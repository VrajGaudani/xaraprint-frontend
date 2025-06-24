import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobleService } from './globle.service';
import { catchError, map, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private gs: GlobleService,
    private router : Router
  ) { }

  setHeaders() {
    let token: any = localStorage.getItem('token')

    let headers = new HttpHeaders({
      "Authorization": "Bearer " + JSON.parse(token),
      'Content-type': 'application/json'
    });

    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    let options = { headers: headers, withCredintials: true };
    return options
  }

  get(url:string){
    return this.http.get(url , this.setHeaders()).pipe(map((res) => {
      return res
    }),
    catchError((err) => {
      if(err?.status == 401){
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
      return throwError(err)
    }))
  }

  post(url:string, payload: any){
    return this.http.post(url,payload, this.setHeaders()).pipe(map((res) => {
      return res
    }),
    catchError((err) => {
      if(err?.status == 401){
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
      return throwError(err)
    }))
  }

  delete(url:string, payload: any){
    return this.http.delete(url, this.setHeaders()).pipe(map((res) => {
      return res
    }),
    catchError((err) => {
      if(err?.status == 401){
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
      return throwError(err)
    }))
  }

  put(url:string, payload: any){
    return this.http.put(url,payload,this.setHeaders()).pipe(map((res) => {
      return res
    }),
    catchError((err) => {
      if(err?.status == 401){
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
      return throwError(err)
    }))
  }

  postWithoutSec(url:string, payload: any){
    return this.http.post(url,payload).pipe(map((res) => {
      return res
    }),
    catchError((err) => {
      return throwError(err)
    }))
  }
}
