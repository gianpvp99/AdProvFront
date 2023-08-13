import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {RequestMethod} from "../helpers/request-method";
import {TABLAMAESTRA} from "../../../helpers/url";
import {CONTENT_TYPE} from "../helpers/headers";
import {environment} from "environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TablaMaestraService {
  private requestMethod = new RequestMethod();
  constructor() { }

  async listar(payload): Promise<any> {
    return this.requestMethod.get(
      `${environment.apiUrl}${TABLAMAESTRA.dropdown}`,
      `?&idTabla=${payload.idTabla}`,
      {
        'Content-Type': CONTENT_TYPE.json
      }
    );
  }
}
