import { Component, Injectable, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CoreTranslationService } from '@core/services/translation.service';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode, RowHeightCache } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { UtilsService } from "app/shared/services/utils.service";
import { ClienteService } from 'app/main/dashboard/clientes/clientes.service';
import { ContratistasService } from 'app/main/dashboard/contratistas.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'app/shared/models/auth/user';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';

class Params {
  IdCliente: number;
  IdContratista: number;
  IdProyecto: number;
  IdEmpleado: number;
  nroDocumento:string;
  Empleado: string;
  Ruc: string;
  RazonSocial: string;
  Direccion: string;
  Ubigeo: string;
  Telefono: string;
  Correo: string;
  PorcentajeRGeneral: number;
  PorcentajeRMype: number;
  PorcentajeRAgrario: number;
  PorcentajeCCivil: number;
  IdRegimen: number;
  Especialista: string;
  FechaCreacion: string;
}

@Component({
  selector: 'app-revision-doc-emp',
  templateUrl: './revision-doc-emp.component.html',
  styleUrls: ['./revision-doc-emp.component.scss']
})
export class RevisionDocEmpComponent implements OnInit {
  public currentUser: User;
  pdfSrc = "";
  params: Params;

  forPageOptions = [10, 25, 50, 100];

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };

  public currentDate = new Date();
  fechaEmision = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };

  fechaVenc = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };

  contratistaclienteSettings = { ...this.tableDefaultPageSettings };
  empresadocumentosSettings = { ...this.tableDefaultPageSettings };
  rowsContratistaCliente = [];
  rowsEmpleadoDocumentos = [];
  contratistasustento = [];
  totalPuntaje = [];
  rowsDocumentosHomTrabajador = [];

  distortion: boolean;
  archive: string;
  public nowYear: any;
  public day: any;
  public month: any;
  public monthText: string;

  public EmpresaHomologacion: FormGroup;
  public contentHeader: object;

  public idContratista: number;
  get AControls(): { [p: string]: AbstractControl } {
    return this.EmpresaHomologacion.controls;
  }

  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private clienteService: ClienteService,
    private contratistasService: ContratistasService) {
    this.EmpresaHomologacion = this.formBuilder.group({
      idCtrHomologacion: [0],
      idCliente: [0],
      idContratista: [0],
      estado: [''],
      observacion: ['', Validators.required],
      porcentaje: [0],
      ruc: [''],
      razonSocial: [''],
      direccion: [''],
      telefono: [''],
      correo: [''],
      idEstado: [1],
      idEstadoContratista: [1],

      idRegimenGeneral: [3],
      idRegimenMype: [3],
      idRegimenAgrario: [3],
      idConstruccionCivil: [3],
      idProyecto: [0],
      idRegimen: [0]
    });

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
            isLink: false,
            link: '/'
          },
          {
            name: 'Contratistas',
            isLink: false,
            link: '/'
          },
          {
            name: 'Empleados',
            isLink: false,
            link: '/'
          },
          {
            name: 'Documentos',
            isLink: false,
            link: '/'
          }
        ]
      }
    };
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.route.queryParams.subscribe(params => {
      console.log(params);
      this.params = {
        IdCliente: Number(params.IdCliente),
        IdContratista: Number(params.IdContratista),
        IdProyecto: Number(params.IdProyecto),
        IdEmpleado: Number(params.IdEmpleado),
        Empleado: String(params.Empleado),
        Ruc: String(params.Ruc),
        RazonSocial: String(params.RazonSocial),
        Direccion: String(params.Direccion),
        Ubigeo: String(params.Ubigeo),
        Telefono: String(params.Telefono),
        Correo: String(params.Correo),
        PorcentajeRGeneral: Number(params.PorcentajeRGeneral),
        PorcentajeRMype: Number(params.PorcentajeRMype),
        PorcentajeRAgrario: Number(params.PorcentajeRAgrario),
        PorcentajeCCivil: Number(params.PorcentajeCCivil),
        IdRegimen: Number(params.IdRegimen),
        Especialista: String(params.Especialista),
        FechaCreacion: String(params.FechaCreacion),
        nroDocumento:String(params.nroDocumento)
      };
      //console.log(params);
    });
    

    this.nowYear = this.currentDate.getFullYear();
    this.day = this.currentDate.getUTCDate();
    this.month = this.currentDate.getMonth() + 1; // 5 el monthText de hoy

    if (this.month === 1) {
      this.monthText = "Enero";
    } else if (this.month === 2) {
      this.monthText = "Febrero";
    } else if (this.month === 3) {
      this.monthText = "Marzo";
    } else if (this.month === 4) {
      this.monthText = "Abril";
    } else if (this.month === 5) {
      this.monthText = "Mayo";
    } else if (this.month === 6) {
      this.monthText = "Junio";
    } else if (this.month === 7) {
      this.monthText = "Julio";
    } else if (this.month === 8) {
      this.monthText = "Agosto";
    } else if (this.month === 9) {
      this.monthText = "Setiembre";
    } else if (this.month === 10) {
      this.monthText = "Octubre";
    } else if (this.month === 11) {
      this.monthText = "Noviembre";
    } else if (this.month === 12) {
      this.monthText = "Diciembre";
    }

    this.distortion = false;
    this.idContratista = this.params.IdContratista;
    this.AControls.idContratista.setValue(this.params.IdContratista);
    this.AControls.ruc.setValue(this.params.Ruc);
    this.AControls.razonSocial.setValue(this.params.RazonSocial);
    this.AControls.direccion.setValue(this.params.Direccion);
    this.AControls.telefono.setValue(this.params.Telefono);
    this.AControls.correo.setValue(this.params.Correo);
    if (this.params.IdRegimen == 1) {
      this.AControls.porcentaje.setValue(this.params.PorcentajeRGeneral);
    } else if (this.params.IdRegimen == 2) {
      this.AControls.porcentaje.setValue(this.params.PorcentajeRMype);
    } else if (this.params.IdRegimen == 3) {
      this.AControls.porcentaje.setValue(this.params.PorcentajeRAgrario);
    } else if (this.params.IdRegimen == 4) {
      this.AControls.porcentaje.setValue(this.params.PorcentajeCCivil);
    }
    this.onSetEmpleadoDocumentos();
    this.onSetEmpleadoDocumentosCompletos();
  }

  onSetEmpleadoDocumentosCompletos() {
    this.AControls.idRegimen.setValue(this.params.IdRegimen);

    if (this.AControls.idRegimen.value == 1) {
      this.AControls.idRegimenGeneral.setValue(1);
      this.AControls.idRegimenMype.setValue(3);
      this.AControls.idRegimenAgrario.setValue(3);
      this.AControls.idConstruccionCivil.setValue(3);
    } else if (this.AControls.idRegimen.value == 2) {
      this.AControls.idRegimenGeneral.setValue(3);
      this.AControls.idRegimenMype.setValue(1);
      this.AControls.idRegimenAgrario.setValue(3);
      this.AControls.idConstruccionCivil.setValue(3);
    } else if (this.AControls.idRegimen.value == 3) {
      this.AControls.idRegimenGeneral.setValue(3);
      this.AControls.idRegimenMype.setValue(3);
      this.AControls.idRegimenAgrario.setValue(1);
      this.AControls.idConstruccionCivil.setValue(3);
    } else if (this.AControls.idRegimen.value == 4) {
      this.AControls.idRegimenGeneral.setValue(3);
      this.AControls.idRegimenMype.setValue(3);
      this.AControls.idRegimenAgrario.setValue(3);
      this.AControls.idConstruccionCivil.setValue(1);
    }

    this.rowsDocumentosHomTrabajador = [];
    this.clienteService.documentoHomEmpleado_List({
      idCliente: this.params.IdCliente,
      idProyecto: this.params.IdProyecto,
      idEmpleado: this.params.IdEmpleado,
      idRegimenGeneral: this.AControls.idRegimenGeneral.value,
      idRegimenMype: this.AControls.idRegimenMype.value,
      idRegimenAgrario: this.AControls.idRegimenAgrario.value,
      idConstruccionCivil: this.AControls.idConstruccionCivil.value
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
  }

  onSetEmpleadoDocumentos() {
    this.utilsService.blockUIStart('Cargando listado de Contratistas...');
    this.contratistasService.empleado_DocPresentados_List({
      idCliente: this.params.IdCliente,
      idContratista: this.params.IdContratista,
      idEmpleado: this.params.IdEmpleado,
      idEstado: this.AControls.idEstado.value,
      search: this.empresadocumentosSettings.searchString,
      pageIndex: this.empresadocumentosSettings.page,
      pageSize: this.empresadocumentosSettings.pageSize
    }).subscribe(response => {
      this.rowsEmpleadoDocumentos = response;

      console.log('Estamos Aquí')
      console.log(this.rowsEmpleadoDocumentos)

      if (response.length > 0) {
        this.empresadocumentosSettings.colletionSize = response ? response[0].totalElements : 0;
      }
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onAprobarArchivo(row, state) {
    this.AControls.idCtrHomologacion.setValue(row.idCtrHomEmpleado);
    this.AControls.idCliente.setValue(row.idCliente);
    this.AControls.observacion.setValue('');
    this.AControls.estado.setValue(state);
    // row.idEstado = state;
    // row.estado = state == 2 ? 'Aprobado' : 'Desaprobado';
    //row.motivo = '';
    this.onAprobarDocumentoHomologacion()
    
  }

  onDesaprobarArchivo(modal: NgbModal, row, state) {
    this.openMD(modal);
    this.AControls.idCtrHomologacion.setValue(row.idCtrHomEmpleado);
    this.AControls.idCliente.setValue(row.idCliente);
    this.AControls.observacion.setValue('');
    this.AControls.estado.setValue(state);
  }

  openMD(modalDesaprove) {
    setTimeout(() => {
      this.modalService.open(modalDesaprove, {
        scrollable: true,
        size: 'sm',
        centered: true,
        backdrop: 'static',
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  async onAprobarDocumentoHomologacion() {
    this.modalService.dismissAll();
    for (const item of this.rowsEmpleadoDocumentos) {
      if (item.idCtrHomEmpleado === this.AControls.idCtrHomologacion.value) {
        item.idEstado = 2;
        item.estado = 'Aprobado';
        item.motivo = ''
        //this.AControls.observacion.value
      }
    }
  }

  async onDesaprobarDocumentoHomologacion() {
    this.modalService.dismissAll();
    for (const item of this.rowsEmpleadoDocumentos) {
      if (item.idCtrHomEmpleado === this.AControls.idCtrHomologacion.value) {
        item.idEstado = 3;
        item.estado = 'Observado';
        item.motivo = this.AControls.observacion.value
      }
    }
  }


  name: string;
  onVisualizadorPdf(row, modal: NgbModal) {
    this.name = row.nombreDocumento;
    // let split; split = row.rutaArchivo.split("/");
    // console.log(row.rutaArchivo.split("/"));
    // let zero; zero = split[0] + '//';
    // let one; one = split[1] + '/';
    // let two; two = split[2] + '/';
    // let three; three = split[3] + '/';
    // let four; four = split[4] + '/';
    // let five; five = split[5] + '/';
    // let six; six = split[6] + '/';
    // let seven; seven = `${encodeURIComponent(split[7])}`;
    // console.log(seven);

    // //this.pdfSrc = "http://localhost:25846/public/homologacion/6/AlcanceCapacitaci%C3%B3n.pdf";
    // // if (row.tipoExtension == 'pdf') {
    // this.pdfSrc = zero + '' + one + '' + two + '' +
    //   '' + three + '' + four + '' + five + '' + six + '' + seven;  

    if (row.driveId == '') {
      let split; split = row.rutaArchivo.split("/");
      console.log(row.rutaArchivo.split("/"));
      let zero; zero = split[0] + '//';
      let one; one = split[1] + '/';
      let two; two = split[2] + '/';
      let three; three = split[3] + '/';
      let four; four = split[4] + '/';
      let five; five = split[5] + '/';
      let six; six = split[6] + '/';
      let seven; seven = split[7] + '/';
      let eight; eight = split[8] + '/';
      let nine; nine = `${encodeURIComponent(split[9])}`;
      this.pdfSrc = zero + '' + one + '' + two + '' +
        '' + three + '' + four + '' + five + '' + six + '' + seven + '' + eight + '' + nine;

    } else {
      this.pdfSrc = "https://drive.google.com/file/d/" + row.driveId + "/preview";
    }



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

  idCtrHomEmpleado: number;
  onFechaVencimiento(row, modal: NgbModal) {
    this.idCtrHomEmpleado = row.idCtrHomEmpleado;
    // console.log(row.fechaVencimiento);

    if (row.fechaVencimiento == '1900-01-01') {
      this.fechaVenc = {
        year: this.currentDate.getFullYear(),
        month: this.currentDate.getMonth() + 1,
        day: this.currentDate.getDate()
      };
    } else {
      let dateDay: number;
      let dateMonth: number;
      let dateYear: number;

      dateDay = parseInt(row.fechaVencimiento.substring(8, row.fechaVencimiento.length), 0);
      dateMonth = parseInt(row.fechaVencimiento.substring(5, 7), 0);
      dateYear = parseInt(row.fechaVencimiento.substring(0, 4), 0);
      this.fechaVenc = {
        year: dateYear,
        month: dateMonth,
        day: dateDay
      };

    }

    setTimeout(() => {
      this.modalService.open(modal, {
        scrollable: true,
        size: 'md',
        centered: true,
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  height = 130;
  value = 1;
  fechaVenctest(value) {
    if (value == 1) {
      this.height += 270;
      value++;
      this.value++;
    }
    // console.log(value);
  }

  saveFechaVenc() {
    this.contratistasService.empleadoClienteHom_Update({
      idCtrHomEmpleado: this.idCtrHomEmpleado,
      fechaVenc: this.fechaVenc.year.toString() + this.fechaVenc.month.toString().padStart(2, '0') + this.fechaVenc.day.toString().padStart(2, '0'),
      idUsuarioAud: this.currentUser.idUsuario,
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.onSetEmpleadoDocumentos();
        this.modalService.dismissAll();
        this.utilsService.blockUIStop();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
    this.value = 1;
    this.height = 130;
  }

  async onConfirmar(): Promise<void> {
    if (this.rowsEmpleadoDocumentos.filter(x => x.idEstado !== 1).length == 0) {
      this.utilsService.showNotification('No hay registros modificados', 'Alerta', 2);
      return;
    }

    Swal.fire({
      title: 'Confirmación',
      text: `¿Desea guardar todos los cambios"?, esta acción no podrá revertirse`,
      icon: 'question',
      animation: true,
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      }
    }).then(result => {
      if (result.value) {
        this.onGuardar();
      }
    });
  }

  async onGuardar(): Promise<void> {
    for (const item of this.rowsEmpleadoDocumentos) {
      if (item.idEstado == 2) {
        await this.contratistasService.empleadoClienteHom_Delete({
          idCtrHomEmpleado: item.idCtrHomEmpleado,
          idCliente: item.idCliente,
          idContratista: this.idContratista,
          idEstado: item.idEstado,
          observacion: item.motivo,
          idUsuarioAud: 1
        }).then((response) => response, error => [])
          .catch(error => []);
      } else if (item.idEstado == 3) {
        await this.contratistasService.empleadoClienteHom_Delete({
          idCtrHomEmpleado: item.idCtrHomEmpleado,
          idCliente: item.idCliente,
          idContratista: this.idContratista,
          idEstado: item.idEstado,
          observacion: item.motivo,
          idUsuarioAud: 1
        }).then((response) => response, error => [])
          .catch(error => []);

        await this.contratistasService.deleteEmp_files({
          driveId: item.driveId,
        }).subscribe(response => {
          if (response) {
            console.log("Ok pass");
          } else {
            console.log("something Wrong");
          }
        }, error => {
        });
      }
    }

    this.utilsService.showNotification('Guardando los cambios...', 'Operación satisfactoria', 1);
    this.onSetEmpleadoDocumentos();

    this.contratistasService.contratistaEmpleado_UpdateEstado({
      idCliente: this.params.IdCliente,
      IdClienteProyecto: this.params.IdProyecto,
      idEmpleado: this.params.IdEmpleado,
      idRegimen: this.params.IdRegimen,
      idUsuarioAud: 1
    }).subscribe(response => {
      if (response.ok) {
      } else {
      }
    }, error => {
    });
  }

  onDeshacerCambios(): void {
    Swal.fire({
      title: 'Confirmación',
      text: `¿Desea deshacer todos los cambios"?, esta acción no podrá revertirse`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      }
    }).then(result => {
      if (result.value) {
        for (const item of this.rowsEmpleadoDocumentos) {
          item.idEstado = 1;
          item.estado = 'Pendiente';
          item.motivo = '';
        }
      }
    });
  }

  onClickBtn(value) {
    this.AControls.idEstado.setValue(value);
    this.onSetEmpleadoDocumentos();
    this.distortion = false;
  }
}
