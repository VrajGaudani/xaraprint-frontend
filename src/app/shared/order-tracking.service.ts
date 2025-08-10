import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';

export interface OrderStatus {
  status: string;
  description: string;
  timestamp: Date;
  location?: string;
  courier?: string;
  tracking_number?: string;
  estimated_delivery?: Date;
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
  };
  estimated_delivery: Date;
  delivery_address: string;
  last_updated: Date;
  shiprocket_data?: any;
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
}

@Injectable({
  providedIn: 'root'
})
export class OrderTrackingService {

  constructor() { }

  /**
   * Get order tracking information
   */
  getOrderTracking(orderId: string): Observable<OrderTracking> {
    // This would typically call your backend API
    // For now, returning mock data with Shiprocket integration
    return of(this.getMockTrackingData(orderId)).pipe(
      delay(500), // Simulate API delay
      catchError(error => {
        console.error('Error fetching tracking data:', error);
        return throwError(() => new Error('Failed to load tracking information'));
      })
    );
  }

  /**
   * Track order with Shiprocket
   */
  trackWithShiprocket(trackingNumber: string): Observable<ShiprocketTracking> {
    // This would integrate with Shiprocket API
    return of(this.getMockShiprocketTracking(trackingNumber)).pipe(
      delay(300),
      catchError(error => {
        console.error('Error fetching Shiprocket data:', error);
        return throwError(() => new Error('Failed to fetch courier tracking'));
      })
    );
  }

  /**
   * Get live tracking updates
   */
  getLiveTracking(orderId: string): Observable<OrderTracking> {
    // This would provide real-time updates
    return new Observable(observer => {
      const interval = setInterval(() => {
        observer.next(this.getMockTrackingData(orderId));
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    });
  }

  /**
   * Track order with courier
   */
  trackWithCourier(trackingNumber: string, courier: string): Observable<any> {
    // This would integrate with courier APIs (Shiprocket, etc.)
    return of(this.getMockCourierTracking(trackingNumber, courier));
  }

  /**
   * Get order status timeline
   */
  getOrderTimeline(orderId: string): Observable<OrderStatus[]> {
    return of(this.getMockTimeline(orderId));
  }

  /**
   * Calculate estimated delivery date
   */
  calculateEstimatedDelivery(orderDate: Date, shippingMethod: string): Date {
    const deliveryDays = this.getDeliveryDays(shippingMethod);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
    return estimatedDate;
  }

  /**
   * Get delivery days based on shipping method
   */
  private getDeliveryDays(shippingMethod: string): number {
    switch (shippingMethod.toLowerCase()) {
      case 'express':
        return 2;
      case 'standard':
        return 5;
      case 'economy':
        return 7;
      default:
        return 5;
    }
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#28a745';
      case 'processing':
        return '#ffc107';
      case 'shipped':
        return '#17a2b8';
      case 'out_for_delivery':
        return '#fd7e14';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      case 'returned':
        return '#6c757d';
      case 'pending':
        return '#6c757d';
      case 'in_transit':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  }

  /**
   * Get status icon for UI
   */
  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bi-check-circle-fill';
      case 'processing':
        return 'bi-gear-fill';
      case 'shipped':
        return 'bi-truck';
      case 'out_for_delivery':
        return 'bi-box-seam';
      case 'delivered':
        return 'bi-check-circle-fill';
      case 'cancelled':
        return 'bi-x-circle-fill';
      case 'returned':
        return 'bi-arrow-return-left';
      case 'pending':
        return 'bi-clock';
      case 'in_transit':
        return 'bi-truck-flatbed';
      default:
        return 'bi-question-circle';
    }
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
   * Get courier website URL
   */
  getCourierWebsite(courier: string): string {
    const courierUrls: { [key: string]: string } = {
      'shiprocket': 'https://shiprocket.co/tracking/',
      'delhivery': 'https://www.delhivery.com/track/',
      'bluedart': 'https://www.bluedart.com/tracking',
      'fedex': 'https://www.fedex.com/fedextrack/',
      'dhl': 'https://www.dhl.com/en/express/tracking.html',
      'dtdc': 'https://www.dtdc.in/tracking.asp',
      'firstflight': 'https://www.firstflight.net/track/',
      'professional': 'https://www.professionalcouriers.com/track/',
      'xpressbees': 'https://www.xpressbees.com/track/',
      'ekart': 'https://ekartlogistics.com/track/'
    };
    
    return courierUrls[courier.toLowerCase()] || '#';
  }

  /**
   * Get courier contact information
   */
  getCourierContact(courier: string): { phone: string; email: string } {
    const courierContacts: { [key: string]: { phone: string; email: string } } = {
      'shiprocket': { phone: '+91 1800-123-4567', email: 'support@shiprocket.co' },
      'delhivery': { phone: '+91 1800-102-1020', email: 'support@delhivery.com' },
      'bluedart': { phone: '+91 1800-233-4567', email: 'support@bluedart.com' },
      'fedex': { phone: '+91 1800-419-4343', email: 'support@fedex.com' },
      'dhl': { phone: '+91 1800-111-345', email: 'support@dhl.com' }
    };
    
    return courierContacts[courier.toLowerCase()] || { phone: '', email: '' };
  }

  // Mock data methods for development
  private getMockTrackingData(orderId: string): OrderTracking {
    return {
      order_id: orderId,
      current_status: 'shipped',
      status_history: this.getMockTimeline(orderId),
      courier_info: {
        name: 'Shiprocket',
        tracking_number: 'SR123456789',
        website: 'https://shiprocket.co',
        phone: '+91 1800-123-4567'
      },
      estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      delivery_address: '123 Main Street, Mumbai, Maharashtra, 400001',
      last_updated: new Date(),
      shiprocket_data: this.getMockShiprocketTracking('SR123456789')
    };
  }

  private getMockShiprocketTracking(trackingNumber: string): ShiprocketTracking {
    return {
      shipment_id: 'SHIP123456',
      tracking_number: trackingNumber,
      status: 'In Transit',
      status_code: 'IN_TRANSIT',
      location: 'Mumbai',
      courier_name: 'Delhivery',
      courier_tracking_number: 'DLV123456789',
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      events: [
        {
          event: 'Shipment picked up',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Surat',
          status: 'PICKED_UP'
        },
        {
          event: 'In transit',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Mumbai',
          status: 'IN_TRANSIT'
        }
      ]
    };
  }

  private getMockTimeline(orderId: string): OrderStatus[] {
    return [
      {
        status: 'Order Placed',
        description: 'Your order has been successfully placed',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        status: 'Order Confirmed',
        description: 'Your order has been confirmed and is being processed',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        status: 'Processing',
        description: 'Your order is being prepared for shipment',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        status: 'Shipped',
        description: 'Your order has been shipped via Shiprocket',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        location: 'Mumbai',
        courier: 'Shiprocket',
        tracking_number: 'SR123456789'
      },
      {
        status: 'In Transit',
        description: 'Your order is on its way to you',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        location: 'Pune',
        courier: 'Shiprocket',
        tracking_number: 'SR123456789'
      }
    ];
  }

  private getMockCourierTracking(trackingNumber: string, courier: string): any {
    return {
      tracking_number: trackingNumber,
      courier: courier,
      status: 'In Transit',
      location: 'Pune',
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      last_update: new Date()
    };
  }
} 