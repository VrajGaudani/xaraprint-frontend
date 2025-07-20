import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { HttpService } from "../../service/http.service"
import { GlobleService } from "../../service/globle.service"
import { APIURLs } from "../../../environments/apiUrls"

@Component({
  selector: "app-order-success",
  templateUrl: "./order-success.component.html",
  styleUrls: ["./order-success.component.scss"],
})
export class OrderSuccessComponent implements OnInit {
  orderId = ""
  orderDetails: any = null
  isLoading = false
  isDownloadingInvoice = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpService,
    public gs: GlobleService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.orderId = params["orderId"]
      if (this.orderId) {
        this.loadOrderDetails()
      }
    })
  }

  loadOrderDetails() {
    this.isLoading = true
    this.httpService.get(`${APIURLs.getOrderByIdAPI}/${this.orderId}`).subscribe(
      (res: any) => {
        this.orderDetails = res.data?.data || res.data || []
        this.isLoading = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to load order details")
        this.isLoading = false
      },
    )
  }

  continueShopping() {
    this.router.navigate(["/"])
  }

  viewOrderDetails() {
    this.router.navigate(["/my-account"], { fragment: "orders" })
  }

  downloadInvoice() {
    if (!this.orderDetails?._id) {
      this.gs.errorToaster("Order details not available")
      return
    }

    this.isDownloadingInvoice = true

    this.httpService.get(`${APIURLs.getInvoiceAPI}/${this.orderDetails._id}`).subscribe(
      (res: any) => {
        if (res.data && res.data.html_content) {
          // Create a blob with the HTML content
          const htmlContent = res.data.html_content
          const blob = new Blob([htmlContent], { type: "text/html" })

          // Create download link
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `invoice-${this.orderDetails.order_id}.html`

          // Trigger download
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Clean up
          window.URL.revokeObjectURL(url)

          this.gs.successToaster("Invoice downloaded successfully")
        } else {
          this.gs.errorToaster("Invoice not available for download")
        }
        this.isDownloadingInvoice = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to download invoice")
        this.isDownloadingInvoice = false
      },
    )
  }
}
