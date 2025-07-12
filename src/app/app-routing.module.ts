import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutsComponent } from './layouts/layouts.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { CartComponent } from './pages/cart/cart.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { BlogDetailsComponent } from './pages/blog-details/blog-details.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { CountryComponent } from './pages/country/country.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { TermsConditionsComponent } from './pages/terms-conditions/terms-conditions.component';
import { CancellationRefundComponent } from './pages/cancellation-refund/cancellation-refund.component';
import { ErrorComponent } from './pages/error/error.component';

const routes: Routes = [
  {
    path: '', component: LayoutsComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'product-list', component: ProductListComponent },
      { path: 'product-list/:slug', component: ProductListComponent },
      { path: 'product-details/:id', component: ProductDetailsComponent },
      { path: 'cart', component: CartComponent },
      { path: 'blogs', component: BlogsComponent },
      { path: 'blog-details/:id', component: BlogDetailsComponent },
      { path: 'privacy-and-policy', component: PrivacyPolicyComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'order-success', component: OrderSuccessComponent },
      { path: 'country', component: CountryComponent },
      { path: 'account', component: MyAccountComponent },
      { path: "about-us", component: AboutUsComponent },
      { path: "contact-us", component: ContactUsComponent },
      { path: "terms-conditions", component: TermsConditionsComponent },
      { path: "cancellation-refund", component: CancellationRefundComponent }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: '404', component: ErrorComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
