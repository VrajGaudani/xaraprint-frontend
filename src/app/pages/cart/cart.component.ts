import { Component, OnInit } from "@angular/core"
import { HttpService } from "../../service/http.service"
import { GlobleService } from "../../service/globle.service"
import { APIURLs } from "../../../environments/apiUrls"
import { Router } from "@angular/router"

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.scss"],
})
export class CartComponent implements OnInit {
  allData: any[] = []
  couponCode = ""
  appliedCoupon: any = null
  isLoading = false
  isUpdatingQuantity = false
  isApplyingCoupon = false
  isCouponApplied = false

  calculations = {
    subtotal: 0,
    total_discount: 0,
    taxable_amount: 0,
    coupon_discount: 0,
    final_taxable_amount: 0,
    total_tax: 0,
    shipping_charge: 0,
    shipping_tax: 0,
    grand_total: 0,
    coupon_details: null,
    item_calculations: [],
  }

  constructor(
    private httpService: HttpService,
    public gs: GlobleService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getCart()
  }

  trackByCartId(index: number, item: any): string {
    return item._id || index.toString()
  }

  getCart() {
    this.isLoading = true
    this.httpService.get(APIURLs.getCartAPI).subscribe(
      (res: any) => {
        console.log("Cart API response:", res)
        if (res.data && res.data.data) {
          this.allData = res.data.data || []
          this.calculations = res.data.calculations || this.calculations
          console.log("Cart calculations:", this.calculations)

          // Check if coupon is applied
          const itemWithCoupon = this.allData.find((item) => item.applied_coupon_code)
          if (itemWithCoupon && itemWithCoupon.applied_coupon_code) {
            this.isCouponApplied = true
            this.couponCode = itemWithCoupon.applied_coupon_code
            this.appliedCoupon = itemWithCoupon.coupon_details || this.calculations.coupon_details
          } else {
            this.isCouponApplied = false
            this.couponCode = ""
            this.appliedCoupon = null
          }
        } else {
          // Handle empty cart
          this.allData = []
          this.calculations = {
            subtotal: 0,
            total_discount: 0,
            taxable_amount: 0,
            coupon_discount: 0,
            final_taxable_amount: 0,
            total_tax: 0,
            shipping_charge: 0,
            shipping_tax: 0,
            grand_total: 0,
            coupon_details: null,
            item_calculations: [],
          }
          this.isCouponApplied = false
          this.couponCode = ""
          this.appliedCoupon = null
        }
        this.isLoading = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to load cart!")
        this.isLoading = false
      },
    )
  }

  changeQuantity(item: any, newQty: number) {
    if (newQty < 1) return
    this.updateQuantity(item, newQty)
  }

  onQuantityInputChange(item: any, event: Event) {
    const target = event.target as HTMLInputElement
    const newQty = Number.parseInt(target.value) || 1

    if (newQty !== item.qty) {
      this.updateQuantity(item, newQty)
    }
  }

  updateQuantity(item: any, newQty: number) {
    if (newQty < 1) {
      newQty = 1
    }

    this.isUpdatingQuantity = true
    const updateData = {
      id: item._id,
      qty: newQty,
    }

    this.httpService.put(APIURLs.updateCartQntAPI, updateData).subscribe(
      (res: any) => {
        if (res.data && res.data.calculations) {
          // Update calculations from backend
          this.calculations = res.data.calculations

          // Update the item in the local array
          const index = this.allData.findIndex((cartItem) => cartItem._id === item._id)
          if (index !== -1 && res.data.item) {
            this.allData[index] = { ...this.allData[index], ...res.data.item }
          }

          // Update coupon status
          const itemWithCoupon = this.allData.find((item) => item.applied_coupon_code)
          if (itemWithCoupon && itemWithCoupon.applied_coupon_code) {
            this.isCouponApplied = true
            this.couponCode = itemWithCoupon.applied_coupon_code
            this.appliedCoupon = itemWithCoupon.coupon_details || this.calculations.coupon_details
          } else {
            this.isCouponApplied = false
            this.couponCode = ""
            this.appliedCoupon = null
          }
        }

        this.gs.successToaster("Quantity updated successfully!")
        this.isUpdatingQuantity = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to update quantity!")
        this.isUpdatingQuantity = false
        this.getCart() // Refresh cart on error
      },
    )
  }

  removeFromCart(item: any) {
    if (confirm("Are you sure you want to remove this item from cart?")) {
      this.httpService.delete(`${APIURLs.deleteCartItemAPI}/${item._id}`).subscribe(
        (res: any) => {
          // Remove item from local array
          this.allData = this.allData.filter((cartItem) => cartItem._id !== item._id)

          if (res.data && res.data.calculations) {
            this.calculations = res.data.calculations

            // Update coupon status
            const itemWithCoupon = this.allData.find((item) => item.applied_coupon_code)
            if (itemWithCoupon && itemWithCoupon.applied_coupon_code) {
              this.isCouponApplied = true
              this.couponCode = itemWithCoupon.applied_coupon_code
              this.appliedCoupon = itemWithCoupon.coupon_details || this.calculations.coupon_details
            } else {
              this.isCouponApplied = false
              this.couponCode = ""
              this.appliedCoupon = null
            }
          }

          this.gs.successToaster("Item removed from cart!")
        },
        (err) => {
          this.gs.errorToaster(err?.error?.msg || "Failed to remove item!")
        },
      )
    }
  }

  clearCart() {
    if (this.allData.length === 0) {
      this.gs.errorToaster("Cart is already empty!")
      return
    }

    if (confirm("Are you sure you want to clear your cart?")) {
      const deletePromises = this.allData.map((item) =>
        this.httpService.delete(`${APIURLs.deleteCartItemAPI}/${item._id}`).toPromise(),
      )

      Promise.all(deletePromises)
        .then(() => {
          this.allData = []
          this.isCouponApplied = false
          this.couponCode = ""
          this.appliedCoupon = null
          this.calculations = {
            subtotal: 0,
            total_discount: 0,
            taxable_amount: 0,
            coupon_discount: 0,
            final_taxable_amount: 0,
            total_tax: 0,
            shipping_charge: 0,
            shipping_tax: 0,
            grand_total: 0,
            coupon_details: null,
            item_calculations: [],
          }
          this.gs.successToaster("Cart cleared successfully!")
        })
        .catch((err) => {
          this.gs.errorToaster("Failed to clear cart!")
          this.getCart() // Refresh cart
        })
    }
  }

  applyCoupon() {
    if (!this.couponCode.trim()) {
      this.gs.errorToaster("Please enter a coupon code!")
      return
    }

    this.isApplyingCoupon = true
    const couponData = {
      coupon_code: this.couponCode.trim().toUpperCase(),
    }

    this.httpService.post(`${APIURLs.applyCouponAPI}`, couponData).subscribe(
      (res: any) => {
        if (res.data) {
          this.appliedCoupon = res.data.coupon
          this.calculations = res.data.calculations
          this.isCouponApplied = true
          this.gs.successToaster("Coupon applied successfully!")
        }
        this.isApplyingCoupon = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Invalid coupon code!")
        this.isApplyingCoupon = false
      },
    )
  }

  removeCoupon() {
    this.httpService.post(`${APIURLs.removeCouponAPI}`, {}).subscribe(
      (res: any) => {
        if (res.data && res.data.calculations) {
          this.calculations = res.data.calculations
        }
        this.appliedCoupon = null
        this.couponCode = ""
        this.isCouponApplied = false
        this.gs.successToaster("Coupon removed!")
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to remove coupon!")
      },
    )
  }

  proceedToCheckout() {
    if (this.allData.length === 0) {
      this.gs.errorToaster("Your cart is empty!")
      return
    }

    // Store cart summary for checkout
    const cartSummary = {
      items: this.allData,
      calculations: this.calculations,
      appliedCoupon: this.appliedCoupon,
    }

    localStorage.setItem("cartSummary", JSON.stringify(cartSummary))
    this.router.navigate(["/checkout"])
  }

  continueShopping() {
    this.router.navigate(["/"])
  }

  getItemTotal(item: any): number {
    // after_discount_price is already for the whole line (for the given quantity)
    return Number.parseFloat((item.after_discount_price || 0).toFixed(2))
  }

  getItemOriginalTotal(item: any): number {
    // orignal_price is already for the whole line
    return Number.parseFloat((item.orignal_price || 0).toFixed(2))
  }

  getItemDiscount(item: any): number {
    // discount_amount is already for the whole line
    return Number.parseFloat((item.discount_amount || 0).toFixed(2))
  }
}
