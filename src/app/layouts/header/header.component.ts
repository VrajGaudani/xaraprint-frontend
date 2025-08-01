import { Component, OnInit } from "@angular/core"
import { FormControl } from "@angular/forms"
import { NavigationEnd, Router } from "@angular/router"
import { debounceTime, distinctUntilChanged } from "rxjs"
import { Api1Service } from "src/app/service/api1.service"
import { GlobleService } from "src/app/service/globle.service"
import { HttpService } from "src/app/service/http.service"
import { PaginationService } from "src/app/service/pagination.service"
import { APIURLs } from "src/environments/apiUrls"

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  upperLineNone = false
  categoryNone = false
  searchNone = false
  cart = false
  sideBar = false
  user: any
  profileData: any
  header: any = []
  searchProductList: any = []
  allData: any = []
  finalPrice: any
  cartItems: any
  searchControl = new FormControl()
  mobileSubmenuOpen: boolean[] = []
  showSearchDropdown = false
  coupenCode = []
  mostValued: any = {}

  constructor(
    private router: Router,
    private api1: Api1Service,
    public gs: GlobleService,
    private httpService: HttpService,
    private paginationService: PaginationService,
  ) {
    // Load categories for navigation
    this.httpService.get(APIURLs.getAllCatAPI).subscribe(
      (res: any) => {
        this.header = res.data?.data || res.data || []
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
      },
    )
  }

  toggleMobileSubmenu(index: number): void {
    this.mobileSubmenuOpen[index] = !this.mobileSubmenuOpen[index]
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(debounceTime(2000), distinctUntilChanged()).subscribe((query) => {
      this.searchProduct(query)
    })
    this.getAllSearchProduct()
    this.getCouponDiscount()

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects
        if (this.gs.isLogin) {
          if (currentUrl !== "/login") {
            this.getProfile()
            this.getCart()
          }
        }
      }
    })

    if (this.gs.isLogin) {
      this.getProfile()
      this.getCart()
    }
  }

  searchProduct(query: any) {
    this.getAllSearchProduct(query)
  }

  getAllSearchProduct(query?: any) {
    // Search in products, not banners
    const searchParams: any = {}
    if (query) {
      searchParams.search = query
      searchParams.limit = 10
    }

    this.httpService.get(APIURLs.getAllProductAPI, searchParams).subscribe(
      (res: any) => {
        this.searchProductList = res.data?.data || res.data || []
        this.showSearchDropdown = query && this.searchProductList.length > 0
      },
      (err) => {
        console.log("err -->", err)
        this.searchProductList = []
        this.showSearchDropdown = false
      },
    )
  }

  getCouponDiscount() {
    return this.httpService.get(APIURLs.getAllCouponAPI).subscribe(
      (res: any) => {
        const coupons = res.data?.data || res.data || []
        this.coupenCode = coupons
        if (Array.isArray(coupons) && coupons.length > 0) {
          this.mostValued = coupons.reduce(
            (max: { discount_amount: any }, curr: { discount_amount: any }) =>
              Number(curr.discount_amount) > Number(max.discount_amount) ? curr : max,
            coupons[0],
          )
        } else {
          this.mostValued = coupons[0] || {}
        }
        console.log("Coupon discount:", coupons)
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to apply coupon!")
      },
    )
  }

  hideSearchDropdown(): void {
    setTimeout(() => {
      this.showSearchDropdown = false
    }, 200)
  }

  selectSearchItem(item: any): void {
    this.showSearchDropdown = false
    this.router.navigate(["/product-details", item._id])
  }

  getProfile() {
    this.httpService.get(APIURLs.getProfileAPI).subscribe(
      (res: any) => {
        this.profileData = res.data
      },
      (err) => {
        console.log("err -->", err)
      },
    )
  }

  getCart() {
    this.httpService.get(APIURLs.getCartAPI).subscribe(
      (res: any) => {
        this.allData = res.data?.data || res.data || []
        setTimeout(() => {
          this.finalPriceCount()
        }, 300)
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
      },
    )
  }

  finalPriceCount() {
    let finalPrice = 0
    let items = 0
    for (let i = 0; i < this.allData.length; i++) {
      finalPrice += this.allData[i].after_discount_price || 0
      items += this.allData[i].qty || 0
    }
    this.finalPrice = finalPrice
    this.cartItems = items
  }

  openCart(): void {
    this.cart = true
  }

  openSideBar(): void {
    this.sideBar = true
  }

  closeCart(): void {
    this.cart = false
  }

  closeSideBar(): void {
    this.sideBar = false
  }

  logout(): void {
    localStorage.removeItem("token")
    this.gs.isLogin = false
    this.router.navigate(["/login"])
  }

  navigateTo(path: string): void {
    this.router.navigate([path])
  }
}
