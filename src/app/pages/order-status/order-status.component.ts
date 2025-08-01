import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../service/http.service';
import { GlobleService } from '../../service/globle.service';
import { APIURLs } from '../../../environments/apiUrls';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss']
})
export class OrderStatusComponent implements OnInit {
  orderId: string = '';
  orderDetails: any = null;
  isLoading: boolean = false;
  trackingSteps: any[] = [];
  currentStep: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpService,
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

  loadOrderDetails() {
    this.isLoading = true;
    this.httpService.get(`${APIURLs.getOrderByIdAPI}/${this.orderId}`).subscribe(
      (res: any) => {
        this.orderDetails = res.data?.data || res.data || null;
        if (this.orderDetails) {
          this.setupTrackingSteps();
        }
        this.isLoading = false;
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || 'Failed to load order details');
        this.isLoading = false;
      }
    );
  }

  setupTrackingSteps() {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentStatus = this.orderDetails.order_status;
    this.currentStep = statusOrder.indexOf(currentStatus);
    
    this.trackingSteps = [
      {
        title: 'Order Placed',
        description: 'Your order has been placed successfully',
        status: 'completed',
        icon: 'bi-check-circle-fill'
      },
      {
        title: 'Order Confirmed',
        description: 'Your order has been confirmed and is being processed',
        status: this.currentStep >= 1 ? 'completed' : 'pending',
        icon: this.currentStep >= 1 ? 'bi-check-circle-fill' : 'bi-circle'
      },
      {
        title: 'Processing',
        description: 'Your order is being prepared for shipping',
        status: this.currentStep >= 2 ? 'completed' : 'pending',
        icon: this.currentStep >= 2 ? 'bi-check-circle-fill' : 'bi-circle'
      },
      {
        title: 'Shipped',
        description: 'Your order has been shipped',
        status: this.currentStep >= 3 ? 'completed' : 'pending',
        icon: this.currentStep >= 3 ? 'bi-check-circle-fill' : 'bi-circle'
      },
      {
        title: 'Delivered',
        description: 'Your order has been delivered',
        status: this.currentStep >= 4 ? 'completed' : 'pending',
        icon: this.currentStep >= 4 ? 'bi-check-circle-fill' : 'bi-circle'
      }
    ];
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge-secondary';
      case 'confirmed': return 'badge-primary';
      case 'processing': return 'badge-info';
      case 'shipped': return 'badge-warning';
      case 'delivered': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getPaymentStatusBadgeClass(paymentMode: string): string {
    return paymentMode === 'online' ? 'badge-success' : 'badge-warning';
  }

  downloadInvoice() {
    if (!this.orderDetails) return;
    
    this.httpService.downloadFile(`${APIURLs.downloadInvoiceAPI}/${this.orderDetails._id}`).subscribe(
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${this.orderDetails.order_id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (err) => {
        this.gs.errorToaster('Failed to download invoice');
      }
    );
  }

  trackOrder() {
    if (this.orderDetails?.tracking_number) {
      window.open(`https://track.shiprocket.in/tracking/${this.orderDetails.tracking_number}`, '_blank');
    } else {
      this.gs.errorToaster('Tracking information not available');
    }
  }

  contactSupport() {
    const message = `Hi, I need help with my order #${this.orderDetails.order_id} on xaraprint.com.`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  goBack() {
    this.router.navigate(['/my-account']);
  }
}
