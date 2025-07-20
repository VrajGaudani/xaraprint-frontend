import { Component, OnInit } from '@angular/core';
import { Api1Service } from '../service/api1.service';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { APIURLs } from 'src/environments/apiUrls';
import { HttpService } from '../service/http.service';
import { GlobleService } from '../service/globle.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  isSubmitted : boolean = false;
  signupForm! : FormGroup;

  isLoading = false
  showPassword = false
  passwordChecks = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  }


  constructor(
    private api1: Api1Service,
    private fb: FormBuilder,
    private httpService: HttpService,
    public gs: GlobleService,
    private router: Router,
  ) {

  }

  ngOnInit(): void {
    this.initializeForm()
    this.setupPasswordValidation()
  }

  initializeForm() {
    this.signupForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      firstname: ["", [Validators.required, Validators.minLength(2)]],
      lastname: ["", [Validators.required, Validators.minLength(2)]],
      company_name: [""],
      country_code: ["", [Validators.required]],
      phone_no: ["", [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  setupPasswordValidation() {
    this.signupForm.get("password")?.valueChanges.subscribe((password) => {
      if (password) {
        this.passwordChecks = {
          length: password.length >= 6,
          uppercase: /[A-Z]/.test(password),
          lowercase: /[a-z]/.test(password),
          number: /[0-9]/.test(password),
        }
      }
    })
  }

  get firstname() {
    return this.signupForm.get('firstname');
  }

  get lastname() {
    return this.signupForm.get('lastname');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get country_code() {
    return this.signupForm.get('country_code');
  }

  get phone_no() {
    return this.signupForm.get('phone_no');
  }

  get company_name() {
    return this.signupForm.get('company_name');
  }


  submit() {
    this.isSubmitted = true

    if (this.signupForm.invalid) {
      this.gs.errorToaster("Please fill all required fields correctly")
      return
    }

    // Check terms acceptance
    const termsAccepted = (document.getElementById("termsAccept") as HTMLInputElement)?.checked
    if (!termsAccepted) {
      this.gs.errorToaster("Please accept the Terms & Conditions")
      return
    }

    this.isLoading = true
    const signupData = this.signupForm.value

    this.httpService.postBasic(APIURLs.userRegisterAPI, signupData).subscribe(
      (res: any) => {
        this.isLoading = false
        if (res.success) {
          this.gs.successToaster("Account created successfully! Please verify your email.")
          // Redirect to login or verification page
          this.router.navigate(["/login"])
        } else {
          this.gs.errorToaster(res.message || "Registration failed")
        }
      },
      (err) => {
        this.isLoading = false
        this.gs.errorToaster(err?.error?.message || "Registration failed. Please try again.")
      },
    )
  }

  socialSignup(provider: 'google' | 'facebook') {
    if (provider === 'google') {
      // Google signup implementation
      this.gs.errorToaster("Google signup feature coming soon!")
    } else if (provider === 'facebook') {
      // Facebook signup implementation
      this.gs.errorToaster("Facebook signup feature coming soon!")
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched || this.isSubmitted))
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName)
    return !!(field && field.valid && (field.dirty || field.touched))
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName)
    if (field?.errors) {
      if (field.errors["required"]) return `${fieldName} is required`
      if (field.errors["email"]) return "Please enter a valid email"
      if (field.errors["minlength"]) return `Minimum ${field.errors["minlength"].requiredLength} characters required`
      if (field.errors["pattern"]) return "Please enter a valid format"
    }
    return ""
  }

}
