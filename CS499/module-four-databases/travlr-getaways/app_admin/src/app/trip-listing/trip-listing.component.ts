import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TripCardComponent } from '../trip-card/trip-card.component';
import { Trip } from '../models/trip';
import { TripDataService } from '../services/trip-data.service';
import { AuthenticationService } from '../services/authentication.service';

import {
  sortTrips,
  TripSortOption
} from '../utils/trip-sort';

@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [
    CommonModule,
    TripCardComponent
  ],
  providers: [
    TripDataService
  ],
  templateUrl: './trip-listing.component.html',
  styleUrl: './trip-listing.component.css'
})
export class TripListingComponent implements OnInit, OnDestroy {

  // trips currently displayed on the page
  trips: Trip[] = [];

  // keep the api results before applying the selected sort
  matchingTrips: Trip[] = [];

  // show the loading state or the number of matching trips
  message: string = '';

  // remember the current search text for api requests
  currentSearch: string = '';

  // keep the chosen sort when the search results change
  sortOption: TripSortOption = 'default';

  // delay requests until the user pauses typing
  private searchTimer?: ReturnType<typeof setTimeout>;

  // track the newest request so older results cannot replace it
  private requestVersion = 0;

  constructor(
    private tripDataService: TripDataService,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  // open the add trip form for an authenticated user
  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  // run whenever the search input changes
  public searchTrips(search: string): void {
    this.currentSearch = search.trim();

    // make responses from earlier searches outdated immediately
    const version = ++this.requestVersion;

    // cancel the pending timer if the user keeps typing
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    // request results after a short pause
    // an empty search requests all trips again
    this.searchTimer = setTimeout(() => {
      this.getTrips(version);
    }, 200);
  }

  // sort the current matches without another api request
  public changeSort(option: string): void {
    this.sortOption = option as TripSortOption;

    this.trips = sortTrips(
      this.matchingTrips,
      this.sortOption
    );
  }

  // retrieve trips matching the current search text
  private getTrips(
    version: number = ++this.requestVersion
  ): void {
    this.message = 'Loading trips...';

    this.tripDataService
      .getTrips(this.currentSearch)
      .subscribe({
        next: (value: Trip[]) => {

          // ignore a response for text the user has since changed
          if (version !== this.requestVersion) {
            return;
          }

          // save the unsorted results for later sort changes
          this.matchingTrips = value;

          // apply the custom merge sort to the current matches
          this.trips = sortTrips(
            this.matchingTrips,
            this.sortOption
          );

          // show how many trips match the current search
          if (value.length > 0) {
            this.message =
              `There are ${value.length} matching trips available.`;
          } else {
            this.message =
              'No trips matched the current search criteria.';
          }
        },

        error: () => {

          // ignore errors from searches that are no longer current
          if (version !== this.requestVersion) {
            return;
          }

          this.matchingTrips = [];
          this.trips = [];

          this.message =
            'Unable to retrieve trips. Please try again.';
        }
      });
  }

  // show the add trip button only when logged in
  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  // load all trips when the page first opens
  ngOnInit(): void {
    this.getTrips();
  }

  // stop a pending search when leaving this page
  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }
}