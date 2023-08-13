import { Component, Injectable, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode, RowHeightCache } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { UtilsService } from "app/shared/services/utils.service";
import { ClienteService } from '../../clientes/clientes.service';
import { ContratistasService } from '../../contratistas.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'app/shared/models/auth/user';

class Params {
  IdCliente: number;
  IdClienteGrupo: number;
  NombreGrupo: string;
  IdContratista: number;
  Contratista: string;
  Ruc: string;
  ContratistaRuc: string;
  RazonSocial: string;
  Direccion: string;
  Ubigeo: string;
  Telefono: string;
  Correo: string;
  CorreoContratista: string;
  Porcentaje: number;
  Especialista: string;
  FechaCreacion: string;
}

@Component({
  selector: 'app-revision-doc',
  templateUrl: './revision-doc.component.html',
  styleUrls: ['./revision-doc.component.scss']
})
export class RevisionDocComponent implements OnInit {
  pdfSrc = "";
  params: Params;
  public currentUser: User;
  forPageOptions = [10, 25, 50, 100];

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 999
  };

  public currentDate = new Date();
  fechaEmision = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };

  empresadocumentosSettings = { ...this.tableDefaultPageSettings };
  rowsContratistaCliente = [];
  rowsEmpresaDocumentos = [];
  rowsDrive = [];
  contratistasustento = [];
  totalPuntaje = [];

  rowsDocumentos = [];
  rowsGrupos = [];

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

      idGrupo: [1],
      driveId: ['']
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
      this.params = {
        IdCliente: Number(params.IdCliente),
        IdClienteGrupo: Number(params.IdClienteGrupo),
        NombreGrupo: String(params.NombreGrupo),
        IdContratista: Number(params.IdContratista),
        Contratista: String(params.Contratista),
        Ruc: String(params.Ruc),
        ContratistaRuc: String(params.ContratistaRuc),
        RazonSocial: String(params.RazonSocial),
        Direccion: String(params.Direccion),
        Ubigeo: String(params.Ubigeo),
        Telefono: String(params.Telefono),
        Correo: String(params.Correo),
        CorreoContratista: String(params.CorreoContratista),
        Porcentaje: Number(params.Porcentaje),
        Especialista: String(params.Especialista),
        FechaCreacion: String(params.FechaCreacion)
      };
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
    this.AControls.porcentaje.setValue(this.params.Porcentaje);
    this.onSetEmpresaDocumentos();
    this.onSetEmpresaDocumentosCompletos();
    this.onSetDriveDocumentos();
  }

  onSetDriveDocumentos() {
    this.clienteService.drive_List().subscribe(response => {
      this.rowsDrive = response;
      console.log(this.rowsDrive);

    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  onSetEmpresaDocumentosCompletos() {
    this.rowsDocumentos = [];

    this.clienteService.contratistaGrupo_List({
      idCliente: this.params.IdCliente,
      idContratista: this.params.IdContratista,
      pageIndex: 1,
      pageSize: 999
    }).subscribe((response) => {
      this.rowsGrupos = response;
      this.AControls.idGrupo.setValue(response[0].idClienteGrupo);

      this.clienteService.documentoHomEmpresa_List({
        idCliente: this.params.IdCliente,
        idClienteGrupo: this.AControls.idGrupo.value,
        idContratista: this.params.IdContratista
      }).subscribe((response) => {
        for (const item of response) {
          if (item.tipoExtension != 'ADPROV') {
            this.rowsDocumentos.push({
              "idHomologacion": item.idHomologacion,
              "idCtrHomologacion": item.idCtrHomologacion,
              "idGeneral": item.idGeneral,
              "idCliente": item.idcliente,
              "idDocumentoName": item.idDocumentoName,
              "documentoName": item.documentoName,
              "tipoExtension": item.tipoExtension,
              "aplica": (item.aplica) ? true : false,
              "disabled": (item.aplica) ? true : false,
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
    });
  }

  onSetEmpresaDocumentos() {
    this.utilsService.blockUIStart('Cargando listado de Contratistas...');
    this.contratistasService.empresadocpresentados_List({
      idCliente: this.params.IdCliente,
      idContratista: this.AControls.idContratista.value,
      idEstado: this.AControls.idEstado.value,
      search: this.empresadocumentosSettings.searchString,
      pageIndex: this.empresadocumentosSettings.page,
      pageSize: this.empresadocumentosSettings.pageSize,
      nombreContratista: this.params.Contratista,
      fecha: this.fechaEmision.year.toString() + '-' + this.fechaEmision.month.toString().padStart(2, '0') + '-' + this.fechaEmision.day.toString().padStart(2, '0')
    }).subscribe(response => {
      this.rowsEmpresaDocumentos = response;
      this.summaryForPuntaje();
      if (response.length > 0) {
        this.empresadocumentosSettings.colletionSize = response ? response[0].totalElements : 0;
      }

      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  summaryForPuntaje() {
    this.totalPuntaje = [];
    let sum = 0;

    for (let index = 0; index < this.rowsEmpresaDocumentos.length; index++) {
      sum += this.rowsEmpresaDocumentos[index].sumaPuntaje
    }
    this.totalPuntaje.push({
      puntajeTotal: sum,
      puntajeDefinido: 1000,
      resultado: 1000 - sum
    })
  }

  onAprobarArchivo(row, state) {
    this.AControls.idCtrHomologacion.setValue(row.idCtrHomologacion);
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
    this.AControls.idCtrHomologacion.setValue(row.idCtrHomologacion);
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
    for (const item of this.rowsEmpresaDocumentos) {
      if (item.idCtrHomologacion === this.AControls.idCtrHomologacion.value) {
        item.idEstado = 2;
        item.estado = 'Aprobado';
        item.motivo = ''
        //this.AControls.observacion.value
      }
    }
  }

  async onDesaprobarDocumentoHomologacion() {
    this.modalService.dismissAll();
    for (const item of this.rowsEmpresaDocumentos) {
      if (item.idCtrHomologacion === this.AControls.idCtrHomologacion.value) {
        item.idEstado = 3;
        item.estado = 'Observado';
        item.motivo = this.AControls.observacion.value,
          console.log(item.driveId);

      }
    }
  }

  name: string;
  onVisualizadorPdf(row, modal: NgbModal) {
    this.name = row.nombreDocumento;
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
      let eight; eight = `${encodeURIComponent(split[8])}`;
      this.pdfSrc = zero + '' + one + '' + two + '' +
        '' + three + '' + four + '' + five + '' + six + '' + seven + '' + eight;
    }
    else{
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

  async onConfirmar(): Promise<void> {
    if (this.rowsEmpresaDocumentos.filter(x => x.idEstado !== 1).length == 0) {
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
    for (const item of this.rowsEmpresaDocumentos) {
      if (item.idEstado == 2) {
        await this.contratistasService.contratistaclienteHom_delete({
          idCtrHomologacion: item.idCtrHomologacion,
          idCliente: item.idCliente,
          idContratista: this.idContratista,
          idEstado: item.idEstado,
          observacion: item.motivo,
          idUsuarioAud: 1
        }).then((response) => response, error => [])
          .catch(error => []);
      } else if (item.idEstado == 3) {
        await this.contratistasService.contratistaclienteHom_delete({
          idCtrHomologacion: item.idCtrHomologacion,
          idCliente: item.idCliente,
          idContratista: this.idContratista,
          idEstado: item.idEstado,
          observacion: item.motivo,
          idUsuarioAud: 1
        }).then((response) => response, error => [])
          .catch(error => []);

        await this.contratistasService.delete_files({
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
    this.onSetEmpresaDocumentos();
    this.onSetEmpresaDocumentosCompletos();

    this.contratistasService.contratistaCliente_UpdateEstado({
      idCliente: this.params.IdCliente,
      idContratista: this.idContratista,
      idUsuarioAud: this.currentUser.idUsuario,
      idClienteGrupo: this.params.IdClienteGrupo,
      correo: this.params.CorreoContratista,
      contratistaUser: this.params.ContratistaRuc
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
        for (const item of this.rowsEmpresaDocumentos) {
          item.idEstado = 1;
          item.estado = 'Pendiente';
          item.motivo = '';
        }
      }
    });
  }

  onClickBtn(value) {
    this.AControls.idEstado.setValue(value);
    this.onSetEmpresaDocumentos();
    this.distortion = false;
  }
}
