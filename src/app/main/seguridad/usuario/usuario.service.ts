import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestMethod } from '../../../../helpers/request-method';
import { environment } from '../../../../environments/environment';
import { CLIENTE, SEGURIDAD } from '../../../../helpers/url';
import { CONTENT_TYPE } from '../../../../helpers/headers';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private requestMethod = new RequestMethod();

    constructor() { }

    usuario_list(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${SEGURIDAD.usuario_list}`,
            `?idEstado=${payload.idEstado}&search=${payload.search}&pageIndex=${payload.pageIndex}&pageSize=${payload.pageSize}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    usuario_save(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${SEGURIDAD.usuario_insertupdate}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    usuario_delete(payload): Observable<any> {
        return this.requestMethod.delete(
            `${environment.apiUrl}${SEGURIDAD.usuario_delete}`,
            `?idUsuario=${payload.idUsuario}&idUsuarioAud=${payload.idUsuarioAud}`,
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

    rolForTypeUser_list(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${SEGURIDAD.role_ForTypeUser_list}`,
            `?idTyeUser=${payload.idTypeUser}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    cliente_list(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CLIENTE.cliente_list}`,
            `?IdCliente=${payload.idCliente}&IdEstado=${payload.idEstado}&Search=${payload.Search}&PageIndex=${payload.pageIndex}&PageSize=${payload.PageSize}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }
}
