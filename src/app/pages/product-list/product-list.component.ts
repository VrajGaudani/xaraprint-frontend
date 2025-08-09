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
    this.initializeFromRoute()
    this.loadCategories()
    this.loadProducts()
  }

  initializeFromRoute(): void {
    // read slug path param if present
    this.route.params.subscribe((params) => {
      const slug = params['slug']
      // slug is optional and not directly used server-side in current API; rely on query params for ids
    })

    // read query params for filters
    this.route.queryParams.subscribe((params) => {
      this.paginationParams.page = Number.parseInt(params["page"]) || 1
      this.paginationParams.limit = Number.parseInt(params["limit"]) || 10
      this.paginationParams.search = params["search"] || ""
      this.paginationParams.sortBy = params["sortBy"] || "createdAt"
      this.paginationParams.sortOrder =
        params["sortOrder"] === "asc" || params["sortOrder"] === "desc" ? params["sortOrder"] : "desc"

      // accept category/subCategory from multiple possible keys for backward compatibility
      this.selectedCategory = params["category"] || params["cat_url"] || ""
      this.selectedSubCategory = params["subCategory"] || params["sub_cat"] || ""

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

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement
    const sortValue = target.value

    const sortOption = this.sortOptions.find((opt) => sortValue.includes(opt.value) || sortValue === opt.label)

    if (sortOption) {
      this.paginationParams.sortBy = sortOption.value
      this.paginationParams.sortOrder = sortOption.order as "asc" | "desc"
    } else {
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

  getChecked(event: Event): boolean {
    return (event.target as HTMLInputElement)?.checked ?? false;
  }

  getValue(event: Event): string {
    return (event.target as HTMLSelectElement)?.value ?? '';
  }
}
