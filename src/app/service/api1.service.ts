import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Api1Service {

  productName: any = "product"
  userName: any = "user"
  catName: any = "category"
  sizeName: any = "size"
  matName: any = "mat"
  cartName: any = "cart"
  orderName: any = "order"
  couponName: any = "coupon"
  categorys: any = "category";
  emailSubs: any = "email"
  blogss: any = "blog"


  constructor(
    private http: HttpClient
  ) { }

  product(apiname: any, data: any) {
    return this.http.post(environment.baseUrl + this.productName + apiname, data)
  }

  user(apiname: any, data: any) {
    return this.http.post(environment.baseUrl + this.userName + apiname, data)
  }

  cart(apiname: any, data: any) {
    return this.http.post(environment.baseUrl + this.cartName + apiname, data)
  }

  order(apiname: any, data: any) {
    return this.http.post(environment.baseUrl + this.orderName + apiname, data)
  }

  coupons(apiname: any, data: any) {
    return this.http.post(environment.baseUrl + this.couponName + apiname, data)
  }

  category(apiname: any, data: any) {
    return this.http.post(environment.baseUrl + this.categorys + apiname, data)
  }

  emailSub(apiname: any, data: any) {
    return this.http.post(environment.baseUrl + this.emailSubs + apiname, data)
  }

  blog(apiname: any, data: any) {
    return this.http.post(environment.baseUrl + this.blogss + apiname, data)
  }
}
