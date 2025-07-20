import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Api1Service } from "src/app/service/api1.service"
import { FileUploadService } from "src/app/service/file-upload.service"
import { GlobleService } from "src/app/service/globle.service"
import { HttpService } from "src/app/service/http.service"
import { PaginationService, PaginationParams, PaginatedResponse } from "src/app/service/pagination.service"
import { APIURLs } from "src/environments/apiUrls"

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit {
  productsArray: any = []
  loading = false
  Math = Math // Make Math available in template

  // Pagination properties
  paginationData: PaginatedResponse<any> = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPage: 0,
    hasNextPage: false,
  }

  paginationParams: PaginationParams = {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  }

  // Filter states
  selectedCategory = ""
  selectedSubCategory = ""
  // selectedUsage: string[] = []
  // selectedPrintType: string[] = []
  // selectedPriceRange: string[] = []
  // minPrice: number | null = null
  // maxPrice: number | null = null

  // Available filter options
  categories: any[] = []
  subCategories: any[] = []
  usageOptions = ["indoor", "outdoor", "events", "retail", "trade"]
  printTypeOptions = ["digital", "vinyl", "fabric", "mesh"]
  priceRangeOptions = [
    { label: "Under ₹25", value: "under25", min: 0, max: 25 },
    { label: "₹25 - ₹50", value: "25to50", min: 25, max: 50 },
    { label: "₹50 - ₹100", value: "50to100", min: 50, max: 100 },
    { label: "₹100+", value: "100plus", min: 100, max: null },
  ]

  sortOptions = [
    { label: "Best Sellers", value: "bestselling", order: "desc" },
    { label: "Price: Low to High", value: "price", order: "asc" },
    { label: "Price: High to Low", value: "price", order: "desc" },
    { label: "Newest First", value: "createdAt", order: "desc" },
    { label: "Oldest First", value: "createdAt", order: "asc" },
    { label: "Name A-Z", value: "productname", order: "asc" },
    { label: "Name Z-A", value: "productname", order: "desc" },
    { label: "Highest Rated", value: "rating", order: "desc" },
  ]

  constructor(
    private api1: Api1Service,
    public gs: GlobleService,
    private file: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
    private httpService: HttpService,
    private paginationService: PaginationService,
  ) {}

  ngOnInit(): void {
    this.initializeFromQueryParams()
    this.loadCategories()
    this.loadProducts()
  }

  initializeFromQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      this.paginationParams.page = Number.parseInt(params["page"]) || 1
      this.paginationParams.limit = Number.parseInt(params["limit"]) || 10
      this.paginationParams.search = params["search"] || ""
      this.paginationParams.sortBy = params["sortBy"] || "createdAt"
      this.paginationParams.sortOrder =
        params["sortOrder"] === "asc" || params["sortOrder"] === "desc" ? params["sortOrder"] : "desc"

      this.selectedCategory = params["category"] || ""
      this.selectedSubCategory = params["subCategory"] || ""
      // this.selectedUsage = params["usage"] ? params["usage"].split(",") : []
      // this.selectedPrintType = params["printType"] ? params["printType"].split(",") : []
      // this.selectedPriceRange = params["priceRange"] ? params["priceRange"].split(",") : []
      // this.minPrice = params["minPrice"] ? Number.parseFloat(params["minPrice"]) : null
      // this.maxPrice = params["maxPrice"] ? Number.parseFloat(params["maxPrice"]) : null

      if (this.selectedCategory) {
        this.loadSubCategories(this.selectedCategory)
      }
    })
  }

  loadCategories(): void {
    const queryString = this.paginationService.buildQueryParams({})

    this.httpService.get(`${APIURLs.getAllMainCatAPI}?${queryString}`).subscribe(
      (res: any) => {
        this.categories = res.data?.data || res.data || []
      },
      (err) => {
        console.error("Error loading categories:", err)
        this.categories = []
      },
    )
  }

  loadSubCategories(categoryId: string): void {
    if (!categoryId) {
      this.subCategories = []
      return
    }

    const queryString = this.paginationService.buildQueryParams({})

    this.httpService.post(`${APIURLs.subCatByMainAPI}?${queryString}`, { id: categoryId }).subscribe(
      (res: any) => {
        this.subCategories = res.data?.data || res.data || []
      },
      (err) => {
        console.error("Error loading subcategories:", err)
        this.subCategories = []
      },
    )
  }

  loadProducts(): void {
    this.loading = true

    const requestParams: any = {
      ...this.paginationParams,
    }

    // Add filter parameters
    if (this.selectedCategory) {
      requestParams.category = this.selectedCategory
    }
    if (this.selectedSubCategory) {
      requestParams.subCategory = this.selectedSubCategory
    }
    // if (this.selectedUsage.length > 0) {
    //   requestParams.usage = this.selectedUsage.join(",")
    // }
    // if (this.selectedPrintType.length > 0) {
    //   requestParams.printType = this.selectedPrintType.join(",")
    // }
    // if (this.minPrice !== null) {
    //   requestParams.minPrice = this.minPrice
    // }
    // if (this.maxPrice !== null) {
    //   requestParams.maxPrice = this.maxPrice
    // }

    const queryString = this.paginationService.buildQueryParams(requestParams)

    this.httpService.get(`${APIURLs.getAllProductAPI}?${queryString}`).subscribe(
      (res: any) => {
        // Handle the paginated response structure from DaoManager
        const responseData = res.data || {}
        this.productsArray = responseData.data || []
        this.paginationData = {
          data: this.productsArray,
          total: responseData.total || this.productsArray.length,
          page: responseData.page || 1,
          limit: responseData.limit || 10,
          totalPage: responseData.totalPage || 1,
          hasNextPage: responseData.hasNextPage || false,
        }

        this.processProductData()
        this.loading = false
      },
      (err) => {
        console.error("Error loading products:", err)
        this.productsArray = []
        this.paginationData = {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPage: 0,
          hasNextPage: false,
        }
        this.loading = false
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  processProductData(): void {
    for (const product of this.productsArray) {
      product.min_size_obj = {}
      if (product.sizes && product.sizes.length) {
        for (const size of product.sizes) {
          size.total_price = Number.parseFloat(size.sq_ft) * Number.parseFloat(size.price)
        }
        product.min_size_obj = product.sizes.reduce((prev: any, curr: any) =>
          curr.total_price < prev.total_price ? curr : prev,
        )
      }
    }
  }

  // Filter methods
  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId
    this.selectedSubCategory = ""
    this.subCategories = []

    if (categoryId) {
      this.loadSubCategories(categoryId)
    }

    this.resetPagination()
    this.updateQueryParams()
    this.loadProducts()
  }

  onSubCategoryChange(subCategoryId: string): void {
    this.selectedSubCategory = subCategoryId
    this.resetPagination()
    this.updateQueryParams()
    this.loadProducts()
  }

  // onUsageChange(usage: string, checked: boolean): void {
  //   if (checked) {
  //     if (!this.selectedUsage.includes(usage)) {
  //       this.selectedUsage.push(usage)
  //     }
  //   } else {
  //     this.selectedUsage = this.selectedUsage.filter((u) => u !== usage)
  //   }
  //   this.resetPagination()
  //   this.updateQueryParams()
  //   this.loadProducts()
  // }

  // onPrintTypeChange(printType: string, checked: boolean): void {
  //   if (checked) {
  //     if (!this.selectedPrintType.includes(printType)) {
  //       this.selectedPrintType.push(printType)
  //     }
  //   } else {
  //     this.selectedPrintType = this.selectedPrintType.filter((p) => p !== printType)
  //   }
  //   this.resetPagination()
  //   this.updateQueryParams()
  //   this.loadProducts()
  // }

  // onPriceRangeChange(priceRange: string, checked: boolean): void {
  //   if (checked) {
  //     if (!this.selectedPriceRange.includes(priceRange)) {
  //       this.selectedPriceRange.push(priceRange)
  //     }
  //   } else {
  //     this.selectedPriceRange = this.selectedPriceRange.filter((p) => p !== priceRange)
  //   }

  //   // Update min/max price based on selected ranges
  //   this.updatePriceRange()
  //   this.resetPagination()
  //   this.updateQueryParams()
  //   this.loadProducts()
  // }

  // updatePriceRange(): void {
  //   if (this.selectedPriceRange.length === 0) {
  //     this.minPrice = null
  //     this.maxPrice = null
  //     return
  //   }

  //   let min = Number.MAX_VALUE
  //   let max = 0

  //   for (const rangeValue of this.selectedPriceRange) {
  //     const range = this.priceRangeOptions.find((opt) => opt.value === rangeValue)
  //     if (range) {
  //       min = Math.min(min, range.min)
  //       if (range.max !== null) {
  //         max = Math.max(max, range.max)
  //       } else {
  //         max = Number.MAX_VALUE
  //       }
  //     }
  //   }

  //   this.minPrice = min === Number.MAX_VALUE ? null : min
  //   this.maxPrice = max === Number.MAX_VALUE ? null : max
  // }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement
    const sortValue = target.value

    const sortOption = this.sortOptions.find((opt) => sortValue.includes(opt.value) || sortValue === opt.label)

    if (sortOption) {
      this.paginationParams.sortBy = sortOption.value
      this.paginationParams.sortOrder = sortOption.order as "asc" | "desc"
    } else {
      // Handle custom sort format like "price_asc" or "price_desc"
      const [field, order] = sortValue.split("_")
      this.paginationParams.sortBy = field || "createdAt"
      this.paginationParams.sortOrder = order === "asc" || order === "desc" ? order : "desc"
    }

    this.resetPagination()
    this.updateQueryParams()
    this.loadProducts()
  }

  onSearchChange(searchTerm: string): void {
    this.paginationParams.search = searchTerm || ""
    this.resetPagination()
    this.updateQueryParams()
    this.loadProducts()
  }

  // Pagination methods
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.paginationData.totalPage) {
      this.paginationParams.page = page
      this.updateQueryParams()
      this.loadProducts()
      window.scrollTo(0, 0)
    }
  }

  onLimitChange(limit: number): void {
    this.paginationParams.limit = limit
    this.resetPagination()
    this.updateQueryParams()
    this.loadProducts()
  }

  resetPagination(): void {
    this.paginationParams.page = 1
  }

  clearAllFilters(): void {
    this.selectedCategory = ""
    this.selectedSubCategory = ""
    // this.selectedUsage = []
    // this.selectedPrintType = []
    // this.selectedPriceRange = []
    // this.minPrice = null
    // this.maxPrice = null
    this.paginationParams.search = ""
    this.paginationParams.sortBy = "createdAt"
    this.paginationParams.sortOrder = "desc"
    this.subCategories = []

    this.resetPagination()
    this.updateQueryParams()
    this.loadProducts()
  }

  updateQueryParams(): void {
    const queryParams: any = {
      page: this.paginationParams.page,
      limit: this.paginationParams.limit,
      sortBy: this.paginationParams.sortBy,
      sortOrder: this.paginationParams.sortOrder,
    }

    if (this.paginationParams.search) {
      queryParams.search = this.paginationParams.search
    }
    if (this.selectedCategory) {
      queryParams.category = this.selectedCategory
    }
    if (this.selectedSubCategory) {
      queryParams.subCategory = this.selectedSubCategory
    }
    // if (this.selectedUsage.length > 0) {
    //   queryParams.usage = this.selectedUsage.join(",")
    // }
    // if (this.selectedPrintType.length > 0) {
    //   queryParams.printType = this.selectedPrintType.join(",")
    // }
    // if (this.selectedPriceRange.length > 0) {
    //   queryParams.priceRange = this.selectedPriceRange.join(",")
    // }
    // if (this.minPrice !== null) {
    //   queryParams.minPrice = this.minPrice
    // }
    // if (this.maxPrice !== null) {
    //   queryParams.maxPrice = this.maxPrice
    // }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: "merge",
    })
  }

  // Utility methods
  navigate(product: any): void {
    this.router.navigate(["/product-details", product._id])
  }

  getPaginationInfo() {
    return this.paginationService.calculatePaginationInfo(
      this.paginationData.page,
      this.paginationData.totalPage,
      this.paginationData.limit,
      this.paginationData.total,
    )
  }

  // isUsageSelected(usage: string): boolean {
  //   return this.selectedUsage.includes(usage)
  // }

  // isPrintTypeSelected(printType: string): boolean {
  //   return this.selectedPrintType.includes(printType)
  // }

  // isPriceRangeSelected(priceRange: string): boolean {
  //   return this.selectedPriceRange.includes(priceRange)
  // }

  toggleGridView(): void {
    console.log("Grid view selected")
  }

  toggleListView(): void {
    console.log("List view selected")
  }

  addToWishlist(product: any): void {
    console.log("Added to wishlist:", product.productname)
    this.gs.successToaster("Added to wishlist!")
  }

  quickView(product: any): void {
    console.log("Quick view:", product.productname)
  }

  getChecked(event: Event): boolean {
    return (event.target as HTMLInputElement)?.checked ?? false;
  }

  getValue(event: Event): string {
    return (event.target as HTMLSelectElement)?.value ?? '';
  }
}
