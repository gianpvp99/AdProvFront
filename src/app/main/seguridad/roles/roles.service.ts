import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { CONTENT_TYPE } from 'helpers/headers';
import { RequestMethod } from 'helpers/request-method';
import { SEGURIDAD } from 'helpers/url';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private requestMethod = new RequestMethod();
  
  constructor() { }

  rol_list(payload): Observable<any> {
    return this.requestMethod.get(
        `${environment.apiUrl}${SEGURIDAD.rol_list}`,
        `?option=${payload.option}&search=${payload.search}&page=${payload.page}&pageSize=${payload.pageSize}`,
        {
            'Content-Type': CONTENT_TYPE.json
        }
    );
  
  }

  typeUser_list(): Observable<any> {
    return this.requestMethod.get(
        `${environment.apiUrl}${SEGURIDAD.typeUser_list}`,
        ``,
        {
            'Content-Type': CONTENT_TYPE.json
        }
    );
  
  }

  rol_save(payload): Observable<any> {
    return this.requestMethod.post(
        `${environment.apiUrl}${SEGURIDAD.role_add}`,
        payload,
        {
            'Content-Type': CONTENT_TYPE.json
        }
    );
  }

  rol_delete(payload): Observable<any> {
    return this.requestMethod.delete(
        `${environment.apiUrl}${SEGURIDAD.rol_delete}`,
        `?idRole=${payload.idRole}&iduser=${payload.iduser}`,
        {
            'Content-Type': CONTENT_TYPE.json
        }
    );
  }

  rol_update(payload): Observable<any> {
    return this.requestMethod.post(
        `${environment.apiUrl}${SEGURIDAD.role_update}`,
        payload,
        {
            'Content-Type': CONTENT_TYPE.json
        }
    );
  }

  access_list(payload): Observable<any>{
    return this.requestMethod.get(
      `${environment.apiUrl}${SEGURIDAD.access_list}`,
      `?idTipoUser=${payload.idTipoUser}`,
      {
          'Content-Type': CONTENT_TYPE.json
      }
    );
  }

  role_access_list(payload): Observable<any>{
    return this.requestMethod.get(
      `${environment.apiUrl}${SEGURIDAD.role_access_list}`,
      `?role=${payload.role}`,
      {
          'Content-Type': CONTENT_TYPE.json
      }
    );
  }
  role_accessNew_list(payload): Observable<any>{
    return this.requestMethod.get(
      `${environment.apiUrl}${SEGURIDAD.role_accessNew_list}`,
      `?role=${payload.role}`,
      {
          'Content-Type': CONTENT_TYPE.json
      }
    );
  }

  rol_access_save(payload): Observable<any> {
    return this.requestMethod.post(
        `${environment.apiUrl}${SEGURIDAD.role_access_add}`,
        payload,
        {
            'Content-Type': CONTENT_TYPE.json
        }
    );
  }

  rol_access_delete(payload): Observable<any> {
    return this.requestMethod.delete(
        `${environment.apiUrl}${SEGURIDAD.role_access_delete}`,
        `?idAccessRole=${payload.idAccessRole}`, 
        {
          'Content-Type': CONTENT_TYPE.json
        }
    );
  }

  role_access_list_Modal(payload): Observable<any>{
    return this.requestMethod.get(
      `${environment.apiUrl}${SEGURIDAD.role_access_list_Modal}`,
      `?role=${payload.role}`,
      {
          'Content-Type': CONTENT_TYPE.json
      }
    );
  }

}