import { Injectable } from "@angular/core"
import { HttpService } from "./http.service"
import { APIURLs } from "../../environments/apiUrls"
import { Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private httpService: HttpService) {}

  // Authentication APIs
  userRegister(userData: any): Observable<any> {
    return this.httpService.post(APIURLs.userRegisterAPI, userData)
  }

  userLogin(loginData: any): Observable<any> {
    return this.httpService.post(APIURLs.userLoginAPI, loginData)
  }

  // Profile APIs
  getProfile(): Observable<any> {
    return this.httpService.get(APIURLs.getProfileAPI)
  }

  updateProfile(profileData: any): Observable<any> {
    return this.httpService.post(APIURLs.updateProfileAPI, profileData)
  }

  updatePassword(passwordData: any): Observable<any> {
    return this.httpService.post(APIURLs.updatePasswordAPI, passwordData)
  }

  // Address APIs
  addAddress(addressData: any): Observable<any> {
    return this.httpService.post(APIURLs.addAddressAPI, addressData)
  }

  updateAddress(addressData: any): Observable<any> {
    return this.httpService.post(APIURLs.updateAddressAPI, addressData)
  }

  deleteAddress(addressData: any): Observable<any> {
    return this.httpService.post(APIURLs.deleteAddressAPI, addressData)
  }

  getAllAddresses(): Observable<any> {
    return this.httpService.get(APIURLs.getAllAdressAPI)
  }

  getAddressById(addressId: string): Observable<any> {
    return this.httpService.get(`${APIURLs.getAddressByIdAPI}/${addressId}`)
  }

  // Cart APIs
  addItemToCart(cartData: any): Observable<any> {
    return this.httpService.post(APIURLs.addItemInCartAPI, cartData)
  }

  getCartItems(): Observable<any> {
    return this.httpService.get(APIURLs.getCartAPI)
  }

  updateCartQuantity(updateData: any): Observable<any> {
    return this.httpService.put(APIURLs.updateCartQntAPI, updateData)
  }

  deleteCartItem(deleteData: any): Observable<any> {
    return this.httpService.delete(APIURLs.deleteCartItemAPI, deleteData)
  }

  updateCart(cartData: any): Observable<any> {
    return this.httpService.put(APIURLs.updateCartAPI, cartData)
  }

  // Order APIs
  createOrder(orderData: any): Observable<any> {
    return this.httpService.post(APIURLs.orderCreateAPI, orderData)
  }

  getOrderCalculations(calculationData: any): Observable<any> {
    return this.httpService.post(APIURLs.getOrderCalculationsAPI, calculationData)
  }

  verifyPayment(paymentData: any): Observable<any> {
    return this.httpService.post(APIURLs.verifyPaymentAPI, paymentData)
  }

  cancelOrder(orderData: any): Observable<any> {
    return this.httpService.put(APIURLs.cancelOrderAPI, orderData)
  }

  addOrderQuery(queryData: any): Observable<any> {
    return this.httpService.post(APIURLs.addOrderQueryAPI, queryData)
  }

  updateOrderQuery(queryData: any): Observable<any> {
    return this.httpService.put(APIURLs.updateOrderQueryAPI, queryData)
  }

  getOrderAddress(): Observable<any> {
    return this.httpService.get(APIURLs.getOrderAddressAPI)
  }

  getOrders(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getOrderAPI, params)
  }

  getOrderById(orderId: string): Observable<any> {
    return this.httpService.get(`${APIURLs.getOrderByIdAPI}/${orderId}`)
  }

  trackOrder(orderId: string): Observable<any> {
    return this.httpService.get(`${APIURLs.trackOrderAPI}/${orderId}`)
  }

  getInvoice(orderId: string): Observable<any> {
    return this.httpService.get(`${APIURLs.getInvoiceAPI}/${orderId}`)
  }

  downloadInvoice(orderId: string): Observable<any> {
    return this.httpService.downloadFile(`${APIURLs.downloadInvoiceAPI}/${orderId}`)
  }

  // Coupon APIs
  getDiscount(couponData: any): Observable<any> {
    return this.httpService.post(APIURLs.getDiscountAPI, couponData)
  }

  getAllCoupons(): Observable<any> {
    return this.httpService.get(APIURLs.getAllCouponAPI)
  }

  // Product APIs
  getAllProducts(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getAllProductAPI, params)
  }

  getProductById(productId: string): Observable<any> {
    return this.httpService.get(`${APIURLs.getProductByIdAPI}/${productId}`)
  }

  getProductBySlug(slugData: any): Observable<any> {
    return this.httpService.post(APIURLs.getProductBySlugAPI, slugData)
  }

  getLatestProducts(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getLatestProductAPI, params)
  }

  getBestSellingProducts(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getAllBestSellerAPI, params)
  }

  getMostLovedProducts(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getAllMostLovedAPI, params)
  }

  getMostPopularProducts(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getAllMostPopularAPI, params)
  }

  getProductsByCategory(categoryData: any): Observable<any> {
    return this.httpService.post(APIURLs.getProductByCatAPI, categoryData)
  }

  // Review APIs
  addReview(reviewData: any): Observable<any> {
    return this.httpService.post(APIURLs.addReviewAPI, reviewData)
  }

  getProductReviews(productId: string): Observable<any> {
    return this.httpService.get(`${APIURLs.getProductReviewAPI}/${productId}`)
  }

  getReviewSummary(productId: string): Observable<any> {
    return this.httpService.get(`${APIURLs.getReviewSummaryAPI}/${productId}`)
  }

  // Category APIs
  uploadCategoryImage(formData: FormData): Observable<any> {
    return this.httpService.uploadFile(APIURLs.uploadCategoryImageAPI, formData)
  }

  getAllCategories(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getAllCatAPI, params)
  }

  getAllMainCategories(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getAllMainCatAPI, params)
  }

  getMainCategoryById(categoryId: string): Observable<any> {
    return this.httpService.get(`${APIURLs.getMainCatByIdAPI}/${categoryId}`)
  }

  addMainCategory(categoryData: any): Observable<any> {
    return this.httpService.post(APIURLs.addMainCatAPI, categoryData)
  }

  updateMainCategory(categoryData: any): Observable<any> {
    return this.httpService.put(APIURLs.updateMainCatAPI, categoryData)
  }

  deleteMainCategory(categoryId: string): Observable<any> {
    return this.httpService.delete(`${APIURLs.deleteMainCatAPI}/${categoryId}`)
  }

  getAllSubCategories(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getAllSubCatAPI, params)
  }

  getSubCategoryById(categoryId: string): Observable<any> {
    return this.httpService.get(`${APIURLs.getSubCatByIdAPI}/${categoryId}`)
  }

  addSubCategory(categoryData: any): Observable<any> {
    return this.httpService.post(APIURLs.addSubCatAPI, categoryData)
  }

  updateSubCategory(categoryData: any): Observable<any> {
    return this.httpService.put(APIURLs.updateSubCatAPI, categoryData)
  }

  deleteSubCategory(categoryId: string): Observable<any> {
    return this.httpService.delete(`${APIURLs.deleteSubCatAPI}/${categoryId}`)
  }

  getSubCategoriesByMainCategory(categoryData: any): Observable<any> {
    return this.httpService.post(APIURLs.subCatByMainAPI, categoryData)
  }

  // Banner APIs
  getAllBanners(): Observable<any> {
    return this.httpService.get(APIURLs.getAllBannersAPI)
  }

  // Blog APIs
  uploadBlogImage(formData: FormData): Observable<any> {
    return this.httpService.uploadFile(APIURLs.uploadBlogImageAPI, formData)
  }

  getAllBlogs(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getAllBlogAPI, params)
  }

  getBlogById(blogId: string): Observable<any> {
    return this.httpService.get(`${APIURLs.getBlogByIdAPI}/${blogId}`)
  }

  addBlog(blogData: any): Observable<any> {
    return this.httpService.post(APIURLs.addBlogAPI, blogData)
  }

  updateBlog(blogData: any): Observable<any> {
    return this.httpService.put(APIURLs.updateBlogAPI, blogData)
  }

  deleteBlog(blogId: string): Observable<any> {
    return this.httpService.delete(`${APIURLs.deleteBlogAPI}/${blogId}`)
  }

  getLatestBlogs(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getLatestBlogAPI, params)
  }

  // Newsletter APIs
  getAllNewsletters(params?: any): Observable<any> {
    return this.httpService.get(APIURLs.getAllNewsLetterAPI, params)
  }

  getNewsletterById(newsletterId: string): Observable<any> {
    return this.httpService.get(`${APIURLs.getNewsLetterByIdAPI}/${newsletterId}`)
  }

  subscribeNewsletter(subscriptionData: any): Observable<any> {
    return this.httpService.post(APIURLs.subscribeNewsLetterAPI, subscriptionData)
  }

  updateNewsletter(newsletterData: any): Observable<any> {
    return this.httpService.put(APIURLs.updateNewsLetterAPI, newsletterData)
  }

  deleteNewsletter(newsletterId: string): Observable<any> {
    return this.httpService.delete(`${APIURLs.deleteNewsLetterAPI}/${newsletterId}`)
  }
}
