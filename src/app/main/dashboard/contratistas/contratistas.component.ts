import { Component, Injectable, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CoreTranslationService } from '@core/services/translation.service';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { UtilsService } from "app/shared/services/utils.service";
import { environment } from 'environments/environment';
import { FileUploader } from 'ng2-file-upload';
import Stepper from 'bs-stepper';
import { ContratistasService } from '../contratistas.service';
import { ClienteService } from '../clientes/clientes.service';
import { User } from 'app/shared/models/auth/user';


class Archivo {
  idFila: number;
  nombre: string;
  tamanio: string;
  tipoExtension: string;
}

class ContratistaSustento {
  idCtrHomologacion: number;
  idHomologacion: number;
  idcliente: number;
  archivo: string;
  tamanioArchivo: number;
  tipoExtension: string;
  rutaArchivo: string;
  idEstado: number;
  editado: boolean = false;
}

const I18N_VALUES = {
  'es': {
    weekdays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
    //years: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
    weekLabel: 'sem'
  }
};

@Injectable()
export class I18n {
  language = 'es';
}
@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {
  constructor(private _i18n: I18n) { super(); }

  getWeekdayShortName(weekday: number): string { return I18N_VALUES[this._i18n.language].weekdays[weekday - 1]; };
  getWeekdayLabel(weekday: number): string { return I18N_VALUES[this._i18n.language].weekdays[weekday - 1]; }
  getWeekLabel(): string { return I18N_VALUES[this._i18n.language].weekLabel; }
  getMonthShortName(month: number): string { return I18N_VALUES[this._i18n.language].months[month - 1]; }
  getMonthFullName(month: number): string { return this.getMonthShortName(month); }
  getDayAriaLabel(date: NgbDateStruct): string { return `${date.day}-${date.month}-${date.year}`; }
  //getYearNumerals(year: number): string { return I18N_VALUES[this._i18n.language].years[year - 1]}
}

@Component({
  selector: 'app-contratistas',
  templateUrl: './contratistas.component.html',
  styleUrls: ['./contratistas.component.scss'],
  providers:
    [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }]
  //changeDetection: ChangeDetectionStrategy.OnPush <-- esta linea hace que el ngOninit no sirva al menos de dar en un evento
})
export class ContratistasComponent implements OnInit {
  public currentUser: User;
  public contentHeader: object;
  private modernWizardStepper: Stepper;

  forPageOptions = [10, 25, 50, 100];

  public archivosHomologacion: FileUploader = new FileUploader({
    isHTML5: true
  });

  public archivosAudEmpresa: FileUploader = new FileUploader({
    isHTML5: true
  });

  public archivosAudEmpleado: FileUploader = new FileUploader({
    isHTML5: true
  });

  public uploader: FileUploader = new FileUploader({
    isHTML5: true
  });

  public uploaderows = [];
  public archivosHom: Archivo[] = [];
  public archivosHomTra: Archivo[] = [];
  public archivosAudEmpr: Archivo[] = [];
  public archivosAudEmpl: Archivo[] = [];
  procesar: boolean = true;

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };
  contratistaSettings = { ...this.tableDefaultPageSettings };
  rowsContratista = [];
  empleadoSettings = { ...this.tableDefaultPageSettings };
  rowsEmpleado = [];
  contratistadropdownSettings = { ...this.tableDefaultPageSettings };
  rowsContratistaDropdown = [];
  clienteSettings = { ...this.tableDefaultPageSettings };
  rowsCliente = [];
  empresadocumentosSettings = { ...this.tableDefaultPageSettings };
  rowsEmpresaDocumentos = [];
  rowsDocumentos = [];
  rowsDocumentosHomTrabajador = []
  rowsDocumentosEmpresa = [];
  rowsDocumentosEmpleado = [];

  public cliente: string;

  flagcontra = false;
  public anio = [];
  public meses = [];
  public flagVista = false;
  Empleadosrows = [];
  aniodate: string;
  mes: string;
  mesvalue: number;
  resultdate: string;
  sesionPerfil: number;
  contratista: string;
  ruc: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  correo: string;
  idUbigeo: string
  displayable: any;
  idEstado = 1;
  idEstadoEmpleado = 1;

  contacto = '';
  idTipoDoc = 1;

  public notification: boolean;
  public hasBaseDropZoneOver: boolean = false;

  nombres: string;
  empleado: string;
  email: string;
  dni: string;
  idContratista: number;
  idTipo: number;

  public rowsNivel = [];
  public rowsrubro = [];
  public rowsPeriodo = [];
  idNivel: number;
  idPeriodo: number;
  Value: number;
  IDSubmitted = false;
  idRubro: number;

  selectedRowIds: number[] = [];
  selectedDiscRowIds: number[] = [];
  PopUpCS: any;
  activated = false;
  modalObs: any

  public currentDate = new Date();
  fechaEmision = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };

  fechaCertificado = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };

  public sustentos: ContratistaSustento[] = [];
  public sustentosOld: ContratistaSustento[] = [];

  public ColumnMode = ColumnMode;
  public ConForm: FormGroup;
  public EmpForm: FormGroup;
  public General: FormGroup;

  get EControls(): { [p: string]: AbstractControl } {
    return this.EmpForm.controls;
  }

  get Controls(): { [p: string]: AbstractControl } {
    return this.General.controls;
  }

  rowsTipoDoc = []


  constructor(
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
    private clienteService: ClienteService,
    private contratistasService: ContratistasService) {
    this.contentHeader = {
      headerTitle: 'Contratistas',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [          
          {
            name: 'Clientes',
            isLink: false,
            link: '/'
          },
          {
            name: 'Documentos',
            isLink: false
          }
        ]
      }
    };

    this.General = this.formBuilder.group({
      sesionPerfil: [0],
      idCliente: [0],
      idTipoExtension: [''],
      porcentaje: [0],
      ruc: [''],
      razonSocial: [''],
      direccion: [''],
      provincia: [''],
      distrito: [''],
      paginaWeb: [''],
      fechaConstitucion: [''],
      nucleoNegocio: [''],
      telefono: [''],
      certificado: [false],
      certificado2: [true],
      namecertificado: ['No'],
      fechaCertificado: [],
      observacion: [''],
      idRubro: [1]
    });

    this.EmpForm = this.formBuilder.group({
      idEmpleado: [0],
      idContratista: [0],
      idCliente: [0],
      contratista: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      nombres: ['', Validators.required],
      nroDocumento: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.Controls.sesionPerfil.setValue(this.currentUser.idPerfil);
    
    this.onClickBtn(1);
    this.Value = 1;
    this.idNivel = 1;
    this.idTipo = 1;
    this.idPeriodo = 1;
    this.idRubro = 1;
    this.Controls.sesionPerfil.value == 3 ? this.displayable = true : this.displayable = false;
    this.flagVista = false;
    this.onSetPage();
    this.onSetCliente();
    this.onNivel();    
    this.DocumentosGet();
    this.TablaMaestra();
    this.ngChargeDate()
  }

  public filterDate = new Date();
  public fromDate = {
    year: this.filterDate.getFullYear(),
    month: this.filterDate.getMonth() + 1,
    day: 25
  };

  public toDate = {
    year: this.filterDate.getFullYear(),
    month: this.filterDate.getMonth() + 2,
    day: 1
  };

  ngChargeDate() {
    // let fechadesdenum = 0;
    // let fechahastanum = 0;

    // fechadesdenum = parseInt(this.fromDate.year.toString() + this.fromDate.month.toString().padStart(2, '0') + this.fromDate.day.toString().padStart(2, '0'));
    // fechahastanum = parseInt(this.toDate.year.toString() + this.toDate.month.toString().padStart(2, '0') + this.toDate.day.toString().padStart(2, '0'));

    // console.log(fechadesdenum);

    // console.log(fechahastanum);

    let x = 7;
    let horas = 168;
    let minutos = 10080;
    let segundos = 604800;
    horas = x * 24;//DIAS A HORAS 168
    minutos = horas * 60;//HORAS A minutos 10080
    segundos = minutos * 60;

    // console.log(countdown(date))  ;      

    // let date = new Date("2022-12-02");
    // this.timerId = countdown(date, (ts) => {
    //   console.log(ts);

    // }, countdown.HOURS | countdown.MINUTES | countdown.SECONDS)
  }

  // ngOnDestroy(){
  //   if (this.timerId) {
  //     clearInterval(this.timerId);
  //   }
  // }

  fileUploaded(row) {
    row.upload = true;
    this.activated = true;
  }

  CertificadoCheck() {
    if (this.Controls.certificado.value == 1) {
      this.Controls.certificado.setValue(false);
      this.Controls.certificado2.setValue(true);
    } else {
      this.Controls.certificado2.setValue(false);
      this.Controls.certificado.setValue(true);
    }
  }
  
  TablaMaestra() {    
    this.clienteService.dropdown({
      idTabla: 5
    }).subscribe((response) => {
      this.rowsTipoDoc = response;
    }, error => {
      this.utilsService.showNotification('Cargando documentos Empresa', 'Alert', 2);
    });

    this.clienteService.dropdown({
      idTabla: 22
    }).subscribe(
      response => {
        this.rowsrubro = response;
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
  }

  DocumentosGet() {
    this.rowsDocumentosEmpresa = [];
    this.clienteService.documentoEmpresa_Get({
      idDocEmpresa: 0
    }).subscribe((response) => {
      for (const item of response) {
        this.rowsDocumentosEmpresa.push({
          "idDocEmpresa": item.idDocEmpresa,
          "idCliente": 0,
          "idDocumentoName": item.idDocumentoName,
          "documentoName": item.documentoName,
          "estado": true //item.estado
        });
      }
    }, error => {
      this.utilsService.showNotification('Cargando documentos Empresa', 'Alert', 2);
    });

    // this.rowsDocumentosEmpleado = [];
    // this.clienteService.documentoEmpleado_Get({
    //   idDocEmpleado: 0
    // }).subscribe((response) => {
    //   for (const item of response) {
    //     this.rowsDocumentosEmpleado.push({
    //       "idDocEmpleado": item.idDocEmpleado,
    //       "idCliente": 0,
    //       "idDocumentoName": item.idDocumentoName,
    //       "documentoName": item.documentoName,
    //       "estado": true //item.estado
    //     });
    //   }
    // }, error => {
    //   this.utilsService.showNotification('Cargando documentos Empleado', 'Alert', 2);
    // });
  }

  //#region    🢃 TABLAS MAESTRA 🢃  
  onNivel(): void {   
    this.clienteService.dropdown({
      idTabla: 12
    }).subscribe(
      response => {
        this.rowsNivel = response;
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });   
  }

  //#endregion 🢁 TABLA MAESTRA 🢁


  fileOverBase(row, tipo): void {
    // this.hasBaseDropZoneOver = e;
    if (tipo == 1) {
      for (const item of this.rowsDocumentos) {
        if (item.idHomologacion == row.idHomologacion) {
          item.fileName = this.uploader.queue[0].file?.name
          item.fileTamanio = this.uploader.queue[0].file?.size / 1024 / 1024;
          item.base64 = this.onArchivoABase64(this.uploader.queue[0]._file);
        }
      }
    }
    else {
      for (const item of this.rowsDocumentosHomTrabajador) {
        if (item.idHomologacion == row.idHomologacion) {
          item.fileName = this.uploader.queue[0].file?.name
          item.fileTamanio = this.uploader.queue[0].file?.size / 1024 / 1024;
          item.base64 = this.onArchivoABase64(this.uploader.queue[0]._file);
        }
      }
    }

    this.uploader.queue = [];
  }

  onReloadChanged() {
    this.onSetPage();
  }

  onSetPage() {
    this.contratistasService.contratistaCliente_List({
      idCliente: 0,
      idContratista: this.currentUser.idContratista,
      idEstado: 0,
      search: this.contratistaSettings.searchString,
      pageIndex: this.contratistaSettings.page,
      pageSize: this.contratistaSettings.pageSize
    }).subscribe(response => {
      this.rowsContratista = response.contratistaCliente;
      this.contratistaSettings.colletionSize = response.contratistaCliente ? response.contratistaCliente[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onSetCliente() {
    this.utilsService.blockUIStart('Cargando listado de Clientes...');
    this.clienteService.cliente_list({
      idCliente: this.currentUser.idCliente,
      idEstado: this.idEstado,
      search: this.clienteSettings.searchString,
      pageIndex: this.clienteSettings.page,
      pageSize: this.clienteSettings.pageSize
    }).subscribe(response => {
      this.rowsCliente = response;
      this.clienteSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      // this.sustentos = response[0].solicitudCabSustento;

      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onSetEmpleados(row) {
    this.flagVista = true;
    this.utilsService.blockUIStart('Cargando listado de Empleados...');
    this.contratistasService.empleado_list({
      idContratista: row.idContratista,
      idEstado: this.idEstadoEmpleado,
      search: this.empleadoSettings.searchString,
      pageIndex: this.empleadoSettings.page,
      pageSize: this.empleadoSettings.pageSize
    }).subscribe(response => {
      this.rowsEmpleado = response;
      this.empleadoSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onReturn() {
    this.flagVista = false;
  }

  CancelValidate() {
    this.flagcontra = false;
  }

  ActivarValidate() {
    this.flagcontra = true;
  }

  NewEmpleado(NEM: NgbModal, notification: boolean) {
    this.idContratista = 0;
    this.cliente = '';
    this.contratista = '';
    this.ruc = '';
    this.direccion = '';
    this.idUbigeo = '';
    this.telefono = '';
    this.correo = '';
    setTimeout(() => {
      this.modalService.open(NEM, {
        scrollable: true,
        size: 'lg',
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  NewContratista(NCT: NgbModal, notification: boolean) {
    this.idContratista = 0;
    this.cliente = '';
    this.contratista = '';
    this.ruc = '';
    this.direccion = '';
    this.idUbigeo = '';
    this.telefono = '';
    this.correo = '';
    setTimeout(() => {
      this.modalService.open(NCT, {
        scrollable: true,
        size: 'lg',
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  EditContratista(NCT: NgbModal, row) {
    this.Controls.porcentaje.setValue(row.porcentaje);
    this.Controls.idCliente.setValue(row.idCliente);
    this.Controls.razonSocial.setValue(row.razonSocial);
    this.Controls.idRubro.setValue(row.idRubro);
    this.Controls.ruc.setValue(row.ruc);
    this.Controls.provincia.setValue(row.provincia);
    this.Controls.distrito.setValue(row.distrito);
    this.Controls.direccion.setValue(row.direccion);
    this.Controls.paginaWeb.setValue(row.paginaWeb);    
    this.Controls.telefono.setValue(row.telefono);

    this.rowsDocumentos = [];
    this.clienteService.documentoHomEmpresa_List({
      idCliente: this.Controls.idCliente.value
    }).subscribe((response) => {
      for (const item of response) {
        if (item.tipoExtension != 'ADPROV') {
          this.rowsDocumentos.push({
            "idHomologacion": item.idHomologacion,
            "idCtrHomologacion": item.idCtrHomologacion,
            "idGeneral": item.idGeneral,
            "idCliente": this.Controls.idCliente.value,
            "idDocumentoName": item.idDocumentoName,
            "documentoName": item.documentoName,
            "tipoExtension": item.tipoExtension,
            "aplica": (item.aplica) ? true : false,
            "idRegimen": item.idRegimen,
            "upload": item.upload,
            "idEstado": item.idEstado,
            "fileName": item.archivo,
            "base64": '',
            "fileTamanio": item.tamanioArchivo,
            "observacion": item.observacion
          });
        }
      }
    }, error => {
      this.utilsService.showNotification('Cargando documentos Homologación', 'Alert', 2);
    });

    this.rowsDocumentosHomTrabajador = [];
    this.clienteService.empleadoMatriz_Get({
      idCliente: 9
    }).subscribe((response) => {
      for (const item of response) {
        this.rowsDocumentosHomTrabajador.push({
          "idHomologacion": item.idHomologacion,
          "idCliente": 9,
          "codDocumento": item.codDocumento,
          "idDocumentoName": item.idDocumentoName,
          "idPeriodicidad": item.idPeriodicidad,
          "idCriticidad": item.idCriticidad,
          "idRegimen": item.idRegimen,
          "documentoName": item.documentoName,
          "idEstado": true, //item.estado
          "fileName": '',
          "base64": '',
          "fileTamanio": 0
        });
      }

      // console.log(this.rowsDocumentosHomTrabajador);

    }, error => {
      this.utilsService.showNotification('Cargando documentos Homologación', 'Alert', 2);
    });


    this.contratistasService.empresadocpresentados_List({
      idCliente: this.currentUser.idCliente,
      idContratista: this.currentUser.idContratista,
      idEstado: 1,
      search: this.empresadocumentosSettings.searchString,
      pageIndex: this.empresadocumentosSettings.page,
      pageSize: this.empresadocumentosSettings.pageSize
    }).subscribe(response => {
      this.rowsEmpresaDocumentos = response;
      for (const row of response) {
        this.archivosHom.push({
          "idFila": row.idCtrHomologacion,
          "nombre": row.archivo,
          "tamanio": '',
          "tipoExtension": row.tipoExtension
        })
      }
      this.empresadocumentosSettings.colletionSize = response.contratistaDocumento ? response.contratistaDocumento[0].totalElements : 0;
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });

    this.cliente = row.rsCliente;
    this.contratista = row.razonSocial;
    this.ruc = row.ruc;
    this.direccion = row.direccion;
    this.idUbigeo = row.idUbigeo;
    this.telefono = row.telefono;
    this.correo = row.correo;
    setTimeout(() => {
      this.modalService.open(NCT, {
        scrollable: true,
        backdrop: 'static',
        size: 'xl',
        beforeDismiss: () => {
          return true;
        }
      });

      // this.modernWizardStepper = new Stepper(document.querySelector('#stepper3'), {
      //   linear: false,
      //   animation: true
      // });
    }, 0);
  }

  EditarCliente(modal: NgbModal, row) {
    // if (!notification) {
    //   this.notification = false;
    //   this.utilsService.showNotification('No cumple con las validaciones ingresadas', 'Alerta', 2);
    //   this.cliente = 'Lula Satterfield Jr.';
    // } else {
    //   this.notification = true;
    //   this.cliente = '';
    // }
    this.cliente = row.rsCliente;
    this.contratista = row.razonSocial;
    this.ruc = row.ruc;
    this.razonSocial = row.razonSocial;
    this.direccion = row.direccion;
    this.idUbigeo = row.idUbigeo;
    this.telefono = row.telefono;
    this.correo = row.correo;

    this.idContratista = 1;

    setTimeout(() => {
      this.modalService.open(modal, {
        scrollable: true,
        size: 'lg',
        beforeDismiss: () => {
          return true;
        }
      });

    }, 0);
  }

  EditarEmpleado(modal: NgbModal, row) {
    this.nombres = row.nombres;
    this.empleado = row.empleado;
    this.email = row.direccion;
    this.dni = row.nroDocumento;
    this.telefono = row.telefono;


    setTimeout(() => {
      this.modalService.open(modal, {
        scrollable: true,
        size: 'lg',
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  onComentarios(row, modal: NgbModal) {
    this.Controls.observacion.setValue(row.observacion);
    setTimeout(() => {
      this.modalObs = this.modalService.open(modal, {
        scrollable: true,
        size: 'md',
        centered: true,
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  onCloseComentarios() {
    this.modalObs.close();
  }

  ValidacionDocumento(): void {
    Swal.fire({
      title: 'Alerta',
      text: 'La información no ha sido completada correctamente, ¿Desea enviarlo?, esta acción no podrá revertirse',
      icon: 'warning',
      showCancelButton: true,
      // confirmButtonColor: '#7367F0',
      cancelButtonColor: '#E42728',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: 'btn btn-warning',
        cancelButton: 'btn btn-primary'
      }
    }).then((result) => {
      if (result.value) {
        this.utilsService.showNotification('Información guardada correctamente', 'Operación satisfactoria', 1);
        this.modalService.dismissAll();
      }
    });
  }

  onClickBtn(value) {
    this.idEstado = value;
  }

  CancelModal() {
    this.modalService.dismissAll();
  }

  onDocumentoSearch(): void {
    if (this.Controls.ruc.value == '') {
      this.utilsService.showNotification('Ingrese N° documento proveedor', 'Alerta', 2)
      return;
    } else if (this.Controls.ruc.value.length != 8 && this.Controls.ruc.value.length != 11) {
      this.utilsService.showNotification('La cantidad de dígitos deben ser 11 (RUC)', 'Alerta', 2)
      return;
    }

    const digitCount = this.Controls.ruc.value.length;

    if (digitCount == 11) {
      this.utilsService.blockUIStart('Buscando RUC...');
      this.clienteService.sunatV2({
        documento: this.Controls.ruc.value
      }).subscribe(response => {
        this.Controls.razonSocial.setValue((response) ? response.razonSocial : '');
        this.Controls.direccion.setValue((response) ? response.direccion : '');
        this.utilsService.blockUIStop();
        if (this.Controls.razonSocial.value == '' || this.Controls.razonSocial.value == null) {
          this.utilsService.showNotification('No se encontraron coincidencias con el RUC ingresado', 'Alerta', 2);
        }
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
    }
  }

  onDelete() {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Desea inactivar a este contratista?, esta acción no podrá revertirse',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: 'btn btn-warning',
        cancelButton: 'btn btn-primary'
      }
    }).then(result => {
      if (result.value) {
        setTimeout(() => {
          this.utilsService.blockUIStart('Eliminando Cotización...');
        }, 1000);
        this.utilsService.blockUIStop();
      }
    });
  }

  async onArchivoABase64(file): Promise<any> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async fileHom(row): Promise<void> {

    row.upload = true;
    this.Controls.idTipoExtension.setValue('');
    this.Controls.idTipoExtension.setValue(row.tipoExtension);
    this.isUploadAll();
    //this.onBrowseChange2(); 
    let cola = this.uploader.queue;
    let nombres = cola.map(item => item?.file?.name)
      .filter((value, index, self) => self.indexOf(value) === index)
    let sinDuplicado = [];
    for (let el of cola) {
      let duplicado = cola.filter(f => f?.file?.name === el.file.name);
      if (duplicado.length > 1) {
        if (sinDuplicado.filter(f => f?.file?.name === el.file.name).length === 0) {
          let ultimo = duplicado.sort((a, b) => b._file.lastModified - a._file.lastModified)[0]
          sinDuplicado.push(ultimo);
        }
      } else {
        sinDuplicado.push(duplicado[0]);
      }
    }

    this.uploader.queue = sinDuplicado;
    for (const item of this.rowsDocumentos) {
      if (item.idGeneral == row.idGeneral) {
        item.fileName = nombres;
        item.base64 = '';
      }
    }

    this.uploader.queue = [];
    // this.archivosHom = [];
    // for (let item of sinDuplicado) {
    //   let base64 = await this.onArchivoABase64(item._file);
    //   this.archivosHom.push({
    //     idFila: this.utilsService.autoIncrement(this.archivosHom),
    //     nombre: item.file.name,
    //     tamanio: `${(item.file.size / 1024 / 1024).toLocaleString('es-pe', { minimumFractionDigits: 2 })} MB`,
    //     base64: base64
    //   });
    // }     
  }

  isUploadAll() {

    for (const item of this.uploader.queue) {
      item.isSuccess = true;
    }

    this.archivosHom = [];
    for (let item of this.uploader.queue) {
      // let base64 = await this.onArchivoABase64(item._file);
      let time; time = item.file.name.split(".")

      this.archivosHom.push({
        idFila: this.utilsService.autoIncrement(this.archivosHom),
        nombre: item.file.name,
        tamanio: `${(item.file.size / 1024 / 1024).toLocaleString('es-pe', { minimumFractionDigits: 2 })} MB`,
        tipoExtension: time[1]
      });
    }
  }

  isUploadHomolog(item) {
    item.isSuccess = true;
    item.isCancel = false;
    // console.log(this.uploader.queue);
  }

  isCancelHomolog(item) {
    item.isSuccess = false;
    item.isCancel = true;
    // console.log(this.uploader.queue);
  }

  isRemove(item) {
    item.isSuccess = false;
    item.isCancel = false;
    item.isRemove = true;

  }

  onBrowseChange2() {
    // if (this.uploader.queue.length > 1) {
    //   this.uploader.queue.splice(0, 1);
    // }
    this.procesar = true;
    let flagEliminado = false;
    for (const item of this.uploader.queue) {
      let name = item._file.name;
      if (name.includes('.XLSX') || name.includes('.PDF') || name.includes('.xlsx') || name.includes('.pdf')) {

      } else {
        flagEliminado = true;
        item.remove();
      }
    }

    this.onEliminarRepetidas2();
    if (flagEliminado == true) {
      this.utilsService.showNotification('Se han eliminado los archivo que no continen una extensión .xlsx o .pdf', 'Tipo archivo no permitido', 2);
    }
  }

  onEliminarRepetidas2(): void {
    let name = '';
    let cant = 0;

    for (const item of this.uploader.queue) {
      name = item?.file?.name;
      cant = 0;
      for (const i of this.uploader.queue) {
        if (name == i?.file?.name) {
          cant = cant + 1;
        }
        // if (cant > 1) {
        //   i.remove();
        // }
      }
    }
  }

  onSave(): void {
    // this.IDSubmitted = true;

    // if (this.ConForm.invalid) {
    //   return;
    // }

    this.sustentos = [];
    for (let item of this.rowsDocumentos) {
      this.sustentos.push({
        idCtrHomologacion: item.idCtrHomologacion,
        idHomologacion: item.idHomologacion,
        idcliente: 0,
        archivo: item.fileName,
        tamanioArchivo: item.fileTamanio,
        tipoExtension: item.tipoExtension,
        rutaArchivo: "",
        idEstado: item.idEstado == 3 && item.fileName != '' ? 1 : item.idEstado,
        editado: item.idCtrHomologacion !== 0 || item.fileName != '' ? true : false
      });
    }

    this.contratistasService.contratistaSustento_InsertUpdate({
      idCliente: this.currentUser.idCliente,
      idContratista: this.currentUser.idContratista,
      ruc: this.Controls.ruc.value,
      razonSocial: this.Controls.razonSocial.value,
      direccion: this.Controls.direccion.value,
      provincia: this.Controls.provincia.value,
      distrito: this.Controls.distrito.value,
      idRubro: this.Controls.idRubro.value,
      paginaWeb: this.Controls.paginaWeb.value,
      fechaConstitucion: this.fechaEmision.year.toString() + this.fechaEmision.month.toString().padStart(2, '0') + this.fechaEmision.day.toString().padStart(2, '0'),      
      telefono: this.Controls.telefono.value,
      idUsuario: this.currentUser.idUsuario,
      contratistaDocumento: this.sustentos.filter(f => f.editado)
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onSetPage();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
        // this.sustentos = [...this.sustentosOld];
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  onSaveEmpleado(): void {
    this.IDSubmitted = true;

    if (this.EmpForm.invalid) {
      return;
    }

    this.utilsService.blockUIStart("Guardando...");

    this.contratistasService.empleado_insertupdate({
      idEmpleado: this.EControls.idEmpleado.value,
      idContratista: this.EControls.idContratista.value,
      apellidoPaterno: this.EControls.apellidoPaterno.value,
      apellidoMaterno: this.EControls.apellidoMaterno.value,
      nombres: this.EControls.nombres.value,
      nroDocumento: this.EControls.nroDocumento.value,
      direccion: this.EControls.direccion.value,
      telefono: this.EControls.telefono.value,
      idUbigeo: "22"
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.flagVista = false
        this.onSetPage();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
        // this.sustentos = [...this.sustentosOld];
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  onDeleteEmpleado() {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Desea eliminar este empleado?, esta acción no podrá revertirse',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: 'btn btn-warning',
        cancelButton: 'btn btn-primary'
      }
    }).then(result => {
      if (result.value) {
        setTimeout(() => {
          this.utilsService.blockUIStart('Eliminando Cotización...');
        }, 1000);
        this.utilsService.blockUIStop();
      }
    });
  }

  onContratistaDropdown() {
    this.utilsService.blockUIStart('Cargando Contratistas...');
    this.clienteService.contratista_dropdown({
      idEstado: 1,
      search: this.contratistadropdownSettings.searchString,
      pageIndex: this.contratistadropdownSettings.page,
      pageSize: this.contratistadropdownSettings.pageSize
    }).subscribe(response => {
      this.rowsContratistaDropdown = response;
      this.contratistadropdownSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  };

  onContratistaSelect(CS: NgbModal) {
    this.onContratistaDropdown();
    setTimeout(() => {
      this.PopUpCS = this.modalService.open(CS, {
        scrollable: true,
        size: 'lg',
        centered: true,
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  onRowClick(row) {
    if (this.selectedRowIds.includes(row)) {
      this.selectedRowIds.splice(this.selectedRowIds.indexOf(row), 1);
    } else {
      this.selectedRowIds.push(row);
      this.EControls.idContratista.setValue(row.idContratista);
      this.contratista = row.razonSocial;
    }
    this.PopUpCS.close();
  }

  onCloseConstratista() {
    this.PopUpCS.close();
  }

  rowDiscIsSelected(row) {
    return this.selectedDiscRowIds.includes(row);
  }

  // VerEmpleados() {

  //   this.Empleadosrows = [
  //     {
  //       codigo: 'E001-2022',
  //       empleado: 'Rubén Piñeiro',
  //       telefono: '+51 620-76-5907',
  //       email: 'ander.rendon@montez.es',
  //       dni: '74114891',
  //       porcentaje: 100
  //     },
  //     {
  //       codigo: 'E002-2022',
  //       empleado: 'Cassandre Volkman',
  //       telefono: '+51-385-348-981',
  //       email: 'erich.simonis@gmail.com',
  //       dni: '10624285',
  //       porcentaje: 30
  //     },
  //     {
  //       codigo: 'E003-2022',
  //       empleado: 'Maverick Walsh',
  //       telefono: '+51 915-05-9414',
  //       email: 'castellano.rodrigo@valenzuela.es',
  //       dni: '90881678',
  //       porcentaje: 60
  //     },
  //     {
  //       codigo: 'E004-2022',
  //       empleado: 'Bartholome Larkin',
  //       telefono: '+51 684 724560',
  //       email: 'estevan17@kuvalis.com',
  //       dni: '74114891',
  //       porcentaje: 50
  //     },
  //     {
  //       codigo: 'E005-2022',
  //       empleado: 'Einar Ruecker',
  //       telefono: '+51 915676136',
  //       email: 'wehner.lenore@ernser.org',
  //       dni: '36693372',
  //       porcentaje: 20
  //     },
  //   ];
  // }

  /******************************************** 🢃 MANEJO 🢃 ***********************************************/
  /***************************************** 🢃 DE GUARDADO 🢃***********************************************/
  /********************************************** 🢃 DE 🢃 ***********************************************/
  /******************************************* 🢃 ARCHIVOS 🢃 ***********************************************/

  //   async onArchivoABase64(file): Promise<any> {
  //     return await new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.readAsDataURL(file);
  //       reader.onload = () => resolve(reader.result);
  //       reader.onerror = error => reject(error);
  //     });
  //   }

  async fileAudEmpr(e: any): Promise<void> {
    this.hasBaseDropZoneOver = e;
    if (e === false) {
      this.onBrowseChange();
      let cola = this.archivosAudEmpresa.queue;
      let nombres = cola.map(item => item?.file?.name)
        .filter((value, index, self) => self.indexOf(value) === index)
      let sinDuplicado = [];
      for (let el of cola) {
        let duplicado = cola.filter(f => f?.file?.name === el.file.name);
        if (duplicado.length > 1) {
          if (sinDuplicado.filter(f => f?.file?.name === el.file.name).length === 0) {
            let ultimo = duplicado.sort((a, b) => b._file.lastModified - a._file.lastModified)[0]
            sinDuplicado.push(ultimo);
          }
        } else {
          sinDuplicado.push(duplicado[0]);
        }
      }

      this.archivosAudEmpresa.queue = sinDuplicado;
      this.archivosAudEmpr = [];
      for (let item of sinDuplicado) {
        let base64 = await this.onArchivoABase64(item._file);
        this.archivosAudEmpr.push({
          idFila: this.utilsService.autoIncrement(this.archivosAudEmpr),
          nombre: item.file.name,
          tamanio: `${(item.file.size / 1024 / 1024).toLocaleString('es-pe', { minimumFractionDigits: 2 })} MB`,
          tipoExtension: base64
        });
      }
    }
  }

  onBrowseChange() {
    // if (this.uploader.queue.length > 1) {
    //   this.uploader.queue.splice(0, 1);
    // }
    this.procesar = true;
    let flagEliminado = false;
    for (const item of this.archivosAudEmpresa.queue) {
      let name = item._file.name;
      if (name.includes('.XLSX') || name.includes('.PDF') || name.includes('.xlsx') || name.includes('.pdf')) {

      } else {
        flagEliminado = true;
        item.remove();
      }
    }

    this.onEliminarRepetidas();
    if (flagEliminado == true) {
      this.utilsService.showNotification('Se han eliminado los archivo que no continen una extensión .xlsx o .pdf', 'Tipo archivo no permitido', 2);
    }
  }

  onEliminarRepetidas(): void {
    let name = '';
    let cant = 0;

    for (const item of this.archivosAudEmpresa.queue) {
      name = item?.file?.name;
      cant = 0;
      for (const i of this.archivosAudEmpresa.queue) {
        if (name == i?.file?.name) {
          cant = cant + 1;
        }
        // if (cant > 1) {
        //   i.remove();
        // }
      }
    }
  }

  onEliminarAudEmpr(item): void {
    //item.remove();
    let archivo = item.nombre;
    let id = 0;
    for (const arch of this.archivosAudEmpresa.queue) {
      if (arch?.file?.name == archivo) {
        arch.remove();
        break;
      }
    }

    for (const row of this.archivosAudEmpr) {

      if (row.nombre === archivo) {
        this.archivosAudEmpr.splice(id, 1)
      }
      id = id + 1;
    }
  }

  //   onEliminarArchivoAdjunto(item: SolicitudCabSustento): void {
  //     Swal.fire({
  //       title: 'Confirmación',
  //       text: `¿Desea eliminar el archivo "${item.archivo}"?`,
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonText: 'Sí',
  //       cancelButtonText: 'No',
  //       customClass: {
  //         confirmButton: 'btn btn-warning',
  //         cancelButton: 'btn btn-primary'
  //       }
  //     }).then(result => {
  //       if (result.value) {
  //         item.editado = true;
  //         item.estado = false;
  //       }
  //     });
  //   }


  onRemoveFile(row): void {
    row.fileName = '';
    row.base64 = '';
    row.fileTamanio = 0;
  }
}
