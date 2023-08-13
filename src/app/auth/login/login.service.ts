import { Injectable } from '@angular/core';
import { RequestMethod } from '../../shared/helpers/request-method';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { AUTH, SEGURIDAD } from 'helpers/url';
import { CONTENT_TYPE } from '../../shared/helpers/headers';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private requestMethod = new RequestMethod();

  constructor() {
  }

  login(payload): Observable<any> {
    return this.requestMethod.get(
      `${environment.apiUrl}${AUTH.login}`,
      `?ruc=${payload.ruc}&usuario=${payload.usuario}&clave=${payload.clave}&idSignInType=${payload.idSignInType}`,
      {
        'Content-Type': CONTENT_TYPE.json
      }
    );
  }

  isAuth(): boolean {
    return localStorage.getItem('currentUser') ? true : false;
  }

  setMenuAccess(payload): Observable<any> {
    return this.requestMethod.get(
        `${environment.apiUrl}${SEGURIDAD.role_access_list}`,
        `?role=${payload.role}`,
        {
            'Content-Type': CONTENT_TYPE.json
        }
    );
}
}
