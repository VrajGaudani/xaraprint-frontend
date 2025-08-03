import { Component, OnInit } from "@angular/core"
import { HttpService } from "../../service/http.service"
import { GlobleService } from "../../service/globle.service"
import { APIURLs } from "../../../environments/apiUrls"
import { Router } from "@angular/router"

declare var Razorpay: any

@Component({
  selector: "app-checkout",
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.scss"],
})
export class CheckoutComponent implements OnInit {
  cartSummary: any = null
  addresses: any[] = []
  selectedShippingAddress: any = null
  selectedBillingAddress: any = null
  useSameBilling = true
  isLoadingAddresses = false
  isProcessingOrder = false
  isLoadingCalculations = false

  paymentMethod = "online"
  orderCalculations: any = null

  constructor(
    private httpService: HttpService,
    public gs: GlobleService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCartSummary()
    this.loadAddresses()
    this.getOrderCalculations()
  }

  addAddress() {
    this.router.navigate(["/account"], { fragment: "addresses" })
  }

  loadCartSummary() {
    const cartData = localStorage.getItem("cartSummary")
    if (cartData) {
      this.cartSummary = JSON.parse(cartData)
    } else {
      this.gs.errorToaster("No cart data found!")
      this.router.navigate(["/cart"])
    }
  }

  loadAddresses() {
    this.isLoadingAddresses = true

    // Get addresses from user object
    if (this.gs.userDataObj?.addresses && this.gs.userDataObj.addresses.length > 0) {
      this.addresses = this.gs.userDataObj.addresses
      this.selectedShippingAddress = this.addresses.find((addr) => addr.isShipping) || this.addresses[0]
      this.selectedBillingAddress = this.addresses.find((addr) => addr.isBilling) || this.selectedShippingAddress
      this.isLoadingAddresses = false
    } else {
      // Fallback to API call if addresses not in user object
      this.httpService.get(APIURLs.getAllAdressAPI).subscribe(
        (res: any) => {
          this.addresses = res.data || []
          if (this.addresses.length > 0) {
            this.selectedShippingAddress = this.addresses[0]
            this.selectedBillingAddress = this.addresses[0]
          }
          this.isLoadingAddresses = false
        },
        (err) => {
          this.gs.errorToaster(err?.error?.msg || "Failed to load addresses")
          this.isLoadingAddresses = false
        },
      )
    }
  }

  getOrderCalculations() {
    this.isLoadingCalculations = true

    // Get fresh calculations from backend
    this.httpService.get(APIURLs.getCartAPI).subscribe(
      (res: any) => {
        if (res.data && res.data.calculations) {
          this.orderCalculations = res.data.calculations
          console.log("Order calculations from backend:", this.orderCalculations)
        } else {
          // Fallback to stored cart summary
          this.orderCalculations = this.cartSummary?.calculations || this.calculateFallbackTotal()
          console.log("Using fallback calculations:", this.orderCalculations)
        }
        this.isLoadingCalculations = false
      },
      (err) => {
        // Fallback calculation if API fails
        this.orderCalculations = this.cartSummary?.calculations || this.calculateFallbackTotal()
        this.isLoadingCalculations = false
        console.warn("Order calculation API failed, using fallback calculation:", this.orderCalculations)
      },
    )
  }

  selectShippingAddress(address: any) {
    this.selectedShippingAddress = address
    if (this.useSameBilling) {
      this.selectedBillingAddress = address
    }
  }

  selectBillingAddress(address: any) {
    this.selectedBillingAddress = address
  }

  onBillingCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement
    this.useSameBilling = target.checked

    if (this.useSameBilling) {
      this.selectedBillingAddress = this.selectedShippingAddress
    }
  }

  calculateFallbackTotal() {
    if (!this.cartSummary) return null

    const subtotal = this.cartSummary.calculations.subtotal || 0
    const totalDiscount = this.cartSummary.calculations.total_discount || 0
    const couponDiscount = this.cartSummary.calculations.coupon_discount || 0
    const taxableAmount = subtotal - totalDiscount
    const finalTaxableAmount = Math.max(0, taxableAmount - couponDiscount)
    const shippingCharge = finalTaxableAmount >= 999 ? 0 : 99
    const totalTax = Math.round(finalTaxableAmount * 0.18) + Math.round(shippingCharge * 0.18)
    const grandTotal = finalTaxableAmount + shippingCharge + totalTax

    return {
      subtotal,
      total_discount: totalDiscount,
      taxable_amount: taxableAmount,
      coupon_discount: couponDiscount,
      final_taxable_amount: finalTaxableAmount,
      shipping_charge: shippingCharge,
      total_tax: totalTax,
      grand_total: grandTotal,
    }
  }

  getFinalTotal(): number {
    if (!this.orderCalculations) return 0

    let total = this.orderCalculations.grand_total || 0
    if (this.paymentMethod === "cod") {
      total += 30 // COD charge
    }
    return total
  }

  onPaymentMethodChange(method: string) {
    this.paymentMethod = method
  }

  placeOrder() {
    if (!this.selectedShippingAddress) {
      this.gs.errorToaster("Please select a delivery address")
      return
    }

    if (!this.useSameBilling && !this.selectedBillingAddress) {
      this.gs.errorToaster("Please select a billing address")
      return
    }

    if (!this.cartSummary || !this.cartSummary.items.length) {
      this.gs.errorToaster("Your cart is empty")
      return
    }

    this.isProcessingOrder = true

    const orderData = {
      billing_address: {
        firstname: (this.useSameBilling ? this.selectedShippingAddress : this.selectedBillingAddress).firstname,
        lastname: (this.useSameBilling ? this.selectedShippingAddress : this.selectedBillingAddress).lastname,
        email: this.gs.userDataObj?.email || "",
        phone_no: (this.useSameBilling ? this.selectedShippingAddress : this.selectedBillingAddress).phone_no,
        address: (this.useSameBilling ? this.selectedShippingAddress : this.selectedBillingAddress).address,
        city: (this.useSameBilling ? this.selectedShippingAddress : this.selectedBillingAddress).city,
        state: (this.useSameBilling ? this.selectedShippingAddress : this.selectedBillingAddress).state,
        pincode: (this.useSameBilling ? this.selectedShippingAddress : this.selectedBillingAddress).pincode,
        country: (this.useSameBilling ? this.selectedShippingAddress : this.selectedBillingAddress).country || "India",
      },
      shipping_address: {
        firstname: this.selectedShippingAddress.firstname,
        lastname: this.selectedShippingAddress.lastname,
        email: this.gs.userDataObj?.email || "",
        phone_no: this.selectedShippingAddress.phone_no,
        address: this.selectedShippingAddress.address,
        city: this.selectedShippingAddress.city,
        state: this.selectedShippingAddress.state,
        pincode: this.selectedShippingAddress.pincode,
        country: this.selectedShippingAddress.country || "India",
      },
      payment_mode: this.paymentMethod,
      cart_ids: this.cartSummary.items.map((item: any) => item._id),
      coupon_code: this.cartSummary.appliedCoupon?.coupon_code || null,
    }

    this.httpService.post(APIURLs.orderCreateAPI, orderData).subscribe(
      (res: any) => {
        if (this.paymentMethod === "online") {
          this.initiateRazorpayPayment(res.data)
        } else {
          // COD order
          this.gs.successToaster("Order placed successfully!")
          localStorage.removeItem("cartSummary")
          this.router.navigate(["/order-success"], {
            queryParams: { orderId: res.data.order?.order_id || res.data.order_id },
          })
        }
        this.isProcessingOrder = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to place order")
        this.isProcessingOrder = false
      },
    )
  }

  initiateRazorpayPayment(orderData: any) {
    const options = {
      key: orderData.razorpay_order?.key || "rzp_test_key", // Replace with your Razorpay key
      amount: orderData.razorpay_order?.amount || this.getFinalTotal() * 100,
      currency: orderData.razorpay_order?.currency || "INR",
      name: orderData.razorpay_order?.name || "XaraPrint",
      description: orderData.razorpay_order?.description || "Order Payment",
      order_id: orderData.razorpay_order?.id,
      handler: (response: any) => {
        this.verifyPayment(response)
      },
      prefill: {
        name: `${this.selectedShippingAddress?.firstname} ${this.selectedShippingAddress?.lastname}`,
        email: this.gs.userDataObj?.email || "",
        contact: this.selectedShippingAddress?.phone_no || "",
      },
      theme: {
        color: "#667eea",
      },
      modal: {
        ondismiss: () => {
          this.gs.errorToaster("Payment cancelled")
          this.isProcessingOrder = false
        },
      },
    }

    const rzp = new Razorpay(options)
    rzp.open()
  }

  verifyPayment(paymentResponse: any) {
    this.isProcessingOrder = true
    const verificationData = {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
    }

    this.httpService.post(APIURLs.verifyPaymentAPI, verificationData).subscribe(
      (res: any) => {
        this.gs.successToaster("Payment successful! Order placed.")
        localStorage.removeItem("cartSummary")
        this.router.navigate(["/order-success"], {
          queryParams: { orderId: res.data.order?.order_id || res.data.order_id },
        })
        this.isProcessingOrder = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Payment verification failed")
        this.isProcessingOrder = false
        this.gs.errorToaster(err?.error?.msg || "Payment verification failed")
      },
    )
  }

  goToAddresses() {
    this.router.navigate(["/account"], { fragment: "addresses" })
  }

  goBackToCart() {
    this.router.navigate(["/cart"])
  }
}
