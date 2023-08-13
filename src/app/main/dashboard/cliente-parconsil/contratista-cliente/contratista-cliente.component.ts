import { Component, Injectable, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CoreTranslationService } from '@core/services/translation.service';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode, RowHeightCache } from '@swimlane/ngx-datatable';
import { UtilsService } from "app/shared/services/utils.service";
import { ClienteService } from '../../clientes/clientes.service';
import { ContratistasService } from '../../contratistas.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'app/shared/models/auth/user';
import { environment } from 'environments/environment';
import { CONTRATISTA } from 'helpers/url';

class Params {
  IdCliente: number;
  Ruc: string;
  RazonSocial: string;
  Direccion: string;
  Ubigeo: string;
  Telefono: string;
  Correo: string;
  Especialista: string;
  FechaCreacion: string;
}

@Component({
  selector: 'app-contratista-cliente',
  templateUrl: './contratista-cliente.component.html',
  styleUrls: ['./contratista-cliente.component.scss']
})
export class ContratistaClienteComponent implements OnInit {
  pdfSrc = "";
  params: Params;
  public currentUser: User;

  forPageOptions = [10, 25, 50, 100];
  public ColumnMode = ColumnMode;
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

  contratistaclienteSettings = { ...this.tableDefaultPageSettings };
  empresadocumentosSettings = { ...this.tableDefaultPageSettings };
  clienteproyectoSettings = { ...this.tableDefaultPageSettings };
  rowsContratistaCliente = [];
  rowsEmpresaDocumentos = [];
  rowsProyecto = [];
  contratistasustento = [];
  totalPuntaje = [];
  rowsExistingProjects = [];

  distortion: boolean;
  archive: string;
  public contentHeader: object;

  public EmpresaHomologacion: FormGroup;

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
      contratista: [''],
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

      idProyecto: [0],
      proyecto: [''],
      titleProyecto: ['']
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
            isLink: true,
            link: '/'
          },
          {
            name: 'Contratistas',
            isLink: false,
            link: '/'
          }
        ]
      }
    };
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.route.queryParams.subscribe(params => {
      this.params = {
        IdCliente: Number(params.IdCliente),
        Ruc: String(params.Ruc),
        RazonSocial: String(params.RazonSocial),
        Direccion: String(params.Direccion),
        Ubigeo: String(params.Ubigeo),
        Telefono: String(params.Telefono),
        Correo: String(params.Correo),
        Especialista: String(params.Especialista),
        FechaCreacion: String(params.FechaCreacion)
      };
    });
    console.log(this.params)
    this.onSetContratistaCliente();
  }

  onSetContratistaCliente() {
    this.distortion = true;
    this.utilsService.blockUIStart('Cargando listado de Contratistas...');
    this.contratistasService.contratistaCliente_List({
      idCliente: this.params.IdCliente,
      idContratista: 0,
      idEstado: this.AControls.idEstadoContratista.value,
      search: this.contratistaclienteSettings.searchString,
      pageIndex: this.contratistaclienteSettings.page,
      pageSize: this.contratistaclienteSettings.pageSize
    }).subscribe(response => {
      this.rowsContratistaCliente = response.contratistaCliente;
      if (response.contratistaCliente.length > 0) {
        this.contratistaclienteSettings.colletionSize = response.contratistaCliente ? response.contratistaCliente[0].totalElements : 0;
      }
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onClearFilter(): void {
    this.contratistaclienteSettings.searchString = '';
    this.utilsService.blockUIStart("Quitando filtro...");
    this.onSetContratistaCliente();
    setTimeout(() => {
      this.utilsService.blockUIStop();
    }, 1000);
  }

  onClickCtr(value) {
    this.AControls.idEstadoContratista.setValue(value);
    this.onSetContratistaCliente();
    //this.distortion = false;
  }

  active: boolean = false;
  onContratistaCheckBox(row, AGP) {
    this.AControls.idContratista.setValue(row.idContratista);
    this.AControls.contratista.setValue(row.razonSocial);
    this.AControls.idProyecto.setValue(row.idProyecto);

    this.contratistasService.contratistaProyecto_List({
      idContratista: row.idContratista,
      idProyecto: 0
    }).subscribe(response => {
      this.rowsExistingProjects = response;
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });

    (this.AControls.idProyecto.value == 0) ? this.AControls.titleProyecto.setValue('Asignando Proyecto') : this.AControls.titleProyecto.setValue('Proyecto Asignado');
    this.clienteService.clienteProyectoGrupo_List({
      idCliente: row.idCliente,
      pageIndex: this.clienteproyectoSettings.page,
      pageSize: this.clienteproyectoSettings.pageSize
    }).subscribe(response => {
      this.rowsProyecto = response.clienteProyecto;

      for (const exis of this.rowsExistingProjects) {
        this.rowsProyecto.find(py => py.idProyecto == exis.idProyecto && py.idContratista == exis.idContratista);
      }


      this.clienteproyectoSettings.colletionSize = response.clienteGrupos[0] ? response.clienteGrupos[0].totalElements : 0;
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
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
  }

  onContratistaGrupoValue(row) {
    this.AControls.idProyecto.setValue(row.idProyecto);
    this.AControls.proyecto.setValue(row.proyecto);

    this.contratistasService.contratistaProyecto_InsertUpdate({
      idProyectoContratista: 0,
      idContratista: this.AControls.idContratista.value,
      idProyecto: this.AControls.idProyecto.value,
      idUsuarioAud: this.currentUser.idUsuario
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Asignado correctamente', 'Confirmación', 4);
        this.modalService.dismissAll();
        this.utilsService.blockUIStop();
        this.onSetContratistaCliente();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  public reportURL = environment.apiUrl + CONTRATISTA.contratista_Report;

  GetURL() {
    this.utilsService.blockUIStart('Exportando contratistas...');
    setTimeout(() => {
      window.location.href = this.reportURL
        + '?idCliente=' + this.params.IdCliente
        + '&idContratista=' + 0
        + '&idEstado=' + this.AControls.idEstadoContratista.value
        + '&search=' + this.contratistaclienteSettings.searchString
        + '&pageIndex=' + this.contratistaclienteSettings.page
        + '&pageSize=' + this.contratistaclienteSettings.pageSize;
      this.utilsService.blockUIStop();
    }, 2000);
  }
}