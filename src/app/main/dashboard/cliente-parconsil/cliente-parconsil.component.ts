import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'app/shared/services/utils.service';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { FileUploader } from 'ng2-file-upload';
import { User } from 'app/shared/models/auth/user';
import { ClienteService } from '../clientes/clientes.service';
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

class Proyectos {
  idFila: number;
  idProyecto: number;
  proyecto: string;
  responsable: string;
}

class Grupos {
  idFila: number;
  idClienteGrupo: number;
  nombreGrupo: string;
  flagEliminado: boolean;
}

@Component({
  selector: 'app-cliente-parconsil',
  templateUrl: './cliente-parconsil.component.html',
  styleUrls: ['./cliente-parconsil.component.scss'],
  providers:
    [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }]
})
export class ClienteParconsilComponent implements OnInit {
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

  tableDefaultPageSettings2 = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 20
  };

  IDSubmitted = false;
  PRSubmitted = false;
  GRSubmitted = false;

  clienteSettings = { ...this.tableDefaultPageSettings };
  rowsClientes = [];
  contratistaSettings = { ...this.tableDefaultPageSettings };
  rowsContratista = [];
  contratistadropdownSettings = { ...this.tableDefaultPageSettings };
  rowsContratistaDropdown = [];

  clientegrupoSettings = { ...this.tableDefaultPageSettings2 };

  rowsProyecto: Proyectos[] = [];
  rowsGrupo: Grupos[] = [];

  public archivosHom: Archivo[] = [];
  public archivosAudEmpr: Archivo[] = [];
  public archivosAudEmpl: Archivo[] = [];

  public rowsNivel = [];
  public rowsRegimen = [];
  public rowsGroup = [];
  public rowsPeriodo = [];
  public rowsCriticidad = [];
  public rowsTipoDoc = [];

  procesar: boolean = true;
  selectedRowIds: number[] = [];
  selectedDiscRowIds: number[] = [];

  public hasBaseDropZoneOver: boolean = false;
  public progressbarHeight = '.857rem';
  public contentHeader: object;
  public searchValue = '';

  idTipoDoc: number;
  sesionPerfil: number;
  idNivel: number;
  idPeriodo: number;
  idRegimen: number;
  idCriticidad: number;

  public ColumnMode = ColumnMode;
  forPageOptions = [10, 25, 50, 100];
  flagcontra = false;

  public items = [{ itemId: '', itemName: '', itemQuantity: '', itemCost: '' }];

  public item = {
    itemName: '',
    itemQuantity: '',
    itemCost: ''
  };

  CliForm: FormGroup;
  ProyectoForm: FormGroup;
  GrupoForm: FormGroup;

  get CControls(): { [p: string]: AbstractControl } {
    return this.CliForm.controls;
  }

  get PControls(): { [p: string]: AbstractControl } {
    return this.ProyectoForm.controls;
  }

  get GControls(): { [p: string]: AbstractControl } {
    return this.GrupoForm.controls;
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
            isLink: false,
            link: '/'
          },
          {
            name: 'Clientes',
            isLink: false,
            link: '/'
          }
        ]
      }
    };

    this.CliForm = this.formBuilder.group({
      value: [1],
      idCliente: [0],
      ruc: ['', Validators.required],
      razonSocial: ['', Validators.required],
      direccion: ['', Validators.required],
      idUbigeo: [45],
      telefono: ['', Validators.required],
      correo: ['', Validators.required],
      puntajemin: [1, Validators.required],
      idTipoDoc: [1],
      idEstado: [1],
      titulo: [''],
      certificado: [false],
      namecertificado: ['No']
    });

    this.ProyectoForm = this.formBuilder.group({
      idFilaProyecto: [0],
      idProyecto: [0],
      idCliente: [0],
      proyecto: ['', Validators.required],
      responsable: ['', Validators.required],
      titulo: [''],
      idEstadoProyecto: [1],
      tipoEstado: [false],
      estadoProyecto: ['Estado actual: creando un nuevo registro']
    });

    this.GrupoForm = this.formBuilder.group({
      idFilaGrupo: [0],
      idClienteGrupo: [0],
      idCliente: [0],
      nombreGrupo: ['', Validators.required],
      flagEliminado: [0],
      titulo: [''],
      idEstadoGrupo: [1],
      tipoEstado: [false],
      estadoGrupo: ['Estado actual: creando un nuevo registro']
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.sesionPerfil = this.currentUser.idPerfil;
    this.idNivel = 1;
    this.idPeriodo = 1;
    this.idCriticidad = 1;
    // this.idRegimen = 0;
    this.idTipoDoc = 1;
    this.onSetPage();
    this.onDataMaster();
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

  onReloadChanged() {
    this.onSetPage();
  }

  onClearFilter(): void {
    this.clienteSettings.searchString = '';
    this.utilsService.blockUIStart("Quitando filtro...");
    this.onReloadChanged();
    setTimeout(() => {
      this.utilsService.blockUIStop();
    }, 1000);
  }

  CertificadoCheck() {
    if (this.CControls.certificado.value == 1) {
      console.log("hola");
      this.CControls.namecertificado.setValue("No")
    }
    else {
      console.log("no se activo");
      this.CControls.namecertificado.setValue("Si")
    }

    console.log(this.CControls.certificado.value);
  }

  //#region 🢃 TABLA MAESTRA 🢃

  onDataMaster(): void {
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
      idTabla: 14
    }).subscribe(
      response => {
        this.rowsTipoDoc = response;
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

  //#endregion

  //#region 🢃 MANEJO DE PROYECTO 🢃

  onProyectoGetIdFila(data): number {
    let max = 0;

    for (const item of data) {
      if (parseInt(item.idFila, 0) > max) {
        max = parseInt(item.idFila, 0);
      }
    }

    return max + 1;
  }

  onProyectofindIndex(newItem): boolean {
    return newItem.idFila === this;
  }

  onProyectoEdit(row): void {
    this.bagdeActiveP = true;
    this.PControls.tipoEstado.setValue(true);
    this.PControls.idEstadoProyecto.setValue(2);
    this.PControls.estadoProyecto.setValue('Estado actual: editando registro seleccionado');
    this.PControls.idFilaProyecto.setValue(row.idFila);
    this.PControls.idProyecto.setValue(row.idProyecto);
    this.PControls.idCliente.setValue(row.idCliente);
    this.PControls.proyecto.setValue(row.proyecto);
    this.PControls.responsable.setValue(row.responsable);
  }

  onProyectoDelete(row): void {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Desea eliminar el registro seleccionado?',
      icon: 'warning',
      showCancelButton: true,
      // confirmButtonColor: '#7367F0',
      //cancelButtonColor: '#E42728',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: 'btn btn-danger ml-1',
        cancelButton: 'btn btn-primary'
      }
    }).then((result) => {
      if (result.value) {
        const updateItem = this.rowsProyecto.find(this.findIndexToUpdate, row.idFila);
        const index = this.rowsProyecto.indexOf(updateItem);
        this.rowsProyecto.splice(index, 1);
        this.rowsProyecto = [...this.rowsProyecto];        
        this.onProyectoClean();
      }
    });
  }

  bagdeActiveP: boolean;
  onProyectoClean(): void {
    this.bagdeActiveP = false;
    this.PControls.idFilaProyecto.setValue(0);
    this.PControls.idProyecto.setValue(0);
    this.PControls.idCliente.setValue(0);
    this.PControls.proyecto.setValue('');
    this.PControls.responsable.setValue('');
    this.PRSubmitted = false;
  }

  onProyectoSave(): void {
    this.PControls.tipoEstado.setValue(false);
    this.PControls.idEstadoProyecto.setValue(1);
    this.PControls.estadoProyecto.setValue('Estado actual: creando un nuevo registro');    
    this.PRSubmitted = true;

    if (this.ProyectoForm.invalid) {      
      return;
    }

    if (this.PControls.idFilaProyecto.value === 0) {
      this.rowsProyecto = [...this.rowsProyecto, {
        idFila: this.onProyectoGetIdFila(this.rowsProyecto),
        idProyecto: this.PControls.idProyecto.value,
        proyecto: this.PControls.proyecto.value,
        responsable: this.PControls.responsable.value,
      }];
    } else {
      const updateItem = this.rowsProyecto.find(this.onProyectofindIndex, this.PControls.idFilaProyecto.value);
      const index = this.rowsProyecto.indexOf(updateItem);
      this.rowsProyecto[index] = {
        idFila: this.PControls.idFilaProyecto.value,
        idProyecto: this.PControls.idProyecto.value,
        proyecto: this.PControls.proyecto.value,
        responsable: this.PControls.responsable.value,
      };
      this.rowsProyecto = [...this.rowsProyecto];
    }

    this.onProyectoClean();
  }

  //#endregion

  //#region 🢃 MANEJO DE GRUPOS 🢃

  getNewIdFila(data): number {
    let max = 0;

    for (const item of data) {
      if (parseInt(item.idFila, 0) > max) {
        max = parseInt(item.idFila, 0);
      }
    }

    return max + 1;
  }

  findIndexToUpdate(newItem): boolean {
    return newItem.idFila === this;
  }

  bagdeActive: boolean;
  onGrupoEdit(row): void {
    this.bagdeActive = true;
    this.GControls.tipoEstado.setValue(true);
    this.GControls.idEstadoGrupo.setValue(2);
    this.GControls.estadoGrupo.setValue('Estado actual: editando registro seleccionado');

    this.GControls.idFilaGrupo.setValue(row.idFila);
    this.GControls.idClienteGrupo.setValue(row.idClienteGrupo);
    this.GControls.nombreGrupo.setValue(row.nombreGrupo);
    this.GControls.idCliente.setValue(row.idCliente);
  }

  onGrupoDelete(row): void {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Desea eliminar el registro seleccionado?',
      icon: 'warning',
      showCancelButton: true,
      // confirmButtonColor: '#7367F0',
      //cancelButtonColor: '#E42728',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: 'btn btn-danger ml-1',
        cancelButton: 'btn btn-primary'
      }
    }).then((result) => {
      if (result.value) {
        const updateItem = this.rowsGrupo.find(this.findIndexToUpdate, row.idFila);
        const index = this.rowsGrupo.indexOf(updateItem);
        this.rowsGrupo.splice(index, 1);
        this.rowsGrupo = [...this.rowsGrupo];      
        this.onGrupoClean();
      }
    });
  }
  
  onGrupoClean(): void {
    this.bagdeActive = false;
    this.GRSubmitted = false;
    this.GControls.idFilaGrupo.setValue(0);
    this.GControls.idClienteGrupo.setValue(0);
    this.GControls.nombreGrupo.setValue('');
    this.GControls.idCliente.setValue(0);
  }

  onSaveGrupos(): void {
    this.GControls.tipoEstado.setValue(false);
    this.GControls.idEstadoGrupo.setValue(1);
    this.GControls.estadoGrupo.setValue('Estado actual: creando un nuevo registro');
    this.GRSubmitted = true;

    if (this.GrupoForm.invalid) {
      return;
    }

    if (this.GControls.idFilaGrupo.value === 0) {
      this.rowsGrupo = [...this.rowsGrupo, {
        idFila: this.getNewIdFila(this.rowsGrupo),
        idClienteGrupo: this.GControls.idClienteGrupo.value,
        nombreGrupo: this.GControls.nombreGrupo.value,
        flagEliminado: false
      }];
    } else {
      const updateItem = this.rowsGrupo.find(this.findIndexToUpdate, this.GControls.idFilaGrupo.value);
      const index = this.rowsGrupo.indexOf(updateItem);
      this.rowsGrupo[index] = {
        idFila: this.GControls.idFilaGrupo.value,
        idClienteGrupo: this.GControls.idClienteGrupo.value,
        nombreGrupo: this.GControls.nombreGrupo.value,
        flagEliminado: false
      };
      this.rowsGrupo = [...this.rowsGrupo];
    }
    this.onGrupoClean();
  }

  //#endregion

  //#region 🢃 MANEJO DE CLIENTE 🢃
  onSetPage() {
    this.utilsService.blockUIStart('Cargando listado de Clientes...');
    this.clienteService.cliente_list({
      idCliente: 0,
      idEstado: this.CControls.idEstado.value,
      search: this.clienteSettings.searchString,
      pageIndex: this.clienteSettings.page,
      pageSize: this.clienteSettings.pageSize
    }).subscribe(response => {
      this.rowsClientes = response.clientes;
      this.clienteSettings.colletionSize = response.clientes[0] ? response.clientes[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
    this.utilsService.blockUIStop();
  }

  title: string;
  onNewCliente(modal: NgbModal) {
    this.title = 'Registrar Información complementaria';
    this.IDSubmitted = false;
    this.CControls.idCliente.setValue(0);
    this.CControls.ruc.setValue('');
    this.CControls.razonSocial.setValue('');
    this.CControls.direccion.setValue('');
    this.CControls.idUbigeo.setValue('');
    this.CControls.telefono.setValue('');
    this.CControls.correo.setValue('');

    this.rowsProyecto = [];
    this.rowsGrupo = [];
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

  onEditCliente(modal: NgbModal, row) {
    this.title = 'Actualizar Información complementaria';
    this.idRegimen = 1;
    this.CControls.idCliente.setValue(row.idCliente);
    this.CControls.ruc.setValue(row.ruc);
    this.CControls.puntajemin.setValue(row.puntajeMinimo);
    this.CControls.razonSocial.setValue(row.razonSocial);
    this.CControls.direccion.setValue(row.direccion);
    this.CControls.idUbigeo.setValue(row.idUbigeo);
    this.CControls.telefono.setValue(row.telefono);
    this.CControls.correo.setValue(row.correo);

    this.clienteService.clienteProyectoGrupo_List({
      idCliente: row.idCliente,
      pageIndex: this.clientegrupoSettings.page,
      pageSize: this.clientegrupoSettings.pageSize
    }).subscribe(response => {
      this.rowsGrupo = response.clienteGrupos;
      this.rowsProyecto = response.clienteProyecto;
      this.clientegrupoSettings.colletionSize = response.clienteGrupos[0] ? response.clienteGrupos[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
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

  onSaveCliente(): void {
    console.log(this.CControls.puntajemin.value);
    
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

    // let DocumentosGeneral = [];
    // let DocumentosEmpresa = [];
    // let DocumentosEmpleado = [];

    // for (const item of this.rowsDocumentos) {
    //   DocumentosGeneral.push({
    //     "idHomologacion": item.idHomologacion,
    //     "idCliente": item.idCliente,
    //     "idDocumentoName": item.idDocumentoName,
    //     "idPeriodicidad": item.idPeriodicidad,
    //     "idCriticidad": item.idCriticidad,
    //     "idRegimen": item.idRegimen,
    //     "estado": item.estado
    //   });
    // }

    // for (const item of this.rowsDocumentosEmpresa) {
    //   DocumentosEmpresa.push({
    //     "idDocEmpresa": item.idDocEmpresa,
    //     "idCliente": item.idCliente,
    //     "idDocumentoName": item.idDocumentoName,
    //     "estado": item.estado
    //   });
    // }

    // for (const item of this.rowsDocumentosEmpleado) {
    //   DocumentosEmpleado.push({
    //     "idDocEmpleado": item.idDocEmpleado,
    //     "idCliente": item.idCliente,
    //     "idDocumentoName": item.idDocumentoName,
    //     "estado": item.estado
    //   });
    // } 

    this.clienteService.cliente_insertupdate({
      idCliente: this.CControls.idCliente.value,
      rUC: this.CControls.ruc.value,
      razonSocial: this.CControls.razonSocial.value,
      direccion: this.CControls.direccion.value,
      idUbigeo: this.CControls.idUbigeo.value,
      puntajeMinimo: parseInt(this.CControls.puntajemin.value),
      telefono: this.CControls.telefono.value,
      correo: this.CControls.correo.value,
      idEstado: 1,
      idUsuarioAud: this.currentUser.idUsuario,
      tablaClienteGrupo: this.rowsGrupo,
      tablaClienteProyecto: this.rowsProyecto
      // tDocumentoHomologacionE: DocumentosGeneral,
      // tDocumentoEmpresa: DocumentosEmpresa,
      // tDocumentoEmpleado: DocumentosEmpleado
      // solicitudCabSustento: this.sustentos.filter(f => f.editado)
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Información guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onSetPage();
        this.rowsGrupo = [];
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
        // this.sustentos = [...this.sustentosOld];
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  onDeleteCliente(row) {
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

  onDocumentoSearch(): void {
    if (this.CControls.ruc.value == '') {
      this.utilsService.showNotification('Ingrese N° documento proveedor', 'Alerta', 2)
      return;
    } else if (this.CControls.ruc.value.length != 8 && this.CControls.ruc.value.length != 11) {
      this.utilsService.showNotification('La cantidad de dígitos debe der 8 (DNI) u 11 (RUC)', 'Alerta', 2)
      return;
    }

    const digitCount = this.CControls.ruc.value.length;

    if (digitCount == 11) {
      this.utilsService.blockUIStart('Buscando RUC / DNI...');
      this.clienteService.sunatV2({
        documento: this.CControls.ruc.value
      }).subscribe(response => {
        this.CControls.razonSocial.setValue((response) ? response.razonSocial : '');
        this.CControls.direccion.setValue((response) ? response.direccion : '');

        this.utilsService.blockUIStop();

        if (this.CControls.razonSocial.value == '' || this.CControls.razonSocial.value == null) {
          this.utilsService.showNotification('No se encontraron coincidencias con el RUC ingresado', 'Alerta', 2);
        }
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
    } else {
      this.utilsService.blockUIStart('Buscando RUC / DNI...');
      this.clienteService.sunatV1({
        dni: this.CControls.ruc.value
      }).subscribe(response => {
        this.CControls.razonSocial.setValue((response) ? response.nombres + ' ' + response.apellidoPaterno + ' ' + response.apellidoMaterno : '');
        this.CControls.direccion.setValue('');

        this.utilsService.blockUIStop();

        if (this.CControls.razonSocial.value == '' || this.CControls.razonSocial.value == null) {
          this.utilsService.showNotification('No se encontraron coincidencias con el DNI ingresado', 'Alerta', 2);
        }
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
    }
  }

  //#endregion

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

}
