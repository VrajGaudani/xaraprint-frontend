export const APIURLs = {
  // Base URL
  baseURL: "http://localhost:3000/v1/",

  // User Authentication APIs
  userRegisterAPI: "user/auth/register",
  userLoginAPI: "user/auth/login",
  loginAPI: "user/auth/login", // Added this for backward compatibility
  signupAPI: "user/auth/register", // Added this for backward compatibility

  // User Profile APIs
  getProfileAPI: "user/profile/get",
  updateProfileAPI: "user/profile/update",
  updatePasswordAPI: "user/profile/updatePassword",

  // User Address APIs
  addAddressAPI: "user/address/add",
  updateAddressAPI: "user/address/update",
  deleteAddressAPI: "user/address/delete",
  getAllAdressAPI: "user/address/getAll",
  getAddressByIdAPI: "user/address/getById",

  // User Cart APIs
  addItemInCartAPI: "user/cart/addItem",
  getCartAPI: "user/cart/getItems",
  applyCouponAPI: "user/cart/apply-coupon",
  removeCouponAPI: "user/cart/remove-coupon",
  updateCartQntAPI: "user/cart/updateQnt",
  deleteCartItemAPI: "user/cart/deleteItem",
  updateCartAPI: "user/cart/updateCart",
  clearCartAPI: "user/cart/clear",

  // User Order APIs
  orderCreateAPI: "user/order/create",
  getOrderCalculationsAPI: "user/order/calculations",
  verifyPaymentAPI: "user/order/verify-payment",
  cancelOrderAPI: "user/order/cancel",
  addOrderQueryAPI: "user/order/add-query",
  updateOrderQueryAPI: "user/order/update-query",
  getOrderAddressAPI: "user/order/address",
  getOrderAPI: "user/order/",
  getOrderByIdAPI: "user/order",
  trackOrderAPI: "user/order/track",
  getInvoiceAPI: "user/order/invoice",
  downloadInvoiceAPI: "user/order/download-invoice",
  shiprocketWebhookAPI: "user/order/shiprocket-webhook",

  // User Coupon APIs
  getDiscountAPI: "user/coupon/getDiscount",
  getAllCouponAPI: "user/coupon/getAll",

  // User Product APIs
  getAllProductAPI: "user/product/getAll",
  getProductByIdAPI: "user/product/getById",
  getProductBySlugAPI: "user/product/bySlug",
  getLatestProductAPI: "user/product/latest",
  getAllBestSellerAPI: "user/product/bestselling",
  getAllMostLovedAPI: "user/product/mostLoved",
  getAllMostPopularAPI: "user/product/mostPopular",
  getProductByCatAPI: "user/product/bycategory",

  // User Review APIs
  addReviewAPI: "user/review/addReview",
  getProductReviewAPI: "user/review/getAllReview",
  getReviewSummaryAPI: "user/review/getReviewSummary",

  // Category APIs
  uploadCategoryImageAPI: "category/uploadImage",
  getAllCatAPI: "category/getAll",
  getAllMainCatAPI: "category/Main-category/list",
  getMainCatByIdAPI: "category/Main-category/getById",
  addMainCatAPI: "category/Main-category/addNew",
  updateMainCatAPI: "category/Main-category/update",
  deleteMainCatAPI: "category/Main-category/delete",
  getAllSubCatAPI: "category/Sub-category/list",
  getSubCatByIdAPI: "category/Sub-category/getById",
  addSubCatAPI: "category/Sub-category/addNew",
  updateSubCatAPI: "category/Sub-category/update",
  deleteSubCatAPI: "category/Sub-category/delete",
  subCatByMainAPI: "category/Sub-category/bycat",

  // Banner APIs
  getAllBannersAPI: "banner/getAll",

  // Blog APIs
  uploadBlogImageAPI: "blog/uploadImage",
  getAllBlogAPI: "blog/getAll",
  getBlogByIdAPI: "blog/getById",
  addBlogAPI: "blog/add",
  updateBlogAPI: "blog/update",
  deleteBlogAPI: "blog/delete",
  getLatestBlogAPI: "blog/getLatest",

  // Newsletter APIs
  getAllNewsLetterAPI: "newsLetter/getAll",
  getNewsLetterByIdAPI: "newsLetter/getById",
  subscribeNewsLetterAPI: "newsLetter/subscribe",
  updateNewsLetterAPI: "newsLetter/update",
  deleteNewsLetterAPI: "newsLetter/delete",

  // Banner List API (seems to be used in frontend)
  bannersListAPI: "banner/getAll",
}
