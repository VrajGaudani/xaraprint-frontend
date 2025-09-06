import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../service/http.service';
import { GlobleService } from '../../service/globle.service';
import { APIURLs } from '../../../environments/apiUrls';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent implements OnInit {
  allBlogs: any[] = [];
  isLoading = false;
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 8;

  constructor(
    private httpService: HttpService,
    public gs: GlobleService
  ) {}

  ngOnInit(): void {
    this.getBlogs();
  }

  getBlogs(): void {
    this.isLoading = true;
    this.httpService.get(APIURLs.getLatestBlogAPI, { 
      limit: this.itemsPerPage,
      page: this.currentPage 
    }).subscribe(
      (res: any) => {
        this.allBlogs = res.data?.data || res.data || [];
        this.totalPages = Math.ceil((res.data?.total || this.allBlogs.length) / this.itemsPerPage);
        this.isLoading = false;
      },
      (err) => {
        this.gs.errorToaster(err?.error?.msg || "Failed to load blogs!");
        this.allBlogs = [];
        this.isLoading = false;
      }
    );
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getBlogs();
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-blog.jpg';
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 4) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }
}
