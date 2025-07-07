import { Component, OnInit } from "@angular/core"
import { FormControl } from "@angular/forms"
import { NavigationEnd, Router } from "@angular/router"
import { debounceTime, distinctUntilChanged } from "rxjs"
import { Api1Service } from "src/app/service/api1.service"
import { GlobleService } from "src/app/service/globle.service"
import { HttpService } from "src/app/service/http.service"
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

  constructor(
    private router: Router,
    private api1: Api1Service,
    public gs: GlobleService,
    private httpService: HttpService,
  ) {
    this.httpService.get(APIURLs.getAllCatAPI).subscribe(
      (res: any) => {
        this.header = res.data
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
    this.httpService.get(query ? APIURLs.getAllBannersAPI + `?str=${query}` : APIURLs.getAllBannersAPI).subscribe(
      (res: any) => {
        this.searchProductList = res.data
      },
      (err) => {
        console.log("err -->", err)
        this.searchProductList = []
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
    this.httpService.post(APIURLs.getCartAPI, "").subscribe(
      (res: any) => {
        this.allData = res.data
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
      finalPrice += this.allData[i].after_discount_price
      items += this.allData[i].qty
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
    this.router.navigate(["/login"])
  }

  navigateTo(path: string): void {
    this.router.navigate([path])
  }
}
