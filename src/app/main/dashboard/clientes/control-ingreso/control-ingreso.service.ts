import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { CONTENT_TYPE } from 'helpers/headers';
import { RequestMethod } from 'helpers/request-method';
import { CLIENTE } from 'helpers/url';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ControlIngresoService {
  private requestMethod = new RequestMethod();
  constructor() { }

  empleado_list(payload): Observable<any> {
    return this.requestMethod.get(
        `${environment.apiUrl}${CLIENTE.cliente_list}`,
        `?idCliente=${payload.idCliente}`,
        {
            'Content-Type': CONTENT_TYPE.json
        }
    );
  }
}
