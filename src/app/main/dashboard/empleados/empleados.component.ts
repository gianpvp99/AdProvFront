import { Component, Injectable, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CoreTranslationService } from '@core/services/translation.service';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { UtilsService } from "app/shared/services/utils.service";
import { FileUploader } from 'ng2-file-upload';
import { ContratistasService } from '../contratistas.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'app/shared/models/auth/user';
import { ClienteService } from '../clientes/clientes.service';
import { Page } from 'model/page';
import Stepper from 'bs-stepper';

class Params {
  ActiveDeactive: boolean;
  IdProyecto: number;

  IdCliente: number;
  IdContratista: number;
  Contratista: string;
  Ruc: string;
  Telefono: string;
  Correo: string;
  PaginaWeb: string;
  Direccion: string;
  constructor(ActiveDeactive: boolean, IdProyecto: number, IdCliente: number,
    IdContratista: number, Contratista: string, Ruc: string,
    Telefono: string, Correo: string, PaginaWeb: string, Direccion: string) {
    this.ActiveDeactive = ActiveDeactive;
    this.IdProyecto = IdProyecto;
    this.IdCliente = IdCliente;
    this.IdContratista = IdContratista;
    this.Contratista = Contratista;
    this.Ruc = Ruc;
    this.Telefono = Telefono;
    this.Correo = Correo;
    this.PaginaWeb = PaginaWeb;
    this.Direccion = Direccion;
  }
}

@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpleadosComponent implements OnInit {
  public currentUser: User;
  public contentHeader: object;
  params: Params;
  forPageOptions = [10, 25, 50, 100];
  pageExc = new Page();

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };

  empleadoSettings = { ...this.tableDefaultPageSettings };
  rowsEmpleados = [];

  rowsCliente = [];
  clienteproyectoSettings = { ...this.tableDefaultPageSettings };
  rowsProyecto = [];


  IDSubmitted = false;

  public cliente: string;
  public uploader: FileUploader = new FileUploader({
    isHTML5: true
  });

  private modernWizardStepper: Stepper;

  public notification: boolean;
  public hasBaseDropZoneOver: boolean = false;

  public EmpForm: FormGroup;

  get EControls(): { [p: string]: AbstractControl } {
    return this.EmpForm.controls;
  }

  @ViewChild(DatatableComponent) table: DatatableComponent;

  public ColumnMode = ColumnMode;
  constructor(private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private clienteService: ClienteService,
    private contratistasService: ContratistasService,
    private utilsService: UtilsService) {
    this.contentHeader = {
      headerTitle: 'Contratistas',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Empleados',
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

    this.EmpForm = this.formBuilder.group({
      title: [''],
      idEmpleado: [0],
      idContratista: [0],
      contratista: [''],
      idCliente: [0],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      nombres: ['', Validators.required],
      nroDocumento: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      idUbigeo: [''],
      idProyecto: [0],
      proyecto: [''],
      responsable: [''],
      observacion: [''],

      idRegimen: [0],

      idRegimenGeneral: [3],
      idRegimenMype: [3],
      idRegimenAgrario: [3],
      idConstruccionCivil: [3]
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.route.queryParams.subscribe(params => {
      this.params = {
        ActiveDeactive: Boolean(params.ActiveDeactive),
        IdProyecto: Number(params.IdProyecto),
        IdCliente: Number(params.IdCliente),
        IdContratista: Number(params.IdContratista),
        Contratista: String(params.Contratista),
        Ruc: String(params.Ruc),
        Telefono: String(params.Telefono),
        Correo: String(params.Correo),
        PaginaWeb: String(params.PaginaWeb),
        Direccion: String(params.Direccion)
      };
    });

    isNaN(this.params.IdCliente) ? this.params.IdCliente = 0 : this.params.IdCliente;
    console.log(this.params.IdCliente);

    this.onSetEmpleadoList();
  }

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
    console.log(this.selected);
  }

  onSelect({ selected }) {
    console.log({ selected });
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(selected);
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
          idProyecto: 0,
          proyecto: '',
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
      console.log(this.rowsCliente);


      this.pageExc.totalElements = response.clientes[0] ? response.clientes[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  };

  onContratistaCheckBox(row, AGP) {
    console.log(row.active);
    console.log();

    if (row.active) {
      console.log('NO');
    } else {
      this.clienteService.clienteProyectoGrupo_List({
        idCliente: row.idCliente,
        pageIndex: this.clienteproyectoSettings.page,
        pageSize: this.clienteproyectoSettings.pageSize
      }).subscribe(response => {
        console.log(response);
        //this.rowsGrupo = response.clienteGrupos;
        this.rowsProyecto = response.clienteProyecto;
        console.log(this.rowsProyecto);

        this.clienteproyectoSettings.colletionSize = response.clienteGrupos[0] ? response.clienteGrupos[0].totalElements : 0;
        this.utilsService.blockUIStop();
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
      setTimeout(() => {
        this.modalService.open(AGP, {
          scrollable: true,
          size: 'md',
          beforeDismiss: () => {
            return true;
          }
        });
      }, 0);

      this.EControls.idCliente.setValue(row.idCliente);
    }
  }

  onContratistaGrupoValue(row) {
    this.EControls.idProyecto.setValue(row.idProyecto);
    this.EControls.proyecto.setValue(row.proyecto);
    console.log(this.EControls.idProyecto.value);

    for (const row of this.rowsCliente) {
      if (this.EControls.idCliente.value == row.idCliente) {
        row.idProyecto = this.EControls.idProyecto.value;
        row.proyecto = this.EControls.proyecto.value;
      }
    }
  }

  onSetEmpleadoList() {
    this.utilsService.blockUIStart('Cargando listado de Empleados...');
    this.contratistasService.empleado_list({
      idCliente: this.params.IdCliente,
      idContratista: this.params.IdContratista,
      idEstado: 0,
      search: this.empleadoSettings.searchString,
      pageIndex: this.empleadoSettings.page,
      pageSize: this.empleadoSettings.pageSize
    }).subscribe(response => {
      this.rowsEmpleados = response;
      this.empleadoSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onClearFilter(): void {
    this.empleadoSettings.searchString = '';
    this.utilsService.blockUIStart("Quitando filtro...");
    this.onSetEmpleadoList();
    setTimeout(() => {
      this.utilsService.blockUIStop();
    }, 1000);
  }


  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  onEmpleadoNew(NEM: NgbModal) {
    this.onSetCliente();

    this.contratistasService.contratistaProyecto_List({
      idCliente: 0,
      idContratista: this.params.IdContratista,
      idEstado: 0,
      search: this.empleadoSettings.searchString,
      pageIndex: this.empleadoSettings.page,
      pageSize: this.empleadoSettings.pageSize
    }).subscribe(response => {
      this.rowsEmpleados = response;
      this.empleadoSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
    this.EControls.title.setValue('Registrar Información complementaria (Empleado)');
    this.EControls.idEmpleado.setValue(0);
    this.EControls.idContratista.setValue(this.params.IdContratista);
    this.EControls.contratista.setValue(this.params.Contratista);
    this.EControls.apellidoPaterno.setValue('');
    this.EControls.apellidoMaterno.setValue('');
    this.EControls.nombres.setValue('');
    this.EControls.nroDocumento.setValue('');
    this.EControls.direccion.setValue('');
    this.EControls.telefono.setValue('');
    this.EControls.idUbigeo.setValue('123');
    setTimeout(() => {
      this.modalService.open(NEM, {
        scrollable: true,
        size: 'lg',
        beforeDismiss: () => {
          return true;
        }
      });

      this.modernWizardStepper = new Stepper(document.querySelector('#stepper3'), {
        linear: false,
        animation: true
      });
    }, 0);
  }

  onEmpleadoEdit(NEM: NgbModal, row) {
    this.onSetCliente();
    this.EControls.title.setValue('Actualizar Información de (' + row.fullName + ')');
    this.EControls.idEmpleado.setValue(row.idEmpleado);
    this.EControls.idContratista.setValue(this.params.IdContratista);
    this.EControls.contratista.setValue(this.params.Contratista);
    this.EControls.apellidoPaterno.setValue(row.apellidoPaterno);
    this.EControls.apellidoMaterno.setValue(row.apellidoMaterno);
    this.EControls.nombres.setValue(row.nombres);
    this.EControls.nroDocumento.setValue(row.nroDocumento);
    this.EControls.direccion.setValue(row.direccion);
    this.EControls.telefono.setValue(row.telefono);
    //this.EControls.idUbigeo.setValue('123');

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

  onSaveEmpleado(): void {
    this.IDSubmitted = true;

    // if (this.EmpForm.invalid) {
    //   return;
    // }
    // let EmpleadoContratistaRows = [];

    // for (const row of this.rowsCliente) {
    //   if (row.active) {
    //     EmpleadoContratistaRows.push({
    //       idEmpContratista: 0,
    //       idEmpleado: this.EControls.idEmpleado,
    //       idCliente: row.idCliente,
    //       idContratista: this.params.IdContratista,
    //       idProyecto: row.idProyecto
    //     });
    //   }
    // }
    // for (const item of ClienteContratistaRows) {
    //   for (const item2 of this.rowsContratistaDropdown) {
    //     if (item.idCliente == item2.idCliente) {
    //       item.idCtrCliente = item2.idCtrCliente
    //     }
    //   }
    // }

    //this.utilsService.blockUIStart("Guardando...");

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
      // idUsuarioAud: this.currentUser.idUsuario,
      // empleadoContratistaEnlace: EmpleadoContratistaRows
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.utilsService.blockUIStop();
        this.onSetEmpleadoList();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  onDeleteEmpleado(row) {
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
        this.contratistasService.empleado_delete({
          idEmpleado: row.idEmpleado,
          idUsuarioAud: 1
        }).subscribe(response => {
          if (response.ok == 1) {
            this.utilsService.showNotification('Registro eliminado correctamente', 'Operación satisfactoria', 1);
            this.onSetEmpleadoList();
          }
          else {
            this.utilsService.showNotification(response.message, 'Error', 3);
          }
        }, error => {
          this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        });
        this.utilsService.blockUIStop();
      }
    });
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
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-info  ml-1'
      }
    }).then((result) => {
      if (result.value) {
        this.utilsService.showNotification('Información guardada correctamente', 'Operación satisfactoria', 1);
        this.modalService.dismissAll();
      }
    });
  }

  onDelete() {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Desea eliminar la cotización seleccionada?, esta acción no podrá revertirse',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-info'
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

  rowsDocumentosHomTrabajador = []
  onDocEmpleados(DEM, row) {
    this.EControls.title.setValue('Documentos del Empleado (' + row.fullName + ')');
    this.EControls.idEmpleado.setValue(row.idEmpleado);
    this.EControls.idRegimen.setValue(row.idRegimen);
    console.log(this.EControls.idRegimen.value);

    if (this.EControls.idRegimen.value == 1) {
      this.EControls.idRegimenGeneral.setValue(1);
      this.EControls.idRegimenMype.setValue(3);
      this.EControls.idRegimenAgrario.setValue(3);
      this.EControls.idConstruccionCivil.setValue(3);
    } else if (this.EControls.idRegimen.value == 2) {
      this.EControls.idRegimenGeneral.setValue(3);
      this.EControls.idRegimenMype.setValue(1);
      this.EControls.idRegimenAgrario.setValue(3);
      this.EControls.idConstruccionCivil.setValue(3);
    } else if (this.EControls.idRegimen.value == 3) {
      this.EControls.idRegimenGeneral.setValue(3);
      this.EControls.idRegimenMype.setValue(3);
      this.EControls.idRegimenAgrario.setValue(1);
      this.EControls.idConstruccionCivil.setValue(3);
    } else if (this.EControls.idRegimen.value == 4) {
      this.EControls.idRegimenGeneral.setValue(3);
      this.EControls.idRegimenMype.setValue(3);
      this.EControls.idRegimenAgrario.setValue(3);
      this.EControls.idConstruccionCivil.setValue(1);
    }

    this.rowsDocumentosHomTrabajador = [];
    this.clienteService.documentoHomEmpleado_List({
      idCliente: this.params.IdCliente,
      idProyecto: this.params.IdProyecto,
      idEmpleado: row.idEmpleado,
      idRegimenGeneral: this.EControls.idRegimenGeneral.value,
      idRegimenMype: this.EControls.idRegimenMype.value,
      idRegimenAgrario: this.EControls.idRegimenAgrario.value,
      idConstruccionCivil: this.EControls.idConstruccionCivil.value
    }).subscribe((response) => {
      for (const item of response) {
        if (item.tipoExtension != 'ADPROV') {
          this.rowsDocumentosHomTrabajador.push({
            "idHomEmpleado": item.idHomEmpleado,
            "idCliente": item.idcliente,
            "codDocumento": item.codDocumento,
            "idDocumentoName": item.idDocumentoName,
            "documentoName": item.documentoName,
            "tipoExtension": item.tipoExtension,
            "idPeriodicidad": item.idPeriodicidad,
            "idCriticidad": item.idCriticidad,
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
    setTimeout(() => {
      this.modalService.open(DEM, { windowClass: "opened", scrollable: true, backdrop: 'static' });
    }, 0);
  }

  onComentarios(row, COM: NgbModal) {
    this.EControls.observacion.setValue(row.observacion);
    setTimeout(() => {
      this.modalService.open(COM, {
        scrollable: true,
        size: 'md',
        centered: true,
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }
}



