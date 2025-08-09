import { Component, OnInit } from "@angular/core"
import { Api1Service } from "../service/api1.service"
import { GlobleService } from "../service/globle.service"
import { Router } from "@angular/router"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { HttpService } from "../service/http.service"
import { APIURLs } from "src/environments/apiUrls"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  formObj: any = {}
  isSubmitted = false
  loginForm!: FormGroup
  isLoading = false
  showPassword = false

  constructor(
    private api1: Api1Service,
    private fb: FormBuilder,
    public gs: GlobleService,
    private router: Router,
    private httpService: HttpService,
  ) {}

  ngOnInit(): void {
    this.initializeForm()
  }

  initializeForm() {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  private handleLoginSuccess(res: any) {
    const token = res?.data?.token
    const user = res?.data?.user || res?.data?.data || res?.data
    if (token) {
      this.gs.setItem("token", token)
    }
    if (user) {
      this.gs.setItem("userData", user)
      this.gs.userDataObj = user
    }
    this.gs.isLogin = true
    this.router.navigate(["/home"]) // Trigger header to update via route change
    this.gs.successToaster(res?.msg || res?.message || "Login successful!")
    this.isSubmitted = false
  }

  login() {
    this.isSubmitted = true

    if (this.loginForm.invalid) {
      this.gs.errorToaster("Please fill all required fields correctly")
      return
    }

    this.isLoading = true
    const loginData = this.loginForm.value

    this.httpService.postBasic(APIURLs.userLoginAPI, loginData).subscribe(
      (res: any) => {
        this.isLoading = false
        if (res && (res.status === 200 || res.status === 201)) {
          this.handleLoginSuccess(res)
        } else {
          this.gs.errorToaster(res?.msg || res?.message || "Login failed. Please try again.")
        }
      },
      (err) => {
        this.isLoading = false
        this.gs.errorToaster(err?.error?.msg || err?.error?.message || "Login failed. Please try again.")
      },
    )
  }

  socialLogin(provider: 'google' | 'facebook') {
    if (provider === 'google') {
      signInWithPopup(this.gs.socialLogin(), new GoogleAuthProvider())
        .then((res) => {
          const payload = {
            email: res.user.email,
            password: res.user.uid,
            firstname: res.user.displayName,
            social_id: res.user.uid,
          }

          this.httpService.postBasic(APIURLs.userLoginAPI, payload).subscribe(
            (apiRes: any) => {
              if (apiRes && (apiRes.status === 200 || apiRes.status === 201)) {
                this.handleLoginSuccess(apiRes)
              } else {
                this.gs.errorToaster(apiRes?.msg || apiRes?.message || 'Login failed')
              }
            },
            (error) => {
              this.gs.errorToaster(error?.error?.msg || 'Login failed')
            }
          )
        })
        .catch((error) => {
          console.log("google error: ", error)
          this.gs.errorToaster("Google login failed. Please try again.")
        })
    } else if (provider === 'facebook') {
      this.gs.errorToaster("Facebook login coming soon!")
    }
  }

  forgotPassword() {
    this.router.navigate(["/forgot-password"])
  }

  loginWithOTP() {
    this.router.navigate(["/login-otp"])
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  guestCheckout() {
    this.router.navigate(["/checkout"])
  }

  getHelp() {
    this.router.navigate(["/support"])
  }

  createAccount() {
    this.router.navigate(["/sign-up"])
  }
}
