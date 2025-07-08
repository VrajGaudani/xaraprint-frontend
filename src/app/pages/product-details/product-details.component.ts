import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Api1Service } from 'src/app/service/api1.service';
import { FileUploadService } from 'src/app/service/file-upload.service';
import { GlobleService } from 'src/app/service/globle.service';
import { HttpService } from 'src/app/service/http.service';
import { APIURLs } from 'src/environments/apiUrls';
declare var $: any;

interface RatingData {
  progress: number;
  count: number;
}
@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  @ViewChild('popularTab') popularTab!: ElementRef;
  @ViewChild('customTab') customTab!: ElementRef;

  imageData: any;
  formObj: any = {};
  product_price: any = 0;
  discount_price: any = 0;
  size_mode: any = "";
  custom_size: any = {};
  prod_qty: any = 1;
  discount: any = 0;

  isInCart: any = false;

  uploadlater: any = false
  uploadnow: any = false

  currentTab = 1;

  cartObj: any = {
    upload_art_image: ""
  };

  single_product_price: any = 0

  alreadyExistObj: any = {}

  currentIndex: any = 0;
  images: any = [];
  modelViewType: any = 0
  modelViewName: any = "Select Design Method";
  imageName: any = "";
  proid: any = "";

  reviewForm: FormGroup;
  stars: number[] = [1, 2, 3, 4, 5];
  selectedRating: number = 0;
  reviewList: any[] = [];
  reviewSummaryData : any;

  ratingData: { [key: number]: RatingData } = {
    1: { progress: 0, count: 0 },
    2: { progress: 0, count: 0 },
    3: { progress: 0, count: 0 },
    4: { progress: 0, count: 0 },
    5: { progress: 0, count: 0 }
  };

  constructor(
    private api1: Api1Service,
    public gs: GlobleService,
    private file: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
    private httpService: HttpService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      rating: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      this.proid = paramMap.get('id');
      if (this.proid) {
        this.getProduct(this.proid);
        this.getAllproductReview();
        this.getReviewSummary();
      }
    });
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    for (let i in this.images) {
      // this.images[i].ngClass = "";
    }
    // this.images[this.currentIndex].ngClass = "activeImg"
  }

  previous() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    for (let i in this.images) {
      // this.images[i].ngClass = "";
    }
    // this.images[this.currentIndex].ngClass = "activeImg"
  }

  setCurrentIndex(index: number) {
    this.currentIndex = index;
    for (let i in this.images) {
      this.images[i].ngClass = "";
    }
    this.images[this.currentIndex].ngClass = "activeImg"
  }

  getProduct(id: any) {

    // let obj = {
    //   // product_id: "65cce230d4618a1d941eae08",
    //   product_id: id,
    //   user_id: this.gs.userDataObj._id || "",
    // }

    this.httpService.get(APIURLs.getProductByIdAPI + '/' + id).subscribe((res: any) => {
      console.log('res -->', res)
      this.images = res.data.product_images
      this.imageData = res.data

      this.formObj = res.data;
      this.images = this.formObj.product_images
      // this.images[this.currentIndex].ngClass = "activeImg";
      console.log("this.formObj -->", this.formObj)
      for (let i in this.formObj.sizes) {
        this.formObj.sizes[i].total_price = parseFloat(this.formObj.sizes?.[i]?.price) || 0
      }

      this.formObj.sizes[0].ngClass = "active";
      // this.size_mode = this.formObj.sizes[0].shape;

      for (let i in this.formObj.otherObj) {
        for (let j in this.formObj.otherObj[i].details) {
          this.formObj.otherObj[i].details[0].ngClass = "active";
        }
      }

      setTimeout(() => {
        this.FinalCalculation();

      }, 500)
    }, (err) => {
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
    })
  }


  addActiveClass(otherIndex: any, detailsIndex: any) {

    // this.prod_qty = 1;
    // this.discount = 0;
    for (let j in this.formObj.otherObj[otherIndex].details) {
      if (j == detailsIndex) {
        this.formObj.otherObj[otherIndex].details[detailsIndex].ngClass = "active";
      } else {
        this.formObj.otherObj[otherIndex].details[j].ngClass = "";
      }
    }

    this.FinalCalculation();
    this.qtyCalculation()
  }

  sizePrice(data: any, index: any) {

    // this.prod_qty = 1;
    // this.discount = 0;
    for (let i in this.formObj.sizes) {
      if (i == index) {
        this.formObj.sizes[i].ngClass = "active";
        this.size_mode = this.formObj.sizes[i].shape;
      } else {
        this.formObj.sizes[i].ngClass = "";
      }
    }

    this.FinalCalculation();
    this.qtyCalculation()
  }

  customCalculation(name: any, size: any) {

    // this.prod_qty = 1;
    // this.discount = 0;
    let sizeArray = this.formObj.sizes;

    for (let i in sizeArray) {
      sizeArray[i].height = sizeArray[i].size[0]
      sizeArray[i].width = sizeArray[i].size[2]
    }

    for (let i in sizeArray) {
      if (Number(sizeArray[i].height) == Number(this.custom_size.height) && Number(sizeArray[i].width) == Number(this.custom_size.width)) {
        // var element = document.getElementById("home-tab");
        // if (element) {
        //   element.classList.add("active");
        // }
      }
    }


    let height = Math.ceil(Number(this.custom_size.height) * 2) / 2;
    let width = Math.ceil(Number(this.custom_size.width) * 2) / 2;

    if (height && width) {
      this.custom_size.totalft = height * width;

      // this.custom_size.height = height;
      // this.custom_size.width = width;
    }

    this.FinalCalculation();
    this.qtyCalculation()
  }

  clearCustom() {
    // this.prod_qty = 1;
    // this.discount = 0;
    this.custom_size.totalft = "";
    this.custom_size.height = "";
    this.custom_size.width = "";
    this.product_price = 0;

    for (let j in this.formObj.sizes) {
      this.formObj.sizes[j].ngClass = "";
    }

    this.formObj.sizes[0].ngClass = "active";
    this.size_mode = this.formObj.sizes[0].shape;

    for (let i in this.formObj.otherObj) {
      for (let j = 0; j < this.formObj.otherObj[i].details.length; j++) {
        if (j == 0) {
          this.formObj.otherObj[i].details[0].ngClass = "active";
        } else {
          this.formObj.otherObj[i].details[0].ngClass = "";
        }
      }
    }

    this.FinalCalculation();
    this.qtyCalculation()
  }


  //for normal
  FinalCalculation() {

    this.product_price = parseInt(this.formObj?.price) || 0;
    let sizeActiveData = this.formObj.sizes.find((size: any) => size.ngClass == "active");
    console.log("sizeActiveData -->",sizeActiveData)
    if (sizeActiveData && sizeActiveData.total_price < 0) {
      this.product_price += parseFloat(sizeActiveData.total_price);
    }

    console.log("this.product_price -->",this.product_price)
    console.log("this.custom_size -->",this.custom_size)

    if (this.custom_size.totalft) {
      this.product_price = parseFloat(this.custom_size.totalft) * parseFloat(this.formObj.custom_size_price)
    }

    for (let i in this.formObj.otherObj) {
      for (let j in this.formObj.otherObj[i].details) {
        this.formObj.otherObj[i].details[j].new_price = parseFloat(this.formObj.otherObj[i].details[j].price) + this.product_price
      }
    }

    let detailsActiveData = this.formObj.otherObj.map((obj: any) => ({
      main_title: obj.main_title,
      details: obj.details.filter((detail: any) => detail.ngClass == "active")
    }));

    for (let i in detailsActiveData) {
      for (let j in detailsActiveData[i].details) {
        this.product_price += parseFloat(detailsActiveData[i].details[j].new_price)
      }
    }

    this.qtyCalculation()

    // const matchedDiscount = this.formObj.bulk_qty.find((item: any) => item.qty <= this.prod_qty);
    // if (matchedDiscount && matchedDiscount.qty) {
    //   this.discount = matchedDiscount.discount;
    //   this.discount_price = this.product_price - (this.product_price * this.discount) / 100;
    // }
  }

  //for cart
  FinalCartCalculation() {

    let price = 0;
    this.product_price = 0
    let sizeActiveData = this.formObj.sizes.find((size: any) => size.ngClass == "active");
    if (sizeActiveData && sizeActiveData.total_price) {
      this.product_price += parseFloat(sizeActiveData.total_price);
      price += parseFloat(sizeActiveData.total_price);
    }

    if (this.alreadyExistObj.custom_size) {
      price = parseFloat(this.alreadyExistObj.sq_ft) * parseFloat(this.alreadyExistObj.price)
      this.custom_size.totalft = this.alreadyExistObj.sq_ft
      this.custom_size.height = this.alreadyExistObj.size.split("x")[0]
      this.custom_size.width = this.alreadyExistObj.size.split("x")[1]

      $("#popular").removeClass("show active")
      $("#custom").addClass("show active")

      $(document).ready(() => {
        $('#tab2').tab('show');
      });
    }

    for (let i in this.formObj.otherObj) {
      for (let j in this.formObj.otherObj[i].details) {
        this.formObj.otherObj[i].details[j].new_price = parseFloat(this.formObj.otherObj[i].details[j].price) * price
      }
    }

    this.prod_qty = this.alreadyExistObj.qty;

    this.qtyCalculation()


    // const matchedDiscount = this.formObj.bulk_qty.find((item: any) => item.qty <= this.prod_qty);

    // if (matchedDiscount && matchedDiscount.qty) {
    //   this.discount = this.alreadyExistObj.discount;
    //   this.product_price = this.alreadyExistObj.orignal_price;
    //   this.discount_price = this.alreadyExistObj.discount_price;
    // } else {
    //   this.product_price = this.alreadyExistObj.orignal_price;
    // }
  }


  minus() {

    // if (this.prod_qty == 1) {
    //   this.single_product_price = this.product_price;
    // }

    if (this.prod_qty == 1) {
      return
    }

    this.prod_qty = this.prod_qty - 1;
    this.qtyCalculation()

    // this.product_price = this.single_product_price * this.prod_qty
    // this.discount = this.calculateDiscount(this.prod_qty, this.formObj.bulk_qty);
    // let tempPrice = (this.discount * this.product_price) / 100
    // this.discount_price = this.product_price - tempPrice
  }

  plus() {

    this.prod_qty = this.prod_qty + 1;
    this.qtyCalculation()

    // if (this.prod_qty == 1) {
    //   this.single_product_price = this.product_price;
    // }



    // this.product_price = this.single_product_price * this.prod_qty
    // this.discount = this.calculateDiscount(this.prod_qty, this.formObj.bulk_qty);
    // let tempPrice = (this.discount * this.product_price) / 100
    // this.discount_price = this.product_price - tempPrice
  }


  qtyCalculation() {

    let price = 0;

    let sizeActiveData = this.formObj.sizes.find((size: any) => size.ngClass == "active");
    if (sizeActiveData && sizeActiveData.total_price) {
      price += parseFloat(sizeActiveData.total_price);
    }

    if (this.custom_size.totalft) {
      price += parseFloat(this.custom_size.totalft) * parseFloat(this.formObj.custom_size_price)
    }

    for (let i in this.formObj.otherObj) {
      for (let j in this.formObj.otherObj[i].details) {
        if (this.formObj.otherObj[i].details[j].ngClass && this.formObj.otherObj[i].details[j].ngClass == 'active') {
          price += this.formObj.otherObj[i].details[j].new_price
        }
      }
    }

    this.cartObj.single_price = price; // done single price
    let multiQtyPrice = price * this.prod_qty;
    let discountPercentage = 0;
    let discountAmount = 0;
    let finalPrice = 0;

    discountPercentage = this.calculateDiscount(this.prod_qty, this.formObj.bulk_qty);
    discountAmount = (multiQtyPrice * discountPercentage) / 100;
    this.cartObj.discount_amount = discountAmount // done discount diff amount
    finalPrice = multiQtyPrice - discountAmount

    this.discount = discountPercentage
    this.product_price = multiQtyPrice;
    this.discount_price = finalPrice;

    this.cartObj.discount_percentage = this.discount; // done
    this.cartObj.orignal_price = this.product_price; // done all qty price
    this.cartObj.after_discount_price = this.discount_price // done after discount amount
  }

  calculateDiscount(quantity: any, discounts: any) {

    for (let i = discounts.length - 1; i >= 0; i--) {
      if (quantity >= discounts[i].qty) {
        return discounts[i].discount;
      }
    }
    return 0; // Return 0 if no discount found
  }


  addToCart() {
    if (!this.gs.getItem('token')) {
      this.gs.errorToaster("please login");
      return
    }

    let detailsActiveData = this.formObj.otherObj.map((obj: any) => ({
      main_title: obj.main_title,
      details: obj.details.filter((detail: any) => detail.ngClass == "active")
    }));

    let sizeActiveData = this.formObj.sizes.find((size: any) => size.ngClass == "active");

    this.cartObj.details = detailsActiveData;
    this.cartObj.qty = this.prod_qty;
    // this.cartObj.orignal_price = this.product_price
    // this.cartObj.discount_price = this.discount_price
    // this.cartObj.discount = this.discount;
    this.cartObj.product_id = this.formObj._id;
    // this.cartObj.user_id = this.gs.userDataObj._id;

    if (this.custom_size.totalft) {
      this.cartObj.custom_size = true;
      this.cartObj.price = this.formObj.custom_size_price;
      this.cartObj.shape = "";
      this.cartObj.size = `${this.custom_size.height}` + "x" + `${this.custom_size.width}`;
      this.cartObj.sq_ft = this.custom_size.totalft //roundup value
      this.cartObj.size_total_price = parseFloat(this.custom_size.totalft) * parseFloat(this.formObj.custom_size_price); //roundup price
    } else {
      this.cartObj.custom_size = false;
      this.cartObj.price = sizeActiveData.price
      this.cartObj.shape = sizeActiveData.shape
      this.cartObj.size = sizeActiveData.size
      this.cartObj.sq_ft = sizeActiveData.sq_ft
      this.cartObj.size_total_price = sizeActiveData.total_price
    }

    this.cartObj.discount_amount = (Number(this.discount) * this.cartObj.orignal_price) / 100
    // this.cartObj.final_price = this.product_price - this.cartObj.discount_amount;
    this.cartObj.cart_status = "cart";


    // console.log(">>>", this.cartObj)

    // return

    this.httpService.post(APIURLs.addItemInCartAPI, this.cartObj).subscribe((res: any) => {
      this.router.navigate(['/cart']);
      this.gs.successToaster(res?.msg)
    }, (err) => {
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
    })
  }

  // openDesignModal() {

  //   if (this.isInCart) {
  //     this.cartObj.upload_art = this.alreadyExistObj.upload_art;
  //     this.cartObj.upload_art_image = this.alreadyExistObj.upload_art_image;
  //     if (this.alreadyExistObj.upload_art == "Later") {
  //       this.uploadNow("#uploadlater")
  //     } else {
  //       this.uploadNow("#uploadnow")
  //     }
  //   }

  //   $('#selectDesignModal').modal('show');
  // }

  changeviewtype(type: any) {
    this.modelViewType = Number(type);

    if (this.modelViewType == 1) {
      this.modelViewName = "Select Preferred Design Method"
    } else if (this.modelViewType == 2) {
      this.modelViewName = "Select Preferred Design Method"
    } else if (this.modelViewType == 3) {
      this.modelViewName = "Benefits you get with Hire a Designer service";
    }
  }


  closeViewTypeModal(type: any) {
    if (type == '1') {
      this.modelViewType = 0;
      this.modelViewName = "Select Design Method";
    } else {
      $('#selectDesignModal').modal('hide');
      this.modelViewType = 0;
      this.modelViewName = "Select Design Method";
    }
  }


  // uploadNow(id: any) {

  //   this.uploadlater = false;
  //   this.uploadnow = false;

  //   $("#uploadlater").removeClass("activelogo");
  //   $("#uploadnow").removeClass("activelogo");
  //   $(id).addClass("activelogo");

  //   if (this.isInCart && id == "#uploadnow") {
  //     this.uploadnow = true;
  //   }

  //   if (this.isInCart && id == "#uploadlater") {
  //     this.uploadlater = true;
  //   }

  //   if ($("#uploadnow").hasClass("activelogo")) {
  //     this.cartObj.upload_art = "Now";
  //     this.cartObj.upload_art_image = "";
  //   }

  //   if ($("#uploadlater").hasClass("activelogo")) {
  //     this.cartObj.upload_art = "Later"
  //   }
  // }

  // uploadArt(event: any) {

  //   if (event.target.files[0].type == 'image/jpeg' ||
  //     event.target.files[0].type == 'image/png' ||
  //     event.target.files[0].type == 'image/jpg') {

  //     let file = event.target.files[0];
  //     let FileSize = event.target.files[0].size / Math.pow(1024, 2) // in MB
  //     if (FileSize > 20) {
  //       this.gs.errorToaster('File size is too Large, Maximum 5 mb Allowed')
  //     } else {
  //       this.file.saveimage(file).subscribe((res: any) => {
  //         if (res && res.status) {
  //           this.cartObj.upload_art_image = res.data[0].filename;
  //         } else {
  //           this.gs.errorToaster(res.message);
  //         }
  //       });
  //     }
  //   } else {
  //     let str = event.target.files[0].type;
  //     let splitted = str.split("/", 2);
  //     let BadUrlMsg = splitted[0];
  //     this.gs.errorToaster(BadUrlMsg + ' is not allowed');
  //   }
  // }

  imageViewModal(name: any) {
    $('#imageModal').modal('show');
    this.imageName = name;
  }

  updateCart() {

    let detailsActiveData = this.formObj.otherObj.map((obj: any) => ({
      main_title: obj.main_title,
      details: obj.details.filter((detail: any) => detail.ngClass == "active")
    }));

    let sizeActiveData = this.formObj.sizes.find((size: any) => size.ngClass == "active");

    this.cartObj.details = detailsActiveData;
    this.cartObj.qty = this.prod_qty;
    // this.cartObj.orignal_price = this.product_price
    // this.cartObj.discount_price = this.discount_price
    // this.cartObj.discount = this.discount;
    this.cartObj.product_id = this.formObj._id;
    this.cartObj.user_id = this.gs.userDataObj._id;

    if (this.custom_size.totalft) {
      this.cartObj.custom_size = true;
      this.cartObj.price = this.formObj.custom_size_price;
      this.cartObj.shape = "";
      this.cartObj.size = `${this.custom_size.height}` + "x" + `${this.custom_size.width}`;
      this.cartObj.sq_ft = this.custom_size.totalft //roundup value
      this.cartObj.size_total_price = parseFloat(this.custom_size.totalft) * parseFloat(this.formObj.custom_size_price); //roundup price
    } else {
      this.cartObj.custom_size = false;
      this.cartObj.price = sizeActiveData.price
      this.cartObj.shape = sizeActiveData.shape
      this.cartObj.size = sizeActiveData.size
      this.cartObj.sq_ft = sizeActiveData.sq_ft
      this.cartObj.size_total_price = sizeActiveData.total_price
    }

    this.cartObj.discount_amount = (Number(this.discount) * this.cartObj.orignal_price) / 100
    // this.cartObj.final_price = this.product_price - this.cartObj.discount_amount
    this.cartObj.cart_status = "cart";


    // console.log("????", this.cartObj)

    // return

    this.httpService.post(APIURLs.updateCartAPI, this.cartObj).subscribe((res: any) => {
      // this.router.navigate(['/cart']);
      this.gs.successToaster(res?.msg)
    }, (err) => {
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
    })
  }

  selectRating(rating: number) {
    this.selectedRating = rating;
    this.reviewForm.controls['rating'].setValue(rating);
  }

  submitReview() {
    if (this.reviewForm.valid) {
      console.log('Review Submitted:', this.reviewForm.value);
      this.reviewForm.value['productId'] = this.proid;
      this.httpService.post(APIURLs.addReviewAPI,this.reviewForm.value).subscribe((res: any) => {
        this.reviewForm.reset();
        this.selectedRating = 0;
        this.gs.successToaster(res?.msg || "success !!")
        this.getAllproductReview()
        this.getReviewSummary()
      }, (err) => {
        this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
      })
    }else{
      this.gs.errorToaster("invalid form data !!")
    }
  }

  getAllproductReview() {
    this.httpService.get(APIURLs.getProductReviewAPI + '/' + this.proid).subscribe((res: any) => {
      this.reviewList = res.data;
      console.log('this.reviewList-- >',this.reviewList)
    }, (err) => {
      this.reviewList = [];
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
    })
  }

  getReviewSummary() {
    this.httpService.get(APIURLs.getReviewSummaryAPI + '/' + this.proid).subscribe((res: any) => {
      this.reviewSummaryData = res.data || {
        totalReviews: 0,
        ratingGroups: []
      };
      this.updateRatingSummary();;
    }, (err) => {
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
    })
  }

  updateRatingSummary(): void {
    let totalReviews = this.reviewSummaryData.totalReviews;
    let ratingGroups = this.reviewSummaryData.ratingGroups || [];

    // Default to 0% if there are no reviews
    for (let i = 1; i <= 5; i++) {
      let ratingGroup :any = ratingGroups.find((group:any) => group._id === i);

      // If the rating exists, calculate percentage and update
      if (ratingGroup) {
        const percentage = (ratingGroup.count / totalReviews) * 100;
        this.ratingData[i].progress = percentage;
        this.ratingData[i].count = ratingGroup.count;
      } else {
        this.ratingData[i].progress = 0;
        this.ratingData[i].count = 0;
      }
    }
  }

  cancelReview() {
    this.reviewForm.reset();
    this.selectedRating = 0;
  }
}
