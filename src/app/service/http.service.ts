import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { GlobleService } from "./globle.service"
import { catchError, map, throwError } from "rxjs"
import { Router } from "@angular/router"
import { environment } from "../../environments/environment"

@Injectable({ providedIn: "root" })
export class HttpService {
  private basicToken: string

  constructor(
    private http: HttpClient,
    private gs: GlobleService,
    private router: Router,
  ) {
    // Use environment variables for basic auth
    this.basicToken = btoa(`${environment.basicUser}:${environment.basicPassword}`)
  }

  private setHeaders(useBasic = false) {
    const headersConfig: { [name: string]: string } = {
      "Content-Type": "application/json",
    }

    if (useBasic) {
      headersConfig["Authorization"] = `Basic ${this.basicToken}`
    } else {
      const stored = localStorage.getItem("token")
      const bearer = stored ? JSON.parse(stored) : ""
      if (bearer) {
        headersConfig["Authorization"] = `Bearer ${bearer}`
      }
    }

    const headers = new HttpHeaders(headersConfig)
    return { headers, withCredentials: true }
  }

  private setFileHeaders(useBasic = false) {
    const headersConfig: { [name: string]: string } = {}

    if (useBasic) {
      headersConfig["Authorization"] = `Basic ${this.basicToken}`
    } else {
      const stored = localStorage.getItem("token")
      const bearer = stored ? JSON.parse(stored) : ""
      if (bearer) {
        headersConfig["Authorization"] = `Bearer ${bearer}`
      }
    }

    // Don't set Content-Type for file uploads - browser will set it with boundary
    const headers = new HttpHeaders(headersConfig)
    return { headers, withCredentials: true }
  }

  // Basic auth methods
  postBasic<T>(url: string, payload: any) {
    return this.http.post<T>(environment.baseUrl + url, payload, this.setHeaders(true)).pipe(
      map((res) => res),
      catchError((err) => throwError(() => err)),
    )
  }

  getBasic<T>(url: string) {
    return this.http.get<T>(environment.baseUrl + url, this.setHeaders(true)).pipe(
      map((res) => res),
      catchError((err) => throwError(() => err)),
    )
  }

  // Standard methods with token
  get<T>(url: string, params?: any) {
    let fullUrl = environment.baseUrl + url
    if (params) {
      const urlParams = new URLSearchParams()
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          urlParams.append(key, params[key].toString())
        }
      })
      if (urlParams.toString()) {
        fullUrl += "?" + urlParams.toString()
      }
    }

    return this.http.get<T>(fullUrl, this.setHeaders()).pipe(
      map((res) => res),
      catchError((err) => this.handleAuthError(err)),
    )
  }

  post<T>(url: string, payload: any) {
    return this.http.post<T>(environment.baseUrl + url, payload, this.setHeaders()).pipe(
      map((res) => res),
      catchError((err) => this.handleAuthError(err)),
    )
  }

  put<T>(url: string, payload: any) {
    return this.http.put<T>(environment.baseUrl + url, payload, this.setHeaders()).pipe(
      map((res) => res),
      catchError((err) => this.handleAuthError(err)),
    )
  }

  delete<T>(url: string, id?: string) {
    const deleteUrl = id ? `${environment.baseUrl}${url}/${id}` : `${environment.baseUrl}${url}`
    return this.http.delete<T>(deleteUrl, this.setHeaders()).pipe(
      map((res) => res),
      catchError((err) => this.handleAuthError(err)),
    )
  }

  // File upload method
  uploadFile<T>(url: string, formData: FormData) {
    return this.http.post<T>(environment.baseUrl + url, formData, this.setFileHeaders()).pipe(
      map((res) => res),
      catchError((err) => this.handleAuthError(err)),
    )
  }

  // Method for downloading files (like invoices)
  downloadFile(url: string, params?: any) {
    let fullUrl = environment.baseUrl + url
    if (params) {
      const urlParams = new URLSearchParams()
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          urlParams.append(key, params[key].toString())
        }
      })
      if (urlParams.toString()) {
        fullUrl += "?" + urlParams.toString()
      }
    }

    return this.http
      .get(fullUrl, {
        ...this.setHeaders(),
        responseType: "blob",
      })
      .pipe(catchError((err) => this.handleAuthError(err)))
  }

  // Method without security (for public APIs)
  postWithoutSec<T>(url: string, payload: any) {
    return this.http.post<T>(environment.baseUrl + url, payload).pipe(
      map((res) => res),
      catchError((err) => throwError(() => err)),
    )
  }

  private handleAuthError(err: any) {
    if (err?.status === 401) {
      localStorage.removeItem("token")
      this.gs.isLogin = false
      this.router.navigate(["/login"])
    }
    return throwError(() => err)
  }
}
