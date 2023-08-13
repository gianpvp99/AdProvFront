import { Component, Injectable, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CoreTranslationService } from '@core/services/translation.service';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Stepper from 'bs-stepper';
import Swal from 'sweetalert2';
import { UtilsService } from "app/shared/services/utils.service";
import { environment } from 'environments/environment';
import { merge, Observable, OperatorFunction, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { FileUploader } from 'ng2-file-upload';
import { ContratistasService } from '../contratistas.service';
import { User } from 'app/shared/models/auth/user';

const URL = 'https://your-url.com';

@Component({
  selector: 'app-regimen',
  templateUrl: './regimen.component.html',
  styleUrls: ['./regimen.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegimenComponent implements OnInit {
  public currentUser: User;
  public contentHeader: object;
  public flagVista: boolean;
  forPageOptions = [10, 30, 50, 100];
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
  public rows = [
    {
      item: '19',
      alcance: 'TC',
      periocidad: 'ME',
      documento: 'Vida Ley',
      audit: 'Auditado'
    },
    {
      item: '02',
      alcance: 'TC',
      periocidad: 'ND',
      documento: 'Alta (pdf emitido por SUNAT) formato único',
      audit: 'Auditado'
    },
    {
      item: '03',
      alcance: 'TC',
      periocidad: 'ND',
      documento: 'Contratos de Trabajo (pdf escaneado)',
      audit: 'No Auditado'
    },
    {
      item: '04',
      alcance: 'TC',
      periocidad: 'ND',
      documento: 'Contratos de Locación de Servicios (pdf escaneado)',
      audit: 'Auditado'
    },
    {
      item: '17',
      alcance: 'TC',
      periocidad: 'ME',
      documento: 'Registro de Control de Asistencia',
      audit: 'No Auditado'
    },
    {
      item: '05',
      alcance: 'TC',
      periocidad: 'ME',
      documento: 'Boletas de Pago (pdf escaneado)',
      audit: 'Auditado'
    },
    {
      item: '07',
      alcance: 'TC',
      periocidad: 'ME',
      documento: 'AFP (pdf emitido por la web de la AFP)',
      audit: 'Auditado'
    },
    {
      item: '08',
      alcance: 'TC',
      periocidad: 'ME',
      documento: 'Pagos de AFP',
      audit: 'No Auditado'
    },
    {
      item: '21',
      alcance: 'TC',
      periocidad: 'ND',
      documento: 'Examenes Médicos (pdf emitido por la clinica)',
      audit: 'Auditado'
    },
    {
      item: '22',
      alcance: 'TC',
      periocidad: 'ND',
      documento: 'Baja (pdf emitido por SUNAT)',
      audit: 'No Auditado'
    },
  ];
  rowsDocumento = [];

  idMatriz = 1;
  documento: string;

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };

  documentosSettings = { ...this.tableDefaultPageSettings };
  rowsDocumentos = [];
  rowsMatriz = [];

  public cliente: string;
  public uploader: FileUploader = new FileUploader({
    url: URL,
    isHTML5: true
  });

  public notification: boolean;
  public hasBaseDropZoneOver: boolean = false;

  public DocumentoForm: FormGroup;
  get DControls(): { [p: string]: AbstractControl } {
    return this.DocumentoForm.controls;
  }

  private modernWizardStepper: Stepper;
  public ColumnMode = ColumnMode;
  constructor(private coreTranslationService: CoreTranslationService,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private modalService: NgbModal,
    private modalService2: NgbModal,
    private formBuilder: FormBuilder,
    private contratistasService: ContratistasService,
    private utilsService: UtilsService) {
    this.contentHeader = {
      headerTitle: 'Regimen',
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
            name: 'Regimen',
            isLink: false
          }
        ]
      }
    };

    this.DocumentoForm = this.formBuilder.group({
      idDocumento: [0],
      idMatriz: [0],
      nombreDocumento: [0, Validators.required],
      tipoExtension: [0, Validators.required],
      homEmpresa: [false],
      homTrabajador: [false],
      empresa: [false],
      trabajador: [false],

      totalHomEmpresa: [0],
      totalHomTrabajador: [0],
      totalEmpresa: [0],
      totalTrabajador: [0]
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.flagVista = true;
    this.utilsService.blockUIStart("Cargando Información...")
    setTimeout(() => {
      this.utilsService.blockUIStop();
    }, 1000);
    this.Value;
    this.onSetDocumento();
    this.onMatriz();
  }

  onMatriz() {
    this.contratistasService.dropdown({
      idTabla: 21,
    }).subscribe(response => {
      this.rowsMatriz = response;
      console.log(response);
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }


  onSetDocumento() {
    this.contratistasService.documento_List({
      idEstado: 1,
      search: this.documentosSettings.searchString,
      pageIndex: this.documentosSettings.page,
      pageSize: this.documentosSettings.pageSize
    }).subscribe(response => {
      this.rowsDocumentos = [];
      for (const item of response) {
        this.DControls.totalHomEmpresa.setValue(item.totalHomEmpresa);
        this.DControls.totalHomTrabajador.setValue(item.totalHomTrabajador);
        this.DControls.totalEmpresa.setValue(item.totalEmpresa);
        this.DControls.totalTrabajador.setValue(item.totalTrabajador);

        this.rowsDocumentos.push({
          "idDocumento": item.idDocumento,
          "idMatriz": item.idMatriz,
          "matriz": item.matriz,
          "nombreDocumento": item.nombreDocumento,
          "tipoExtension": item.tipoExtension,
          "homEmpresa": item.homEmpresa,
          "homTrabajador": item.homTrabajador,
          "empresa": item.empresa,
          "trabajador": item.trabajador,
          "action": false
        });
      }

      this.documentosSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  AgregarDocumento(modal: NgbModal) {
    this.DControls.idDocumento.setValue(0);
    this.DControls.idMatriz.setValue(1);
    this.DControls.nombreDocumento.setValue('');
    this.DControls.tipoExtension.setValue('PDF');
    this.DControls.homEmpresa.setValue(false);
    this.DControls.homTrabajador.setValue(false);
    this.DControls.empresa.setValue(false);
    this.DControls.trabajador.setValue(false);
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

  EditDocumento(row) {
    if (this.rowsDocumentos.filter(x => x.action).length > 0) {
      this.utilsService.showNotification('Primero debe finalizar la edición del registro actual', 'Información', 4);
      return;
    }
    row.action = true;
    this.DControls.idDocumento.setValue(row.idDocumento);
    this.DControls.idMatriz.setValue(row.idMatriz);
    this.DControls.nombreDocumento.setValue(row.nombreDocumento);
    this.DControls.tipoExtension.setValue(row.tipoExtension);
    this.DControls.homEmpresa.setValue(row.homEmpresa);
    this.DControls.homTrabajador.setValue(row.homTrabajador);
    this.DControls.empresa.setValue(row.empresa);
    this.DControls.trabajador.setValue(row.trabajador);
  }

  HomEmpresaAgregar() {
    if (this.DControls.homEmpresa.value == true) {
      this.DControls.homEmpresa.setValue(false);
    } else {
      this.DControls.homEmpresa.setValue(true);
    }
  }

  HomEmpresaEstado(row) {
    this.DControls.idDocumento.setValue(row.idDocumento);
    this.DControls.idMatriz.setValue(row.idMatriz);
    this.DControls.nombreDocumento.setValue(row.nombreDocumento);
    this.DControls.tipoExtension.setValue(row.tipoExtension);
    this.DControls.homEmpresa.setValue(row.homEmpresa);
    this.DControls.homTrabajador.setValue(row.homTrabajador);
    this.DControls.empresa.setValue(row.empresa);
    this.DControls.trabajador.setValue(row.trabajador);

    if (this.DControls.homEmpresa.value == true) {
      this.DControls.homEmpresa.setValue(false);
    } else {
      this.DControls.homEmpresa.setValue(true);
    }

    this.utilsService.blockUIStart("Guardando...");
    setTimeout(() => {
      this.utilsService.blockUIStop();
      this.SaveDocumento(row);
    }, 1000);
  }

  HomTrabajadorAgregar() {
    if (this.DControls.homTrabajador.value == true) {
      this.DControls.homTrabajador.setValue(false);
    } else {
      this.DControls.homTrabajador.setValue(true);
    }
  }

  HomTrabajadorEstado(row) {
    this.DControls.idDocumento.setValue(row.idDocumento);
    this.DControls.idMatriz.setValue(row.idMatriz);
    this.DControls.nombreDocumento.setValue(row.nombreDocumento);
    this.DControls.tipoExtension.setValue(row.tipoExtension);
    this.DControls.homEmpresa.setValue(row.homEmpresa);
    this.DControls.homTrabajador.setValue(row.homTrabajador);
    this.DControls.empresa.setValue(row.empresa);
    this.DControls.trabajador.setValue(row.trabajador);

    if (this.DControls.homTrabajador.value == true) {
      this.DControls.homTrabajador.setValue(false);
    } else {
      this.DControls.homTrabajador.setValue(true);
    }

    this.utilsService.blockUIStart("Guardando...");
    setTimeout(() => {
      this.utilsService.blockUIStop();
      this.SaveDocumento(row);
    }, 1000);
  }

  EmpresaAgregar() {
    if (this.DControls.empresa.value == true) {
      this.DControls.empresa.setValue(false);
    } else {
      this.DControls.empresa.setValue(true);
    }
  }

  EmpresaEstado(row) {
    this.DControls.idDocumento.setValue(row.idDocumento);
    this.DControls.idMatriz.setValue(row.idMatriz);
    this.DControls.nombreDocumento.setValue(row.nombreDocumento);
    this.DControls.tipoExtension.setValue(row.tipoExtension);
    this.DControls.homologacion.setValue(row.homologacion);
    this.DControls.empresa.setValue(row.empresa);
    this.DControls.trabajador.setValue(row.trabajador);

    if (this.DControls.empresa.value == true) {
      this.DControls.empresa.setValue(false);
    } else {
      this.DControls.empresa.setValue(true);
    }

    this.utilsService.blockUIStart("Guardando...");
    setTimeout(() => {
      this.utilsService.blockUIStop();
      this.SaveDocumento(row);
    }, 1000);
  }

  TrabajadorAgregar() {
    if (this.DControls.trabajador.value == true) {
      this.DControls.trabajador.setValue(false);
    } else {
      this.DControls.trabajador.setValue(true);
    }
  }

  TrabajadorEstado(row) {
    this.DControls.idDocumento.setValue(row.idDocumento);
    this.DControls.idMatriz.setValue(row.idMatriz);
    this.DControls.nombreDocumento.setValue(row.nombreDocumento);
    this.DControls.tipoExtension.setValue(row.tipoExtension);
    this.DControls.homologacion.setValue(row.homologacion);
    this.DControls.empresa.setValue(row.empresa);
    this.DControls.trabajador.setValue(row.trabajador);

    if (this.DControls.trabajador.value == true) {
      this.DControls.trabajador.setValue(false);
    } else {
      this.DControls.trabajador.setValue(true);
    }

    this.utilsService.blockUIStart("Guardando...");
    setTimeout(() => {
      this.utilsService.blockUIStop();
      this.SaveDocumento(row);
    }, 1000);
  }

  CancelDocumento(row) {
    row.action = false;
  }

  SaveDocumento(row): void {
    this.contratistasService.documento_InsertUpdate({
      idDocumento: this.DControls.idDocumento.value,
      idMatriz: this.DControls.idMatriz.value,
      nombreDocumento: this.DControls.nombreDocumento.value,
      tipoExtension: this.DControls.tipoExtension.value,
      homEmpresa: this.DControls.homEmpresa.value,
      homTrabajador: this.DControls.homTrabajador.value,
      empresa: this.DControls.empresa.value,
      trabajador: this.DControls.trabajador.value,
      idUsuario: this.currentUser.idUsuario
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onSetDocumento();
        row.action = false;
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
        // this.sustentos = [...this.sustentosOld];
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  SaveDocumentoInAgregar(): void {  
    this.contratistasService.documento_InsertUpdate({
      idDocumento: this.DControls.idDocumento.value,
      idMatriz: this.DControls.idMatriz.value,
      nombreDocumento: this.DControls.nombreDocumento.value,
      tipoExtension: this.DControls.tipoExtension.value,
      homEmpresa: this.DControls.homEmpresa.value,
      homTrabajador: this.DControls.homTrabajador.value,
      empresa: this.DControls.empresa.value,
      trabajador: this.DControls.trabajador.value,
      idUsuario: this.currentUser.idUsuario
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onSetDocumento();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
        // this.sustentos = [...this.sustentosOld];
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  Mantenimiento() {
    this.flagVista = false;
  }

  viewDocument(modal: NgbModal) {
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

  AgregarCliente(modal: NgbModal, notification: boolean) {
    // if (!notification) {
    //   this.notification = false;
    //   this.utilsService.showNotification('No cumple con las validaciones ingresadas', 'Alerta', 2);
    //   this.cliente = 'Lula Satterfield Jr.';
    // }else{
    //   this.notification = true;
    //   this.cliente = '';
    // }

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

  EditarCliente(modal: NgbModal, notification: boolean) {
    // if (!notification) {
    //   this.notification = false;
    //   this.utilsService.showNotification('No cumple con las validaciones ingresadas', 'Alerta', 2);
    //   this.cliente = 'Lula Satterfield Jr.';
    // } else {
    //   this.notification = true;
    //   this.cliente = '';
    // }

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

      }
    });
  }

  onDocumentoDelete(row) {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Desea eliminar este constratista?, esta acción no podrá revertirse',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-primary'
      }
    }).then(result => {
      if (result.value) {
        this.contratistasService.documento_Delete({
          idDocumento: row.idDocumento,
          idUsuarioAud: this.currentUser.idUsuario
        }).subscribe(response => {
          if (response.ok == 1) {
            this.utilsService.showNotification('Registro eliminado correctamente', 'Operación satisfactoria', 1);
            this.onSetDocumento();
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
