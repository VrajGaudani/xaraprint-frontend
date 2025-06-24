import { HttpClient } from '@angular/common/http';
import { DoCheck, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class GlobleService {

  userDataObj: any = {};
  isLogin : boolean = false;
  imageUrl: any = environment.imgUrl

  constructor(
    private http: HttpClient,
    private toast: ToastrService
  ) {

    this.userDataObj = this.getItem("userData");
    if(this.getItem('token')){
      this.isLogin = true
    }
  }

  // Set item in local storage
  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Get item from local storage
  getItem(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  // Remove item from local storage
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all items from local storage
  clear(): void {
    localStorage.clear();
  }

  successToaster(message?: any) {
    this.toast.success(message, 'Success!', {
      timeOut: 1500,
      positionClass: 'toast-top-right',
      progressBar: true,
      progressAnimation: 'increasing'
    });
  }

  errorToaster(message?: any) {
    this.toast.error(message, 'Oops!', {
      timeOut: 1500,
      positionClass: 'toast-top-right',
      progressBar: true,
      progressAnimation: 'increasing'
    });
  }

  socialLogin() {
    let app = initializeApp(environment.firebaseConfig);
    let auth = getAuth(app);
    return auth
  }
}
