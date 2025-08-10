import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, delay, switchMap, retry } from 'rxjs/operators';
import { HttpService } from '../service/http.service';
import { APIURLs } from 'src/environments/apiUrls';

export interface OrderStatus {
  status: string;
  description: string;
  timestamp: Date;
  location?: string;
  courier?: string;
  icon?: string;
  color?: string;
}

export interface OrderTracking {
  order_id: string;
  current_status: string;
  status_history: OrderStatus[];
  courier_info?: {
    name: string;
    tracking_number: string;
    website: string;
    phone: string;
    awb_code?: string;
  };
  estimated_delivery: Date;
  delivery_address: string;
  last_updated: Date;
  shiprocket_data?: any;
  order_details?: {
    order_date: Date;
    total_amount: number;
    payment_status: string;
    items: any[];
  };
}

export interface ShiprocketTracking {
  shipment_id: string;
  tracking_number: string;
  status: string;
  status_code: string;
  location: string;
  courier_name: string;
  courier_tracking_number: string;
  estimated_delivery: string;
  events: ShiprocketEvent[];
}

export interface ShiprocketEvent {
  event: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderTrackingService {

  constructor(private httpService: HttpService) { }

  /**
   * Get comprehensive order tracking information
   */
  getOrderTracking(orderId: string): Observable<OrderTracking> {
    return this.httpService.get<OrderTracking>(`${APIURLs.trackOrderAPI}/${orderId}`).pipe(
      catchError(error => {
        console.error('Error fetching order tracking:', error);
        return throwError(() => new Error('Failed to fetch tracking information'));
      })
    );
  }

  /**
   * Get real-time tracking updates from Shiprocket
   */
  getRealTimeTracking(trackingNumber: string): Observable<ShiprocketTracking> {
    return this.httpService.get<ShiprocketTracking>(`${APIURLs.trackOrderAPI}/shiprocket/${trackingNumber}`).pipe(
      retry(3),
      catchError(error => {
        console.error('Error fetching Shiprocket tracking:', error);
        return throwError(() => new Error('Failed to fetch real-time tracking'));
      })
    );
  }

  /**
   * Start live tracking with periodic updates
   */
  startLiveTracking(orderId: string, intervalMs: number = 30000): Observable<OrderTracking> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.getOrderTracking(orderId))
    );
  }

  /**
   * Track order with Shiprocket
   */
  trackWithShiprocket(trackingNumber: string): Observable<ShiprocketTracking> {
    return this.getRealTimeTracking(trackingNumber);
  }

  /**
   * Get courier tracking URL
   */
  getCourierTrackingUrl(courierName: string, trackingNumber: string): string {
    const courierUrls: { [key: string]: string } = {
      'delhivery': `https://www.delhivery.com/track/package/${trackingNumber}`,
      'bluedart': `https://www.bluedart.com/track/${trackingNumber}`,
      'fedex': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      'dtdc': `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=${trackingNumber}`,
      'ecom': `https://ecomexpress.in/tracking/?awb_field=${trackingNumber}`,
      'xpressbees': `https://www.xpressbees.com/track/${trackingNumber}`,
      'shadowfax': `https://track.shadowfax.in/track/${trackingNumber}`,
      'pickrr': `https://pickrr.com/tracking/${trackingNumber}`,
      'shiprocket': `https://track.shiprocket.in/tracking/${trackingNumber}`
    };

    const normalizedCourier = courierName.toLowerCase().replace(/\s+/g, '');
    return courierUrls[normalizedCourier] || `https://track.shiprocket.in/tracking/${trackingNumber}`;
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': '#ffc107',
      'confirmed': '#17a2b8',
      'processing': '#007bff',
      'shipped': '#28a745',
      'out_for_delivery': '#fd7e14',
      'delivered': '#28a745',
      'cancelled': '#dc3545',
      'returned': '#6c757d',
      'rto': '#dc3545',
      'pickup_scheduled': '#17a2b8',
      'picked_up': '#28a745',
      'in_transit': '#007bff',
      'failed_delivery': '#dc3545'
    };

    return statusColors[status.toLowerCase()] || '#6c757d';
  }

  /**
   * Get status icon for UI
   */
  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'pending': 'bi-clock',
      'confirmed': 'bi-check-circle',
      'processing': 'bi-gear',
      'shipped': 'bi-truck',
      'out_for_delivery': 'bi-box-arrow-right',
      'delivered': 'bi-check-circle-fill',
      'cancelled': 'bi-x-circle',
      'returned': 'bi-arrow-return-left',
      'rto': 'bi-arrow-return-left',
      'pickup_scheduled': 'bi-calendar-check',
      'picked_up': 'bi-box-seam',
      'in_transit': 'bi-truck-flatbed',
      'failed_delivery': 'bi-exclamation-triangle'
    };

    return statusIcons[status.toLowerCase()] || 'bi-question-circle';
  }

  /**
   * Format tracking number for display
   */
  formatTrackingNumber(trackingNumber: string): string {
    if (!trackingNumber) return '';
    
    // Add spaces every 4 characters for better readability
    return trackingNumber.replace(/(.{4})/g, '$1 ').trim();
  }

  /**
   * Calculate delivery progress percentage
   */
  calculateProgress(statusHistory: OrderStatus[]): number {
    if (!statusHistory || statusHistory.length === 0) return 0;

    const completedStatuses = ['delivered', 'shipped', 'out_for_delivery', 'picked_up'];
    const completedCount = statusHistory.filter(status => 
      completedStatuses.includes(status.status.toLowerCase())
    ).length;

    return Math.round((completedCount / statusHistory.length) * 100);
  }

  /**
   * Get estimated delivery text
   */
  getEstimatedDeliveryText(estimatedDate: Date): string {
    if (!estimatedDate) return 'Not available';

    const today = new Date();
    const deliveryDate = new Date(estimatedDate);
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Delivered';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `in ${diffDays} days`;
    } else {
      return `by ${deliveryDate.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      })}`;
    }
  }

  /**
   * Check if order can be tracked
   */
  canTrackOrder(order: any): boolean {
    return !!(order.tracking_number || order.shiprocket_order_id);
  }

  /**
   * Get order status badge class
   */
  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'processing': 'badge-primary',
      'shipped': 'badge-success',
      'out_for_delivery': 'badge-warning',
      'delivered': 'badge-success',
      'cancelled': 'badge-danger',
      'returned': 'badge-secondary',
      'rto': 'badge-danger'
    };

    return statusClasses[status.toLowerCase()] || 'badge-secondary';
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get mock tracking data for development/testing
   */
  private getMockShiprocketTracking(trackingNumber: string): ShiprocketTracking {
    return {
      shipment_id: 'SR123456789',
      tracking_number: trackingNumber,
      status: 'In Transit',
      status_code: 'IN_TRANSIT',
      location: 'Mumbai, Maharashtra',
      courier_name: 'Delhivery',
      courier_tracking_number: trackingNumber,
      estimated_delivery: '2024-01-15',
      events: [
        {
          event: 'Shipment picked up',
          timestamp: '2024-01-10T10:30:00Z',
          location: 'Surat, Gujarat',
          status: 'PICKED_UP',
          description: 'Package has been picked up from seller'
        },
        {
          event: 'In transit',
          timestamp: '2024-01-11T14:20:00Z',
          location: 'Mumbai, Maharashtra',
          status: 'IN_TRANSIT',
          description: 'Package is in transit to destination'
        }
      ]
    };
  }
} 