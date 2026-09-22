import {
  Inject,
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { Trip } from '../models/trip';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';

import {
  BROWSER_STORAGE
} from '../storage';

@Injectable({
  providedIn: 'root'
})
export class TripDataService {

  baseUrl = 'http://localhost:3000/api';

  private tripUrl = '/api/trips';

  constructor(
    private http: HttpClient,

    @Inject(BROWSER_STORAGE)
    private storage: Storage
  ) {}

  getTrips(
    resort: string = ''
  ): Observable<Trip[]> {

    let params = new HttpParams();

    const normalizedResort =
      resort.trim();

    if (normalizedResort) {
      params = params.set(
        'resort',
        normalizedResort
      );
    }

    return this.http.get<Trip[]>(
      this.tripUrl,
      { params }
    );
  }

  addTrip(
    formData: Trip
  ): Observable<Trip> {

    return this.http.post<Trip>(
      this.tripUrl,
      formData
    );
  }

  getTrip(
    tripCode: string
  ): Observable<Trip> {

    console.log('getTrip');

    return this.http.get<Trip>(
      this.tripUrl + '/' + tripCode
    );
  }

  updateTrip(
    formData: Trip
  ): Observable<Trip> {

    console.log('updateTrip');

    return this.http.put<Trip>(
      this.tripUrl + '/' + formData.code,
      formData
    );
  }

  deleteTrip(
    tripCode: string
  ): Observable<void> {

    console.log('deleteTrip');

    return this.http.delete<void>(
      this.tripUrl + '/' + tripCode
    );
  }

  // Call to the /login endpoint.
  // Returns a JWT.
  login(
    user: User,
    passwd: string
  ): Observable<AuthResponse> {

    return this.handleAuthAPICall(
      'login',
      user,
      passwd
    );
  }

  // Call to the /register endpoint.
  // Creates a user and returns a JWT.
  register(
    user: User,
    passwd: string
  ): Observable<AuthResponse> {

    return this.handleAuthAPICall(
      'register',
      user,
      passwd
    );
  }

  // Helper used by both login and register.
  handleAuthAPICall(
    endpoint: string,
    user: User,
    passwd: string
  ): Observable<AuthResponse> {

    const formData = {
      name: user.name,
      email: user.email,
      password: passwd
    };

    return this.http.post<AuthResponse>(
      this.baseUrl + '/' + endpoint,
      formData
    );
  }
}