import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) { }

  saveimage(file: any) {
    var fd = new FormData();
    fd.append('file', file);
    return this.http.post(environment.baseUrl + 'upload-file', fd);
  }
}
