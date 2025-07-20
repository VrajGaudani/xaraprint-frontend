import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { HttpService } from "./http.service"
import { APIURLs } from "../../environments/apiUrls"
import { CartItem } from "../models/cart.model"

@Injectable({
  providedIn: "root",
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([])
  public cartItems$ = this.cartItemsSubject.asObservable()

  constructor(private httpService: HttpService) {
    this.loadCart()
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value
  }

  loadCart(): Observable<any> {
    return this.httpService.get(APIURLs.getCartAPI)
  }

  addToCart(productId: string, qty = 1): Observable<any> {
    const data = {
      product_id: productId,
      qty: qty,
    }
    return this.httpService.post(APIURLs.addItemInCartAPI, data)
  }

  updateQuantity(cartId: string, qty: number): Observable<any> {
    const data = {
      cart_id: cartId,
      qty: qty,
    }
    return this.httpService.put(APIURLs.updateCartQntAPI, data)
  }

  removeFromCart(cartId: string): Observable<any> {
    return this.httpService.delete(APIURLs.deleteCartItemAPI, cartId)
  }

  getCartCount(): number {
    return this.cartItemsSubject.value.reduce((total, item) => total + item.qty, 0)
  }

  updateCartItems(items: CartItem[]) {
    this.cartItemsSubject.next(items)
  }
}
