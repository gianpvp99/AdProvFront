import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'app/shared/services/utils.service';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { FileUploader } from 'ng2-file-upload';
import { User } from 'app/shared/models/auth/user';
import { ClienteService } from './clientes.service';
import { ContratistasService } from '../contratistas.service';
import Swal from 'sweetalert2';

const I18N_VALUES = {
  'es': {
    weekdays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
    weekLabel: 'sem'
  }
  // other languages you would support
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
}

class Archivo {
  idFila: number;
  idTipo: number;
  idTipoSustento: number;
  nombre: string;
  tamanio: string;
  base64: string;
}

class SolicitudCabSustento {
  idSolicitudCabSustento: number;
  idSolicitudCab: number;
  idTipo: number;
  tipo: string;
  archivo: string;
  base64: string;
  rutaArchivo: string;
  estado: boolean;

  editado: boolean = false;
}

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
  providers:
    [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }]
})
export class ClientesComponent implements OnInit {
  public currentUser: User;
  public cliente: string;
  public archivosHomologacion: FileUploader = new FileUploader({
    isHTML5: true
  });

  public archivosAudEmpresa: FileUploader = new FileUploader({
    isHTML5: true
  });

  public archivosAudEmpleado: FileUploader = new FileUploader({
    isHTML5: true
  });

  public sustentos: SolicitudCabSustento[] = [];
  public sustentosOld: SolicitudCabSustento[] = [];

  Value = 1;
  Especialista = [{
    idColumna: 1,
    despecialista: 'Dr. Felipe Waelchi',
  }, {
    idColumna: 2,
    despecialista: 'Abelardo Welch V',
  }, {
    idColumna: 3,
    despecialista: 'Cindy Ohara',
  }, {
    idColumna: 4,
    despecialista: 'Lilian Quiley',
  }, {
    idColumna: 5,
    despecialista: 'Kobe Ernser'
  }]

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

  IDSubmitted = false;

  clienteSettings = { ...this.tableDefaultPageSettings };
  contratistaSettings = { ...this.tableDefaultPageSettings };
  rowsContratista = [];
  contratistadropdownSettings = { ...this.tableDefaultPageSettings };
  rowsContratistaDropdown = [];
  rowsDocumentos = [];
  rowsDocumentosEmpresa = [];
  rowsDocumentosEmpleado = [];

  public archivosHom: Archivo[] = [];
  public archivosAudEmpr: Archivo[] = [];
  public archivosAudEmpl: Archivo[] = [];

  public rowsNivel = [];
  public rowsRegimen = [];
  public rowsPeriodo = [];
  public rowsCriticidad = [];
  public rowsTipoDoc = [];

  procesar: boolean = true;
  selectedRowIds: number[] = [];
  selectedDiscRowIds: number[] = [];
  PopUpCS: any;

  public notification: boolean;
  public hasBaseDropZoneOver: boolean = false;
  public progressbarHeight = '.857rem';
  public contentHeader: object;
  public searchValue = '';
  public page = 10;

  idTipoDoc: number;
  sesionPerfil: number;
  idCliente: number;
  idContratista: number;
  contratista: string;
  ruc: string;
  razonSocial: string;
  direccion: string;
  idUbigeo: string;
  telefono: string;
  correo: string;
  idEstado: number;
  CliForm: FormGroup;

  idNivel: number;
  idPeriodo: number;
  idRegimen: number;
  idCriticidad: number;

  rows = [];
  public ColumnMode = ColumnMode;
  forPageOptions = [10, 25, 50, 100];
  flagVista: boolean;
  flagcontra = false;

  public items = [{ itemId: '', itemName: '', itemQuantity: '', itemCost: '' }];

  public item = {
    itemName: '',
    itemQuantity: '',
    itemCost: ''
  };

  get ReactiveIUForm(): { [p: string]: AbstractControl } {
    return this.CliForm.controls;
  }

  constructor(
    private utilsService: UtilsService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private clienteService: ClienteService,
    private contratistasService: ContratistasService
  ) {
    this.contentHeader = {
      headerTitle: 'Clientes',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Inicio',
            isLink: true,
            link: '/'
          },
          {
            name: 'DashBoard',
            isLink: false,
            link: '/'
          },
          {
            name: 'Clientes',
            isLink: false
          }
        ]
      }
    };

    this.CliForm = this.formBuilder.group({
      value: [1],
      idCliente: [0, Validators.required],
      contratista: ['', Validators.required],
      ruc: ['', Validators.required],
      razonSocial: ['', Validators.required],
      direccion: ['', Validators.required],
      idUbigeo: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', Validators.required],
      idTipoDoc: [1, Validators.required],
      idEstado: [0],
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.sesionPerfil = this.currentUser.idPerfil;
    this.onChangeState(1);
    this.idNivel = 1;
    this.idEstado = 1;
    this.idPeriodo = 1;
    this.idCriticidad = 1;        
    // this.idRegimen = 0;
    this.idTipoDoc = 1;
    this.flagVista = false;    
    this.onSetPage();
    this.onNivel();
    this.onPeriodo();
    this.onTipoDoc();
    this.onRegimen();   
    this.onCriticidad(); 
    this.onSetContratista();
  }

  addItem() {
    this.items.push({
      itemId: '',
      itemName: '',
      itemQuantity: '',
      itemCost: ''
    });
  }

  deleteItem(id) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items.indexOf(this.items[i]) === id) {
        this.items.splice(i, 1);
        break;
      }
    }
  }

  DocumentosGet() {
    this.rowsDocumentos = [];
    this.clienteService.empresaMatriz_Get({
      idCliente: 0
    }).subscribe((response) => {
      for (const item of response) {
        this.rowsDocumentos.push({
          "idGeneral": item.idGeneral,
          "idCliente": 0,
          "idPeriodicidad": item.idPeriodicidad,
          "idCriticidad": item.idCriticidad,
          "idDocumentoName": item.idDocumentoName,
          "documentoName": item.documentoName,
          "estado": true //item.estado
        });
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


  onReloadChanged() {
    this.onSetPage();
  }

  onSetPage() {
    this.utilsService.blockUIStart('Cargando listado de Clientes...');
    this.clienteService.cliente_list({
      idCliente: this.currentUser.idCliente,
      idEstado: this.idEstado,
      search: this.clienteSettings.searchString,
      pageIndex: this.clienteSettings.page,
      pageSize: this.clienteSettings.pageSize
    }).subscribe(response => {
      this.rows = response.clientes;
      this.ReactiveIUForm.ruc.setValue(response.clientes[0].ruc);
      this.ReactiveIUForm.razonSocial.setValue(response.clientes[0].razonSocial);
      this.ReactiveIUForm.correo.setValue(response.clientes[0].correo);
      this.ReactiveIUForm.direccion.setValue(response.clientes[0].direccion);
      this.ReactiveIUForm.telefono.setValue(response.clientes[0].telefono);

      this.clienteSettings.colletionSize = response.clientes ? response.clientes[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
    this.utilsService.blockUIStop();
  }

  /******************************************** 🢃 TABLA MAESTRA 🢃 ***********************************************/

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

  onRegimen(): void {
    this.clienteService.dropdown({
      idTabla: 16
    }).subscribe(
      response => {
        this.rowsRegimen = response;
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
  }

  onCriticidad(): void {
    this.clienteService.dropdown({
      idTabla: 17
    }).subscribe(
      response => {
        this.rowsCriticidad = response;
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
  }

  onPeriodo(): void {
    this.clienteService.dropdown({
      idTabla: 13
    }).subscribe(
      response => {
        this.rowsPeriodo = response;
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
  }

  onTipoDoc(): void {
    this.clienteService.dropdown({
      idTabla: 14
    }).subscribe(
      response => {
        this.rowsTipoDoc = response;
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
  }
  /******************************************** 🢁 TABLA MAESTRA 🢁 ***********************************************/

  onChangeState(value) {
    this.idEstado = value;
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
      this.idContratista = row.idContratista;
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

  onSetContratista() {
    this.utilsService.blockUIStart('Cargando listado de Contratistas...');
    this.contratistasService.contratistaCliente_List({
      idCliente: this.currentUser.idCliente,
      idContratista: 0,
      idEstado: this.idEstado,
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

  VistaContratistas(row) {
    this.ruc = row.ruc;
    this.razonSocial = row.razonSocial;
    this.direccion = row.direccion;
    this.idUbigeo = row.idUbigeo;
    this.telefono = row.telefono;
    this.correo = row.correo;
    this.flagVista = true;    
    this.onSetContratista();
  }

  ChangeRegimen(){
    if (this.idRegimen != null) {
      this.DocumentosGet();
    }
  }

  AgregarCliente(modal: NgbModal, notification: boolean) {
    this.IDSubmitted = false;
    this.CleaningCliente();
    if (!notification) {
      this.notification = false;
      this.utilsService.showNotification('No cumple con las validaciones ingresadas', 'Alerta', 2);
      this.cliente = 'Lula Satterfield Jr.';
    } else {
      this.notification = true;
      this.cliente = '';
    }

    this.idCliente = 0;
    this.ruc = '';
    this.razonSocial = '';
    this.direccion = '';
    this.idUbigeo = ''
    this.telefono = '';
    this.correo = '';

    setTimeout(() => {
      this.modalService.open(modal, {
        scrollable: true,
        size: 'xl',
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  onEditCliente(modal: NgbModal, row) {
    this.notification = true;
    this.idCliente = row.idCliente;
    this.contratista = row.contratista;
    this.ruc = row.ruc;
    this.razonSocial = row.razonSocial;
    this.direccion = row.direccion;
    this.idUbigeo = row.idUbigeo;
    this.telefono = row.telefono;
    this.correo = row.correo;
    this.sustentos = row.solicitudCabSustento;
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

  CleaningCliente() {
    this.ruc = "";
    this.razonSocial = "";
    this.direccion = "";
    this.idUbigeo = "";
    this.telefono = "";
    this.correo = "";
  }

  CancelModal() {
    this.modalService.dismissAll();
  }

  onDeleteCli(row) {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Desea eliminar este cliente?, esta acción no podrá revertirse',
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
        this.clienteService.cliente_delete({
          idCliente: row.idCliente,
          idUsuarioAud: this.currentUser.idUsuario,
        }).subscribe(response => {
          if (response.ok) {
            this.onSetPage();

            this.utilsService.showNotification('Registro eliminado correctamente', 'Operación satisfactoria', 1);
          } else {
            this.utilsService.showNotification(response.message, 'Alerta', 2);
          }
        }, error => {
          this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        });
      }
    });
  }

  onDelete(row) {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Desea eliminar este contratista?, esta acción no podrá revertirse',
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
      }
    });
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

  onDocumentoSearch(): void {
    if (this.ruc == '') {
      this.utilsService.showNotification('Ingrese N° documento proveedor', 'Alerta', 2)
      return;
    } else if (this.ruc.length != 8 && this.ruc.length != 11) {
      this.utilsService.showNotification('La cantidad de dígitos debe der 8 (DNI) u 11 (RUC)', 'Alerta', 2)
      return;
    }

    const digitCount = this.ruc.length;

    if (digitCount == 11) {
      this.utilsService.blockUIStart('Buscando RUC / DNI...');
      this.clienteService.sunatV2({
        documento: this.ruc
      }).subscribe(response => {
        this.razonSocial = (response) ? response.razonSocial : '';
        this.direccion = (response) ? response.direccion : '';

        this.utilsService.blockUIStop();

        if (this.razonSocial == '' || this.razonSocial == null) {
          this.utilsService.showNotification('No se encontraron coincidencias con el RUC ingresado', 'Alerta', 2);
        }
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
    } else {
      this.utilsService.blockUIStart('Buscando RUC / DNI...');
      this.clienteService.sunatV1({
        dni: this.ruc
      }).subscribe(response => {
        this.razonSocial = (response) ? response.nombres + ' ' + response.apellidoPaterno + ' ' + response.apellidoMaterno : '';
        this.direccion = '';

        this.utilsService.blockUIStop();

        if (this.razonSocial == '' || this.razonSocial == null) {
          this.utilsService.showNotification('No se encontraron coincidencias con el DNI ingresado', 'Alerta', 2);
        }
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
    }
  }

  /******************************************* 🢃 ARCHIVOS 🢃 ***********************************************/
  /******************************************* 🢃 ARCHIVOS 🢃 ***********************************************/

  async onArchivoABase64(file): Promise<any> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async fileHom(e: any): Promise<void> {
    this.hasBaseDropZoneOver = e;
    if (e === false) {
      this.onBrowseChange();
      let cola = this.archivosHomologacion.queue;
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

      this.archivosHomologacion.queue = sinDuplicado;
      this.archivosHom = [];
      for (let item of sinDuplicado) {
        let base64 = await this.onArchivoABase64(item._file);
        this.archivosHom.push({
          idFila: this.utilsService.autoIncrement(this.archivosHom),
          idTipo: 8,
          idTipoSustento: 1,
          nombre: item.file.name,
          tamanio: `${(item.file.size / 1024 / 1024).toLocaleString('es-pe', { minimumFractionDigits: 2 })} MB`,
          base64: base64
        });
      }
    }
  }

  onBrowseChange() {
    if (this.archivosHomologacion.queue.length > 1) {
      this.archivosHomologacion.queue.splice(0, 1);
    }
    this.procesar = true;
    let flagEliminado = false;
    for (const item of this.archivosHomologacion.queue) {
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

    for (const item of this.archivosHomologacion.queue) {
      name = item?.file?.name;
      cant = 0;
      for (const i of this.archivosHomologacion.queue) {
        if (name == i?.file?.name) {
          cant = cant + 1;
        }
        // if (cant > 1) {
        //   i.remove();
        // }
      }
    }
  }

  onMensajeValidacion(msg): void {
    Swal.fire({
      title: 'No Coincide',
      //text: msg,
      html: msg,
      icon: 'warning',
      showCancelButton: false,
      // confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      customClass: {
        confirmButton: 'btn btn-danger ml-1'
      },
      confirmButtonText: 'OK'
    });
  }

  async fileAudEmpr(e: any): Promise<void> {
    this.hasBaseDropZoneOver = e;
    if (e === false) {
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
          idTipo: 8,
          idTipoSustento: 1,
          nombre: item.file.name,
          tamanio: `${(item.file.size / 1024 / 1024).toLocaleString('es-pe', { minimumFractionDigits: 2 })} MB`,
          base64: base64
        });
      }
    }
  }

  async fileAudEmpl(e: any): Promise<void> {
    this.hasBaseDropZoneOver = e;
    if (e === false) {
      let cola = this.archivosAudEmpleado.queue;
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

      this.archivosAudEmpleado.queue = sinDuplicado;
      this.archivosAudEmpl = [];
      for (let item of sinDuplicado) {
        let base64 = await this.onArchivoABase64(item._file);
        this.archivosAudEmpl.push({
          idFila: this.utilsService.autoIncrement(this.archivosAudEmpl),
          idTipo: 8,
          idTipoSustento: 1,
          nombre: item.file.name,
          tamanio: `${(item.file.size / 1024 / 1024).toLocaleString('es-pe', { minimumFractionDigits: 2 })} MB`,
          base64: base64
        });
      }
    }
  }

  onEliminarHom(item): void {
    //item.remove();
    let archivo = item.nombre;
    let id = 0;
    for (const arch of this.archivosHomologacion.queue) {
      if (arch?.file?.name == archivo) {
        arch.remove();
        break;
      }
    }

    for (const row of this.archivosHom) {

      if (row.nombre === archivo) {
        this.archivosHom.splice(id, 1)
      }
      id = id + 1;
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

  onEliminarAudEmpl(item): void {
    //item.remove();
    let archivo = item.nombre;
    let id = 0;
    for (const arch of this.archivosAudEmpleado.queue) {
      if (arch?.file?.name == archivo) {
        arch.remove();
        break;
      }
    }

    for (const row of this.archivosAudEmpl) {

      if (row.nombre === archivo) {
        this.archivosAudEmpl.splice(id, 1)
      }
      id = id + 1;
    }
  }

  onSave(): void {
    this.IDSubmitted = true;

    if (this.CliForm.invalid) {
      return;
    }


    // this.utilsService.blockUIStart("Guardando...");
    // if (this.sustentosOld.length === 0)
    //   this.sustentosOld = [...this.sustentos];
    // else {
    //   this.sustentos = [...this.sustentosOld];
    // }

    // for (let item of this.archivosHom) {
    //   this.sustentos.push({
    //     idSolicitudCabSustento: 0,
    //     idSolicitudCab: 0,
    //     idTipo: item.idTipo,
    //     tipo: "",
    //     archivo: item.nombre,
    //     base64: item.base64,
    //     rutaArchivo: "",
    //     estado: true,
    //     editado: true
    //   });
    // }

    let DocumentosGeneral = [];
    let DocumentosEmpresa = [];
    let DocumentosEmpleado = [];

    for (const item of this.rowsDocumentos) {
      DocumentosGeneral.push({
        "idGeneral": item.idGeneral,
        "idCliente": item.idCliente,
        "idDocumentoName": item.idDocumentoName,
        "estado": item.estado
      });
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

    this.clienteService.cliente_insertupdate({
      idCliente: this.idCliente,
      idContratista: this.idContratista,
      rUC: this.ruc,
      razonSocial: this.razonSocial,
      direccion: this.direccion,
      idUbigeo: this.idUbigeo,
      telefono: this.telefono,
      correo: this.correo,
      idEstado: 1,
      idUsuario: 1,
      tDocumentoGeneral: DocumentosGeneral,
      tDocumentoEmpresa: DocumentosEmpresa,
      tDocumentoEmpleado: DocumentosEmpleado
      // solicitudCabSustento: this.sustentos.filter(f => f.editado)
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

  onEliminarArchivo(item): void {
    //item.remove();
    let archivo = item.nombre;
    let id = 0;
    for (const arch of this.archivosHomologacion.queue) {
      if (arch?.file?.name == archivo) {
        arch.remove();
        break;
      }
    }

    for (const row of this.archivosHom) {

      if (row.nombre === archivo) {
        this.archivosHom.splice(id, 1)
      }
      id = id + 1;
    }
  }

  onEliminarArchivoAdjunto(item: SolicitudCabSustento): void {
    Swal.fire({
      title: 'Confirmación',
      text: `¿Desea eliminar el archivo "${item.archivo}"?`,
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
        item.editado = true;
        item.estado = false;
      }
    });
  }

  ///////////////////////////sacar


  CancelValidate() {
    this.flagcontra = false;
  }

  ActivarValidate() {
    this.flagcontra = true;
  }


  Return() {
    this.flagVista = false;
  }

}

