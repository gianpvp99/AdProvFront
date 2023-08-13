import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {InjectorInstance} from 'app/app.module';

export class RequestMethod {
  private http: HttpClient;

  constructor() {
    this.http = InjectorInstance.get<HttpClient>(HttpClient);
  }

  get(url: string, params: string, headers: any): Observable<any> {
    return this.http.get(url + ((params) ? params : ''), {headers: new HttpHeaders(headers)});
  }

  post(url: string, body: string, headers: any): Observable<any> {
    return this.http.post(url, body, {headers: new HttpHeaders(headers)});
  }

  delete(url: string, params: string, headers: any): Observable<any> {
    return this.http.delete(url + ((params) ? params : ''), {headers: new HttpHeaders(headers)});
  }

  async deleteAsync(url: string, params: string, headers: any): Promise<any> {
    return await this.http.delete<any>(url + ((params) ? params : ''), {headers: new HttpHeaders(headers)}).toPromise();
  }
  // postFile(url: string, body: FormData, headers: any): Observable<any> {
  //   return this.http.post(url, body, {headers: new HttpHeaders(headers)});
  // }
}
