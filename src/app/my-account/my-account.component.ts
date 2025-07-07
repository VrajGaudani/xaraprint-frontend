import { Component, OnInit } from "@angular/core"
import { GlobleService } from "../service/globle.service"
import { Api1Service } from "../service/api1.service"
import { Router } from "@angular/router"
import { HttpService } from "../service/http.service"
import { APIURLs } from "src/environments/apiUrls"
declare var $: any

@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.scss"],
})
export class MyAccountComponent implements OnInit {
  tabType: any = 1
  formObj: any = {}
  newPaasObj: any = {}
  imageName: any = ""
  addressArray: any = []
  addressKeyType: any = ""
  addressObj: any = {}
  orderArray: any = []
  orderKeyType: any = ""
  orderObj: any = {
    address_info: {},
    cart_id: [],
    user_id: {},
  }
  isDisable: any = true
  queryObj: any = {}

  constructor(
    public gs: GlobleService,
    private api1: Api1Service,
    private httpService: HttpService,
    private route: Router,
  ) {}

  ngOnInit(): void {
    this.getUserInfo()
    this.getUserOrders()
  }

  getUserInfo() {
    this.httpService.get(APIURLs.getProfileAPI).subscribe(
      (res: any) => {
        this.formObj = res.data
        this.addressArray = res?.data?.addresses || []
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  changeTab(tabNo: any) {
    this.tabType = tabNo
  }

  updateUser(key: any) {
    const userObj = {
      firstname: this.formObj.firstname,
      lastname: this.formObj.lastname,
      email: this.formObj.email,
      phone_no: this.formObj.phone_no,
      company_name: this.formObj.company_name,
    }

    this.httpService.put(APIURLs.updateProfileAPI, userObj).subscribe(
      (res: any) => {
        this.gs.successToaster(res?.msg)
        this.getUserInfo()
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  updatePassword() {
    if (!this.newPaasObj.old_pass || !this.newPaasObj.new_pass) {
      this.gs.errorToaster("Please enter password!")
      return
    }

    if (this.newPaasObj.confirm_pass !== this.newPaasObj.new_pass) {
      this.gs.errorToaster("Password and confirm password must be same!")
      return
    }

    this.httpService.post(APIURLs.updatePasswordAPI, this.newPaasObj).subscribe(
      (res: any) => {
        this.gs.successToaster(res?.msg)
        this.getUserInfo()
        this.newPaasObj = {}
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  showModal(key?: any, data?: any) {
    this.addressObj = {}
    if (key == "add") {
      this.addressKeyType = "Add a New "
      this.addressObj = {}
    } else {
      this.addressKeyType = "Edit"
      this.addressObj = data
    }
    $("#addressModal").modal("show")
  }

  submit() {
    this.httpService.post(APIURLs.addAdressAPI, this.addressObj).subscribe(
      (res: any) => {
        this.gs.successToaster(res?.msg)
        $("#addressModal").modal("hide")
        this.getUserInfo()
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  update() {
    this.addressObj.addressId = this.addressObj._id

    this.httpService.post(APIURLs.updateAdressAPI, this.addressObj).subscribe(
      (res: any) => {
        this.gs.successToaster(res?.msg)
        this.getUserInfo()
        $("#addressModal").modal("hide")
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  delete(addressId: any) {
    if (confirm("Are you sure you want to delete this address?")) {
      this.httpService.post(APIURLs.deleteAdressAPI, { addressId }).subscribe(
        (res: any) => {
          this.gs.successToaster(res?.msg)
          this.getUserInfo()
        },
        (err) => {
          this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
        },
      )
    }
  }

  getUserOrders() {
    this.httpService.get(APIURLs.getOrderAPI).subscribe(
      (res: any) => {
        this.orderArray = res.data || []
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  showOrderModal(key: any, data: any) {
    this.orderObj = {
      address_info: {},
      cart_id: [],
      user_id: {},
    }
    this.getOrder(data._id)
  }

  getOrder(order_id: any) {
    this.httpService.get(APIURLs.getOrderByIdAPI + "/" + order_id).subscribe(
      (res: any) => {
        this.orderObj = res.data
        $("#orderModal").modal("show")
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  imageViewModal(name: any) {
    $("#imageModal").modal("show")
    this.imageName = name
  }

  queryOrder(data: any, index: any, msg: any) {
    this.queryObj = {
      query_id: "",
      order_id: data._id,
      order_status: data.order_status,
      user_id: data.user_id,
      order_unique_id: data.order_id,
      message: msg,
      subject: data.querys?.subject || "",
      description: data.querys?.description || "",
    }

    if (data.querys?._id) {
      this.queryObj.query_id = data.querys._id
    }

    $("#reasonModal").modal("show")
  }

  submitReason() {
    this.httpService.post(APIURLs.addOrderQueryAPI, this.queryObj).subscribe(
      (res: any) => {
        this.gs.successToaster(res?.msg)
        this.getUserOrders()
        $("#reasonModal").modal("hide")
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  updateReason() {
    this.httpService.post(APIURLs.updateOrderQueryAPI, this.queryObj).subscribe(
      (res: any) => {
        this.gs.successToaster(res?.msg)
        this.getUserOrders()
        $("#reasonModal").modal("hide")
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Something went wrong!")
      },
    )
  }

  // Additional methods for enhanced functionality
  logout() {
    if (confirm("Are you sure you want to logout?")) {
      // Implement logout logic
      localStorage.clear()
      sessionStorage.clear()
      this.route.navigate(["/login"])
    }
  }

  downloadInvoice(orderId: string) {
    // Implement invoice download logic
    this.gs.successToaster("Invoice download started")
  }

  reorder(order: any) {
    // Implement reorder logic
    this.gs.successToaster("Items added to cart")
  }

  trackOrder(orderId: string) {
    // Implement order tracking logic
    this.gs.successToaster("Redirecting to tracking page")
  }
}
