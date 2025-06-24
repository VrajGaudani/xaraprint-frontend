import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Api1Service } from 'src/app/service/api1.service';
import { FileUploadService } from 'src/app/service/file-upload.service';
import { GlobleService } from 'src/app/service/globle.service';
import { HttpService } from 'src/app/service/http.service';
import { APIURLs } from 'src/environments/apiUrls';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  productsArray: any = []

  constructor(
    private api1: Api1Service,
    public gs: GlobleService,
    private file: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
    private httpService: HttpService,
  ) {

    this.route.queryParams.subscribe(params => {
      let categoryId = params['cat_url'];
      let subCatId = params['sub_cat'];
      if (categoryId) {
        this.getProductBycategory({ "catid": categoryId })
      }else if(subCatId){
        this.getProdUsingSlug(subCatId)
      }else{
        this.getAllproduct()
      }
    });
  }

  ngOnInit(): void {}


  getAllproduct() {
    this.httpService.post(APIURLs.getAllProductAPI, '').subscribe((res: any) => {
      this.productsArray = res.data;
      console.log('this.productsArray -->',this.productsArray)
        for (let i in this.productsArray) {
          this.productsArray[i].min_size_obj = {};
          if (this.productsArray[i].sizes.length) {
            for (let j in this.productsArray[i].sizes) {
              this.productsArray[i].sizes[j].total_price = parseFloat(this.productsArray[i].sizes[j].sq_ft) * parseFloat(this.productsArray[i].sizes[j].price)
            }
          }
          this.productsArray[i].min_size_obj = this.productsArray[i].sizes.reduce((prev: any, curr: any) => (curr.total_price < prev.total_price ? curr : prev))
        }
    },(err) => {
      this.productsArray = []
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
    })
  }

  getProdUsingSlug(id: any) {
    this.httpService.post(APIURLs.getProductBySlugAPI,{ sub_cat_id: id }).subscribe((res: any) => {
      this.productsArray = res.data;
        for (let i in this.productsArray) {
          this.productsArray[i].min_size_obj = {};
          if (this.productsArray[i].sizes.length) {
            for (let j in this.productsArray[i].sizes) {
              this.productsArray[i].sizes[j].total_price = parseFloat(this.productsArray[i].sizes[j].sq_ft) * parseFloat(this.productsArray[i].sizes[j].price)
            }
          }
          this.productsArray[i].min_size_obj = this.productsArray[i].sizes.reduce((prev: any, curr: any) => (curr.total_price < prev.total_price ? curr : prev))
        }
    },(err) => {
      this.productsArray = []
      this.gs.errorToaster(err?.error?.msg || "something went wrong !!")
    })
  }

  getProductBycategory(payload: any) {
    this.httpService.post(APIURLs.getProductByCatAPI, payload).subscribe((res: any) => {
      this.productsArray = res.data;
        for (let i in this.productsArray) {
          this.productsArray[i].min_size_obj = {};
          if (this.productsArray[i].sizes.length) {
            for (let j in this.productsArray[i].sizes) {
              this.productsArray[i].sizes[j].total_price = parseFloat(this.productsArray[i].sizes[j].sq_ft) * parseFloat(this.productsArray[i].sizes[j].price)
            }
          }
          this.productsArray[i].min_size_obj = this.productsArray[i].sizes.reduce((prev: any, curr: any) => (curr.total_price < prev.total_price ? curr : prev))
        }
    }, (err) => {
      console.log("err -->", err)
      this.productsArray = []
    })
  }

  navigate(data: any) {
    this.router.navigate(['/product-details', data._id]);
  }

}
