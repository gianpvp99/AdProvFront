import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestMethod } from '../../../../helpers/request-method';
import { environment } from '../../../../environments/environment';
import { CLIENTE, CONTRATISTA, EMPLEADO, GOOGLEDRIVE, TABLAMAESTRA } from '../../../../helpers/url';
import { CONTENT_TYPE } from '../../../../helpers/headers';

@Injectable({
    providedIn: 'root'
})
export class ClienteService {
    private requestMethod = new RequestMethod();

    constructor() { }

    dropdown(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${TABLAMAESTRA.dropdown}`,
            `?idTabla=${payload.idTabla}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    clienteProyectoGrupo_List(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CLIENTE.clienteProyectoGrupo_List}`,
            `?idCliente=${payload.idCliente}&pageIndex=${payload.pageIndex}&pageSize=${payload.pageSize}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    cliente_list(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CLIENTE.cliente_list}`,
            `?idCliente=${payload.idCliente}&idEstado=${payload.idEstado}&search=${payload.search}&pageIndex=${payload.pageIndex}&pageSize=${payload.pageSize}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    cliente_Dropdown(): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CLIENTE.cliente_Dropdown}`,
            ``,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    cliente_insertupdate(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${CLIENTE.cliente_insertupdate}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratistaDocumentos_Insert(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${CLIENTE.contratistaDocumentos_Insert}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empleadosDocumentos_Insert(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${CLIENTE.empleadosDocumentos_Insert}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empresaDocumento_InsertUpdate(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${CLIENTE.empresaDocumento_InsertUpdate}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    cliente_delete(payload): Observable<any> {
        return this.requestMethod.delete(
            `${environment.apiUrl}${CLIENTE.cliente_delete}`,
            `?idCliente=${payload.idCliente}&idUsuarioAud=${payload.idUsuarioAud}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    sunatV1(payload): Observable<any> {
        return this.requestMethod.get(
            `https://dniruc.apisperu.com/api/v1/dni/` + payload.dni + `?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImtkaWF6cmFtaXJlejE4QGdtYWlsLmNvbSJ9.mYS9vY0ExmJyrdQENVoQeImqsr7YCwyWq84Gckpgs9M`,
            ``,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    sunatV2(payload): Observable<any> {
        return this.requestMethod.get(
            `https://dniruc.apisperu.com/api/v1/ruc/` + payload.documento + `?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImF0ZXJyYXpvc0BjcmVhdGVrc3lzdGVtLmNvbSJ9.OdItaTt5mXsdkcV9kZpa3KJob2szL-r9_MySVwaiAR4`,
            ``,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratista_dropdown(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CONTRATISTA.contratista_dropdown}`,
            `?idEstado=${payload.idEstado}&search=${payload.search}&pageIndex=${payload.pageIndex}&pageSize=${payload.pageSize}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empresaMatriz_Get(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CLIENTE.empresaMatriz_Get}`,
            `?idCliente=${payload.idCliente}&idClienteGrupo=${payload.idClienteGrupo}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empleadoMatriz_Get(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CLIENTE.empleadoMatriz_Get}`,
            `?idCliente=${payload.idCliente}&idClienteProyecto=${payload.idClienteProyecto}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    documentoHomEmpresa_List(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CLIENTE.documentoHomEmpresa_List}`,
            `?idCliente=${payload.idCliente}&idClienteGrupo=${payload.idClienteGrupo}&idContratista=${payload.idContratista}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    documentoHomEmpleado_List(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${EMPLEADO.documentoHomEmpleado_List}`,
            `?idCliente=${payload.idCliente}&idProyecto=${payload.idProyecto}&idEmpleado=${payload.idEmpleado}&idRegimenGeneral=${payload.idRegimenGeneral}&idRegimenMype=${payload.idRegimenMype}&idRegimenAgrario=${payload.idRegimenAgrario}&idConstruccionCivil=${payload.idConstruccionCivil}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    documentoEmpresa_Get(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CLIENTE.documentoEmpresa_Get}`,
            `?idDocEmpresa=${payload.idDocEmpresa}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    documentoEmpleado_Get(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CLIENTE.documentoEmpleado_Get}`,
            `?idDocEmpleado=${payload.idDocEmpleado}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratistaGrupo_List(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CONTRATISTA.contratistaGrupo_List}`,
            `?idCliente=${payload.idCliente}&idContratista=${payload.idContratista}&pageIndex=${payload.pageIndex}&pageSize=${payload.pageSize}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    drive_List(): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${GOOGLEDRIVE.drive_list}`,
            ``,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empleado_List_Document(payload): Observable<any>{

        return this.requestMethod.get(
            `${environment.apiUrl}${CLIENTE.empleado_list_document}`,
            `?IdCliente=${payload.IdCliente}&NroDocumento=${payload.NroDocumento}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

}
