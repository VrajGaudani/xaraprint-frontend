import { Component, OnInit } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { GlobleService } from "../service/globle.service"
import { HttpService } from "../service/http.service"
import { ApiService } from "../service/api.service"
import { APIURLs } from "src/environments/apiUrls"
import { ValidationService } from "../shared/validation.service"

interface Order {
  showTracking: boolean
  _id: string
  order_id: string
  order_status: string
  price: number
  payment_mode: string
  createdAt: string
  cart_id: any[]
  billing_address: any
  shipping_address: any
  invoice?: any
  transaction?: any
  queries?: any[]
}

interface UserProfile {
  _id: string
  firstname: string
  lastname: string
  email: string
  phone_no: string
  company_name?: string
  country_code: string
  addresses: any[]
}

interface Address {
  _id?: string
  firstname: string
  lastname: string
  phone_no: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  isBilling?: boolean
  isShipping?: boolean
}

interface SupportQuery {
  _id?: string
  subject: string
  description: string
  order_id?: string
  status?: string
  createdAt?: string
}

@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.scss"],
})
export class MyAccountComponent implements OnInit {
  activeTab = "dashboard"
  
  // Indian states and cities data
  indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
    "Ladakh", "Lakshadweep", "Puducherry"
  ]

  citiesByState: { [key: string]: string[] } = {
    "Andhra Pradesh": ["Hyderabad", "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kadapa", "Anantapur", "Chittoor"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tezpur", "Bomdila", "Tawang", "Ziro", "Along", "Daporijo", "Namsai"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Barpeta", "Dhubri", "Sivasagar"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Munger"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Durg", "Raigarh", "Ambikapur", "Jagdalpur", "Chirmiri"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Mormugao", "Sanquelim", "Curchorem", "Quepem", "Sanguem"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Junagadh", "Gandhinagar", "Nadiad", "Morbi", "Gandhidham"],
    "Haryana": ["Chandigarh", "Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Karnal", "Hisar", "Rohtak", "Panchkula"],
    "Himachal Pradesh": ["Shimla", "Mandi", "Solan", "Dharamshala", "Baddi", "Palampur", "Una", "Nahan", "Chamba", "Kullu"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Palakkad", "Malappuram", "Kannur", "Kasaragod", "Kollam", "Alappuzha"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Murwara"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Sangli"],
    "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Senapati", "Tamenglong", "Ukhrul", "Chandel", "Jiribam", "Kakching"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar", "Baghmara", "Mairang", "Nongpoh", "Resubelpara", "Khliehriat"],
    "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip", "Mamit", "Saitual", "Hnahthial", "Khawzawl"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Mon", "Longleng", "Kiphire"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Batala", "Pathankot", "Moga"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bharatpur", "Bhilwara", "Alwar", "Sikar"],
    "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Singtam", "Rangpo", "Jorethang", "Ravangla", "Pakyong", "Soreng"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Thoothukkudi"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet"],
    "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Ambassa", "Kailashahar", "Belonia", "Khowai", "Teliamura", "Sabroom", "Sonamura"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Ghaziabad", "Moradabad", "Aligarh"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Roorkee", "Kashipur", "Rudrapur", "Haldwani", "Nainital", "Mussoorie", "Almora"],
    "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Bahraich", "Habra", "Kharagpur", "Shantipur"],
    "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Mayabunder", "Rangat", "Havelock Island", "Neil Island", "Long Island", "Baratang", "Wandoor", "Bambooflat"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North East Delhi", "North West Delhi", "South West Delhi", "Shahdara"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Kathua", "Udhampur", "Punch", "Rajauri", "Doda"],
    "Ladakh": ["Leh", "Kargil", "Drass", "Nubra", "Zanskar", "Changthang", "Suru Valley", "Aryan Valley", "Hemis", "Diskit"],
    "Lakshadweep": ["Kavaratti", "Agatti", "Amini", "Andrott", "Bitra", "Chettalai", "Kadmat", "Kalpeni", "Kiltan", "Minicoy"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
  }
  profileSubTab = "personal"

  // Profile data
  profileData: UserProfile | null = null
  isLoadingProfile = false
  isUpdatingPassword = false

  // Password form
  passwordForm = {
    old_pass: "",
    new_pass: "",
    confirm_pass: "",
  }

  // Preferences
  preferences = {
    emailNotifications: {
      orderUpdates: true,
      promotions: true,
      newsletter: false,
    },
    smsNotifications: {
      orderUpdates: false,
      deliveryNotifications: true,
    },
  }

  // Orders data
  orders: Order[] = []
  filteredOrders: Order[] = []
  isLoadingOrders = false
  orderStatus = "all"
  orderSearchTerm = ""
  currentPage = 1
  totalPages = 1
  totalItems = 0
  itemsPerPage = 10
  orderStatuses = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ]

  // Addresses data
  addresses: Address[] = []
  isLoadingAddresses = false
  showAddressForm = false
  editingAddress: Address | null = null

  addressForm: Address = {
    firstname: "",
    lastname: "",
    phone_no: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isBilling: false,
    isShipping: false,
  }

  // Wishlist data
  wishlistItems: any[] = []

  // Notifications
  notifications: any[] = []

  // Support
  supportQueries: SupportQuery[] = []
  showSupportModal = false
  isSubmittingSupportQuery = false
  supportQueryForm: any = {
    subject: "",
    description: "",
    orderId: null,
    id: null,
  }

  faqs = [
    {
      question: "How can I track my order?",
      answer:
        'You can track your order in the Order History section of your account. Click on "Track Order" button next to your order.',
    },
    {
      question: "How do I return an item?",
      answer:
        'To return an item, go to your Order History, find the order, and click on "Contact Support" to initiate a return request.',
    },
    {
      question: "How can I change my shipping address?",
      answer:
        "You can manage your addresses in the Address Book section. You can add, edit, or delete addresses as needed.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, debit cards, UPI, net banking, and cash on delivery for eligible orders.",
    },
  ]

  constructor(
    private httpService: HttpService,
    private apiService: ApiService,
    public gs: GlobleService,
    private router: Router,
    private route: ActivatedRoute,
    private validationService: ValidationService,
  ) {}

  ngOnInit(): void {
    // Check for query parameters to set active tab
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.setActiveTab(params['tab'])
      }
    })
    
    this.loadProfileData()
    this.loadInitialData()
  }

  loadInitialData(): void {
    // Load basic data for dashboard
    this.loadOrders()
    this.loadAddresses()
    this.loadWishlist()
    this.loadNotifications()
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab

    switch (tab) {
      case "profile":
        this.loadProfileData()
        break
      case "orders":
        this.loadOrders()
        break
      case "addresses":
        this.loadAddresses()
        break
      case "wishlist":
        this.loadWishlist()
        break
      case "notifications":
        this.loadNotifications()
        break
      case "support":
        this.loadSupportQueries()
        break
    }
  }

  // Profile Methods
  loadProfileData(): void {
    this.isLoadingProfile = true
    this.httpService.get(APIURLs.getProfileAPI).subscribe(
      (res: any) => {
        this.profileData = res.data?.data || res.data || []
        this.addresses = res.data?.addresses || []
        this.isLoadingProfile = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to load profile data")
        this.isLoadingProfile = false
      },
    )
  }

  updateProfile(): void {
    if (!this.profileData) return

    this.isLoadingProfile = true
    const updateData = {
      firstname: this.profileData.firstname,
      lastname: this.profileData.lastname,
      email: this.profileData.email,
      phone_no: this.profileData.phone_no,
      company_name: this.profileData.company_name,
    }

    this.httpService.put(APIURLs.updateProfileAPI, updateData).subscribe(
      (res: any) => {
        this.gs.successToaster("Profile updated successfully!")
        this.isLoadingProfile = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to update profile")
        this.isLoadingProfile = false
      },
    )
  }

  updatePassword(): void {
    if (this.passwordForm.new_pass !== this.passwordForm.confirm_pass) {
      this.gs.errorToaster("New password and confirm password do not match")
      return
    }

    if (this.passwordForm.new_pass.length < 8) {
      this.gs.errorToaster("Password must be at least 8 characters long")
      return
    }

    this.isUpdatingPassword = true
    this.apiService.updatePassword(this.passwordForm).subscribe(
      (res: any) => {
        this.gs.successToaster("Password updated successfully!")
        this.passwordForm = { old_pass: "", new_pass: "", confirm_pass: "" }
        this.isUpdatingPassword = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to update password")
        this.isUpdatingPassword = false
      },
    )
  }

  savePreferences(): void {
    // Implement preferences save logic
    this.gs.successToaster("Preferences saved successfully!")
  }

  // Orders Methods
  loadOrders(): void {
    this.isLoadingOrders = true
    let url = `${APIURLs.getOrderAPI}?page=${this.currentPage}&limit=${this.itemsPerPage}`
    if (this.orderStatus !== "all") {
      url += `&status=${this.orderStatus}`
    }

    this.httpService.get(url).subscribe(
      (res: any) => {
        // Handle the paginated response structure from DaoManager
        const responseData = res.data || {}
        this.orders = responseData.data || []
        this.filteredOrders = [...this.orders]
        this.totalPages = responseData.totalPage || 1
        this.totalItems = responseData.total || this.orders.length
        this.isLoadingOrders = false
        this.applyOrderFilters()
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to load orders")
        this.isLoadingOrders = false
      },
    )
  }

  onOrderStatusChange(status: string): void {
    this.orderStatus = status
    this.currentPage = 1
    this.loadOrders()
  }

  searchOrders(): void {
    this.applyOrderFilters()
  }

  applyOrderFilters(): void {
    let filtered = [...this.orders]

    if (this.orderSearchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_id.toLowerCase().includes(this.orderSearchTerm.toLowerCase()) ||
          order.order_status.toLowerCase().includes(this.orderSearchTerm.toLowerCase()),
      )
    }

    this.filteredOrders = filtered
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
      this.loadOrders()
    }
  }

  getPageNumbers(): number[] {
    const pages = []
    const maxPages = Math.min(5, this.totalPages)
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2))
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  getPendingOrdersCount(): number {
    return this.orders.filter((order) => ["pending", "confirmed", "processing"].includes(order.order_status)).length
  }

  viewOrderDetails(order: Order): void {
    this.router.navigate(["/order-status", order.order_id])
  }

  canTrackOrder(order: Order): boolean {
    return ["confirmed", "processing", "shipped"].includes(order.order_status)
  }

  trackOrder(order: Order): void {
    this.router.navigate(["/order-status", order.order_id])
  }

  toggleOrderTracking(order: Order): void {
    order.showTracking = !order.showTracking
  }

  canCancelOrder(order: Order): boolean {
    return ["pending", "confirmed"].includes(order.order_status)
  }

  canDownloadInvoice(order: Order): boolean {
    // Show invoice download for orders that are confirmed, processing, shipped, or delivered
    // and have payment completed (online payment) or are COD orders
    const downloadableStatuses = ["confirmed", "processing", "shipped", "delivered"]
    return downloadableStatuses.includes(order.order_status) && 
           (order.payment_mode === "online" || order.payment_mode === "cod")
  }

  cancelOrder(order: Order): void {
    if (confirm("Are you sure you want to cancel this order?")) {
      this.httpService.put(APIURLs.cancelOrderAPI, { _id: order._id }).subscribe(
        (res: any) => {
          this.gs.successToaster("Order cancelled successfully!")
          this.loadOrders()
        },
        (err) => {
          this.gs.errorToaster(err?.error?.msg || "Failed to cancel order")
        },
      )
    }
  }

  canContactSupport(order: Order): boolean {
    return true // Always allow support contact
  }

  contactSupport(order: Order): void {
    this.supportQueryForm = {
      subject: `Support for Order #${order.order_id}`,
      description: "",
      orderId: order._id,
      id: null,
    }
    this.showSupportModal = true
  }

  downloadInvoice(order: Order): void {
    // Use the downloadFile method which properly handles blob responses
    this.httpService.downloadFile(`${APIURLs.downloadInvoiceAPI}/${order._id}`).subscribe(
      (res: any) => {
        try {
          // Create blob from response
          const blob = new Blob([res], { type: "application/pdf" })
          
          // Create download link
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `invoice-${order.order_id}.pdf`
          
          // Trigger download
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Clean up
          window.URL.revokeObjectURL(url)
          
          this.gs.successToaster("Invoice downloaded successfully!")
        } catch (error) {
          console.error("Error creating download:", error)
          this.gs.errorToaster("Failed to create download link")
        }
      },
      (err) => {
        console.error("Download invoice error:", err)
        
        // Try to read error response if it's a blob
        if (err.error instanceof Blob) {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result as string)
              this.gs.errorToaster(errorData.msg || "Failed to download invoice")
            } catch {
              this.gs.errorToaster("Failed to download invoice")
            }
          }
          reader.readAsText(err.error)
        } else {
          this.gs.errorToaster(err?.error?.msg || "Failed to download invoice")
        }
      },
    )
  }

  // Address Methods
  loadAddresses(): void {
    this.isLoadingAddresses = true
    this.httpService.get(APIURLs.getAllAdressAPI).subscribe(
      (res: any) => {
        this.addresses = res.data || []
        this.isLoadingAddresses = false
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to load addresses")
        this.isLoadingAddresses = false
      },
    )
  }

  showAddAddressForm(): void {
    this.showAddressForm = true
    this.editingAddress = null
    this.resetAddressForm()
  }

  editAddress(address: Address): void {
    this.showAddressForm = true
    this.editingAddress = address
    this.addressForm = { ...address }
  }

  resetAddressForm(): void {
    this.addressForm = {
      firstname: "",
      lastname: "",
      phone_no: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isBilling: false,
      isShipping: false,
    }
  }

  saveAddress(): void {
    // Validate address before saving
    const validation = this.validationService.validateAddressObject(this.addressForm);
    if (!validation.isValid) {
      this.gs.errorToaster(validation.errors[0]); // Show first error
      return;
    }

    this.isLoadingAddresses = true

    if (this.editingAddress) {
      // Update existing address
      const updateData = { ...this.addressForm, addressId: this.editingAddress._id }
      this.httpService.put(APIURLs.updateAddressAPI, updateData).subscribe(
        (res: any) => {
          this.gs.successToaster("Address updated successfully!")
          this.showAddressForm = false
          this.loadAddresses()
        },
        (err) => {
          this.gs.errorToaster(err?.error?.msg || "Failed to update address")
          this.isLoadingAddresses = false
        },
      )
    } else {
      // Add new address
      this.httpService.post(APIURLs.addAddressAPI, this.addressForm).subscribe(
        (res: any) => {
          this.gs.successToaster("Address added successfully!")
          this.showAddressForm = false
          this.loadAddresses()
        },
        (err) => {
          this.gs.errorToaster(err?.error?.msg || "Failed to add address")
          this.isLoadingAddresses = false
        },
      )
    }
  }

  deleteAddress(address: Address): void {
    if (confirm("Are you sure you want to delete this address?")) {
      this.httpService.delete(`${APIURLs.deleteAddressAPI}`, address._id).subscribe(
        (res: any) => {
          this.gs.successToaster("Address deleted successfully!")
          this.loadAddresses()
        },
        (err) => {
          this.gs.errorToaster(err?.error?.msg || "Failed to delete address")
        },
      )
    }
  }

  cancelAddressForm(): void {
    this.showAddressForm = false
    this.editingAddress = null
    this.resetAddressForm()
  }

  // Wishlist Methods
  loadWishlist(): void {
    // Implement wishlist loading
    this.wishlistItems = []
  }

  removeFromWishlist(item: any): void {
    if (confirm("Remove this item from wishlist?")) {
      // Implement wishlist removal
      this.gs.successToaster("Item removed from wishlist")
    }
  }

  addToCart(item: any): void {
    // Implement add to cart from wishlist
    this.gs.successToaster("Item added to cart")
  }



  // Notifications Methods
  loadNotifications(): void {
    this.notifications = [
      {
        id: 1,
        type: "order",
        title: "Order Delivered",
        message: "Your order #12345 has been delivered successfully",
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: 2,
        type: "shipping",
        title: "Order Shipped",
        message: "Your order #12344 is on its way",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
    ]
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some((n) => !n.read)
  }

  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.read = true))
    this.gs.successToaster("All notifications marked as read")
  }

  markAsRead(notification: any): void {
    notification.read = true
    this.gs.successToaster("Notification marked as read")
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      order: "bi-bag-check text-success",
      shipping: "bi-truck text-primary",
      payment: "bi-credit-card text-info",
      account: "bi-person text-warning",
    }
    return icons[type] || "bi-bell text-secondary"
  }

  // Support Methods
  loadSupportQueries(): void {
    this.supportQueries = []
  }

  startLiveChat(): void {
    this.gs.errorToaster("Live chat feature coming soon!")
  }

  openEmailSupport(): void {
    window.location.href = "mailto:support@example.com"
  }

  submitSupportQuery(): void {
    if (!this.supportQueryForm.subject || !this.supportQueryForm.description) {
      this.gs.errorToaster("Please fill in all required fields")
      return
    }

    this.isSubmittingSupportQuery = true

    const queryData = {
      subject: this.supportQueryForm.subject,
      description: this.supportQueryForm.description,
      order_id: this.supportQueryForm.orderId,
    }

    if (this.supportQueryForm.id) {
      // Update existing query
      this.httpService
        .put(APIURLs.updateOrderQueryAPI, {
          query_id: this.supportQueryForm.id,
          ...queryData,
        })
        .subscribe(
          (res: any) => {
            this.gs.successToaster("Support query updated successfully!")
            this.closeSupportModal()
            this.loadSupportQueries()
          },
          (err) => {
            this.gs.errorToaster(err?.error?.msg || "Failed to update query")
            this.isSubmittingSupportQuery = false
          },
        )
    } else {
      // Create new query
      this.httpService.post(APIURLs.addOrderQueryAPI, queryData).subscribe(
        (res: any) => {
          this.gs.successToaster("Support query submitted successfully!")
          this.closeSupportModal()
          this.loadSupportQueries()
        },
        (err) => {
          this.gs.errorToaster(err?.error?.msg || "Failed to submit query")
          this.isSubmittingSupportQuery = false
        },
      )
    }
  }

  closeSupportModal(): void {
    this.showSupportModal = false
    this.isSubmittingSupportQuery = false
    this.supportQueryForm = {
      subject: "",
      description: "",
      orderId: null,
      id: null,
    }
  }

  viewQuery(query: SupportQuery): void {
    // Implement query details view
    this.gs.errorToaster("Query details view coming soon!")
  }

  updateQuery(query: SupportQuery): void {
    this.supportQueryForm = {
      subject: query.subject,
      description: query.description,
      orderId: null,
      id: query._id,
    }
    this.showSupportModal = true
  }

  // Utility Methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: "bg-warning",
      confirmed: "bg-info",
      processing: "bg-primary",
      shipped: "bg-secondary",
      delivered: "bg-success",
      cancelled: "bg-danger",
    }
    return `badge ${statusClasses[status?.toLowerCase()] || "bg-secondary"}`
  }

  getProductImage(item: any): string {
    return item?.product_id?.product_images?.[0] || "/placeholder.svg?height=60&width=60"
  }

  logout(): void {
    if (confirm("Are you sure you want to logout?")) {
      // Clear all stored data
      this.gs.clear()
      this.gs.isLogin = false
      this.gs.userDataObj = null
      this.router.navigate(["/login"])
      this.gs.successToaster("Logged out successfully!")
    }
  }

  getCitiesForState(state: string): string[] {
    if (!state || !this.citiesByState[state]) {
      return [];
    }
    return this.citiesByState[state];
  }

  onStateChange(): void {
    // Reset city when state changes
    this.addressForm.city = '';
  }
}
