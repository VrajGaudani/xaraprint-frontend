import { Component, OnInit } from "@angular/core"
import { FormControl } from "@angular/forms"
import { Api1Service } from "src/app/service/api1.service"
import { GlobleService } from "src/app/service/globle.service"
import { HttpService } from "src/app/service/http.service"
import { PaginationService } from "src/app/service/pagination.service"
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

  blogBannerSlideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    fade: false,
    adaptiveHeight: false,
    pauseOnHover: true,
    pauseOnFocus: false,
    swipe: true,
    touchMove: true,
    prevArrow:
      '<button class="slick-arrow slick-prev banner-nav-btn" aria-label="Previous Banner"><i class="bi bi-chevron-left"></i></button>',
    nextArrow:
      '<button class="slick-arrow slick-next banner-nav-btn" aria-label="Next Banner"><i class="bi bi-chevron-right"></i></button>',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: true,
          dots: true,
          autoplay: true,
          pauseOnHover: true,
        },
      },
    ],
  }

  // Fixed Slider configurations for Most Loved Products
  slideConfigForML = {
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    centerMode: false,
    pauseOnHover: true,
    pauseOnFocus: true,
    swipe: true,
    touchMove: true,
    variableWidth: false,
    adaptiveHeight: false,
    prevArrow:
      '<button class="slick-arrow slick-prev" aria-label="Previous"><i class="bi bi-chevron-left"></i></button>',
    nextArrow: '<button class="slick-arrow slick-next" aria-label="Next"><i class="bi bi-chevron-right"></i></button>',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          centerMode: false,
          arrows: true,
          autoplay: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          arrows: true,
          autoplay: true,
        },
      },
      {
        breakpoint: 650,
        settings: {
          slidesToShow: 1,
          arrows: true,
          dots: false,
          autoplay: true,
        },
      },
    ],
  }

  slideConfigRedesigned = {
    slidesToShow: 4,
    slidesToScroll: 1,
    dots: false,
    infinite: false, // Changed to false to prevent issues with few items
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    centerMode: false,
    pauseOnHover: true,
    pauseOnFocus: false,
    swipe: true,
    touchMove: true,
    variableWidth: false, // Ensure consistent width
    prevArrow:
      '<button class="slick-arrow slick-prev products-nav-btn" aria-label="Previous Products"><i class="bi bi-chevron-left"></i></button>',
    nextArrow:
      '<button class="slick-arrow slick-next products-nav-btn" aria-label="Next Products"><i class="bi bi-chevron-right"></i></button>',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          arrows: true,
          autoplay: true,
          infinite: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          arrows: true,
          dots: false,
          autoplay: true,
          infinite: false,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          arrows: true,
          dots: false,
          autoplay: true,
          infinite: false,
          centerMode: true,
          centerPadding: "20px",
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
  mostValued: any = {}

  subCatValue: any = ""
  selectedMainCategory = ""
  email: any = ""
  isLoadingProducts = false
  isLoadingSubCategories = false
  isLoadingBlogs = false

  // Mock data for demo
  cartItems = 0
  finalPrice = 0.0
  profileData: any = null

  constructor(
    private api1: Api1Service,
    public gs: GlobleService,
    private httpService: HttpService,
    private paginationService: PaginationService,
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
    this.getAllBlogbanners()
    this.getCouponDiscount()
  }

  initializeMobileMenu(): void {
    // Initialize mobile submenu state
    this.mobileSubmenuOpen = new Array(10).fill(false)
  }

  getCouponDiscount() {
    return this.httpService.get(APIURLs.getAllCouponAPI).subscribe(
      (res: any) => {
        const coupons = res.data?.data || res.data || []
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

  setupSearchControl(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      if (value && value.length > 2) {
        // Search in products
        this.httpService.get(APIURLs.getAllProductAPI, { search: value, limit: 6 }).subscribe(
          (res: any) => {
            this.searchProductList = res.data?.data || res.data || []
            this.showSearchDropdown = this.searchProductList.length > 0
          },
          (err) => {
            this.searchProductList = []
            this.showSearchDropdown = false
          },
        )
      } else {
        this.searchProductList = []
        this.showSearchDropdown = false
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
          this.gs.successToaster(res?.msg || "Subscribed successfully!")
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
    this.isLoadingBlogs = true
    this.httpService.get(APIURLs.getLatestBlogAPI, { limit: 4 }).subscribe(
      (res: any) => {
        this.allBlogs = res.data?.data || res.data || []
        this.isLoadingBlogs = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
        this.allBlogs = []
        this.isLoadingBlogs = false
      },
    )
  }

  getLatestProd(): void {
    this.httpService.get(APIURLs.getLatestProductAPI, { limit: 10 }).subscribe(
      (res: any) => {
        this.products = res.data?.data || res.data || []
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
    this.httpService.get(APIURLs.getAllBestSellerAPI, { limit: 10 }).subscribe(
      (res: any) => {
        this.bestSellings = res.data?.data || res.data || []
      },
      (err) => {
        console.log("Error fetching best sellers:", err)
      },
    )
  }

  getMostLoved(): void {
    this.httpService.get(APIURLs.getAllMostLovedAPI, { limit: 10 }).subscribe(
      (res: any) => {
        this.mostLoved = res.data?.data || res.data || []
      },
      (err) => {
        console.log("Error fetching most loved:", err)
      },
    )
  }

  getMostPopular(): void {
    this.httpService.get(APIURLs.getAllMostPopularAPI, { limit: 10 }).subscribe(
      (res: any) => {
        this.mostPopular = res.data?.data || res.data || []
      },
      (err) => {
        console.log("Error fetching most popular:", err)
      },
    )
  }

  getAllMainCategory(): void {
    this.httpService.get(APIURLs.getAllMainCatAPI).subscribe(
      (res: any) => {
        this.mainCategory = res.data?.data || res.data || []
        this.initializeMobileMenu()
        console.log("Categories loaded:", this.mainCategory.length)
        // Initialize with first category after fetching
        if (this.mainCategory.length > 0) {
          this.initializeFirstCategory()
        }
      },
      (err) => {
        console.log("Error fetching categories:", err)
      },
    )
  }

  getAllBlogbanners(): void {
    this.httpService.get(APIURLs.getAllBannersAPI).subscribe(
      (res: any) => {
        this.blogBannerList = res.data?.data || res.data || []
      },
      (err) => {
        console.log("Error fetching blog banners:", err)
      },
    )
  }

  initializeFirstCategory(): void {
    if (this.mainCategory.length > 0) {
      const firstCategory = this.mainCategory[0]
      this.selectedMainCategory = firstCategory._id
      console.log("Initializing with first category:", firstCategory.name)
      this.loadSubCategories(firstCategory._id, true)
    }
  }

  onCategoryChange(event: any): void {
    const categoryId = event.target.value
    if (!categoryId) return

    console.log("Category changed to:", categoryId)
    this.selectedMainCategory = categoryId
    this.clearProductData() // Clear existing data immediately
    this.loadSubCategories(categoryId, true)
  }

  onSubCategoryChange(event: any): void {
    const subCatId = event.target.value
    if (!subCatId) return

    console.log("Subcategory changed to:", subCatId)
    this.subCatValue = subCatId
    this.loadProducts({
      catid: this.selectedMainCategory,
      subCatid: subCatId,
    })
  }

  loadSubCategories(categoryId: string, autoSelectFirst = false): void {
    this.isLoadingSubCategories = true
    this.subCategory = []
    this.subCatValue = ""

    console.log("Loading subcategories for category:", categoryId)
    this.httpService.post(APIURLs.subCatByMainAPI, { id: categoryId }).subscribe(
      (res: any) => {
        this.isLoadingSubCategories = false
        this.subCategory = res.data?.data || res.data || []
        console.log("Subcategories loaded:", this.subCategory.length)

        if (this.subCategory.length > 0 && autoSelectFirst) {
          // Auto-select first subcategory
          this.subCatValue = this.subCategory[0]._id
          console.log("Auto-selected first subcategory:", this.subCatValue)
          this.loadProducts({
            catid: this.selectedMainCategory,
            subCatid: this.subCatValue,
          })
        } else if (this.subCategory.length === 0) {
          // No subcategories, load products by main category only
          console.log("No subcategories, loading products by main category only")
          this.loadProducts({ catid: this.selectedMainCategory })
        }
      },
      (err) => {
        this.isLoadingSubCategories = false
        this.subCategory = []
        this.subCatValue = ""
        console.log("Error fetching subcategories:", err)
        // Load products by main category only if subcategory fetch fails
        this.loadProducts({ catid: this.selectedMainCategory })
      },
    )
  }

  loadProducts(payload: any): void {
    this.isLoadingProducts = true
    this.clearProductData()

    console.log("Loading products with payload:", payload)

    this.httpService.post(APIURLs.getProductByCatAPI, { ...payload, limit: 12 }).subscribe(
      (res: any) => {
        this.isLoadingProducts = false
        const products = res.data?.data || res.data || []
        this.customeBannerList = [...products] // Create new array to trigger change detection
        console.log("Products loaded successfully:", this.customeBannerList.length)
      },
      (err) => {
        this.isLoadingProducts = false
        console.log("Error fetching products by category:", err)
        this.customeBannerList = []
        this.gs.errorToaster("Failed to load products. Please try again.")
      },
    )
  }

  clearProductData(): void {
    this.customeBannerList = []
  }

  resetFilters(): void {
    this.selectedMainCategory = ""
    this.subCatValue = ""
    this.subCategory = []
    this.clearProductData()
    this.isLoadingProducts = false
    this.isLoadingSubCategories = false
  }

  // Utility methods for better UI handling
  trackByProductId(index: number, item: any): any {
    return item._id || index
  }

  onImageError(event: any): void {
    event.target.src = "assets/images/placeholder-product.jpg"
  }

  quickViewProduct(product: any): void {
    // Implement quick view functionality
    console.log("Quick view for product:", product.productname)
  }

  getStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating)
    return Array(fullStars).fill(0)
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5
  }

  getEmptyStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)
    return Array(Math.max(0, emptyStars)).fill(0)
  }

  redirectbannerTo(link: any): void {
    window.open(link, "_blank")
  }

  logout(): void {
    // Implement logout logic
    this.gs.successToaster("Logged out successfully")
  }
}
