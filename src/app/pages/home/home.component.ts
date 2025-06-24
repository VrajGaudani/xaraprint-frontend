import { Component } from '@angular/core';
import { window } from 'rxjs';
import { Api1Service } from 'src/app/service/api1.service';
import { GlobleService } from 'src/app/service/globle.service';
import { HttpService } from 'src/app/service/http.service';
import { APIURLs } from 'src/environments/apiUrls';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', './home.sass']
})


export class HomeComponent {
  private window!: Window;

  slideConfigForML = {
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
    arrows: true,
    centerMode: true,
    centerPadding: '30px',
    prevArrow: '<button class="slick-arrow slick-prev-custom">‹</button>',
    nextArrow: '<button class="slick-arrow slick-next-custom">›</button>',
    responsive: [
      {
        breakpoint: 998,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 650,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
    arrows: true,
    centerMode: true,
    prevArrow: '<button class="slick-arrow slick-prev-custom">‹</button>',
    nextArrow: '<button class="slick-arrow slick-next-custom">›</button>',
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 767,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 400,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  currentIndex = 0;
  itemsPerView = 4;

  // most loved
  currentIndexML = 0;
  itemsPerViewML = 2;

  // most popular
  currentIndexMP = 0;
  itemsPerViewMP = 3;

  // offering custome banners
  currentIndexCB = 0;
  itemsPerViewCB = 3;

  products: any = [];
  bestSellings: any = [];
  mostLoved: any = [];
  mostPopular: any = [];
  mainCategory: any = [];
  customeBannerList: any = [];
  blogBannerList: any = [];
  subCategory: any = [];
  subCatValue: any = '0';
  selectedMainCategory: string = '';

  allBlogs: any = []
  email: any = ""
  constructor(
    private api1: Api1Service,
    public gs: GlobleService,
    private httpService: HttpService
  ) {

  }

  ngOnInit(): void {
    this.getBlogs()
    this.getLatestProd()
    this.getBestSelling()
    this.getMostLoved()
    this.getMostPopular()
    this.getAllMainCategory()
    this.getAllbanners()
    this.getAllBlogbanners()
  }


  nextSlide() {
    if (this.currentIndex < this.products.length - this.itemsPerView) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;  // Loop back to the first slide
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.products.length - this.itemsPerView;  // Loop back to the last slide
    }
  }

  prevSlideMostLoved() {
    if (this.currentIndexML > 0) {
      this.currentIndexML--;
    } else {
      this.currentIndexML = this.mostLoved.length - this.itemsPerViewML;
    }
  }

  nextSlideMostLoved() {
    if (this.currentIndexML < this.mostLoved.length - this.itemsPerViewML) {
      this.currentIndexML++;
    } else {
      this.currentIndexML = 0;
    }
  }

  prevSlideMostPopular() {
    if (this.currentIndexMP > 0) {
      this.currentIndexMP--;
    } else {
      this.currentIndexMP = this.mostPopular.length - this.itemsPerViewMP;
    }
  }

  nextSlideMostPopular() {
    if (this.currentIndexMP < this.mostPopular.length - this.itemsPerViewMP) {
      this.currentIndexMP++;
    } else {
      this.currentIndexMP = 0;
    }
  }

  prevSlideCustomeBanner() {
    if (this.currentIndexCB > 0) {
      this.currentIndexCB--;
    } else {
      this.currentIndexCB = this.customeBannerList.length - this.itemsPerViewCB;
    }
  }

  nextSlideCustomeBanner() {
    if (this.currentIndexCB < this.customeBannerList.length - this.itemsPerViewCB) {
      this.currentIndexCB++;
    } else {
      this.currentIndexCB = 0;
    }
  }

  submit() {

    if (this.email) {
      this.httpService.post(APIURLs.subscribeNewsLetterAPI, { email: this.email }).subscribe((res: any) => {
        this.gs.successToaster(res?.msg);
      }, (err) => {
        this.gs.errorToaster(err?.error?.msg || "something went wrong !!");
      })
    }
  }

  getBlogs() {
    this.httpService.get(APIURLs.getLatestBlogAPI).subscribe((res: any) => {
      this.allBlogs = res.data;
    }, (err) => {
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!");
      this.allBlogs = []
    })
  }

  getLatestProd() {
    this.httpService.get(APIURLs.getLatestProductAPI).subscribe((res: any) => {
      this.products = res.data;
      for (let i in this.products) {
        this.products[i].min_size_obj = {};
        if (this.products[i].sizes.length) {
          for (let j in this.products[i].sizes) {
            this.products[i].sizes[j].total_price = parseFloat(this.products[i].sizes[j].sq_ft) * parseFloat(this.products[i].sizes[j].price)
          }
        }
        this.products[i].min_size_obj = this.products[i].sizes.reduce((prev: any, curr: any) => (curr.total_price < prev.total_price ? curr : prev))
      }
    }, (err) => {
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
    })
  }

  getBestSelling() {
    this.httpService.get(APIURLs.getAllBestSellerAPI).subscribe((res: any) => {
      this.bestSellings = res.data;
    }, (err) => {
      console.log("err -->", err)
    })
  }

  getMostLoved() {
    this.httpService.get(APIURLs.getAllMostLovedAPI).subscribe((res: any) => {
      this.mostLoved = res.data;
    }, (err) => {
      console.log("err -->", err)
    })
  }

  getMostPopular() {
    this.httpService.get(APIURLs.getAllMostPopularAPI).subscribe((res: any) => {
      this.mostPopular = res.data;
    }, (err) => {
      console.log("err -->", err)
    })
  }

  getAllMainCategory() {
    this.httpService.get(APIURLs.getAllMainCatAPI).subscribe((res: any) => {
      this.mainCategory = res.data;
    }, (err) => {
      console.log("err -->", err)
    })
  }

  getAllbanners() {
    this.httpService.get(APIURLs.getAllBannersAPI).subscribe((res: any) => {
      this.customeBannerList = res.data;
    }, (err) => {
      console.log("err -->", err)
    })
  }

  changeCategory(event: any) {
    this.selectedMainCategory = event.target.value
    this.getSubCategory(event.target.value)
    this.getProductBycategory({ "catid": event.target.value })
  }

  getSubCategory(id: string) {
    this.httpService.post(APIURLs.subCatByMainAPI, { id }).subscribe((res: any) => {
      this.subCatValue = '0'
      this.subCategory = res.data;
    }, (err) => {
      this.subCategory = []
      this.subCatValue = '0'
      console.log("err -->", err)
    })
  }

  changeSubCategory(event: any) {
    this.getProductBycategory({ "catid": this.selectedMainCategory, "subCatid": event.target.value })
  }

  getProductBycategory(payload: any) {
    this.httpService.post(APIURLs.getProductByCatAPI, payload).subscribe((res: any) => {
      this.customeBannerList = res.data
    }, (err) => {
      console.log("err -->", err)
      this.customeBannerList = []
    })
  }

  getAllBlogbanners() {
    this.httpService.get(APIURLs.bannersListAPI).subscribe((res: any) => {
      this.blogBannerList = res.data;
    }, (err) => {
      console.log("err -->", err)
    })
  }

  redirectbannerTo(link: any) {
    this.window.open(link, "_blank")
  }

}
