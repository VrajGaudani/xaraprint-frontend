import { Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import { Api1Service } from "src/app/service/api1.service"
import { FileUploadService } from "src/app/service/file-upload.service"
import { GlobleService } from "src/app/service/globle.service"
import { HttpService } from "src/app/service/http.service"
import { APIURLs } from "src/environments/apiUrls"

declare var $: any

interface RatingData {
  progress: number
  count: number
}

interface ProductSize {
  _id?: string
  size: string
  price: number
  total_price: number
  shape: string
  sq_ft: number
  ngClass?: string
}

interface ProductOption {
  main_title: string
  details: Array<{
    _id?: string
    name: string
    price: number
    ngClass?: string
  }>
}

interface Product {
  _id: string
  productname: string
  price: number
  custom_size_price?: number
  product_images: string[]
  sizes?: ProductSize[]
  otherObj?: ProductOption[],
  add_custom_size?: boolean,
  product_description?: string,
  bulk_qty?: Array<{
    qty: number
    discount: number
  }>
  discount?: number | string
}

interface CartItem {
  upload_art_image: string
  details: any[]
  qty: number
  product_id: string
  user_id?: string
  custom_size?: boolean
  price?: number
  shape?: string
  size?: string
  sq_ft?: number
  size_total_price?: number
  discount_amount?: number
  discount_percentage?: number
  orignal_price?: number
  after_discount_price?: number
  cart_status?: string
  single_price?: number
}

@Component({
  selector: "app-product-details",
  templateUrl: "./product-details.component.html",
  styleUrls: ["./product-details.component.scss"],
})
export class ProductDetailsComponent implements OnInit {
  @ViewChild("popularTab") popularTab!: ElementRef
  @ViewChild("customTab") customTab!: ElementRef

  imageData: any
  formObj: Product = {
    _id: "",
    productname: "",
    price: 0,
    product_images: [],
    add_custom_size: false
  }
  product_price: number = 0
  discount_price: number = 0
  size_mode: string = ""
  custom_size: {
    height?: number
    width?: number
    totalft?: number
  } = {}
  prod_qty: number = 1
  discount: number = 0

  isInCart: boolean = false

  uploadlater: boolean = false
  uploadnow: boolean = false

  currentTab: number = 1

  cartObj: CartItem = {
    upload_art_image: "",
    details: [],
    qty: 1,
    product_id: ""
  }

  single_product_price: number = 0

  alreadyExistObj: any = {}

  currentIndex: number = 0
  images: string[] = []
  modelViewType: number = 0
  modelViewName: string = "Select Design Method"
  imageName: string = ""
  proid: string = ""

  reviewForm: FormGroup
  stars: number[] = [1, 2, 3, 4, 5]
  selectedRating: number = 0
  reviewList: any[] = []
  reviewSummaryData: any = {
    totalReviews: 0,
    ratingGroups: []
  }

  ratingData: { [key: number]: RatingData } = {
    1: { progress: 0, count: 0 },
    2: { progress: 0, count: 0 },
    3: { progress: 0, count: 0 },
    4: { progress: 0, count: 0 },
    5: { progress: 0, count: 0 },
  }

  display_price: number = 0;

  constructor(
    private api1: Api1Service,
    public gs: GlobleService,
    private file: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
    private httpService: HttpService,
    private fb: FormBuilder,
  ) {
    this.reviewForm = this.fb.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      rating: [null, Validators.required],
    })
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      this.proid = paramMap.get("id") || ""
      if (this.proid) {
        this.getProduct(this.proid)
        this.getAllproductReview()
        this.getReviewSummary()
      }
    })
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length
  }

  previous(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length
  }

  setCurrentIndex(index: number): void {
    this.currentIndex = index
    for (const i in this.images) {
      this.images[i] = this.images[i] // Reset ngClass if needed
    }
  }

  getProduct(id: string): void {
    this.httpService.get(APIURLs.getProductByIdAPI + "/" + id).subscribe(
      (res: any) => {
        console.log("res -->", res)

        this.formObj = res.data || {
          _id: "",
          productname: "",
          price: 0,
          product_images: []
        }
        this.images = this.formObj.product_images || []
        this.imageData = res.data?.data || res.data || []

        console.log("this.formObj -->", this.formObj)

        // Initialize sizes
        if (this.formObj.sizes && this.formObj.sizes.length > 0) {
          for (const i in this.formObj.sizes) {
            this.formObj.sizes[i].total_price = Number.parseFloat(this.formObj.sizes?.[i]?.price.toString()) || 0
            this.formObj.sizes[i].ngClass = "" // No size is active by default
          }
        }

        // Initialize other objects
        if (this.formObj.otherObj && this.formObj.otherObj.length > 0) {
          for (const i in this.formObj.otherObj) {
            if (this.formObj.otherObj[i].details && this.formObj.otherObj[i].details.length > 0) {
              // No option is active by default
              this.formObj.otherObj[i].details.forEach(detail => detail.ngClass = "");
            }
          }
        }

        // Calculate pricing immediately after initialization
        this.FinalCalculation()
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
      },
    )
  }

  addActiveClass(otherIndex: number, detailsIndex: number): void {
    if (this.formObj.otherObj && this.formObj.otherObj[otherIndex]) {
      for (const j in this.formObj.otherObj[otherIndex].details) {
        if (j == detailsIndex.toString()) {
          this.formObj.otherObj[otherIndex].details[detailsIndex].ngClass = "active"
        } else {
          this.formObj.otherObj[otherIndex].details[parseInt(j)].ngClass = ""
        }
      }
    }

    this.FinalCalculation()
    this.qtyCalculation()
  }

  sizePrice(data: any, index: number): void {
    if (this.formObj.sizes) {
      for (const i in this.formObj.sizes) {
        if (i == index.toString()) {
          this.formObj.sizes[index].ngClass = "active"
          this.size_mode = this.formObj.sizes[index].shape
        } else {
          this.formObj.sizes[parseInt(i)].ngClass = ""
        }
      }
    }

    this.FinalCalculation()
    this.qtyCalculation()
  }

  customCalculation(name: string, size: any): void {
    // Clear any existing size selections
    if (this.formObj.sizes) {
      this.formObj.sizes.forEach((sizeItem: ProductSize) => {
        sizeItem.ngClass = ""
      })
    }

    // Validate custom size inputs
    const height = Number.parseFloat(this.custom_size.height?.toString() || "0") || 0
    const width = Number.parseFloat(this.custom_size.width?.toString() || "0") || 0

    if (height <= 0 || width <= 0) {
      this.gs.errorToaster("Please enter valid dimensions")
      return
    }

    // Calculate total square feet
    this.custom_size.totalft = Number.parseFloat((height * width).toFixed(2))
    
    console.log("Custom size calculation:")
    console.log("Height:", height)
    console.log("Width:", width)
    console.log("Total sq ft:", this.custom_size.totalft)

    // Recalculate pricing
    this.FinalCalculation()
  }

  clearCustom(): void {
    this.custom_size = {}
    this.FinalCalculation()
  }

  FinalCalculation(): void {
    // Start with the base product price
    let basePrice = Number(this.formObj.price) || 0;

    // If a size is selected (ngClass == 'active'), use its price instead of base price
    let sizeActiveData = this.formObj.sizes?.find((size: any) => size.ngClass == "active");
    if (sizeActiveData) {
      basePrice = Number(sizeActiveData.price) || 0;
    }

    // If custom size is enabled and selected, use custom size price instead of base price
    if (this.formObj.add_custom_size && this.custom_size.totalft) {
      basePrice = Number(this.custom_size.totalft) * Number(this.formObj.custom_size_price || 0);
    }

    // Add any selected options to the base price
    let additionalPrice = 0;
    if (this.formObj.otherObj) {
      const detailsActiveData = this.formObj.otherObj.map((obj: any) => ({
        main_title: obj.main_title,
        details: obj.details.filter((detail: any) => detail.ngClass == "active"),
      }));

      for (const obj of detailsActiveData) {
        for (const detail of obj.details) {
          additionalPrice += Number(detail.price) || 0;
        }
      }
    }

    // Set the display price for a single unit (no quantity, no discount)
    this.display_price = basePrice + additionalPrice;

    // Now update the price for the selected quantity and discounts
    this.qtyCalculation();
  }

  minus(): void {
    if (this.prod_qty == 1) {
      return
    }
    this.prod_qty = this.prod_qty - 1
    this.qtyCalculation()
  }

  plus(): void {
    this.prod_qty = this.prod_qty + 1
    this.qtyCalculation()
  }

  qtyCalculation(): void {
    // Use the display price for a single unit
    const unitPrice = this.display_price;
    const quantity = this.prod_qty;

    // Calculate total price for quantity
    const totalPrice = unitPrice * quantity;

    // Get discount percentage - prioritize bulk quantity discount over product discount
    let discountPercentage = 0;
    
    // First check if bulk quantity discount applies
    if (this.formObj.bulk_qty && this.formObj.bulk_qty.length > 0) {
      discountPercentage = this.calculateDiscount(quantity, this.formObj.bulk_qty);
    }
    
    // If no bulk discount applies, use product discount
    if (discountPercentage === 0 && this.formObj.discount) {
      discountPercentage = Number(this.formObj.discount) || 0;
    }

    // Calculate discount amount
    const discountAmount = (totalPrice * discountPercentage) / 100;
    const finalPrice = totalPrice - discountAmount;

    // Round to 2 decimal places to avoid floating point issues
    this.product_price = Number(totalPrice.toFixed(2));
    this.discount_price = Number(finalPrice.toFixed(2));
    this.discount = discountPercentage;
  }

  calculateDiscount(quantity: number, discounts: Array<{qty: number, discount: number}>): number {
    if (!discounts || !Array.isArray(discounts)) return 0

    for (let i = discounts.length - 1; i >= 0; i--) {
      if (quantity >= discounts[i].qty) {
        return discounts[i].discount
      }
    }
    return 0
  }

  addToCart(): void {
    if (!this.gs.getItem("token")) {
      this.gs.errorToaster("please login")
      return
    }

    let detailsActiveData: any[] = []
    if (this.formObj.otherObj) {
      detailsActiveData = this.formObj.otherObj.map((obj: ProductOption) => ({
        main_title: obj.main_title,
        details: obj.details.filter((detail) => detail.ngClass == "active"),
      }))
    }

    const sizeActiveData = this.formObj.sizes?.find((size: ProductSize) => size.ngClass == "active")

    this.cartObj.details = detailsActiveData
    this.cartObj.qty = this.prod_qty
    this.cartObj.product_id = this.formObj._id

    if (this.custom_size.totalft) {
      // Custom size selected
      this.cartObj.custom_size = true
      this.cartObj.price = Number(this.formObj.custom_size_price || 0)
      this.cartObj.shape = "Custom"
      this.cartObj.size = `${this.custom_size.height}x${this.custom_size.width}`
      this.cartObj.sq_ft = this.custom_size.totalft
      this.cartObj.size_total_price = Number(this.custom_size.totalft) * Number(this.formObj.custom_size_price || 0)
      this.cartObj.single_price = this.display_price // Use display_price for single unit price
    } else if (sizeActiveData) {
      // Predefined size selected
      this.cartObj.custom_size = false
      this.cartObj.price = sizeActiveData.price
      this.cartObj.shape = sizeActiveData.shape
      this.cartObj.size = sizeActiveData.size
      this.cartObj.sq_ft = sizeActiveData.sq_ft
      this.cartObj.size_total_price = sizeActiveData.total_price
      this.cartObj.single_price = this.display_price // Use display_price for single unit price
    } else {
      // No size selected, use base product price
      this.cartObj.custom_size = false
      this.cartObj.price = Number(this.formObj.price || 0)
      this.cartObj.shape = ""
      this.cartObj.size = ""
      this.cartObj.sq_ft = 0
      this.cartObj.size_total_price = Number(this.formObj.price || 0)
      this.cartObj.single_price = this.display_price // Use display_price for single unit price
    }

    // Set the original price (before discount) for the cart item
    this.cartObj.orignal_price = this.product_price
    this.cartObj.after_discount_price = this.discount_price
    this.cartObj.discount_percentage = this.discount
    this.cartObj.discount_amount = (Number(this.discount) * this.product_price) / 100
    this.cartObj.cart_status = "cart"

    this.httpService.post(APIURLs.addItemInCartAPI, this.cartObj).subscribe(
      (res: any) => {
        this.router.navigate(["/cart"])
        this.gs.successToaster(res?.msg || "Item added to cart successfully!")
      },
      (err: any) => {
        this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
      },
    )
  }

  changeviewtype(type: number): void {
    this.modelViewType = Number(type)

    if (this.modelViewType == 1) {
      this.modelViewName = "Select Preferred Design Method"
    } else if (this.modelViewType == 2) {
      this.modelViewName = "Select Preferred Design Method"
    } else if (this.modelViewType == 3) {
      this.modelViewName = "Benefits you get with Hire a Designer service"
    }
  }

  closeViewTypeModal(type: string): void {
    if (type == "1") {
      this.modelViewType = 0
      this.modelViewName = "Select Design Method"
    } else {
      // Using jQuery - make sure jQuery is available
      if (typeof $ !== 'undefined') {
        $("#selectDesignModal").modal("hide")
      }
      this.modelViewType = 0
      this.modelViewName = "Select Design Method"
    }
  }

  imageViewModal(name: string): void {
    // Using jQuery - make sure jQuery is available
    if (typeof $ !== 'undefined') {
      $("#imageModal").modal("show")
    }
    this.imageName = name
  }

  updateCart(): void {
    let detailsActiveData: any[] = []
    if (this.formObj.otherObj) {
      detailsActiveData = this.formObj.otherObj.map((obj: ProductOption) => ({
        main_title: obj.main_title,
        details: obj.details.filter((detail) => detail.ngClass == "active"),
      }))
    }

    const sizeActiveData = this.formObj.sizes?.find((size: ProductSize) => size.ngClass == "active")

    this.cartObj.details = detailsActiveData
    this.cartObj.qty = this.prod_qty
    this.cartObj.product_id = this.formObj._id
    this.cartObj.user_id = this.gs.userDataObj?._id

    if (this.custom_size.totalft) {
      // Custom size selected
      this.cartObj.custom_size = true
      this.cartObj.price = Number(this.formObj.custom_size_price || 0)
      this.cartObj.shape = "Custom"
      this.cartObj.size = `${this.custom_size.height}x${this.custom_size.width}`
      this.cartObj.sq_ft = this.custom_size.totalft
      this.cartObj.size_total_price = Number(this.custom_size.totalft) * Number(this.formObj.custom_size_price || 0)
      this.cartObj.single_price = this.display_price // Use display_price for single unit price
    } else if (sizeActiveData) {
      // Predefined size selected
      this.cartObj.custom_size = false
      this.cartObj.price = sizeActiveData.price
      this.cartObj.shape = sizeActiveData.shape
      this.cartObj.size = sizeActiveData.size
      this.cartObj.sq_ft = sizeActiveData.sq_ft
      this.cartObj.size_total_price = sizeActiveData.total_price
      this.cartObj.single_price = this.display_price // Use display_price for single unit price
    } else {
      // No size selected, use base product price
      this.cartObj.custom_size = false
      this.cartObj.price = Number(this.formObj.price || 0)
      this.cartObj.shape = ""
      this.cartObj.size = ""
      this.cartObj.sq_ft = 0
      this.cartObj.size_total_price = Number(this.formObj.price || 0)
      this.cartObj.single_price = this.display_price // Use display_price for single unit price
    }

    // Set the original price (before discount) for the cart item
    this.cartObj.orignal_price = this.product_price
    this.cartObj.after_discount_price = this.discount_price
    this.cartObj.discount_percentage = this.discount
    this.cartObj.discount_amount = (Number(this.discount) * this.product_price) / 100
    this.cartObj.cart_status = "cart"

    this.httpService.post(APIURLs.updateCartAPI, this.cartObj).subscribe(
      (res: any) => {
        this.gs.successToaster(res?.msg || "Cart updated successfully!")
      },
      (err: any) => {
        this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
      },
    )
  }

  selectRating(rating: number): void {
    this.selectedRating = rating
    this.reviewForm.controls["rating"].setValue(rating)
  }

  submitReview(): void {
    if (this.reviewForm.valid) {
      console.log("Review Submitted:", this.reviewForm.value)
      const reviewData = { ...this.reviewForm.value, productId: this.proid }
      this.httpService.post(APIURLs.addReviewAPI, reviewData).subscribe(
        (res: any) => {
          this.reviewForm.reset()
          this.selectedRating = 0
          this.gs.successToaster(res?.msg || "Review submitted successfully!")
          this.getAllproductReview()
          this.getReviewSummary()
        },
        (err: any) => {
          this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
        },
      )
    } else {
      this.gs.errorToaster("Please fill all required fields!")
    }
  }

  getAllproductReview(): void {
    this.httpService.get(APIURLs.getProductReviewAPI + "/" + this.proid).subscribe(
      (res: any) => {
        this.reviewList = res.data?.data || res.data || []
        console.log("this.reviewList-- >", this.reviewList)
      },
      (err: any) => {
        this.reviewList = []
        this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
      },
    )
  }

  getReviewSummary(): void {
    this.httpService.get(APIURLs.getReviewSummaryAPI + "/" + this.proid).subscribe(
      (res: any) => {
        this.reviewSummaryData = res.data?.data ||
          res.data || {
            totalReviews: 0,
            ratingGroups: [],
          }
        this.updateRatingSummary()
      },
      (err: any) => {
        this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
      },
    )
  }

  updateRatingSummary(): void {
    const totalReviews = this.reviewSummaryData.totalReviews || 0
    const ratingGroups = this.reviewSummaryData.ratingGroups || []

    // Default to 0% if there are no reviews
    for (let i = 1; i <= 5; i++) {
      const ratingGroup: any = ratingGroups.find((group: any) => group._id === i)

      // If the rating exists, calculate percentage and update
      if (ratingGroup) {
        const percentage = (ratingGroup.count / totalReviews) * 100
        this.ratingData[i].progress = percentage
        this.ratingData[i].count = ratingGroup.count
      } else {
        this.ratingData[i].progress = 0
        this.ratingData[i].count = 0
      }
    }
  }

  cancelReview(): void {
    this.reviewForm.reset()
    this.selectedRating = 0
  }
}
