import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Api1Service } from "src/app/service/api1.service"
import { FileUploadService } from "src/app/service/file-upload.service"
import { GlobleService } from "src/app/service/globle.service"
import { HttpService } from "src/app/service/http.service"
import { APIURLs } from "src/environments/apiUrls"

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit {
  productsArray: any = []
  loading = false
  currentPage = 1
  totalProducts = 0
  productsPerPage = 12

  // Filter states
  selectedCategory = ""
  selectedUsage: string[] = []
  selectedPrintType: string[] = []
  selectedPriceRange: string[] = []
  sortBy = "best-sellers"

  constructor(
    private api1: Api1Service,
    public gs: GlobleService,
    private file: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
    private httpService: HttpService,
  ) {
    this.route.queryParams.subscribe((params) => {
      const categoryId = params["cat_url"]
      const subCatId = params["sub_cat"]

      if (categoryId) {
        this.selectedCategory = categoryId
        this.getProductBycategory({ catid: categoryId })
      } else if (subCatId) {
        this.getProdUsingSlug(subCatId)
      } else {
        this.getAllproduct()
      }
    })
  }

  ngOnInit(): void {
    // Initialize any additional setup
    this.setupFilters()
  }

  setupFilters(): void {
    // Setup filter event listeners or initial states
    console.log("Filters initialized")
  }

  getAllproduct() {
    this.loading = true
    this.httpService.post(APIURLs.getAllProductAPI, "").subscribe(
      (res: any) => {
        this.productsArray = res.data
        this.totalProducts = res.data.length
        this.processProductData()
        this.loading = false
      },
      (err) => {
        this.productsArray = []
        this.loading = false
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  getProdUsingSlug(id: any) {
    this.loading = true
    this.httpService.post(APIURLs.getProductBySlugAPI, { sub_cat_id: id }).subscribe(
      (res: any) => {
        this.productsArray = res.data
        this.totalProducts = res.data.length
        this.processProductData()
        this.loading = false
      },
      (err) => {
        this.productsArray = []
        this.loading = false
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  getProductBycategory(payload: any) {
    this.loading = true
    this.httpService.post(APIURLs.getProductByCatAPI, payload).subscribe(
      (res: any) => {
        this.productsArray = res.data
        this.totalProducts = res.data.length
        this.processProductData()
        this.loading = false
      },
      (err) => {
        console.log("err -->", err)
        this.productsArray = []
        this.loading = false
      },
    )
  }

  processProductData(): void {
    for (const i in this.productsArray) {
      this.productsArray[i].min_size_obj = {}
      if (this.productsArray[i].sizes && this.productsArray[i].sizes.length) {
        for (const j in this.productsArray[i].sizes) {
          this.productsArray[i].sizes[j].total_price =
            Number.parseFloat(this.productsArray[i].sizes[j].sq_ft) *
            Number.parseFloat(this.productsArray[i].sizes[j].price)
        }
        this.productsArray[i].min_size_obj = this.productsArray[i].sizes.reduce((prev: any, curr: any) =>
          curr.total_price < prev.total_price ? curr : prev,
        )
      }
    }
  }

  navigate(data: any) {
    this.router.navigate(["/product-details", data._id])
  }

  // Filter methods
  onCategoryChange(category: string): void {
    this.selectedCategory = category
    this.applyFilters()
  }

  onUsageChange(usage: string, checked: boolean): void {
    if (checked) {
      this.selectedUsage.push(usage)
    } else {
      this.selectedUsage = this.selectedUsage.filter((u) => u !== usage)
    }
    this.applyFilters()
  }

  onPrintTypeChange(printType: string, checked: boolean): void {
    if (checked) {
      this.selectedPrintType.push(printType)
    } else {
      this.selectedPrintType = this.selectedPrintType.filter((p) => p !== printType)
    }
    this.applyFilters()
  }

  onPriceRangeChange(priceRange: string, checked: boolean): void {
    if (checked) {
      this.selectedPriceRange.push(priceRange)
    } else {
      this.selectedPriceRange = this.selectedPriceRange.filter((p) => p !== priceRange)
    }
    this.applyFilters()
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy
    this.applySorting()
  }

  applyFilters(): void {
    // Implement filtering logic based on selected filters
    console.log("Applying filters:", {
      category: this.selectedCategory,
      usage: this.selectedUsage,
      printType: this.selectedPrintType,
      priceRange: this.selectedPriceRange,
    })

    // For now, just reload the products
    // In a real implementation, you would filter the products array
    this.getAllproduct()
  }

  applySorting(): void {
    // Implement sorting logic
    switch (this.sortBy) {
      case "price-low":
        this.productsArray.sort((a: any, b: any) => Number.parseFloat(a.price) - Number.parseFloat(b.price))
        break
      case "price-high":
        this.productsArray.sort((a: any, b: any) => Number.parseFloat(b.price) - Number.parseFloat(a.price))
        break
      case "newest":
        this.productsArray.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "rating":
        this.productsArray.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        // Best sellers - keep original order
        break
    }
  }

  clearAllFilters(): void {
    this.selectedCategory = ""
    this.selectedUsage = []
    this.selectedPrintType = []
    this.selectedPriceRange = []
    this.sortBy = "best-sellers"
    this.getAllproduct()
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page
    // Implement pagination logic
    window.scrollTo(0, 0)
  }

  // View toggle methods
  toggleGridView(): void {
    // Implement grid view toggle
    console.log("Grid view selected")
  }

  toggleListView(): void {
    // Implement list view toggle
    console.log("List view selected")
  }

  // Quick actions
  addToWishlist(product: any): void {
    console.log("Added to wishlist:", product.productname)
    this.gs.successToaster("Added to wishlist!")
  }

  quickView(product: any): void {
    console.log("Quick view:", product.productname)
    // Implement quick view modal
  }
}
