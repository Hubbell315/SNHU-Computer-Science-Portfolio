import { Component, OnInit } from '@angular/core';
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
export class TripListingComponent implements OnInit {

  trips: Trip[] = [];

  // Stores the original matching collection returned by the API.
  // This allows a different sort option to be applied without
  // requesting the data again.
  matchingTrips: Trip[] = [];

  message: string = '';

  currentResort: string = '';

  sortOption: TripSortOption = 'default';

  constructor(
    private tripDataService: TripDataService,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  public searchTrips(resort: string): void {
    this.currentResort = resort.trim();
    this.getTrips();
  }

  public clearSearch(
    input: HTMLInputElement
  ): void {
    input.value = '';

    this.currentResort = '';

    this.getTrips();
  }

  public changeSort(option: string): void {
    this.sortOption = option as TripSortOption;

    this.trips = sortTrips(
      this.matchingTrips,
      this.sortOption
    );
  }

  private getTrips(): void {
    this.message = 'Loading trips...';

    this.tripDataService
      .getTrips(this.currentResort)
      .subscribe({
        next: (value: Trip[]) => {

          // Keep the API result separate from the displayed,
          // sorted collection.
          this.matchingTrips = value;

          // Apply the custom merge-sort implementation.
          this.trips = sortTrips(
            this.matchingTrips,
            this.sortOption
          );

          if (value.length > 0) {
            this.message =
              `There are ${value.length} matching trips available.`;
          } else {
            this.message =
              'No trips matched the current search criteria.';
          }
        },

        error: () => {
          this.matchingTrips = [];
          this.trips = [];

          this.message =
            'Unable to retrieve trips. Please try again.';
        }
      });
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  ngOnInit(): void {
    this.getTrips();
  }
}