import { Component, OnInit } from '@angular/core';
import { ContratistasService } from 'app/main/dashboard/contratistas.service';
import { UtilsService } from 'app/shared/services/utils.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ClienteService } from 'app/main/dashboard/clientes/clientes.service';

class Params {
  IdCliente: number;
  IdContratista: number;
  IdProyecto: number;
  Ruc: string;
  RazonSocial: string;
  Direccion: string;
  Telefono: string;
  Correo: string;
  PaginaWeb: string;

  Especialista: string;
  RucContratista: string;
  RazonSocialContratista: string;
  DireccionContratista: string;
  TelefonoContratista: string;
  CorreoContratista: string;
}

@Component({
  selector: 'app-empleado-contratista',
  templateUrl: './empleado-contratista.component.html',
  styleUrls: ['./empleado-contratista.component.scss']
})
export class EmpleadoContratistaComponent implements OnInit {
  public contentHeader: object;
  params: Params;

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };

  public currentDate = new Date();
  fechaContraActual = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };
  fechaTrabajo = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };
  IDSubmitted = false;
  empleadoSettings = { ...this.tableDefaultPageSettings };
  rowsEmpleados = [];
  rowsDocVencidos = [];
  rowsProyectos = [];
  rowsRegimen = [];

  public EmpForm: FormGroup;

  get EControls(): { [p: string]: AbstractControl } {
    return this.EmpForm.controls;
  }

  constructor(
    private route: ActivatedRoute,
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
            name: 'Cliente',
            isLink: false
          },
          {
            name: 'Contratistas',
            isLink: false
          },
          {
            name: 'Empleados',
            isLink: false
          }
        ]
      }
    };

    this.EmpForm = this.formBuilder.group({
      title: [''],
      idEmpleado: [0],
      idContratista: [0],
      contratista: ['', Validators.required],
      idCliente: [0],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      nombres: ['', Validators.required],
      nroDocumento: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      idUbigeo: [''],
      fechaTrabajo: [''],
      idProyecto: [0],
      idRegimen: [0],

      nameProyect: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.params = {
        IdCliente: Number(params.IdCliente),
        IdContratista: Number(params.IdContratista),
        IdProyecto: Number(params.IdProyecto),
        Ruc: String(params.Ruc),
        RazonSocial: String(params.RazonSocial),
        Direccion: String(params.Direccion),
        Telefono: String(params.Telefono),
        Correo: String(params.Correo),
        PaginaWeb: String(params.PaginaWeb),

        Especialista: String(params.Especialista),
        RucContratista: String(params.RucContratista),
        RazonSocialContratista: String(params.RazonSocialContratista),
        TelefonoContratista: String(params.TelefonoContratista),
        CorreoContratista: String(params.CorreoContratista),
        DireccionContratista: String(params.DireccionContratista)
      };
    });

    this.clienteService.dropdown({
      idTabla: 16
    }).subscribe(
      response => {
        this.rowsRegimen = response;
        this.EControls.idRegimen.setValue(response[0].idColumna);
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });

    this.onsetProyectoList();
  }

  onProyectoSelect(key, name): void {
    this.EControls.idProyecto.setValue(key);
    this.EControls.nameProyect.setValue(name);
    this.onSetEmpleadoList();
  }

  onsetProyectoList() {
    this.contratistasService.contratistaProyecto_List({
      idContratista: this.params.IdContratista,
      idProyecto: 0
    }).subscribe(response => {
      if (response.length > 0) {
        this.rowsProyectos = response;
        this.EControls.idProyecto.setValue(response[0].idProyecto);
        this.empleadoSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      }
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onSetEmpleadoList() {
    this.utilsService.blockUIStart('Cargando listado de Empleados...');
    this.contratistasService.empleado_list({
      idCliente: this.params.IdCliente,
      idProyecto: this.EControls.idProyecto.value,
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

  rowsDocVersion = [];
  async onDocumentosVencidos(row) {
    this.utilsService.blockUIStart('Cargando listado de Empleados...');
    const response = await this.contratistasService.empleado_DocPresentados_List({
      idCliente: this.params.IdCliente,
      idContratista: this.params.IdContratista,
      idEmpleado: row.idEmpleado,
      idEstado: 0,
      search: this.empleadoSettings.searchString,
      pageIndex: this.empleadoSettings.page,
      pageSize: this.empleadoSettings.pageSize
    }).toPromise().catch(error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });


    if (response) {
      const fechaActual = this.fechaContraActual.year.toString() + '-' + this.fechaContraActual.month.toString().padStart(2, '0') + '-' + this.fechaContraActual.day.toString().padStart(2, '0')
      console.log(fechaActual);

      this.rowsDocVencidos = response.filter(f => f.idPeriodicidad == 2)
      for (const item of this.rowsDocVencidos) {
        if (fechaActual >= item.fechaVencimiento) {
          console.log("fecha pasada" + item.idCtrHomEmpleado);
          this.rowsDocVersion.push({
            archivo: item.archivo,
            base64: item.base64,
            documentosSubidos: item.documentosSubidos,
            documentosTotales: item.documentosTotales,
            driveId: item.driveId,
            estado: item.estado,
            fechaVencimiento: item.fechaVencimiento,
            idCliente: item.idCliente,
            idContratista: item.idContratista,
            idCtrHomEmpleado: item.idCtrHomEmpleado,
            idDocumentoName: item.idDocumentoName,
            idEmpleado: item.idEmpleado,
            idEstado: item.idEstado,
            idHomologacion: item.idHomologacion,
            idPeriodicidad: item.idPeriodicidad,
            nombreDocumento: item.nombreDocumento,
            observacion: item.observacion,
            periodicidad: item.periodicidad,
            porcentaje: item.porcentaje,
            rutaArchivo: item.rutaArchivo,
            tamanioArchivo: item.tamanioArchivo,
            tipoExtension: item.tipoExtension,
            totalElements: item.totalElements
          })
        }
      }

      console.log(this.rowsDocVersion);

      // for (const d of this.rowsDocVersion) {
      //   await this.contratistasService.empleadoClienteHom_Delete({
      //     idCtrHomEmpleado: d.idCtrHomEmpleado,
      //     idCliente: this.params.IdCliente,
      //     idContratista: this.params.IdContratista,
      //     idEstado: 1,
      //     observacion: '',
      //     idUsuarioAud: 1
      //   }).then((response) => response, error => [])
      //     .catch(error => []);
      // }

    } else {
      this.utilsService.showNotification('[B]: An internal error has occurred', 'Error', 3);
    }

    this.utilsService.blockUIStop();
  }

  untouch: boolean;
  onEmpleadoNew(NEM: NgbModal) {
    this.untouch = false;

    this.fechaTrabajo = {
      year: this.currentDate.getFullYear(),
      month: this.currentDate.getMonth() + 1,
      day: this.currentDate.getDate()
    };

    this.EControls.nameProyect.value;
    this.idRegimen = 1;
    this.EControls.title.setValue('Registrar Información complementaria (Empleado)');
    this.EControls.idEmpleado.setValue(0);
    this.EControls.idContratista.setValue(this.params.IdContratista);
    this.EControls.contratista.setValue(this.params.RazonSocial);
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

      // this.modernWizardStepper = new Stepper(document.querySelector('#stepper3'), {
      //   linear: false,
      //   animation: true
      // });
    }, 0);
  }

  idRegimen: number;
  onEmpleadoEdit(NEM: NgbModal, row) {
    this.untouch = true;

    let dateDay: number;
    let dateMonth: number;
    let dateYear: number;

    dateDay = parseInt(row.fechaInicioProyecto.substring(8, row.fechaInicioProyecto.length), 0);
    dateMonth = parseInt(row.fechaInicioProyecto.substring(5, 7), 0);
    dateYear = parseInt(row.fechaInicioProyecto.substring(0, 4), 0);
    this.fechaTrabajo = {
      year: dateYear,
      month: dateMonth,
      day: dateDay
    };

    this.idRegimen = row.idRegimen;
    this.EControls.idRegimen.setValue(row.idRegimen);
    this.EControls.idProyecto.setValue(row.idProyecto);
    this.EControls.nameProyect.value;
    this.EControls.title.setValue('Actualizar Información de (' + row.fullName + ')');
    this.EControls.idEmpleado.setValue(row.idEmpleado);
    this.EControls.idContratista.setValue(this.params.IdContratista);
    this.EControls.contratista.setValue(this.params.RazonSocialContratista);
    this.EControls.apellidoPaterno.setValue(row.apellidoPaterno);
    this.EControls.apellidoMaterno.setValue(row.apellidoMaterno);
    this.EControls.nombres.setValue(row.nombres);
    this.EControls.nroDocumento.setValue(row.nroDocumento);
    this.EControls.direccion.setValue(row.direccion);
    this.EControls.telefono.setValue(row.telefono);

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

    if (this.EmpForm.invalid) {
      return;
    }

    this.utilsService.blockUIStart("Guardando...");

    this.contratistasService.empleado_insertupdate({
      idEmpleado: this.EControls.idEmpleado.value,
      idContratista: this.EControls.idContratista.value,
      idProyecto: this.EControls.idProyecto.value,
      fechaInicioProyecto: this.fechaTrabajo.year.toString() + this.fechaTrabajo.month.toString().padStart(2, '0') + this.fechaTrabajo.day.toString().padStart(2, '0'),
      idRegimen: this.EControls.idRegimen.value,
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
        this.utilsService.blockUIStop();
        this.onSetEmpleadoList();
      } else {
        this.utilsService.showNotification(response.message, 'Empleado Repetido', 4);
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
}
