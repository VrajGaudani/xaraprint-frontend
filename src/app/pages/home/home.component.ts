import { Component, type OnInit } from "@angular/core"
import { FormControl } from "@angular/forms"
import { Api1Service } from "src/app/service/api1.service"
import { GlobleService } from "src/app/service/globle.service"
import { HttpService } from "src/app/service/http.service"
import { APIURLs } from "src/environments/apiUrls"

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss", "./home.sass"],
})
export class HomeComponent implements OnInit {
  searchControl = new FormControl("")
  showSearchDropdown = false

  // Mobile menu state
  mobileSubmenuOpen: boolean[] = []

  // Blog Banner Slider Configuration
  blogBannerSlideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    fade: true,
    prevArrow: '<button class="slick-arrow slick-prev"><i class="bi bi-chevron-left"></i></button>',
    nextArrow: '<button class="slick-arrow slick-next"><i class="bi bi-chevron-right"></i></button>',
  }

  // Fixed Slider configurations
  slideConfigForML = {
    slidesToShow: 2,
    slidesToScroll: 1,
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    centerMode: false,
    prevArrow: '<button class="slick-arrow slick-prev"><i class="bi bi-chevron-left"></i></button>',
    nextArrow: '<button class="slick-arrow slick-next"><i class="bi bi-chevron-right"></i></button>',
    responsive: [
      {
        breakpoint: 998,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          arrows: true,
        },
      },
      {
        breakpoint: 650,
        settings: {
          slidesToShow: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  }

  slideConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: true,
    centerMode: false,
    prevArrow: '<button class="slick-arrow slick-prev"><i class="bi bi-chevron-left"></i></button>',
    nextArrow: '<button class="slick-arrow slick-next"><i class="bi bi-chevron-right"></i></button>',
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  }

  // Data arrays
  products: any = []
  bestSellings: any = []
  mostLoved: any = []
  mostPopular: any = []
  mainCategory: any = []
  customeBannerList: any = []
  blogBannerList: any = []
  subCategory: any = []
  searchProductList: any = []
  allBlogs: any = []

  // Form data
  subCatValue: any = "0"
  selectedMainCategory = ""
  email: any = ""

  // Mock data for demo
  cartItems = 0
  finalPrice = 0.0
  profileData: any = null

  constructor(
    private api1: Api1Service,
    public gs: GlobleService,
    private httpService: HttpService,
  ) {}

  ngOnInit(): void {
    this.initializeData()
    this.setupSearchControl()
    this.initializeMobileMenu()
  }

  initializeData(): void {
    this.getBlogs()
    this.getLatestProd()
    this.getBestSelling()
    this.getMostLoved()
    this.getMostPopular()
    this.getAllMainCategory()
    this.getAllbanners()
    this.getAllBlogbanners()
  }

  initializeMobileMenu(): void {
    // Initialize mobile submenu state
    this.mobileSubmenuOpen = new Array(10).fill(false)
  }

  setupSearchControl(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      if (value && value.length > 2) {
        // Simulate search API call
        this.searchProductList = this.products
          .filter((item: any) => item.productname.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 6)
      } else {
        this.searchProductList = []
      }
    })
  }

  // Search dropdown methods
  hideSearchDropdown(): void {
    setTimeout(() => {
      this.showSearchDropdown = false
    }, 200)
  }

  selectSearchItem(item: any): void {
    this.showSearchDropdown = false
    // Navigate to product details
  }

  // Mobile menu toggle
  toggleMobileSubmenu(index: number): void {
    this.mobileSubmenuOpen[index] = !this.mobileSubmenuOpen[index]
  }

  // Newsletter subscription
  submit(): void {
    if (this.email) {
      this.httpService.post(APIURLs.subscribeNewsLetterAPI, { email: this.email }).subscribe(
        (res: any) => {
          this.gs.successToaster(res?.msg)
          this.email = ""
        },
        (err) => {
          this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
        },
      )
    }
  }

  // API Calls
  getBlogs(): void {
    this.httpService.get(APIURLs.getLatestBlogAPI).subscribe(
      (res: any) => {
        this.allBlogs = res.data
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
        this.allBlogs = []
      },
    )
  }

  getLatestProd(): void {
    this.httpService.get(APIURLs.getLatestProductAPI).subscribe(
      (res: any) => {
        this.products = res.data
        this.processProductPrices()
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  processProductPrices(): void {
    for (const i in this.products) {
      this.products[i].min_size_obj = {}
      if (this.products[i].sizes && this.products[i].sizes.length) {
        for (const j in this.products[i].sizes) {
          this.products[i].sizes[j].total_price =
            Number.parseFloat(this.products[i].sizes[j].sq_ft) * Number.parseFloat(this.products[i].sizes[j].price)
        }
        this.products[i].min_size_obj = this.products[i].sizes.reduce((prev: any, curr: any) =>
          curr.total_price < prev.total_price ? curr : prev,
        )
      }
    }
  }

  getBestSelling(): void {
    this.httpService.get(APIURLs.getAllBestSellerAPI).subscribe(
      (res: any) => {
        this.bestSellings = res.data
      },
      (err) => {
        console.log("Error fetching best sellers:", err)
      },
    )
  }

  getMostLoved(): void {
    this.httpService.get(APIURLs.getAllMostLovedAPI).subscribe(
      (res: any) => {
        this.mostLoved = res.data
      },
      (err) => {
        console.log("Error fetching most loved:", err)
      },
    )
  }

  getMostPopular(): void {
    this.httpService.get(APIURLs.getAllMostPopularAPI).subscribe(
      (res: any) => {
        this.mostPopular = res.data
      },
      (err) => {
        console.log("Error fetching most popular:", err)
      },
    )
  }

  getAllMainCategory(): void {
    this.httpService.get(APIURLs.getAllMainCatAPI).subscribe(
      (res: any) => {
        this.mainCategory = res.data
        this.initializeMobileMenu()
      },
      (err) => {
        console.log("Error fetching categories:", err)
      },
    )
  }

  getAllbanners(): void {
    this.httpService.get(APIURLs.getAllBannersAPI).subscribe(
      (res: any) => {
        this.customeBannerList = res.data
      },
      (err) => {
        console.log("Error fetching banners:", err)
      },
    )
  }

  getAllBlogbanners(): void {
    this.httpService.get(APIURLs.bannersListAPI).subscribe(
      (res: any) => {
        this.blogBannerList = res.data
      },
      (err) => {
        console.log("Error fetching blog banners:", err)
      },
    )
  }

  // Category and subcategory handling
  changeCategory(event: any): void {
    this.selectedMainCategory = event.target.value
    this.getSubCategory(event.target.value)
    this.getProductBycategory({ catid: event.target.value })
  }

  getSubCategory(id: string): void {
    this.httpService.post(APIURLs.subCatByMainAPI, { id }).subscribe(
      (res: any) => {
        this.subCatValue = "0"
        this.subCategory = res.data
      },
      (err) => {
        this.subCategory = []
        this.subCatValue = "0"
        console.log("Error fetching subcategories:", err)
      },
    )
  }

  changeSubCategory(event: any): void {
    this.getProductBycategory({
      catid: this.selectedMainCategory,
      subCatid: event.target.value,
    })
  }

  getProductBycategory(payload: any): void {
    this.httpService.post(APIURLs.getProductByCatAPI, payload).subscribe(
      (res: any) => {
        this.customeBannerList = res.data
      },
      (err) => {
        console.log("Error fetching products by category:", err)
        this.customeBannerList = []
      },
    )
  }

  // Utility functions
  redirectbannerTo(link: any): void {
    window.open(link, "_blank")
  }

  logout(): void {
    // Implement logout logic
    this.gs.successToaster("Logged out successfully")
  }
}
