export interface CartItem {
  _id: string
  user_id: string
  product_id: {
    _id: string
    productname: string
    images: string[]
    price: number
    discount_price?: number
  }
  qty: number
  single_price: number
  orignal_price: number
  after_discount_price: number
  discount_amount: number
  applied_coupon_code?: string
  coupon_discount?: number
  coupon_details?: CouponDetails
  createdAt: string
  updatedAt: string
}

export interface CouponDetails {
  coupon_id: string
  coupon_code: string
  discount_type: string
  discount_amount: number
  applied_discount: number
}

export interface CartCalculations {
  subtotal: number
  total_discount: number
  taxable_amount: number
  coupon_discount: number
  final_taxable_amount: number
  total_tax: number
  shipping_charge: number
  shipping_tax: number
  grand_total: number
  coupon_details: CouponDetails | null
  item_calculations: CartItemCalculation[]
}

export interface CartItemCalculation {
  product_id: string
  product_name: string
  base_price: number
  quantity: number
  item_subtotal: number
  bulk_discount_percentage: number
  product_discount_percentage: number
  discount_amount: number
  taxable_amount: number
}

export interface CartResponse {
  data: CartItem[]
  calculations: CartCalculations
}
