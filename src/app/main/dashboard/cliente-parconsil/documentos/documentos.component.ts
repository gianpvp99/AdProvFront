import { Component, Injectable, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CoreTranslationService } from '@core/services/translation.service';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import Swal from 'sweetalert2';
import { UtilsService } from "app/shared/services/utils.service";
import { ContratistasService } from '../../contratistas.service';
import { ClienteService } from '../../clientes/clientes.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'app/shared/models/auth/user';
import { LoginComponent } from 'app/auth/login/login.component';
import { EMPTY, Observable } from 'rxjs';

class Params {
  IdCliente: number;
  PuntajeMin: number;
  constructor(IdCliente: number, PuntajeMin: number) {
    this.IdCliente = IdCliente;
    this.PuntajeMin = PuntajeMin;
  }
}

class Grupos {
  idFila: number;
  idClienteGrupo: number;
  nombreGrupo: string;
  flagEliminado: boolean;
}

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.scss']
})
export class DocumentosComponent implements OnInit {
  public currentUser: User;

  params: Params;
  disabled = true;
  flagOption = false;
  MatrizValidator: number;
  idGrupo = 10;
  MatrizSuma: number;

  public currentDate = new Date();
  public filterDate = new Date();
  public fromDate = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: 1
  };
  public toDate = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };
  documentosSettings = { ...this.tableDefaultPageSettings };
  rowsDocumentos = [];
  rowsDocumentosHomEmpleado = [];
  rowsDocumentosEmpresa = [];
  rowsDocumentosEmpleado = [];
  clientegrupoSettings = { ...this.tableDefaultPageSettings };
  rowsGrupo: Grupos[] = [];
  rowsProyecto = [];

  IdSubGrupo = 1;
  rowsMatriz = [];

  public rowsNivel = [];
  public rowsRegimen = [];
  public rowsGroup = [];
  public rowsPeriodo = [];
  public rowsCriticidad = [];
  public rowsTipoDoc = [];

  public DocumentoForm: FormGroup;
  get DControls(): { [p: string]: AbstractControl } {
    return this.DocumentoForm.controls;
  }

  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private contratistasService: ContratistasService,
    private clienteService: ClienteService) {
    this.DocumentoForm = this.formBuilder.group({
      idHomologacion: [0],
      idCliente: [0],
      nombreDocumento: [''],
      sumaPuntaje: [0],
      idMatriz: [1],
      idCriticidad: [1],
      estado: [false],
      idClienteGrupo: [0],
      idClienteProyecto: [0]
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.route.queryParams.subscribe(params => {
      this.params = {
        IdCliente: Number(params.IdCliente),
        PuntajeMin: Number(params.PuntajeMin)
      };
    });
    this.DataMaster();
    this.onGrupoProyectoList();


  }

  onGrupoProyectoList(): void {
    // this.utilsService.blockUIStart('Cargando...')
    this.clienteService.clienteProyectoGrupo_List({
      idCliente: this.params.IdCliente,
      pageIndex: this.clientegrupoSettings.page,
      pageSize: this.clientegrupoSettings.pageSize
    }).subscribe(response => {
      this.rowsGrupo = response.clienteGrupos;
      this.rowsProyecto = response.clienteProyecto;
      if (this.rowsGrupo.length >= 1) {
        this.DControls.idClienteGrupo.setValue(response.clienteGrupos[0].idClienteGrupo);
      }
      if (this.rowsProyecto.length >= 1) {
        this.DControls.idClienteProyecto.setValue(response.clienteProyecto[0].idProyecto);
      }
      this.onEmpresaMatriz_Get();
      this.onEmpleadoMatriz_Get();
      this.clientegrupoSettings.colletionSize = response.clienteGrupos[0] ? response.clienteGrupos[0].totalElements : 0;
      // this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      // this.utilsService.blockUIStop();
    });
  }

  onGrupoSelect(key): void {
    this.DControls.idClienteGrupo.setValue(key);
    this.onEmpresaMatriz_Get();
  }

  onProyectoSelect(key): void {
    this.DControls.idClienteProyecto.setValue(key);
    this.onEmpleadoMatriz_Get();
  }

  onNewDocumento(modal: NgbModal) {
    // this.rowsDocumentos.push({
    //   idHomologacion: row.idHomologacion,
    //   idCliente: row.idCliente,
    //   idMatriz: (flaggrupo) ? idMatriz : row.idMatriz,
    //   matriz,
    //   puntaje,
    //   sumaPuntaje: (flaggrupo) ? puntaje : row.sumaPuntaje,
    //   codDocumento: row.codDocumento,
    //   idDocumentoName: row.idDocumentoName,
    //   documentoName: (flaggrupo) ? matriz : row.codDocumento + ' - ' + row.documentoName,
    //   tipoExtension: row.tipoExtension,
    //   idCriticidad: row.idCriticidad,
    //   criticidad: row.criticidad,
    //   idRegimen: row.idRegimen,
    //   regimen: row.regimen,
    //   flaggrupo,
    //   estado: row.estado,
    //   edicion: false
    // })
    setTimeout(() => {
      this.modalService.open(modal, {
        scrollable: true,
        size: 'sm',
        centered: true,
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  //#region TABLA MAESTRA
  DataMaster(): void {
    this.contratistasService.dropdown({
      idTabla: 21,
    }).subscribe(response => {
      this.rowsMatriz = response;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });

    this.clienteService.dropdown({
      idTabla: 17
    }).subscribe(
      response => {
        this.rowsCriticidad = response;
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });

    this.clienteService.dropdown({
      idTabla: 13
    }).subscribe(
      response => {
        this.rowsPeriodo = response;
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });

    this.clienteService.dropdown({
      idTabla: 16
    }).subscribe(
      response => {
        this.rowsRegimen = response;
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });


    this.clienteService.dropdown({
      idTabla: 18
    }).subscribe(
      response => {
        this.rowsGroup = response;
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
  }
  //#endregion

  //#region VALIDACIONES DE LA MATRIZ EMPRESA

  ValidatorNumber(row) {
    this.MatrizSuma = 0
    for (const item of this.rowsDocumentos) {
      if (item.idMatriz == row.idMatriz && !item.flaggrupo) {
        this.MatrizSuma += item.sumaPuntaje;
      }

      if (item.idMatriz == row.idMatriz && item.flaggrupo) {
        if (this.MatrizSuma != item.sumaPuntaje) {
          item.sumaPuntaje = this.MatrizSuma
          this.flagOption = true;
          this.MatrizValidator = row.idMatriz;
        }
        if (this.MatrizSuma == item.puntaje) {
          this.flagOption = false;
          //this.MatrizValidator = row.idMatriz;
        }

      }
    }

    this.SumaMatrices();
  }

  TotalNumber(row) {
    let number = 0
    for (const item of this.rowsDocumentos) {
      if (item.idMatriz == row.idMatriz && !item.flaggrupo) {
        number += item.sumaPuntaje;
      }

      if (item.idMatriz == row.idMatriz && item.flaggrupo) {
        if (number != item.puntaje) {
          this.flagOption = true;
          this.MatrizValidator = row.idMatriz;
        }
        if (number == item.puntaje) {
          this.flagOption = false;
          this.MatrizValidator = row.idMatriz;
        }

      }
    }

    this.SumaSubMatrices();
  }

  CheckEnable(row) {
    for (const item of this.rowsDocumentos) {
      if (item.idMatriz == row.idMatriz && item.idHomologacion == row.idHomologacion &&
        item.codDocumento == row.codDocumento && !item.flaggrupo) {
        item.sumaPuntaje = 0;
      }
    }

    this.ValidatorNumber(row);
  }

  allEstadoEmpresa = false;
  CheckEnableAll() {
    if (!this.allEstadoEmpresa) {
      Swal.fire({
        title: 'Confirmación',
        text: '¿Desea MARCAR (✔) todos los documentos?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        customClass: {
          confirmButton: 'btn btn-warning',
          cancelButton: 'btn btn-primary'
        }
      }).then(result => {
        if (result.value) {
          this.allEstadoEmpresa = true;
          for (const item of this.rowsDocumentos) {
            item.estado = true;
          }
        }
        else {
          this.allEstadoEmpresa = false;
        }
      });
    }

    if (this.allEstadoEmpresa) {
      Swal.fire({
        title: 'Confirmación',
        text: '¿Desea DESMARCAR (✘) todos los documentos?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        customClass: {
          confirmButton: 'btn btn-warning',
          cancelButton: 'btn btn-primary'
        }
      }).then(result => {
        if (result.value) {
          this.allEstadoEmpresa = false;
          for (const item of this.rowsDocumentos) {
            item.estado = false;
            item.sumaPuntaje = 0;
          }
        }
        else {
          this.allEstadoEmpresa = true;
        }
      });
    }
    this.SumaMatrices();
  }

  total = 0;
  SumaMatrices() {
    this.total = 0
    for (const item of this.rowsDocumentos) {
      if (!item.flaggrupo) {
        this.total += item.sumaPuntaje;
      }
    }
  }

  resultadoGeneral = 0;
  SumaSubMatrices() {
    this.resultadoGeneral = 0
    for (const item of this.rowsDocumentos) {
      if (item.flaggrupo) {
        this.resultadoGeneral += item.puntaje;
      }
    }
  }

  //#endregion

  //#region VALIDACIONES DE LA MATRIZ EMPLEADO    

  allEstadoEmpleado = false;
  CheckEnableAllEmpleado() {
    if (!this.allEstadoEmpleado) {
      Swal.fire({
        title: 'Confirmación',
        text: '¿Desea MARCAR (✔) todos los documentos?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        customClass: {
          confirmButton: 'btn btn-warning',
          cancelButton: 'btn btn-primary'
        }
      }).then(result => {
        if (result.value) {
          this.allEstadoEmpleado = true;
          for (const item of this.rowsDocumentosHomEmpleado) {
            item.estado = true;
          }
        }
        else {
          this.allEstadoEmpleado = false;
        }
      });
    }

    if (this.allEstadoEmpleado) {
      Swal.fire({
        title: 'Confirmación',
        text: '¿Desea DESMARCAR (✘) todos los documentos?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        customClass: {
          confirmButton: 'btn btn-warning',
          cancelButton: 'btn btn-primary'
        }
      }).then(result => {
        if (result.value) {
          this.allEstadoEmpleado = false;
          for (const item of this.rowsDocumentosHomEmpleado) {
            item.estado = false;
            item.sumaPuntaje = 0;
          }
        }
        else {
          this.allEstadoEmpleado = true;
        }
      });
    }
  }

  //#endregion

  onEmpresaMatriz_Get() {
    this.rowsDocumentos = [];
    this.utilsService.blockUIStart("Cargando Documentos...");
    this.clienteService.empresaMatriz_Get({
      idCliente: this.params.IdCliente,
      idClienteGrupo: this.DControls.idClienteGrupo.value
    }).subscribe((response) => {
      let grupoActual = response[0].matriz;
      let idActual = response[0].idMatriz;
      let puntajeFinal = response[0].puntaje;
      let count = 0;
      for (const row of response) {
        count++;
        if (row.matriz != grupoActual || row.idMatriz != idActual) {
          this.onSetDocumentoHom(row, true, idActual, grupoActual, puntajeFinal);
          grupoActual = row.matriz;
          idActual = row.idMatriz;
          puntajeFinal = row.puntaje;
        }
        this.onSetDocumentoHom(row, false, row.idMatriz, row.matriz, row.puntaje);
        if (count == response.length) {
          this.onSetDocumentoHom(row, true, row.idMatriz, row.matriz, row.puntaje);
        }
      }

      this.SumaMatrices();
      this.SumaSubMatrices();
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('Algo no esta cargando...', 'Alert', 2);
      this.utilsService.blockUIStop();
    });
  }

  onEmpleadoMatriz_Get() {
    this.rowsDocumentosHomEmpleado = [];
    this.clienteService.empleadoMatriz_Get({
      idCliente: this.params.IdCliente,
      idClienteProyecto: this.DControls.idClienteProyecto.value
    }).subscribe((response) => {
      let grupoActual = response[0].matriz;
      let idActual = response[0].idMatriz;
      let count = 0;
      for (const row of response) {
        count++;
        if (row.matriz != grupoActual && row.idMatriz != idActual) {
          this.onSetDocHomEmpleado(row, true, idActual, row.matriz);
          grupoActual = row.matriz;
          idActual = row.idMatriz;
        }
        if (count == 1) {
          this.onSetDocHomEmpleado(row, true, idActual, row.matriz);
          grupoActual = row.matriz;
          idActual = row.idMatriz;
        }
        this.onSetDocHomEmpleado(row, false, row.idMatriz, row.matriz);

      }

    }, error => {
      this.utilsService.showNotification('Cargando documentos Homologación', 'Alert', 2);
    });

    this.rowsDocumentosEmpresa = [];
    this.clienteService.documentoEmpresa_Get({
      idDocEmpresa: 0
    }).subscribe((response) => {
      for (const item of response) {
        this.rowsDocumentosEmpresa.push({
          "idDocEmpresa": item.idDocEmpresa,
          "idCliente": 0,
          "idPeriodicidad": item.idPeriodicidad,
          "idCriticidad": item.idCriticidad,
          "idDocumentoName": item.idDocumentoName,
          "documentoName": item.documentoName,
          "estado": true //item.estado
        });
      }
    }, error => {
      this.utilsService.showNotification('Cargando documentos Empresa', 'Alert', 2);
    });

    this.rowsDocumentosEmpleado = [];
    this.clienteService.documentoEmpleado_Get({
      idDocEmpleado: 0
    }).subscribe((response) => {
      for (const item of response) {
        this.rowsDocumentosEmpleado.push({
          "idDocEmpleado": item.idDocEmpleado,
          "idCliente": 0,
          "idPeriodicidad": item.idPeriodicidad,
          "idCriticidad": item.idCriticidad,
          "idDocumentoName": item.idDocumentoName,
          "documentoName": item.documentoName,
          "estado": true //item.estado
        });
      }
    }, error => {
      this.utilsService.showNotification('Cargando documentos Empleado', 'Alert', 2);
    });
  }

  onSetDocumentoHom(row: any, flaggrupo: boolean, idMatriz: number, matriz: string, puntaje: number) {
    this.rowsDocumentos.push({
      idHomologacion: row.idHomologacion,
      idCliente: row.idCliente,
      idMatriz: (flaggrupo) ? idMatriz : row.idMatriz,
      matriz,
      puntaje,
      sumaPuntaje: (flaggrupo) ? puntaje : row.sumaPuntaje,
      codDocumento: row.codDocumento,
      idDocumentoName: row.idDocumentoName,
      documentoName: (flaggrupo) ? matriz : row.codDocumento + ' - ' + row.documentoName,
      tipoExtension: row.tipoExtension,
      idCriticidad: row.idCriticidad,
      criticidad: row.criticidad,
      idRegimen: row.idRegimen,
      regimen: row.regimen,
      flaggrupo,
      estado: row.estado,
      edicion: false
    });
  }

  onSetDocHomEmpleado(row: any, flaggrupo: boolean, idMatriz: number, matriz: string) {

    this.rowsDocumentosHomEmpleado.push({
      idHomEmpleado: row.idHomEmpleado,
      idCliente: row.idCliente,
      idMatriz: (flaggrupo) ? idMatriz : row.idMatriz,
      matriz,
      codDocumento: row.codDocumento,
      idDocumentoName: row.idDocumentoName,
      documentoName: (flaggrupo) ? matriz : row.codDocumento + ' - ' + row.documentoName,
      tipoExtension: row.tipoExtension,
      idPeriodicidad: row.idPeriodicidad,
      periodicidad: row.periodicidad,
      idCriticidad: row.idCriticidad,
      criticidad: row.criticidad,
      idRegimenGeneral: row.idRegimenGeneral,
      idRegimenMype: row.idRegimenMype,
      idRegimenAgrario: row.idRegimenAgrario,
      idConstruccionCivil: row.idConstruccionCivil,
      complete: (row.idRegimenGeneral == 1 || row.idRegimenMype == 1 || row.idRegimenAgrario == 1 || row.idConstruccionCivil == 1) ?
        [(row.idRegimenGeneral == 1) ? { idTabla: 16, idColumna: 1, valor: '', descripcion: 'Regimen General' } : '',
        (row.idRegimenMype == 1) ? { idTabla: 16, idColumna: 2, valor: '', descripcion: 'Regimen Mype' } : '',
        (row.idRegimenAgrario == 1) ? { idTabla: 16, idColumna: 3, valor: '', descripcion: 'Regimen Agrario' } : '',
        (row.idConstruccionCivil == 1) ? { idTabla: 16, idColumna: 4, valor: '', descripcion: 'Construccion Civil' } : ''].filter((item) => item != '') : [],
      regimen: row.regimen,
      flaggrupo,
      estado: row.estado,
      edicion: false
    });
  }

  onEmpresaSaveDocument(): void {
    let DocumentosGeneral = [];
    let HomEmpresaCabecera = [];

    for (const item of this.rowsDocumentos) {
      //&& item.estado
      if (!item.flaggrupo) {
        DocumentosGeneral.push({
          "idHomologacion": item.idHomologacion,
          "idCliente": item.idCliente,
          "sumaPuntaje": item.sumaPuntaje,
          "idMatriz": item.idMatriz,
          "idDocumentoName": item.idDocumentoName,
          "idCriticidad": item.idCriticidad,
          "idRegimen": item.idRegimen,
          "estado": item.estado
        });
      }
    }

    for (const item of this.rowsDocumentos) {
      if (item.flaggrupo) {
        HomEmpresaCabecera.push({
          "idHomEmpresaCabecera": 0,
          "idCliente": item.idCliente,
          "puntaje": item.puntaje,
          "idMatriz": item.idMatriz,
          "idDocumentoName": item.idDocumentoName
        });
      }
    }

    if (this.total != this.resultadoGeneral) {
      Swal.fire({
        icon: 'error', title: 'Puntajes Erróneos', text: 'La suma de los puntajes no esta acorde al definido', showConfirmButton: false, timer: 2000
      });
      return;
    }

    if (DocumentosGeneral.length == 0 || this.resultadoGeneral == 0) {
      Swal.fire({
        icon: 'info', title: 'Sin Cambios', text: 'No se detecto ninguna modificación', showConfirmButton: false, timer: 2200
      });
      return;
    }

    if (this.total != 1000 && this.resultadoGeneral != 1000) {
      Swal.fire({
        icon: 'warning', title: 'Puntaje Máximo', text: 'La suma del puntaje debe ser 1000', showConfirmButton: false, timer: 2000
      });
      return;
    }

    this.clienteService.contratistaDocumentos_Insert({
      idCliente: this.params.IdCliente,
      idClienteGrupo: this.DControls.idClienteGrupo.value,
      tDocumentoHomologacionE: DocumentosGeneral,
      tDocumentoHomEmpresaCabecera: HomEmpresaCabecera
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Información guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onEmpresaMatriz_Get();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  onEmpleadoSaveDocument(): void {
    let DocumentosHomEmpleado = [];
    let DocumentosEmpresa = [];
    let DocumentosEmpleado = [];

    for (const item of this.rowsDocumentosHomEmpleado) {
      if (!item.flaggrupo) {
        DocumentosHomEmpleado.push({
          "idHomEmpleado": item.idHomEmpleado,
          "idCliente": item.idCliente,
          "idDocumentoName": item.idDocumentoName,
          "idPeriodicidad": item.idPeriodicidad,
          "idCriticidad": item.idCriticidad,
          "idRegimenGeneral": item.idRegimenGeneral,
          "idRegimenMype": item.idRegimenMype,
          "idRegimenAgrario": item.idRegimenAgrario,
          "idConstruccionCivil": item.idConstruccionCivil,
          "estado": item.estado
        });
      }
    }

    for (const item of this.rowsDocumentosEmpresa) {
      DocumentosEmpresa.push({
        "idDocEmpresa": item.idDocEmpresa,
        "idCliente": item.idCliente,
        "idDocumentoName": item.idDocumentoName,
        "estado": item.estado
      });
    }

    for (const item of this.rowsDocumentosEmpleado) {
      DocumentosEmpleado.push({
        "idDocEmpleado": item.idDocEmpleado,
        "idCliente": item.idCliente,
        "idDocumentoName": item.idDocumentoName,
        "estado": item.estado
      });
    }

    this.clienteService.empleadosDocumentos_Insert({
      idCliente: this.params.IdCliente,
      idClienteProyecto: this.DControls.idClienteProyecto.value,
      tDocumentoHomEmpresa: DocumentosHomEmpleado,
      tDocumentoEmpresa: DocumentosEmpresa,
      tDocumentoEmpleado: DocumentosEmpleado
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Información guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onEmpleadoMatriz_Get();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  async onSaveDocument(): Promise<any> {
    let value = 0;
    for (const item of this.rowsDocumentos) {
      if (item.idMatriz == 10) {
        value = 1
      }
      else {
        value = 0
      }
    }

    this.utilsService.blockUIStart("Agregando Documento a la matriz...");
    this.clienteService.empresaDocumento_InsertUpdate({
      idHomologacion: 0,
      idHomEmpresaCabecera: value,
      idCliente: this.params.IdCliente,
      idClienteGrupo: this.DControls.idClienteGrupo.value,
      idCriticidad: 1,
      idDocumento: 0,
      idMatriz: 10,
      nombreDocumento: this.DControls.nombreDocumento.value,
      tipoExtension: "PDF",
      homEmpresa: true,
      homTrabajador: false,
      empresa: false,
      trabajador: false,
      idUsuarioAud: this.currentUser.idUsuario
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.blockUIStop();
        this.utilsService.showNotification('Información guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onEmpresaMatriz_Get();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
        // this.sustentos = [...this.sustentosOld];
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  public selectMulti: Observable<any[]>;
  public selectMultiSelected = [];
  MultiSelect($event, row) {
    //console.log(this.rowsRegimen);
    // console.log($event);

    console.log(row.complete);
    if (row.complete.find(x => x.descripcion == 'Regimen General')) {
      row.idRegimenGeneral = true;
    } else {
      row.idRegimenGeneral = false;
    }

    if (row.complete.find(x => x.descripcion == 'Regimen Mype')) {
      row.idRegimenMype = true;
    } else {
      row.idRegimenMype = false;
    }

    if (row.complete.find(x => x.descripcion == 'Regimen Agrario')) {
      row.idRegimenAgrario = true;
    } else {
      row.idRegimenAgrario = false;
    }

    if (row.complete.find(x => x.descripcion == 'Construccion Civil')) {
      row.idConstruccionCivil = true;
    } else {
      row.idConstruccionCivil = false;
    }

    console.log(row.idRegimenGeneral);
    console.log(row.idRegimenMype);
    console.log(row.idRegimenAgrario);
    console.log(row.idConstruccionCivil);


    // console.log(this.selectMulti);
    // console.log(this.selectMultiSelected);
  }
}
