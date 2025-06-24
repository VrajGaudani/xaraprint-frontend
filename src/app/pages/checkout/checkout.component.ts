import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Api1Service } from 'src/app/service/api1.service';
import { GlobleService } from 'src/app/service/globle.service';
import { HttpService } from 'src/app/service/http.service';
import { APIURLs } from 'src/environments/apiUrls';
declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  profileData: any;
  formObj: any = {
    address_info: {
      country: "",
      state: "",
    },
    is_next_time: false
  };
  cartData: any = {
    items: [],
    subtotal: 0,
    totalDiscount: 0,
    finalPrice: 0,
    cartLength: 0,
    coupon_code: '',
    coupon_discount: 0,
    coupon_applied: false
  };

  constructor(
    public gs: GlobleService,
    private router: Router,
    private route: ActivatedRoute,
    private api1: Api1Service,
    private httpService: HttpService,
  ) { }

  ngOnInit(): void {
    this.getProfile();
    this.getAddressData();
    this.getCartData();
  }

  getProfile() {
    this.httpService.get(APIURLs.getProfileAPI).subscribe((res: any) => {
      this.profileData = res.data
    }, (err) => {
      console.log("err -->", err)
    })
  }

  getAddressData() {
    this.httpService.get(APIURLs.getAllAdressAPI).subscribe((res: any) => {
      if (res?.data?.length > 0) {
        this.formObj.address_info = res.data;
        this.setupAddressData()
      }

    }, (err) => {
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!");
    })
  }

  setupAddressData() {
    let shipping_add: any = {};
    this.formObj.address_info.forEach((i: any) => {
      if (i.isShipping) {
        shipping_add = i
        i['useSameBilling'] = true
      }
    })
    this.formObj.shipping_address = shipping_add;
    if (shipping_add?.useSameBilling) {
      this.formObj.billing_address = shipping_add;
    }
    // console.log("this.formObj -->",this.formObj)
  }

  onBillingCheckboxChange(event: any) {
    if (!event.target.checked) {
      this.formObj.address_info.forEach((i: any) => {
        if (i.isShipping) {
          i['useSameBilling'] = event.target.checked
          this.formObj.shipping_address = i;
        }
        if (i.isBilling) {
          this.formObj.billing_address = i;
        }
      })
    }
    else {
      this.formObj.address_info.forEach((i: any) => {
        if (i.isShipping) {
          i['useSameBilling'] = event.target.checked
          this.formObj.shipping_address = i;
          this.formObj.billing_address = i;
        }
      })
    }

    // console.log("this.formObj -->",this.formObj)
  }

  onshippingAddressChange(selectedAddress: any): void {
    let isSameBilling = false;
    this.formObj.address_info.forEach((i: any) => {
      if (i.isShipping && i.useSameBilling) {
        isSameBilling = true
      }
    })
    this.formObj.address_info.forEach((i: any) => {
      i.isShipping = false
      i['useSameBilling'] = false
    })
    this.formObj.address_info.forEach((i: any) => {
      if (i._id == selectedAddress._id) {
        i.isShipping = true
        if (isSameBilling) {
          i.useSameBilling = true
        }
      }
    })
    this.formObj.shipping_address = selectedAddress
    // console.log('Updated Address Info:', this.formObj);
  }
  onBillingAddressChange(selectedAddress: any): void {
    this.formObj.billing_address = selectedAddress
    // console.log('Updated Address Info:', this.formObj);
  }

  getCartData() {
    this.httpService.post(APIURLs.getCartAPI, '').subscribe((res: any) => {
      if (res.data) {
        this.cartData.items = res.data;
        this.calculateCartTotals();
      }
    }, (err) => {
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!");
    });
  }

  calculateCartTotals() {
    let subtotal = 0;
    let totalDiscount = 0;
    let finalPrice = 0;

    this.cartData.items.forEach((item: any) => {
      subtotal += item.orignal_price;
      totalDiscount += item.discount_amount;
      finalPrice += item.after_discount_price;
    });

    this.cartData.subtotal = subtotal;
    this.cartData.totalDiscount = totalDiscount;
    this.cartData.finalPrice = finalPrice;
    this.cartData.cartLength = this.cartData.items.length;
  }

  submitOrder() {
    // if (!this.gs.userDataObj || !this.gs.userDataObj._id) {
    //   this.gs.errorToaster("please login");
    //   return;
    // }

    let cartIds = this.cartData.items.map((item: any) => item._id);
    const orderId = this.generateOrderID();

    this.formObj.cart_id = cartIds;
    this.formObj.price = this.cartData.finalPrice;
    this.formObj.coupon_code = this.cartData.coupon_code;
    this.formObj.coupon_discount = this.cartData.coupon_discount;
    this.formObj.is_coupon_applyed = this.cartData.coupon_applied;
    this.formObj.order_id = orderId;

    // Create Razorpay order first
    const orderData = {
      amount: this.cartData.finalPrice * 100, // Razorpay expects amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: orderId,
      payment_capture: 1
    };

    this.httpService.post(APIURLs.createRazorpayOrderAPI, orderData).subscribe(
      (response: any) => {
        this.initializeRazorpayPayment(response.data);
      },
      (error) => {
        this.gs.errorToaster("Payment initialization failed");
      }
    );
  }

  initializeRazorpayPayment(orderData: any) {
    const options = {
      key: 'rzp_test_HJG5Rtuy8Xh2NB',
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Your Company Name',
      description: 'Order Payment',
      order_id: orderData.id,
      prefill: {
        name: this.profileData?.firstname + ' ' + this.profileData?.lastname,
        email: this.profileData?.email,
        contact: this.formObj.shipping_address?.phone_no
      },
      handler: (response: any) => {
        this.handlePaymentSuccess(response);
      },
      modal: {
        ondismiss: () => {
          this.gs.errorToaster("Payment cancelled");
        }
      }
    };

    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
  }

  handlePaymentSuccess(response: any) {
    this.formObj.payment_mode = 'razorpay';
    this.formObj.payment_id = response.razorpay_payment_id;

    this.formObj.payment_details = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      payment_status: 'completed',
      payment_method: 'razorpay',
      payment_amount: this.cartData.finalPrice,
      payment_currency: 'INR',
      payment_date: new Date().toISOString()
    };
    this.formObj.order_status = 'pending'; // default status as per schema

    // Verify payment on backend
    const paymentVerificationData = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      order_details: this.formObj
    };

    this.httpService.post(APIURLs.verifyPaymentAPI, paymentVerificationData).subscribe(
      (res: any) => {
        // Create order after payment verification
        this.httpService.post(APIURLs.orderCreateAPI, this.formObj).subscribe(
          (orderRes: any) => {
            this.gs.successToaster(orderRes?.msg);
            this.router.navigate(['/order-success'], {
              queryParams: {
                order_id: this.formObj.order_id,
                payment_id: response.razorpay_payment_id
              }
            });
          },
          (err) => {
            this.gs.errorToaster(err?.error?.msg || "Order creation failed");
          }
        );
      },
      (err) => {
        this.gs.errorToaster("Payment verification failed");
      }
    );
  }

  generateOrderID() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let orderId = '';

    // Generate the first 4 characters (alphabets)
    for (let i = 0; i < 4; i++) {
      orderId += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    // Generate the 10-digit numeric part
    for (let i = 0; i < 10; i++) {
      orderId += Math.floor(Math.random() * 10);
    }

    return orderId;
  }

}
