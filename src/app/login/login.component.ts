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
  constructor(
    private api1: Api1Service,
    public gs: GlobleService,
    private router: Router,
    private httpService: HttpService,
  ) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      "email" : new FormControl('',[Validators.required,Validators.email]),
      "password" : new FormControl('',[Validators.required,Validators.minLength(6)]),
    })
  }

  login() {
    this.isSubmitted = true;
    this.formObj.social_id = "";
    this.formObj.firstname = "";
    // this.api1.user("/login", this.formObj).subscribe((res: any) => {
    //   if (res && res.status) {
    //     this.gs.setItem("userData", res.data);
    //     this.gs.userDataObj = res.data
    //     this.router.navigate(['/home']);
    //     this.gs.successToaster(res.message);
    //   } else {
    //     this.gs.errorToaster(res.message);
    //   }
    // })

    if(this.loginForm.valid){
      this.httpService.postWithoutSec(APIURLs.loginAPI, this.loginForm.value).subscribe((res:any) => {
        // this.gs.setItem("userData", res.data);
        this.gs.setItem("token", res?.data?.token);
        this.gs.userDataObj = res.data
        this.router.navigate(['/home']);
        this.gs.successToaster(res?.msg);
        this.isSubmitted = false;
      },(err) => {
        this.gs.errorToaster(err?.error?.msg || "something went wrong !!");
      })
    }

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
}
