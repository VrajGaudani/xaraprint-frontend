import { Component, OnInit } from '@angular/core';
import { Api1Service } from '../service/api1.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  // formObj: any = {
  //   firstname: "",
  //   lastname: "",
  //   email: "",
  //   password: "",
  //   company_name: "",
  //   country_code: "",
  //   phone_no: "",
  //   type: "",
  //   social_id: "",
  // }


  constructor(
    private api1: Api1Service,
    private httpService: HttpService,
    public gs: GlobleService,
    private router: Router,
  ) {

  }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      "firstname" : new FormControl('',[Validators.required]),
      "lastname" : new FormControl('',[Validators.required]),
      "email" : new FormControl('',[Validators.required,Validators.email]),
      "password" : new FormControl('',[Validators.required,Validators.minLength(6)]),
      "country_code" : new FormControl('',[Validators.required]),
      "phone_no" : new FormControl('',[Validators.required]),
      "company_name" : new FormControl('',[Validators.required]),
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
    // console.log(">>>", this.formObj)

    // this.formObj = {
    //   "firstname": "aamir",
    //   "lastname": "bhimani",
    //   "email": "aamirbhimani01@gmail.com",
    //   "password": "123123",
    //   "company_name": "gold infotech",
    //   "country_code": "+91",
    //   "phone_no": "+919737863281",
    //   "type": "",
    //   "social_id": ""
    // }

    // this.api1.user("/sign-up", this.formObj).subscribe((res: any) => {
    //   console.log("<<<", res);
    //   if (res && res.status) {

    //   } else {

    //   }
    // })

    if(this.signupForm.valid){
      this.httpService.postWithoutSec(APIURLs.registerAPI, this.signupForm.value).subscribe((res:any) => {
        this.router.navigate(['/login']);
        this.gs.successToaster(res?.msg);
        this.isSubmitted = false;
      },(err) => {
        this.gs.errorToaster(err?.error?.msg || "something went wrong !!");
      })
    }


  }

}
