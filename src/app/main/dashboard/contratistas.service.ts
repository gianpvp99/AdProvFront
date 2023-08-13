import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestMethod } from '../../../helpers/request-method';
import { environment } from '../../../environments/environment';
import { CLIENTE, CONTRATISTA, DOCUMENTO, EMPLEADO, GOOGLEDRIVE, TABLAMAESTRA } from '../../../helpers/url';
import { CONTENT_TYPE } from '../../../helpers/headers';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ContratistasService {
    private requestMethod = new RequestMethod();

    constructor(
        private http: HttpClient
    ) { }

    dropdown(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${TABLAMAESTRA.dropdown}`,
            `?idTabla=${payload.idTabla}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    puntajeFinal_List(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${TABLAMAESTRA.puntajeFinal_List}`,
            `?idCliente=${payload.idCliente}&idClienteGrupo=${payload.idClienteGrupo}&idContratista=${payload.idContratista}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }


    documento_List(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${DOCUMENTO.documento_List}`,
            `?idEstado=${payload.idEstado}&search=${payload.search}&pageIndex=${payload.pageIndex}&pageSize=${payload.pageSize}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }


    documento_InsertUpdate(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${DOCUMENTO.documento_InsertUpdate}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    homologacionEmpresa_Delete(payload): Observable<any> {
        return this.requestMethod.delete(
            `${environment.apiUrl}${DOCUMENTO.homologacionEmpresa_Delete}`,
            `?idCtrHomologacion=${payload.idCtrHomologacion}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empresadocpresentados_List(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CONTRATISTA.empresadocpresentados_List}`,
            `?idCliente=${payload.idCliente}&idContratista=${payload.idContratista}&idEstado=${payload.idEstado}&search=${payload.search}&pageIndex=${payload.pageIndex}&pageSize=${payload.pageSize}&nombreContratista=${payload.nombreContratista}&fecha=${payload.fecha}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratistaCliente_List(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CONTRATISTA.contratistaCliente_List}`,
            `?idCliente=${payload.idCliente}&idContratista=${payload.idContratista}&idEstado=${payload.idEstado}&search=${payload.search}&pageIndex=${payload.pageIndex}&pageSize=${payload.pageSize}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratista_list(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CONTRATISTA.contratista_list}`,
            `?idContratista=${payload.idContratista}&idEstado=${payload.idEstado}&search=${payload.search}&pageIndex=${payload.pageIndex}&pageSize=${payload.pageSize}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratista_insertupdate(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${CONTRATISTA.contratista_insertupdate}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratista_delete(payload): Observable<any> {
        return this.requestMethod.delete(
            `${environment.apiUrl}${CONTRATISTA.contratista_delete}`,
            `?idContratista=${payload.idContratista}&idUsuarioAud=${payload.idUsuarioAud}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratistaSustento_InsertUpdate(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${CONTRATISTA.contratistaSustento_InsertUpdate}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratistaProyecto_InsertUpdate(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${CONTRATISTA.contratistaProyecto_InsertUpdate}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empleadoSustento_InsertUpdate(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${EMPLEADO.empleadoSustento_InsertUpdate}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    async contratistaclienteHom_delete(payload): Promise<any> {
        return await this.requestMethod.deleteAsync(
            `${environment.apiUrl}${CLIENTE.contratistaclienteHom_delete}`,
            `?idCtrHomologacion=${payload.idCtrHomologacion}&idCliente=${payload.idCliente}&idEstado=${payload.idEstado}&observacion=${payload.observacion}&idUsuarioAud=${payload.idUsuarioAud}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }


    async empleadoClienteHom_Delete(payload): Promise<any> {
        return await this.requestMethod.deleteAsync(
            `${environment.apiUrl}${EMPLEADO.empleadoClienteHom_Delete}`,
            `?idCtrHomEmpleado=${payload.idCtrHomEmpleado}&idCliente=${payload.idCliente}&idEstado=${payload.idEstado}&observacion=${payload.observacion}&idUsuarioAud=${payload.idUsuarioAud}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empleadoClienteHom_Update(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${EMPLEADO.empleadoClienteHom_Update}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratistaLogin_insert(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${CONTRATISTA.contratistaLogin_insert}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empleado_list(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${EMPLEADO.empleado_list}`,
            `?idCliente=${payload.idCliente}&idProyecto=${payload.idProyecto}&idContratista=${payload.idContratista}&idEstado=${payload.idEstado}&search=${payload.search}&pageIndex=${payload.pageIndex}&pageSize=${payload.pageSize}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empleado_DocPresentados_List(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${EMPLEADO.empleado_DocPresentados_List}`,
            `?idCliente=${payload.idCliente}&idContratista=${payload.idContratista}&idEmpleado=${payload.idEmpleado}&idEstado=${payload.idEstado}&search=${payload.search}&pageIndex=${payload.pageIndex}&pageSize=${payload.pageSize}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empleado_insertupdate(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${EMPLEADO.empleado_insertupdate}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    empleado_delete(payload): Observable<any> {
        return this.requestMethod.delete(
            `${environment.apiUrl}${EMPLEADO.empleado_delete}`,
            `?idEmpleado=${payload.idEmpleado}&idUsuarioAud=${payload.idUsuarioAud}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratistaCliente_UpdateEstado(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${CONTRATISTA.contratistaCliente_UpdateEstado}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratistaEmpleado_UpdateEstado(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${CONTRATISTA.contratistaEmpleado_UpdateEstado}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    delete_files(payload): Observable<any> {
        return this.requestMethod.delete(
            `${environment.apiUrl}${GOOGLEDRIVE.delete_files}`,
            `?driveId=${payload.driveId}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    deleteEmp_files(payload): Observable<any> {
        return this.requestMethod.delete(
            `${environment.apiUrl}${GOOGLEDRIVE.deleteEmp_files}`,
            `?driveId=${payload.driveId}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    cliente_delete(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CLIENTE.cliente_delete}`,
            `?idCliente=${payload.idCliente}`,
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

    documento_Delete(payload): Observable<any> {
        return this.requestMethod.delete(
            `${environment.apiUrl}${DOCUMENTO.documento_Delete}`,
            `?idDocumento=${payload.idDocumento}&idUsuarioAud=${payload.idUsuarioAud}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    contratistaProyecto_List(payload): Observable<any> {
        return this.requestMethod.get(
            `${environment.apiUrl}${CONTRATISTA.contratistaProyecto_List}`,
            `?idContratista=${payload.idContratista}&idProyecto=${payload.idProyecto}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    create_Folder(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${GOOGLEDRIVE.create_Folder}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    createEmp_Folder(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${GOOGLEDRIVE.createEmp_Folder}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    generateEmpCadenaQR(payload): Observable<any> {
        return this.requestMethod.post(
            `${environment.apiUrl}${EMPLEADO.empleadoCadenaQr}`,
            payload,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    convertCadenaQR(textQr:String): Observable<any>{
        return this.requestMethod.get(
            `${environment.apiUrl}${EMPLEADO.empleadoConvertCadenaQr}`,
            `?textQr=${textQr}`,
            {
                'Content-Type': CONTENT_TYPE.json
            }
        );
    }

    // convertCadenaQR2(textQr: String): Observable<any>{
    //     return this.http.get(`${environment.apiUrl}${EMPLEADO.empleadoConvertCadenaQr}?textQr=${textQr}`);
    // }
}
