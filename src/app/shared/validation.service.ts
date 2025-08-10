import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  // Indian PIN code validation (6 digits)
  validatePinCode(pincode: string): boolean {
    const pinCodeRegex = /^[1-9][0-9]{5}$/;
    return pinCodeRegex.test(pincode);
  }

  // Indian phone number validation (10 digits, starting with 6-9)
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  // Email validation
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Name validation (only letters, spaces, and common Indian characters)
  validateName(name: string): boolean {
    const nameRegex = /^[a-zA-Z\s\u0900-\u097F\u0A80-\u0AFF\u0B80-\u0BFF\u0C80-\u0CFF\u0D80-\u0DFF\u0E80-\u0EFF\u0F00-\u0FFF]+$/;
    return nameRegex.test(name.trim()) && name.trim().length >= 2 && name.trim().length <= 50;
  }

  // Address validation (minimum 10 characters, maximum 200)
  validateAddress(address: string): boolean {
    const trimmedAddress = address.trim();
    return trimmedAddress.length >= 10 && trimmedAddress.length <= 200;
  }

  // City validation (minimum 2 characters, maximum 50)
  validateCity(city: string): boolean {
    const trimmedCity = city.trim();
    return trimmedCity.length >= 2 && trimmedCity.length <= 50;
  }

  // State validation (Indian states)
  validateState(state: string): boolean {
    const indianStates = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
      'Puducherry', 'Andaman and Nicobar Islands'
    ];
    return indianStates.some(s => s.toLowerCase() === state.toLowerCase());
  }


  // Get validation error message
  getValidationError(field: string, value: any): string | null {
    switch (field) {
      case 'firstname':
      case 'lastname':
        if (!value || value.trim().length === 0) {
          return 'Name is required';
        }
        if (!this.validateName(value)) {
          return 'Please enter a valid name (2-50 characters, only letters and spaces)';
        }
        break;
      case 'phone_no':
        if (!value || value.trim().length === 0) {
          return 'Phone number is required';
        }
        if (!this.validatePhoneNumber(value)) {
          return 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)';
        }
        break;
      // case 'email':
      //   if (!value || value.trim().length === 0) {
      //     return 'Email address is required';
      //   }
      //   if (!this.validateEmail(value)) {
      //     return 'Please enter a valid email address';
      //   }
      //   break;
      case 'address':
        if (!value || value.trim().length === 0) {
          return 'Address is required';
        }
        if (!this.validateAddress(value)) {
          return 'Please enter a complete address (10-200 characters)';
        }
        break;
      case 'city':
        if (!value || value.trim().length === 0) {
          return 'City is required';
        }
        if (!this.validateCity(value)) {
          return 'Please enter a valid city name (2-50 characters)';
        }
        break;
      case 'state':
        if (!value || value.trim().length === 0) {
          return 'State is required';
        }
        if (!this.validateState(value)) {
          return 'Please select a valid Indian state';
        }
        break;
      case 'pincode':
        if (!value || value.trim().length === 0) {
          return 'PIN code is required';
        }
        if (!this.validatePinCode(value)) {
          return 'Please enter a valid 6-digit PIN code';
        }
        break;
    }
    return null;
  }

  // Validate complete address object
  validateAddressObject(address: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const fields = ['firstname', 'lastname', 'phone_no', 'email', 'address', 'city', 'state', 'pincode'];

    fields.forEach(field => {
      const error = this.getValidationError(field, address[field]);
      if (error) {
        errors.push(error);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format phone number for display
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  }

  // Format PIN code for display
  formatPinCode(pincode: string): string {
    if (pincode && pincode.length === 6) {
      return pincode.slice(0, 3) + ' ' + pincode.slice(3);
    }
    return pincode;
  }

  // Real-time validation for form fields
  validateFieldRealTime(field: string, value: string): { isValid: boolean; message: string } {
    const error = this.getValidationError(field, value);
    return {
      isValid: !error,
      message: error || ''
    };
  }

  // Get Indian states list for dropdown
  getIndianStates(): string[] {
    return [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
      'Puducherry', 'Andaman and Nicobar Islands'
    ].sort();
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; message: string } {
    if (!password || password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (strength < 3) {
      return { isValid: false, message: 'Password must contain at least 3 of: uppercase, lowercase, numbers, special characters' };
    }
    
    return { isValid: true, message: 'Password is strong' };
  }
} 