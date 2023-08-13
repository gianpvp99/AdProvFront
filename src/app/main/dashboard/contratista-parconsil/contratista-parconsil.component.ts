import { Component, Injectable, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode, DatatableComponent, RowHeightCache, SelectionType } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { UtilsService } from "app/shared/services/utils.service";
import Stepper from 'bs-stepper';
import { ContratistasService } from '../contratistas.service';
import { ClienteService } from '../clientes/clientes.service';
import { User } from 'app/shared/models/auth/user';

export class Page {
  size = 0;
  totalElements = 0;
  pageNumber = 0;
}

@Component({
  selector: 'app-contratista-parconsil',
  templateUrl: './contratista-parconsil.component.html',
  styleUrls: ['./contratista-parconsil.component.scss'],
  encapsulation: ViewEncapsulation.None
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContratistaParconsilComponent implements OnInit {
  public currentUser: User;
  public contentHeader: object;
  public ColumnMode = ColumnMode;

  configTable: any = {
    page: new Page(),
    columnMode: ColumnMode.force,
    rows: [],
  };

  forPageOptions = [10, 25, 50, 100];

  procesar: boolean = true;

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };


  tableDefaultPageSetting2 = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 4
  };

  contratistaclienteSettings = { ...this.tableDefaultPageSettings };
  rowsContratistaClientes = [];

  contratistaSettings = { ...this.tableDefaultPageSettings };
  rowsContratista = [];

  empleadoSettings = { ...this.tableDefaultPageSettings };
  rowsEmpleado = [];

  contratistadropdownSettings = { ...this.tableDefaultPageSettings };
  rowsContratistaDropdown = [];

  rowsCliente = [];

  clientegrupoSettings = { ...this.tableDefaultPageSettings };
  rowsGrupo = [];

  public passwordTextTypeOld: boolean;
  public passwordTextTypeNew: boolean;
  public passwordTextTypeEqual: boolean;

  flagcontra = false;
  public anio = [];
  public meses = [];

  Empleadosrows = [];
  aniodate: string;
  mes: string;
  mesvalue: number;
  resultdate: string;
  sesionPerfil: number;
  displayable: any;
  idEstadoEmpleado = 1;
  public notification: boolean;
  public hasBaseDropZoneOver: boolean = false;

  public rowsRegimen = [];
  nombres: string;
  empleado: string;
  email: string;
  dni: string;
  idTipo: number;

  pageExc = new Page();

  rowsTipoDoc = [];

  public rowsNivel = [];
  public rowsPeriodo = [];
  idNivel: number;
  idPeriodo: number;
  Value: number;
  IDSubmitted = false;

  public currentDate = new Date();
  fechaIngreso = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };

  fechaCierre = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };

  selectedRowIds: number[] = [];
  selectedDiscRowIds: number[] = [];
  activated = false;

  private modernWizardStepper: Stepper;
  private modernWizardStepper2: Stepper;

  public ConForm: FormGroup;
  public General: FormGroup;


  get CControls(): { [p: string]: AbstractControl } {
    return this.ConForm.controls;
  }

  get Controls(): { [p: string]: AbstractControl } {
    return this.General.controls;
  }

  @ViewChild(DatatableComponent) table: DatatableComponent;

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
            name: 'Inicio',
            isLink: false,
            link: '/'
          },
          {
            name: 'Contratistas',
            isLink: false
          }
        ]
      }
    };

    this.ConForm = this.formBuilder.group({
      idContratista: [0],
      idCliente: [0],
      contratistaUser: ['', Validators.required],
      cliente: [''],
      ruc: [''],
      razonSocial: [''],
      direccion: [''],
      telefono: [''],
      correo: ['', Validators.required],
      fechaIngreso: ['', Validators.required],
      fechaCierre: ['', Validators.required],
      idRegimen: [1],
      idUbigeo: [''],
      idEstado: [1],
      idGrupo: [0],
      grupo: [''],

      personaNombres: [''],
      personaIdTipoDoc: [1],
      personaDoc: [''],
      personaNacyRes: [''],
      personaDom: [''],
      personaPuesto: [''],
      personaTelefono: [''],
      personaCorreo: [''],
    });

    this.General = this.formBuilder.group({
      idCliente: [0],
      sesionPerfil: [0],

      clave: [{ value: '', disabled: true }],
      ruc: [{ value: '', disabled: true }],
      razonSocial: [{ value: '', disabled: true }],
      direccion: [{ value: '', disabled: true }],
      provincia: [{ value: '', disabled: true }],
      distrito: [{ value: '', disabled: true }],
      paginaWeb: [{ value: '', disabled: true }],
      fechaConstitucion: [''],
      telefono: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.Controls.sesionPerfil.setValue(this.currentUser.idPerfil);
    this.Value = 1;
    this.idNivel = 1;
    this.idTipo = 1;
    this.idPeriodo = 1;
    this.sesionPerfil == 3 ? this.displayable = true : this.displayable = false;
    this.onSetCliente();
    this.onContratistaList();
    this.DataMaster();
  }

  modernHorizontalNext(): void {
    this.modernWizardStepper.next();
  }

  modernHorizontalPrevious(): void {
    this.modernWizardStepper.previous();
  }

  //#region  🢃 TABLAS MAESTRA 🢃
  DataMaster() {
    this.clienteService.dropdown({
      idTabla: 5
    }).subscribe((response) => {
      this.rowsTipoDoc = response;
    }, error => {
      this.utilsService.showNotification('Cargando documentos Empresa', 'Alert', 2);
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
      idTabla: 13
    }).subscribe(
      response => {
        this.rowsPeriodo = response;
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

  public SelectionType = SelectionType;

  public basicSelectedOption: number = 10;

  public selected = [];

  onActivate(event) {
    // console.log('Activate Event', event);
  }

  allRowsSelected: boolean = false;
  MultiS(allRowsSelected) {
    console.log(allRowsSelected, 'evento de seleccion multiple');

    if (allRowsSelected) {
      for (const item of this.rowsCliente) {
        if (item.docsConfigurados) {
          item.active = true;
        }
      }
    }
    else {
      for (const item of this.rowsCliente) {
        item.active = false;
      }
    }
  }

  onSelect({ selected }) {
    console.log({ selected });
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onSetCliente() {
    this.utilsService.blockUIStart('Cargando listado de Clientes...');
    this.clienteService.cliente_Dropdown(
    ).subscribe(response => {
      this.rowsCliente = [];
      for (const row of response.clientes) {
        this.rowsCliente.push({
          "active": row.active,
          "idCliente": row.idCliente,
          idClienteGrupo: 0,
          grupo: '',
          "ruc": row.ruc,
          "razonSocial": row.razonSocial,
          "direccion": row.direccion,
          "telefono": row.telefono,
          "correo": row.correo,
          "docsConfigurados": row.docsConfigurados,
          "nombres": row.nombres,
          "fechaCreacion": row.fechaCreacion,
          "asignado": false
        })
      }

      this.pageExc.totalElements = response.clientes[0] ? response.clientes[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  };

  onContratistaClienteList(row) {
    this.contratistasService.contratistaCliente_List({
      idCliente: 0,
      idContratista: row.idContratista,
      idEstado: 0,
      search: this.contratistadropdownSettings.searchString,
      pageIndex: this.contratistadropdownSettings.page,
      pageSize: 9999
    }).subscribe(response => {
      this.rowsContratistaDropdown = response.contratistaCliente;
      for (const row of this.rowsContratistaDropdown) {
        for (const item of this.rowsCliente) {
          if (item.idCliente == row.idCliente && !row.flagEliminado) {
            item.active = true;
          }
        }
      }

      // this.contratistasustento = [];
      // for (const row of response[0].contratistaDocumento) {
      //   this.contratistasustento.push({
      //     "idCtrHomologacion": row.idCtrHomologacion,
      //     "idCliente": row.idCliente,
      //     "tipoExtension": row.tipoExtension,
      //     "archivo": row.archivo,
      //     "estado": row.estado,
      //     "resultbyPerc": row.resultbyPerc,
      //     "rutaArchivo": row.rutaArchivo,
      //     "porcentaje": row.porcentaje
      //   })
      // }

      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  //#region   🢃 CONTRATISTAS 🢃

  onClearFilter(): void {
    this.contratistaSettings.searchString = '';
    this.utilsService.blockUIStart("Limpiando filtro...");
    this.onContratistaList();
    setTimeout(() => {
      this.utilsService.blockUIStop();
    }, 1000);
  }

  onContratistaList() {
    this.utilsService.blockUIStart('Cargando listado de Contratistas...');
    this.contratistasService.contratista_list({
      idContratista: 0,
      idEstado: 0,
      search: this.contratistaSettings.searchString,
      pageIndex: this.contratistaSettings.page,
      pageSize: this.contratistaSettings.pageSize
    }).subscribe(response => {
      this.rowsContratista = response;
      this.contratistaSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });

  }

  onNewContratista(NCT: NgbModal) {
    this.onSetCliente();
    this.IDSubmitted = false;
    this.CControls.idContratista.setValue(0);
    this.CControls.idCliente.setValue(0);
    this.CControls.contratistaUser.setValue('');
    this.CControls.cliente.setValue('');
    this.CControls.ruc.setValue('');
    this.CControls.razonSocial.setValue('');
    this.CControls.direccion.setValue('');
    this.CControls.idUbigeo.setValue('');
    this.CControls.telefono.setValue('');
    this.CControls.correo.setValue('');

    this.fechaIngreso = {
      year: this.currentDate.getFullYear(),
      month: this.currentDate.getMonth() + 1,
      day: this.currentDate.getDate()
    };
    this.fechaCierre = {
      year: this.currentDate.getFullYear(),
      month: this.currentDate.getMonth() + 1,
      day: this.currentDate.getDate()
    };

    setTimeout(() => {
      this.modalService.open(NCT, {
        scrollable: true,
        size: 'lg',
        beforeDismiss: () => {
          return true;
        }
      });

      this.modernWizardStepper2 = new Stepper(document.querySelector('#stepper1'), {
        linear: false,
        animation: true
      });
    }, 0);
  }

  onContratistaCheckBox(row, AGP) {    
    if (row.active) {
      console.log('NO');
    } else {
      this.clienteService.clienteProyectoGrupo_List({
        idCliente: row.idCliente,
        pageIndex: this.clientegrupoSettings.page,
        pageSize: this.clientegrupoSettings.pageSize
      }).subscribe(response => {
        console.log(response);
        this.rowsGrupo = response.clienteGrupos;
        //this.rowsProyecto = response.clienteProyecto;
        this.clientegrupoSettings.colletionSize = response.clienteGrupos[0] ? response.clienteGrupos[0].totalElements : 0;
        this.utilsService.blockUIStop();
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
      setTimeout(() => {
        this.modalService.open(AGP, {
          scrollable: true,
          backdrop: 'static',
          size: 'md',
          beforeDismiss: () => {
            return true;
          }
        });
      }, 0);

      this.Controls.idCliente.setValue(row.idCliente);
    }
  }

  onContratistaGrupoValue(row) {
    this.CControls.idGrupo.setValue(row.idClienteGrupo);
    this.CControls.grupo.setValue(row.nombreGrupo);

    for (const row of this.rowsCliente) {
      if (this.Controls.idCliente.value == row.idCliente) {
        row.idClienteGrupo = this.CControls.idGrupo.value;
        row.grupo = this.CControls.grupo.value;
      }
    }
  }

  personaIdTipoDoc: number;
  onContratistaEdit(CDT: NgbModal, row) {
    this.onContratistaClienteList(row);
    this.CControls.idContratista.setValue(row.idContratista);
    this.Controls.ruc.setValue(row.ruc);
    this.Controls.clave.setValue(row.clave);
    this.Controls.razonSocial.setValue(row.razonSocial);
    this.Controls.direccion.setValue(row.direccion);
    this.Controls.provincia.setValue(row.provincia);
    this.Controls.distrito.setValue(row.distrito);
    this.Controls.paginaWeb.setValue(row.paginaWeb);
    this.Controls.fechaConstitucion.setValue(row.fechaConstitucion);
    this.Controls.telefono.setValue(row.telefono);

    this.personaIdTipoDoc = row.personaIdTipoDoc;
    this.CControls.personaNombres.setValue(row.personaNombres);
    this.CControls.personaIdTipoDoc.setValue(row.personaIdTipoDoc);
    this.CControls.personaDoc.setValue(row.personaDoc);
    this.CControls.personaNacyRes.setValue(row.personaNacyRes);
    this.CControls.personaDom.setValue(row.personaDom);
    this.CControls.personaPuesto.setValue(row.personaPuesto);
    this.CControls.personaTelefono.setValue(row.personaTelefono);
    this.CControls.personaCorreo.setValue(row.personaCorreo);


    let dateDay: number;
    let dateMonth: number;
    let dateYear: number;

    dateDay = parseInt(row.fechaIngreso.substring(8, row.fechaIngreso.length), 0);
    dateMonth = parseInt(row.fechaIngreso.substring(5, 7), 0);
    dateYear = parseInt(row.fechaIngreso.substring(0, 4), 0);
    this.fechaIngreso = {
      year: dateYear,
      month: dateMonth,
      day: dateDay
    };

    dateDay = parseInt(row.fechaCierre.substring(8, row.fechaCierre.length), 0);
    dateMonth = parseInt(row.fechaCierre.substring(5, 7), 0);
    dateYear = parseInt(row.fechaCierre.substring(0, 4), 0);
    this.fechaCierre = {
      year: dateYear,
      month: dateMonth,
      day: dateDay
    };



    setTimeout(() => {
      this.modalService.open(CDT, {
        scrollable: true,
        size: 'lg',
        beforeDismiss: () => {
          return true;
        }
      });

      this.modernWizardStepper = new Stepper(document.querySelector('#stepper3'), {
        linear: false,
        animation: false
      });
    }, 0);
  }

  SaveContratista(): void {
    this.IDSubmitted = true;

    if (this.ConForm.invalid) {
      return;
    }

    let ClienteContratistaRows = [];

    for (const row of this.rowsCliente) {
      if (row.active) {
        ClienteContratistaRows.push({
          idCtrCliente: 0,
          idCliente: row.idCliente,
          idContratista: 0,
          idClienteGrupo: row.idClienteGrupo
        });
      }
    }

    console.log(ClienteContratistaRows);
    

    let fechadesdenum = 0;
    let fechahastanum = 0;
    let caducidad = '';

    //clean year to fromdate and todate
    fechadesdenum = parseInt(this.fechaIngreso.year.toString() + this.fechaIngreso.month.toString().padStart(2, '0') + this.fechaIngreso.day.toString().padStart(2, '0'));
    fechahastanum = parseInt(this.fechaCierre.year.toString() + this.fechaCierre.month.toString().padStart(2, '0') + this.fechaCierre.day.toString().padStart(2, '0'));

    caducidad = this.fechaCierre.day.toString().padStart(2, '0') + '-' + this.fechaCierre.month.toString().padStart(2, '0') + '-' + this.fechaCierre.year.toString();

    if (fechahastanum < fechadesdenum) {
      this.utilsService.showNotification('La FECHA CIERRE no puede ser menor a la FECHA INGRESO', 'Alerta', 2);
      return;
    }

    for (const ret of this.rowsContratista) {
      if (ret.contratistaUser == this.CControls.contratistaUser.value) {
        Swal.fire({
          icon: 'error', title: 'Contratista Existente', text: 'El contratista que quiere agregar ya ha sido creado anteriormente.', showConfirmButton: false, timer: 3000
        });
        return;
      }
      else {
        console.log(" NO REPETIDO");
      }
    }

    if (ClienteContratistaRows.length < 1) {
      Swal.fire({
        icon: 'warning', title: 'Cliente no asignado.', text: 'El contratista no ha sido asignado a ningún Cliente.', showConfirmButton: false, timer: 2000
      });
      return;
    }

    this.utilsService.blockUIStart("Guardando...");
    this.contratistasService.contratistaLogin_insert({
      idContratista: this.CControls.idContratista.value,
      contratistaUser: this.CControls.contratistaUser.value,
      clave: '',
      ruc: this.CControls.contratistaUser.value,
      razonSocial: this.CControls.razonSocial.value,
      direccion: this.CControls.direccion.value,
      correo: this.CControls.correo.value,
      caducidad: caducidad,
      fechaIngreso: this.fechaIngreso.year.toString() + this.fechaIngreso.month.toString().padStart(2, '0') + this.fechaIngreso.day.toString().padStart(2, '0'),
      fechaCierre: this.fechaCierre.year.toString() + this.fechaCierre.month.toString().padStart(2, '0') + this.fechaCierre.day.toString().padStart(2, '0'),
      idUsuarioAud: this.currentUser.idUsuario,
      contratistaClienteEnlace: ClienteContratistaRows
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.utilsService.showNotification('Cargando contenido del correo', 'Enviando...', 4);
        this.modalService.dismissAll();
        this.utilsService.blockUIStop();
        this.onContratistaList();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onContratistaUpdate(): void {
    let ClienteContratistaRows = [];
    for (const row of this.rowsCliente) {
      if (row.active) {
        ClienteContratistaRows.push({
          "idCtrCliente": 0,
          "idCliente": row.idCliente,
          "idContratista": 0,
          idClienteGrupo: row.idClienteGrupo
        });
      }
    }

    for (const item of ClienteContratistaRows) {
      for (const item2 of this.rowsContratistaDropdown) {
        if (item.idCliente == item2.idCliente) {
          item.idCtrCliente = item2.idCtrCliente
        }
      }
    }

    let fechadesdenum = 0;
    let fechahastanum = 0;
    //zfill(number, width)

    //clean year to fromdate and todate
    fechadesdenum = parseInt(this.fechaIngreso.year.toString() + this.fechaIngreso.month.toString().padStart(2, '0') + this.fechaIngreso.day.toString().padStart(2, '0'));
    fechahastanum = parseInt(this.fechaCierre.year.toString() + this.fechaCierre.month.toString().padStart(2, '0') + this.fechaCierre.day.toString().padStart(2, '0'));

    if (fechahastanum < fechadesdenum) {
      this.utilsService.showNotification('La FECHA CIERRE no puede ser menor a la FECHA INGRESO', 'Alerta', 2);
      return;
    }

    this.utilsService.blockUIStart("Guardando...");
    this.contratistasService.contratistaLogin_insert({
      idContratista: this.CControls.idContratista.value,
      contratistaUser: this.CControls.contratistaUser.value,
      clave: '',
      ruc: this.CControls.contratistaUser.value,
      razonSocial: this.CControls.razonSocial.value,
      direccion: this.CControls.direccion.value,
      correo: this.CControls.correo.value,
      fechaIngreso: this.fechaIngreso.year.toString() + this.fechaIngreso.month.toString().padStart(2, '0') + this.fechaIngreso.day.toString().padStart(2, '0'),
      fechaCierre: this.fechaCierre.year.toString() + this.fechaCierre.month.toString().padStart(2, '0') + this.fechaCierre.day.toString().padStart(2, '0'),
      idUsuarioAud: this.currentUser.idUsuario,
      contratistaClienteEnlace: ClienteContratistaRows
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.utilsService.blockUIStop();
        this.onContratistaList();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onDeleteContratista(row) {
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
        this.contratistasService.contratista_delete({
          idContratista: row.idContratista,
          idUsuarioAud: this.currentUser.idUsuario
        }).subscribe(response => {
          if (response.ok == 1) {
            this.utilsService.showNotification('Registro eliminado correctamente', 'Operación satisfactoria', 1);
            this.onContratistaList();
          }
          else {
            this.utilsService.showNotification(response.message, 'Error', 3);
          }
        }, error => {
          this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        });
      }
    });
  }

  onDocumentoSearch(): void {
    if (this.CControls.contratistaUser.value == '') {
      this.utilsService.showNotification('Ingrese un N° documento válido', 'Alerta', 2)
      return;
    } else if (this.CControls.contratistaUser.value.length != 11) {
      this.utilsService.showNotification('La cantidad de dígitos debe ser 11 (RUC)', 'Alerta', 2)
      return;
    }

    const digitCount = (this.CControls.contratistaUser.value).length;

    if (digitCount == 11) {
      this.utilsService.blockUIStart('Buscando RUC...');
      this.clienteService.sunatV2({
        documento: this.CControls.contratistaUser.value
      }).subscribe(response => {
        this.CControls.razonSocial.setValue((response) ? response.razonSocial : '');
        this.CControls.direccion.setValue((response) ? response.direccion : '');

        this.utilsService.blockUIStop();
        if (this.CControls.razonSocial.value == '' || this.CControls.razonSocial.value == null) {
          Swal.fire({
            icon: 'error', title: "<b style='color: blue'>S U N A T ⠀A P I</b>", text: 'No se encontraron coincidencias con el RUC ingresado.', showConfirmButton: false, timer: 2000
          });
        } else {
          Swal.fire({
            icon: 'success', title: "<b style='color: blue'>S U N A T ⠀A P I</b>", text: 'RUC encontrado exitosamente.', showConfirmButton: false, timer: 2000
          });
        }

      }, error => {
        this.utilsService.showNotification('Por favor verificar que sea un RUC valido', 'info', 4);
        this.utilsService.blockUIStop();
      });
    }
  }
  //#endregion

  mostrarClave(value) {
    if (value == 1) {
      this.passwordTextTypeOld = !this.passwordTextTypeOld;
    }
    else if (value == 2) {
      this.passwordTextTypeNew = !this.passwordTextTypeNew;
    }
    else {
      this.passwordTextTypeEqual = !this.passwordTextTypeEqual;
    }
  }
}
