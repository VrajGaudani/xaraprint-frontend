// src/app/services/http.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobleService } from './globle.service';
import { catchError, map, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Buffer } from 'buffer';

@Injectable({ providedIn: 'root' })
export class HttpService {
  private basicToken: string;

  constructor(
    private http: HttpClient,
    private gs: GlobleService,
    private router: Router
  ) {
    this.basicToken = btoa(`${environment.basicUser}:${environment.basicPassword}`);
  }

  private setHeaders(useBasic: boolean = false) {
    const headersConfig: { [name: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (useBasic) {
      headersConfig['Authorization'] = `Basic ${this.basicToken}`;
    } else {
      const stored = localStorage.getItem('token');
      const bearer = stored ? JSON.parse(stored) : '';
      headersConfig['Authorization'] = `Bearer ${bearer}`;
    }

    const headers = new HttpHeaders(headersConfig);
    // withCredentials spelled correctly
    return { headers, withCredentials: true };
  }

  // === Basic protected endpoints ===

  postBasic<T>(url: string, payload: any) {
    return this.http
      .post<T>(url, payload, this.setHeaders(true))
      .pipe(
        map((res) => res),
        catchError((err) => throwError(() => err))
      );
  }

  getBasic<T>(url: string) {
    return this.http
      .get<T>(url, this.setHeaders(true))
      .pipe(
        map((res) => res),
        catchError((err) => throwError(() => err))
      );
  }

  // Example usage:
  // this.http.postBasic(environment.baseUrl + 'user/auth/register', body);
  // this.http.postBasic(environment.baseUrl + 'user/auth/login', body);

  // === Bearer protected endpoints ===

  get<T>(url: string) {
    return this.http.get<T>(url, this.setHeaders()).pipe(
      map((res) => {
        const response = res as { data?: { data?: any } } & T;
        if (response && response.data && response.data.data) {
          response.data = response.data.data;
        }
        return response;
      }),
      catchError((err) => this.handleAuthError(err))
    );
  }

  post<T>(url: string, payload: any) {
    return this.http.post<T>(url, payload, this.setHeaders()).pipe(
      map((res) => res),
      catchError((err) => this.handleAuthError(err))
    );
  }

  put<T>(url: string, payload: any) {
    return this.http.put<T>(url, payload, this.setHeaders()).pipe(
      map((res) => res),
      catchError((err) => this.handleAuthError(err))
    );
  }

  delete<T>(url: string) {
    return this.http.delete<T>(url, this.setHeaders()).pipe(
      map((res) => res),
      catchError((err) => this.handleAuthError(err))
    );
  }

  // === No auth endpoints ===

  postWithoutSec<T>(url: string, payload: any) {
    return this.http.post<T>(url, payload).pipe(
      map((res) => res),
      catchError((err) => throwError(() => err))
    );
  }

  // === shared 401 handler ===
  private handleAuthError(err: any) {
    if (err?.status === 401) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
    return throwError(() => err);
  }
}
