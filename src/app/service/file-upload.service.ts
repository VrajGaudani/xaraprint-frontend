import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) { }

  // Single file upload
  saveimage(file: any) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(environment.baseUrl + 'upload/upload-file', fd);
  }

  // Multiple files upload
  multiimage(fileArray: any) {
    const fd = new FormData();
    for (let i = 0; i < fileArray.length; i++) {
      fd.append('files', fileArray[i]);
    }
    return this.http.post(environment.baseUrl + 'upload/upload-files', fd);
  }

  // Single file upload with authentication
  saveimageAuth(file: any) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(environment.baseUrl + 'upload/upload-file-auth', fd);
  }

  // Multiple files upload with authentication
  multiimageAuth(fileArray: any) {
    const fd = new FormData();
    for (let i = 0; i < fileArray.length; i++) {
      fd.append('files', fileArray[i]);
    }
    return this.http.post(environment.baseUrl + 'upload/upload-files-auth', fd);
  }

  // Delete file
  deleteFile(fileUrl: string) {
    return this.http.delete(environment.baseUrl + 'upload/delete-file', {
      body: { fileUrl }
    });
  }
}
