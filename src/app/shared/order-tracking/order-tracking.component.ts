import { Component, Input, OnInit } from '@angular/core';
import { OrderTrackingService, OrderTracking, OrderStatus } from '../order-tracking.service';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent implements OnInit {
  @Input() orderId: string = '';
  @Input() showDetails: boolean = true;

  trackingData: OrderTracking | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private orderTrackingService: OrderTrackingService) { }

  ngOnInit(): void {
    if (this.orderId) {
      this.loadTrackingData();
    }
  }

  loadTrackingData(): void {
    this.isLoading = true;
    this.error = null;

    this.orderTrackingService.getOrderTracking(this.orderId).subscribe({
      next: (data) => {
        this.trackingData = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tracking information';
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    return this.orderTrackingService.getStatusColor(status);
  }

  getStatusIcon(status: string): string {
    return this.orderTrackingService.getStatusIcon(status);
  }

  formatTrackingNumber(trackingNumber: string): string {
    return this.orderTrackingService.formatTrackingNumber(trackingNumber);
  }

  openCourierTracking(): void {
    if (this.trackingData?.courier_info?.website) {
      window.open(this.trackingData.courier_info.website, '_blank');
    }
  }

  copyTrackingNumber(): void {
    if (this.trackingData?.courier_info?.tracking_number) {
      navigator.clipboard.writeText(this.trackingData.courier_info.tracking_number);
      // You can add a toast notification here
    }
  }

  refreshTracking(): void {
    if (this.orderId) {
      this.loadTrackingData();
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstimatedDeliveryText(): string {
    if (!this.trackingData?.estimated_delivery) return '';
    
    const today = new Date();
    const deliveryDate = new Date(this.trackingData.estimated_delivery);
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Delivered';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `in ${diffDays} days`;
    }
  }

  getProgressPercentage(): number {
    if (!this.trackingData?.status_history) return 0;
    
    const totalSteps = this.trackingData.status_history.length;
    const completedSteps = this.trackingData.status_history.filter(
      status => ['delivered', 'shipped', 'out_for_delivery'].includes(status.status.toLowerCase())
    ).length;
    
    return Math.round((completedSteps / totalSteps) * 100);
  }
} 