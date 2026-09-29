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

  // get trips matching a name or resort
  getTrips(
    search: string = ''
  ): Observable<Trip[]> {

    let params = new HttpParams();

    const normalizedSearch =
      search.trim();

    // an empty search leaves out the parameter
    // so the api returns every trip
    if (normalizedSearch) {
      params = params.set(
        'search',
        normalizedSearch
      );
    }

    return this.http.get<Trip[]>(
      this.tripUrl,
      { params }
    );
  }

  // create a trip through the api
  addTrip(
    formData: Trip
  ): Observable<Trip> {

    return this.http.post<Trip>(
      this.tripUrl,
      formData
    );
  }

  // retrieve one trip by its code
  getTrip(
    tripCode: string
  ): Observable<Trip> {

    console.log('getTrip');

    return this.http.get<Trip>(
      this.tripUrl + '/' + tripCode
    );
  }

  // update an existing trip
  updateTrip(
    formData: Trip
  ): Observable<Trip> {

    console.log('updateTrip');

    return this.http.put<Trip>(
      this.tripUrl + '/' + formData.code,
      formData
    );
  }

  // delete a trip by its code
  deleteTrip(
    tripCode: string
  ): Observable<void> {

    console.log('deleteTrip');

    return this.http.delete<void>(
      this.tripUrl + '/' + tripCode
    );
  }

  // call the login endpoint and return a jwt
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

  // call the register endpoint and return a jwt
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

  // send the shared login or register request
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