import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutsComponent } from './layouts/layouts.component';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { HomeComponent } from './pages/home/home.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { CartComponent } from './pages/cart/cart.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { ToastrModule } from 'ngx-toastr';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { BlogDetailsComponent } from './pages/blog-details/blog-details.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';
import { OrderStatusComponent } from './pages/order-status/order-status.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { CountryComponent } from './pages/country/country.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@NgModule({
  declarations: [
    AppComponent,
    LayoutsComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    ProductDetailsComponent,
    LoginComponent,
    SignUpComponent,
    CartComponent,
    ProductListComponent,
    PrivacyPolicyComponent,
    BlogsComponent,
    BlogDetailsComponent,
    CheckoutComponent,
    OrderSuccessComponent,
    OrderStatusComponent,
    MyAccountComponent,
    CountryComponent
  ],
  imports: [
    SlickCarouselModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CommonModule,
    ToastrModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
