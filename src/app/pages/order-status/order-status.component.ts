import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../service/http.service';
import { GlobleService } from '../../service/globle.service';
import { OrderTrackingService, OrderTracking } from '../../shared/order-tracking.service';
import { APIURLs } from '../../../environments/apiUrls';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss']
})
export class OrderStatusComponent implements OnInit {
  orderId: string = '';
  orderDetails: any = null;
  trackingData: OrderTracking | null = null;
  isLoading: boolean = false;
  isRefreshing: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpService,
    private orderTrackingService: OrderTrackingService,
    public gs: GlobleService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = params['id'] || '';
      if (this.orderId) {
        this.loadOrderDetails();
      }
    });
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    this.error = null;

    this.httpService.get(`${APIURLs.getOrderByIdAPI}/${this.orderId}`).subscribe({
      next: (res: any) => {
        this.orderDetails = res.data;
        this.isLoading = false;
        
        // Load tracking data if order has tracking information
        if (this.orderDetails?.tracking_number || this.orderDetails?.shiprocket_order_id) {
          this.loadTrackingData();
        }
      },
      error: (err) => {
        this.error = err?.error?.msg || 'Failed to load order details';
        this.isLoading = false;
      }
    });
  }

  loadTrackingData(): void {
    this.orderTrackingService.getOrderTracking(this.orderDetails._id || this.orderId).subscribe({
      next: (data) => {
        this.trackingData = data;
      },
      error: (err) => {
        console.error('Failed to load tracking data:', err);
        // Don't show error for tracking data as it's optional
      }
    });
  }

  refreshTracking(): void {
    this.isRefreshing = true;
    this.loadTrackingData();
    
    // Simulate refresh delay
    setTimeout(() => {
      this.isRefreshing = false;
    }, 2000);
  }

  openShiprocketTracking(): void {
    const trackingNumber = this.trackingData?.courier_info?.tracking_number || this.orderDetails?.tracking_number;
    if (trackingNumber) {
      const trackingUrl = this.orderTrackingService.getCourierTrackingUrl('shiprocket', trackingNumber);
      window.open(trackingUrl, '_blank');
    } else {
      this.gs.errorToaster('Tracking number not available');
    }
  }

  copyTrackingNumber(): void {
    const trackingNumber = this.trackingData?.courier_info?.tracking_number || this.orderDetails?.tracking_number;
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber).then(() => {
        this.gs.successToaster('Tracking number copied to clipboard');
      }).catch(() => {
        this.gs.errorToaster('Failed to copy tracking number');
      });
    }
  }

  downloadInvoice(): void {
    this.httpService.downloadFile(`${APIURLs.downloadInvoiceAPI}/${this.orderId}`).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${this.orderDetails.order_id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.gs.errorToaster(err?.error?.msg || 'Failed to download invoice');
      }
    });
  }

  contactSupport(): void {
    // Navigate to support page or open support modal
    this.router.navigate(['/contact-us'], { 
      queryParams: { 
        orderId: this.orderId,
        subject: `Order Query - ${this.orderDetails.order_id}`
      }
    });
  }

  cancelOrder(): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.httpService.put(APIURLs.cancelOrderAPI, { order_id: this.orderId }).subscribe({
        next: (res: any) => {
          this.gs.successToaster('Order cancelled successfully');
          this.loadOrderDetails(); // Refresh order details
        },
        error: (err) => {
          this.gs.errorToaster(err?.error?.msg || 'Failed to cancel order');
        }
      });
    }
  }

  canDownloadInvoice(): boolean {
    return this.orderDetails?.order_status === 'delivered' || 
           this.orderDetails?.order_status === 'shipped' ||
           this.orderDetails?.order_status === 'processing';
  }

  canCancelOrder(): boolean {
    return this.orderDetails?.order_status === 'pending' || 
           this.orderDetails?.order_status === 'confirmed';
  }

  getStatusBadgeClass(status: string): string {
    return this.orderTrackingService.getStatusBadgeClass(status);
  }

  getStatusIcon(status: string): string {
    return this.orderTrackingService.getStatusIcon(status);
  }

  getProgressPercentage(): number {
    if (!this.trackingData?.status_history) return 0;
    return this.orderTrackingService.calculateProgress(this.trackingData.status_history);
  }

  getEstimatedDeliveryText(estimatedDate: Date): string {
    return this.orderTrackingService.getEstimatedDeliveryText(estimatedDate);
  }

  formatDate(date: Date | string): string {
    return this.orderTrackingService.formatDate(date);
  }

  getProductImage(item: any): string {
    return item.product_id?.product_images?.[0] || 'assets/images/placeholder.png';
  }
}
