import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { HttpClientModule } from "@angular/common/http"

import { AppRoutingModule } from "./app-routing.module"
import { AppComponent } from "./app.component"
import { LayoutsComponent } from "./layouts/layouts.component"
import { HeaderComponent } from "./layouts/header/header.component"
import { FooterComponent } from "./layouts/footer/footer.component"
import { LoginComponent } from "./login/login.component"
import { SignUpComponent } from "./sign-up/sign-up.component"
import { MyAccountComponent } from "./my-account/my-account.component"

// Pages
import { HomeComponent } from "./pages/home/home.component"
import { AboutUsComponent } from "./pages/about-us/about-us.component"
import { ContactUsComponent } from "./pages/contact-us/contact-us.component"
import { ProductListComponent } from "./pages/product-list/product-list.component"
import { ProductDetailsComponent } from "./pages/product-details/product-details.component"
import { CartComponent } from "./pages/cart/cart.component"
import { CheckoutComponent } from "./pages/checkout/checkout.component"
import { OrderSuccessComponent } from "./pages/order-success/order-success.component"
import { OrderStatusComponent } from "./pages/order-status/order-status.component"
import { BlogsComponent } from "./pages/blogs/blogs.component"
import { BlogDetailsComponent } from "./pages/blog-details/blog-details.component"
import { PrivacyPolicyComponent } from "./pages/privacy-policy/privacy-policy.component"
import { TermsConditionsComponent } from "./pages/terms-conditions/terms-conditions.component"
import { CancellationRefundComponent } from "./pages/cancellation-refund/cancellation-refund.component"
import { CountryComponent } from "./pages/country/country.component"
import { ErrorComponent } from "./pages/error/error.component"
import { PricingDetailsComponent } from "./pages/pricing-details/pricing-details.component"
import { SlickCarouselModule } from 'ngx-slick-carousel';

// Shared Components
import { PaginationComponent } from "./shared/pagination/pagination.component"
import { WhatsAppButtonComponent } from "./shared/whatsapp-button/whatsapp-button.component"
import { OrderTrackingComponent } from "./shared/order-tracking/order-tracking.component"

// Services
import { HttpService } from "./service/http.service"
import { GlobleService } from "./service/globle.service"
import { Api1Service } from "./service/api1.service"
import { FileUploadService } from "./service/file-upload.service"
import { PaginationService } from "./service/pagination.service"
import { CartService } from "./service/cart.service"

import { ToastrModule } from "ngx-toastr"

@NgModule({
  declarations: [
    AppComponent,
    LayoutsComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    SignUpComponent,
    MyAccountComponent,
    HomeComponent,
    AboutUsComponent,
    ContactUsComponent,
    ProductListComponent,
    ProductDetailsComponent,
    CartComponent,
    CheckoutComponent,
    OrderSuccessComponent,
    OrderStatusComponent,
    BlogsComponent,
    BlogDetailsComponent,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
    CancellationRefundComponent,
    CountryComponent,
    ErrorComponent,
    PricingDetailsComponent,
    PaginationComponent,
    WhatsAppButtonComponent,
    OrderTrackingComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule, HttpClientModule, SlickCarouselModule, ToastrModule.forRoot()],
  providers: [HttpService, GlobleService, Api1Service, FileUploadService, PaginationService, CartService],
  bootstrap: [AppComponent],
})
export class AppModule {}
