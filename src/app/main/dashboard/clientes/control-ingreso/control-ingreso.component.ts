import { Component, Injectable, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { FormBuilder } from '@angular/forms';
import { UtilsService } from 'app/shared/services/utils.service';
import { NgbDateStruct, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploader } from 'ng2-file-upload';
import { User } from 'app/shared/models/auth/user';
import { ControlIngresoService } from './control-ingreso.service';

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

@Component({
  selector: 'app-control-ingreso',
  templateUrl: './control-ingreso.component.html',
  styleUrls: ['./control-ingreso.component.scss'],
  providers:
    [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }]
})
export class ControlIngresoComponent implements OnInit {
  public currentUser: User;
  public contentHeader: object;
  public ColumnMode = ColumnMode;
  sesionPerfil: number;
  nombreCompleto: string;
  
  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };
  forPageOptions = [10, 25, 50, 100];
  flagVista: boolean;

  IDSubmitted = false;
  empleadoclienteSettings = { ...this.tableDefaultPageSettings };
  rows = [];
  rowsEmpleadoCliente = [];
  constructor(
    private utilsService: UtilsService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private controlIngresoService: ControlIngresoService
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

  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.sesionPerfil = this.currentUser.idPerfil;

    // this.onSetControlIngresoEmpleados();
  }


  onSetControlIngresoEmpleados() {
    this.utilsService.blockUIStart('Cargando listado de empleados...');
    this.controlIngresoService.empleado_list({
      // idCliente: this.currentUser.idCliente,
      // idContratista: 0,
      // idEstado: this.idEstadoContratista,
      // search: this.contratistaclienteSettings.searchString,
      // pageIndex: this.contratistaclienteSettings.page,
      // pageSize: this.contratistaclienteSettings.pageSize
    }).subscribe(response => {
      // this.rowsEmpleadoCliente = response.contratistaCliente;
      // this.contratistaclienteSettings.colletionSize = response.contratistaCliente ? response.contratistaCliente[0].totalElements : 0;
      // this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onClearFilter(): void {
    this.empleadoclienteSettings.searchString = '';
    this.utilsService.blockUIStart("Quitando filtro...");
    this.onSetControlIngresoEmpleados();
    setTimeout(() => {
      this.utilsService.blockUIStop();
    }, 1000);
  } 
}
