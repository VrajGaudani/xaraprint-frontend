import { environment } from "./environment.prod";

export const APIURLs = {
  registerAPI : environment.baseUrl + 'user/auth/register',
  loginAPI : environment.baseUrl + 'user/auth/login',
  getProfileAPI : environment.baseUrl + 'user/profile/get',
  updateProfileAPI : environment.baseUrl + 'user/profile/update',
  updatePasswordAPI : environment.baseUrl + 'user/profile/updatePassword',
  getAllAdressAPI : environment.baseUrl + 'user/address/getAll',
  addAdressAPI : environment.baseUrl + 'user/address/add',
  updateAdressAPI : environment.baseUrl + 'user/address/update',
  deleteAdressAPI : environment.baseUrl + 'user/address/delete',

  // product
  getAllProductAPI : environment.baseUrl + 'user/product/getAll',
  getProductByIdAPI : environment.baseUrl + 'user/product/getById',
  getProductBySlugAPI : environment.baseUrl + 'user/product/bySlug',
  getLatestProductAPI : environment.baseUrl + 'user/product/latest',
  getAllBestSellerAPI : environment.baseUrl + 'user/product/bestselling',
  getAllMostLovedAPI : environment.baseUrl + 'user/product/mostLoved',
  getAllMostPopularAPI : environment.baseUrl + 'user/product/mostPopular',
  getProductByCatAPI : environment.baseUrl + 'user/product/bycategory',
  getAllBannersAPI : environment.baseUrl + 'user/product/getAllBanners',
  bannersListAPI : environment.baseUrl + 'banner/getAll',

  // cart
  getCartAPI : environment.baseUrl + 'user/cart/getItems',
  addItemInCartAPI : environment.baseUrl + 'user/cart/addItem',
  cartQntUpdateAPI : environment.baseUrl + 'user/cart/updateQnt',
  deleteCartItemAPI : environment.baseUrl + 'user/cart/deleteItem',
  updateCartAPI : environment.baseUrl + 'user/cart/updateCart',

  // order
  getOrderAPI : environment.baseUrl + 'user/order/getOrder',
  getOrderByIdAPI : environment.baseUrl + 'user/order/getByid',
  orderCreateAPI : environment.baseUrl + 'user/order/create',
  orderCancelAPI : environment.baseUrl + 'user/order/cancel',
  addOrderQueryAPI : environment.baseUrl + 'user/order/addQuery',
  updateOrderQueryAPI : environment.baseUrl + 'user/order/updateQuery',
  getOrderAddressAPI : environment.baseUrl + 'user/order/getAddress',

  // coupon
  getCouponDiscountAPI : environment.baseUrl + 'user/coupon/getDiscount',
  getAllCouponAPI : environment.baseUrl + 'user/coupon/getAll',

  // category
  getAllCatAPI : environment.baseUrl + 'category/getAll',
  subCatByMainAPI : environment.baseUrl + 'category/Sub-category/bycat',
  getAllMainCatAPI : environment.baseUrl + 'category/Main-category/list',

  // newletter
  subscribeNewsLetterAPI : environment.baseUrl + 'newsLetter/subscribe',

  // blog
  getLatestBlogAPI : environment.baseUrl + 'blog/getLatest',
  getBlogByIdAPI : environment.baseUrl + 'blog/getById',

  // review
  addReviewAPI : environment.baseUrl + 'user/review/addReview',
  getProductReviewAPI : environment.baseUrl + 'user/review/getAllReview',
  getReviewSummaryAPI : environment.baseUrl + 'user/review/getReviewSummary',

  // Razorpay
  createRazorpayOrderAPI: environment.baseUrl + 'user/order/create-razorpay-order',
  verifyPaymentAPI: environment.baseUrl + 'user/order/verify-payment',
}
