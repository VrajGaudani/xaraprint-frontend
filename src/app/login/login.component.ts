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
        if (res && res.status) {
          this.gs.setItem("token", res?.data?.token)
          this.gs.setItem("userData", res.data)
          this.gs.userDataObj = res.data?.data || res.data || []
          this.router.navigate(["/home"])
          this.gs.successToaster(res?.msg || res?.message || "Login successful!")
          this.isSubmitted = false
        } else {
          this.gs.errorToaster(res?.message || "Login failed. Please try again.")
        }
      },
      (err) => {
        this.isLoading = false
        this.gs.errorToaster(err?.error?.message || err?.error?.msg || "Login failed. Please try again.")
      },
    )
  }

  socialLogin(provider: 'google' | 'facebook') {
    if (provider === 'google') {
      signInWithPopup(this.gs.socialLogin(), new GoogleAuthProvider())
        .then((res) => {
          this.formObj.email = res.user.email
          this.formObj.password = res.user.uid
          this.formObj.firstname = res.user.displayName
          this.formObj.social_id = res.user.uid

          this.api1.user("/login", this.formObj).subscribe((res: any) => {
            if (res && res.status) {
              this.gs.setItem("userData", res.data)
              this.gs.userDataObj = res.data?.data || res.data || []
              this.router.navigate(["/home"])
              this.gs.successToaster(res.message)
            } else {
              this.gs.errorToaster(res.message)
            }
          })
        })
        .catch((error) => {
          console.log("google error: ", error)
          this.gs.errorToaster("Google login failed. Please try again.")
        })
    } else if (provider === 'facebook') {
      // Facebook login implementation
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
