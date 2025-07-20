import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp-button',
  templateUrl: './whatsapp-button.component.html',
  styleUrls: ['./whatsapp-button.component.scss']
})
export class WhatsAppButtonComponent {
  
  openWhatsApp() {
    const phoneNumber = '919876543210'; // Replace with actual WhatsApp number
    const message = encodeURIComponent('Hi, I need help with my order on xaraprint.com.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }
} 