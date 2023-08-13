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

const URL = 'https://your-url.com';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditoriaComponent implements OnInit {

  public contentHeader: object;
  public flagVista: boolean;
  forPageOptions = [10, 25, 50, 100];
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
  public page = 10;
  public rows = [
    // {
    //   item: '01',
    //   alcance: 'TC',
    //   periocidad: 'PC, ME',
    //   documento: 'Relación de Personal (Desplazado) (Formato Excel)',
    // }, 
    // {
    //   item: '27',
    //   alcance: 'TC',
    //   periocidad: 'ME',
    //   documento: 'PLAME',
    // },
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

  public manteniemiento = [
    {
      item: '01',
      alcance: 'TC',
      periocidad: 'PC, ME',
      documento: 'Relación de Personal (Desplazado) (Formato Excel)',
    }, 
    {
      item: '27',
      alcance: 'TC',
      periocidad: 'ME',
      documento: 'PLAME',
    },
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

  regimens = [
  {
    value:'TC - Todos Contratistas'
  },
  {
    value:'RG - Regimen General'
  },
  {
    value:'RM - Regimen Mype'
  },
  {
    value:'CC - Construcción Civil'
  }                
  ]

  public cliente: string;
  public uploader: FileUploader = new FileUploader({
    url: URL,
    isHTML5: true
  });

  public notification: boolean;
  public hasBaseDropZoneOver: boolean = false;

  private modernWizardStepper: Stepper;
  public ColumnMode = ColumnMode;
  constructor(private coreTranslationService: CoreTranslationService,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private modalService: NgbModal,
    private modalService2: NgbModal,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService) {
    this.contentHeader = {
      headerTitle: 'Auditoría',
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
            name: 'Dashboard',
            isLink: false,
            link: '/'
          },
          {
            name: 'Auditoría',
            isLink: false
          }
        ]
      }
    };
  }

  ngOnInit(): void {
    this.flagVista = true;
    this.utilsService.blockUIStart("Cargando Información...")
    setTimeout(() => {
      this.utilsService.blockUIStop();
    }, 1000);
    this.Value;
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  Mantenimiento(){    
    this.flagVista = false;
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
        this.utilsService.showNotification('Información guardada correctamente', 'Operación satisfactoria', 1);
        this.modalService.dismissAll();
      }
    });
  }

  CancelModal() {
    this.modalService.dismissAll();
  }

  onDelete() {
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
        setTimeout(() => {
          this.utilsService.blockUIStart('Eliminando Cotización...');
        }, 1000);
        this.utilsService.blockUIStop();
      }
    });
  }

}
