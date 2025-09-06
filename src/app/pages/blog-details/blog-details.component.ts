import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Api1Service } from 'src/app/service/api1.service';
import { FileUploadService } from 'src/app/service/file-upload.service';
import { GlobleService } from 'src/app/service/globle.service';
import { HttpService } from 'src/app/service/http.service';
import { APIURLs } from 'src/environments/apiUrls';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent implements OnInit {
  blogId: any = "";
  formObj: any = {}
  isLoading = false;
  notFound = false;

  constructor(
    private api1: Api1Service,
    public gs: GlobleService,
    private file: FileUploadService,
    private router: Router,
    private route: ActivatedRoute,
    private httpService: HttpService,
  ) { }

  ngOnInit(): void {
    this.blogId = this.route.snapshot.paramMap.get('id');
    if (this.blogId) {
      this.getBlog(this.blogId);
    } else {
      this.router.navigate(['/blogs']);
    }
  }

  getBlog(_id: any) {
    this.isLoading = true;
    this.notFound = false;
    
    this.httpService.get(APIURLs.getBlogByIdAPI + '/' + _id).subscribe(
      (res: any) => {
        this.formObj = res.data?.data || res.data || {};
        this.isLoading = false;
        
        if (!this.formObj || Object.keys(this.formObj).length === 0) {
          this.notFound = true;
        }
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Blog not found!");
        this.isLoading = false;
        this.notFound = true;
      }
    );
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-blog.jpg';
  }
}
