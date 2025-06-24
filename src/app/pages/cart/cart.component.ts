import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Api1Service } from 'src/app/service/api1.service';
import { GlobleService } from 'src/app/service/globle.service';
import { HttpService } from 'src/app/service/http.service';
import { APIURLs } from 'src/environments/apiUrls';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  allData: any = [];
  finalPrice: any = 0;
  cartItems: any = 0;
  coupon_code: any = ""
  couponObj: any = {
    res: false,
    coupon_code: "",
    discount_amount: 0
  }
  subtotal: number = 0;
  totalDiscount: number = 0;

  constructor(
    private api1: Api1Service,
    public gs: GlobleService,
    private httpService: HttpService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getCart();
  }


  getCart() {

    this.httpService.post(APIURLs.getCartAPI,'').subscribe((res: any) => {
      this.allData = res.data;
      console.log("this.allData", this.allData)
      setTimeout(() => {
        this.finalPriceCount();
      }, 300);
    },(err) => {
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
    })
  }


  changeQty(data: any, index: any, type: any) {
    this.allData[index].qty = Number(this.allData[index].qty);
    if (type == 'plus') {
      this.allData[index].qty += 1;
    } else if (type == 'minus') {
      if (this.allData[index].qty > 1) {
        this.allData[index].qty -= 1;
      } else {
        this.gs.errorToaster('Quantity cannot be less than 1');
      }
    }

    let price = this.allData[index].single_price;
    let multiQtyPrice = price * this.allData[index].qty;
    let discountPercentage = 0;
    let discountAmount = 0;
    let finalPrice = 0;

    discountPercentage = this.calculateDiscount(this.allData[index].qty, data.product_id.bulk_qty);
    discountAmount = (multiQtyPrice * discountPercentage) / 100;
    this.allData[index].discount_amount = discountAmount
    finalPrice = multiQtyPrice - discountAmount

    this.allData[index].discount_percentage = discountPercentage;
    this.allData[index].orignal_price = multiQtyPrice;
    this.allData[index].after_discount_price = finalPrice

    // add spinner here

    this.httpService.post(APIURLs.cartQntUpdateAPI,this.allData[index]).subscribe((res: any) => {
      setTimeout(() => {
        this.finalPriceCount();
      }, 300)
    },(err) => {
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
    })
  }

  calculateDiscount(quantity: any, discounts: any) {

    for (let i = discounts.length - 1; i >= 0; i--) {
      if (quantity >= discounts[i].qty) {
        return discounts[i].discount;
      }
    }
    return 0;
  }

  finalPriceCount() {
    let finalPrice = 0;
    let items = 0;
    let subtotal = 0;
    let totalDiscount = 0;

    for (let i = 0; i < this.allData.length; i++) {
      // Calculate subtotal (price before discount)
      subtotal += this.allData[i].orignal_price;

      // Calculate total discount (including bulk discounts)
      totalDiscount += this.allData[i].discount_amount;

      finalPrice += this.allData[i].after_discount_price;
      items += this.allData[i].qty;
    }

    // Add coupon discount if applied
    if (this.couponObj.res) {
      totalDiscount += parseFloat(this.couponObj.discount_amount);
    }

    this.subtotal = subtotal;
    this.totalDiscount = totalDiscount;
    this.finalPrice = finalPrice;
    this.cartItems = items;
  }


  proceedToCheckout() {


    let cartIds = []

    for (let i in this.allData) {
      cartIds.push(this.allData[i]._id)
    }

    let cartData = {
      cartLength: this.allData.length,
      totalPrice: this.finalPrice,
      cartIds: cartIds,
      coupon_code: this.coupon_code,
      coupon_discount: this.couponObj.discount_amount,
      coupon_applyed :  this.coupon_code.res
    }

    let queryParams = { cartData: JSON.stringify(cartData) };
    // this.router.navigate(['/checkout'], { queryParams });
    this.router.navigate(['/checkout']);
  }

  deleteCart(data: any, index: any) {
    this.httpService.post(APIURLs.deleteCartItemAPI,{ _id: data._id }).subscribe((res: any) => {
      this.allData.splice(index, 1);
      this.finalPriceCount();
    },(err) => {
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
    })

  }

  applyCoupon() {
    this.httpService.post(APIURLs.getCouponDiscountAPI, { coupon_code: this.coupon_code }).subscribe((res: any) => {
      this.couponObj = res.data;
      this.couponObj.res = true;
      this.finalPriceCount(); // Recalculate all totals including the coupon discount
    }, (err) => {
      this.couponObj.res = false;
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!");
    });
  }
}
