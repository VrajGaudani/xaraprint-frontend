import { Component, OnInit } from '@angular/core';
import { Api1Service } from '../service/api1.service';
import { GlobleService } from '../service/globle.service';
import { Router } from '@angular/router';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { HttpService } from '../service/http.service';
import { APIURLs } from 'src/environments/apiUrls';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  formObj: any = {};
  isSubmitted : boolean = false;
  loginForm! : FormGroup;
  isLoading = false
  showPassword = false
  constructor(
    private api1: Api1Service,
    private fb: FormBuilder,
    public gs: GlobleService,
    private router: Router,
    private httpService: HttpService,
  ) { }

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

    this.httpService.post(APIURLs.loginAPI, loginData).subscribe(
      (res: any) => {
        this.isLoading = false
          this.gs.setItem("token", res?.data?.token);
        this.gs.userDataObj = res.data
        this.router.navigate(['/home']);
        this.gs.successToaster(res?.msg);
        this.isSubmitted = false;
      },
      (err) => {
        this.isLoading = false
        this.gs.errorToaster(err?.error?.message || "Login failed. Please try again.")
      },
    )
  }

  socialLogin() {
    // let op = this.gs.socialLogin();
    // console.log(":op>>", op)

    signInWithPopup(this.gs.socialLogin(), new GoogleAuthProvider()).then((res) => {
      this.formObj.email = res.user.email;
      this.formObj.password = res.user.uid;
      this.formObj.firstname = res.user.displayName;
      this.formObj.social_id = res.user.uid;

      this.api1.user("/login", this.formObj).subscribe((res: any) => {
        if (res && res.status) {
          this.gs.setItem("userData", res.data);
          this.gs.userDataObj = res.data
          this.router.navigate(['/home']);
          this.gs.successToaster(res.message);
        } else {
          this.gs.errorToaster(res.message);
        }
      })
    }).catch((error) => console.log("google error: ", error));

  }

  forgotPassword() {
    // Implement forgot password logic
    this.router.navigate(["/forgot-password"])
  }

  loginWithOTP() {
    // Implement OTP login logic
    this.router.navigate(["/login-otp"])
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  // Quick actions
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
