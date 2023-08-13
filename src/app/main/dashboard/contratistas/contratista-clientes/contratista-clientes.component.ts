import { Component, ViewChild, ElementRef, Injectable, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CoreTranslationService } from '@core/services/translation.service';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { UtilsService } from "app/shared/services/utils.service";
import { environment } from 'environments/environment';
import { FileUploader } from 'ng2-file-upload';
import Stepper from 'bs-stepper';
import { ContratistasService } from '../../contratistas.service';
import { ClienteService } from '../../clientes/clientes.service';
import { User } from 'app/shared/models/auth/user';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class Archivo {
  idFila: number;
  tipo: string;
  nombre: string;
  tamanio: string;
  base64: string;
}

class ContratistaSustento {
  idCtrHomologacion: number;
  idHomologacion: number;
  idcliente: number;
  archivo: string;
  base64: string;
  tamanioArchivo: number;
  tipoExtension: string;
  rutaArchivo: string;
  idEstado: number;
  editado: boolean = false;
  nombreDocumento: string;
}

const I18N_VALUES = {
  'es': {
    weekdays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
    //years: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
    weekLabel: 'sem'
  }
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
  //getYearNumerals(year: number): string { return I18N_VALUES[this._i18n.language].years[year - 1]}
}

@Component({
  selector: 'app-contratista-clientes',
  templateUrl: './contratista-clientes.component.html',
  styleUrls: ['./contratista-clientes.component.scss'],
  providers:
    [I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }]
})
export class ContratistaClientesComponent implements OnInit {

  @ViewChild('qrCodeSection', { static: false }) qrCodeSection: ElementRef;

  public currentUser: User;
  public contentHeader: object;
  private modernWizardStepper: Stepper;

  forPageOptions = [10, 25, 50, 100];

  public archivosHomologacion: FileUploader = new FileUploader({
    isHTML5: true
  });

  public archivosAudEmpresa: FileUploader = new FileUploader({
    isHTML5: true
  });

  public archivosAudEmpleado: FileUploader = new FileUploader({
    isHTML5: true
  });

  public uploader: FileUploader = new FileUploader({
    isHTML5: true
  });

  public uploaderows = [];
  public archivosHom: Archivo[] = [];
  public archivosHomTra: Archivo[] = [];
  public archivosAudEmpr: Archivo[] = [];
  public archivosAudEmpl: Archivo[] = [];
  procesar: boolean = true;

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };
  contratistaSettings = { ...this.tableDefaultPageSettings };
  rowsContratista = [];

  rowsDocumentos = [];
  rowsGrupos = [];
  public anio = [];
  public meses = [];

  Empleadosrows = [];
  aniodate: string;
  mes: string;
  mesvalue: number;
  resultdate: string;
  sesionPerfil: number;

  displayable: any;
  idEstado = 1;
  idEstadoEmpleado = 1;

  contacto = '';

  public notification: boolean;
  public hasBaseDropZoneOver: boolean = false;

  idTipo: number;

  public rowsNivel = [];
  public rowsrubro = [];
  public rowsPeriodo = [];
  idNivel: number;
  idPeriodo: number;
  Value: number;
  IDSubmitted = false;
  idRubro: number;

  selectedRowIds: number[] = [];
  selectedDiscRowIds: number[] = [];
  activated = false;

  public currentDate = new Date();
  fechaEmision = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };

  fechaCertificado = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };

  public sustentos: ContratistaSustento[] = [];
  public sustentosOld: ContratistaSustento[] = [];

  public ColumnMode = ColumnMode;
  public ConForm: FormGroup;
  public Contact: FormGroup;
  public General: FormGroup;

  get PControls(): { [p: string]: AbstractControl } {
    return this.Contact.controls;
  }

  get Controls(): { [p: string]: AbstractControl } {
    return this.General.controls;
  }

  rowsTipoDoc = []

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
            name: 'Clientes',
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

    this.General = this.formBuilder.group({
      sesionPerfil: [0],
      idCliente: [0],
      idTipoExtension: [''],
      porcentaje: [0],
      ruc: ['', Validators.required],
      razonSocial: ['', Validators.required],
      direccion: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      paginaWeb: [''],
      fechaConstitucion: [''],
      nucleoNegocio: [''],
      telefono: ['', Validators.required],
      certificado: [false],
      certificado2: [true],
      namecertificado: ['No'],
      fechaCertificado: [],
      observacion: [''],
      idRubro: [1],
      idGrupo: [0]
    });

    this.Contact = this.formBuilder.group({
      idEmpleado: [0],
      idContratista: [0],
      idCliente: [0],

      personaNombres: ['', Validators.required],
      personaIdTipoDoc: [1],
      personaDoc: ['', Validators.required],
      personaNacyRes: ['', Validators.required],
      personaDom: ['', Validators.required],
      personaPuesto: ['', Validators.required],
      personaTelefono: ['', Validators.required],
      personaCorreo: ['', Validators.required],
    });
  }

  segundosTotales: any;
  segundos: any;
  minutosTotales: any;
  minutos: any;
  horasTotales: any;
  horas: any;
  dias: any;

  fechaActual: any;
  fechaFinal: any;
  diferencia: any;
  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.Controls.sesionPerfil.setValue(this.currentUser.idPerfil);

    this.onClickBtn(1);
    this.Value = 1;
    this.idNivel = 1;
    this.idTipo = 1;
    this.idPeriodo = 1;
    this.idRubro = 1;
    this.Controls.sesionPerfil.value == 3 ? this.displayable = true : this.displayable = false;
    this.onContratistaClienteList();
    this.TablaMaestra();
    this.ngChargeDate();
  }

  public filterDate = new Date();
  public fromDate = {
    year: this.filterDate.getFullYear(),
    month: this.filterDate.getMonth() + 1,
    day: 25
  };

  public toDate = {
    year: this.filterDate.getFullYear(),
    month: this.filterDate.getMonth() + 2,
    day: 1
  };

  ngChargeDate() {
    // let fechadesdenum = 0;
    // let fechahastanum = 0;

    // fechadesdenum = parseInt(this.fromDate.year.toString() + this.fromDate.month.toString().padStart(2, '0') + this.fromDate.day.toString().padStart(2, '0'));
    // fechahastanum = parseInt(this.toDate.year.toString() + this.toDate.month.toString().padStart(2, '0') + this.toDate.day.toString().padStart(2, '0'));

    // console.log(fechadesdenum);

    // console.log(fechahastanum);

    let x = 7;
    let horas = 168;
    let minutos = 10080;
    let segundos = 604800;
    horas = x * 24;//DIAS A HORAS 168
    minutos = horas * 60;//HORAS A minutos 10080
    segundos = minutos * 60;

    // console.log(countdown(date))  ;      

    // let date = new Date("2022-12-02");
    // this.timerId = countdown(date, (ts) => {
    //   console.log(ts);

    // }, countdown.HOURS | countdown.MINUTES | countdown.SECONDS)
  }

  // ngOnDestroy(){
  //   if (this.timerId) {
  //     clearInterval(this.timerId);
  //   }
  // } 

  CertificadoCheck() {
    if (this.Controls.certificado.value == 1) {
      this.Controls.certificado.setValue(false);
      this.Controls.certificado2.setValue(true);
    } else {
      this.Controls.certificado2.setValue(false);
      this.Controls.certificado.setValue(true);
    }
  }

  //#region 🢃 TABLAS MAESTRA 🢃  
  TablaMaestra() {
    this.clienteService.dropdown({
      idTabla: 5
    }).subscribe((response) => {
      this.rowsTipoDoc = response;
    }, error => {
      this.utilsService.showNotification('Cargando documentos Empresa', 'Alert', 2);
    });

    this.clienteService.dropdown({
      idTabla: 22
    }).subscribe(
      response => {
        this.rowsrubro = response;
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
  //#endregion 🢁 TABLA MAESTRA 🢁

  onContratistaClienteList() {
    this.contratistasService.contratistaCliente_List({
      idCliente: 0,
      idContratista: this.currentUser.idContratista,
      idEstado: 0,
      search: this.contratistaSettings.searchString,
      pageIndex: this.contratistaSettings.page,
      pageSize: this.contratistaSettings.pageSize
    }).subscribe(response => {
      this.rowsContratista = response.contratistaCliente;
      if (this.rowsContratista.length > 0) {
        this.contratistaSettings.colletionSize = response.contratistaCliente ? response.contratistaCliente[0].totalElements : 0;
      }
      console.log(this.rowsContratista);

      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onClearFilter(): void {
    this.contratistaSettings.searchString = '';
    this.utilsService.blockUIStart("Quitando filtro...");
    this.onContratistaClienteList();
    setTimeout(() => {
      this.utilsService.blockUIStop();
    }, 1000);
  }

  async onListarDocumentos(id, NCT): Promise<any> {
    this.utilsService.blockUIStart('Obteniendo información...');
    const response = await this.clienteService.documentoHomEmpresa_List({
      idCliente: this.Controls.idCliente.value,
      idClienteGrupo: this.Controls.idGrupo.value,
      idContratista: id
    }).toPromise().catch(error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });

    if (response) {
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
    } else {
      this.utilsService.showNotification('[B]: An internal error has occurred', 'Error', 3);
    }
    
    this.utilsService.blockUIStop();

    setTimeout(() => {
      this.modalService.open(NCT, {
        scrollable: true,
        backdrop: 'static',
        size: 'xl',
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  async CrearCarpeta(){
    console.log(this.Controls.idCliente.value);
    console.log(this.Controls.razonSocial.value);    
    this.contratistasService.create_Folder({
      idCliente: this.Controls.idCliente.value,
      razonSocial: this.Controls.razonSocial.value
    }).subscribe(response => {
      if (response) {
        console.log("Ok pass");
      } else {
        console.log("something Wrong");
      }
    }, error => {
    });
  }

  async EditContratista(NCT: NgbModal, row) {
    this.Controls.porcentaje.setValue(row.porcentaje);
    this.Controls.idCliente.setValue(row.idCliente);
    this.Controls.razonSocial.setValue(row.razonSocial);
    this.Controls.idRubro.setValue(row.idRubro);
    this.Controls.ruc.setValue(row.ruc);
    this.Controls.provincia.setValue(row.provincia);
    this.Controls.distrito.setValue(row.distrito);
    this.Controls.direccion.setValue(row.direccion);
    this.Controls.paginaWeb.setValue(row.paginaWeb);
    this.Controls.telefono.setValue(row.telefono);

    this.PControls.personaNombres.setValue(row.personaNombres);
    this.PControls.personaIdTipoDoc.setValue(row.personaIdTipoDoc);
    this.PControls.personaDoc.setValue(row.personaDoc);
    this.PControls.personaNacyRes.setValue(row.personaNacyRes);
    this.PControls.personaDom.setValue(row.personaDom);
    this.PControls.personaPuesto.setValue(row.personaPuesto);
    this.PControls.personaTelefono.setValue(row.personaTelefono);
    this.PControls.personaCorreo.setValue(row.personaCorreo);

    this.rowsDocumentos = [];

    const response = await this.clienteService.contratistaGrupo_List({
      idCliente: this.Controls.idCliente.value,
      idContratista: row.idContratista,
      pageIndex: 1,
      pageSize: 999
    }).toPromise().catch(error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });

    if (response) {
      this.rowsGrupos = response;
      this.Controls.idGrupo.setValue(response[0].idClienteGrupo);
      await this.onListarDocumentos(row.idContratista, NCT);
      await this.CrearCarpeta();
    } else {
      this.utilsService.showNotification('[B]: An internal error has occurred', 'Error', 3);
    }    

    this.fechaActual = new Date();
    this.fechaFinal = new Date(row.fechaCierre);

    this.diferencia = this.fechaFinal.getTime() - this.fechaActual.getTime();

    this.segundosTotales = Math.floor(this.diferencia / 1000);
    this.segundos = this.segundosTotales % 60;
    this.minutosTotales = Math.floor(this.segundosTotales / 60);
    this.minutos = this.minutosTotales % 60;
    this.horasTotales = Math.floor(this.minutosTotales / 60);
    this.horas = this.horasTotales % 24;
    this.dias = Math.floor(this.horasTotales / 24);

    setInterval(() => {
      this.fechaActual = new Date();
      this.diferencia = this.fechaFinal.getTime() - this.fechaActual.getTime();
      this.segundosTotales = Math.floor(this.diferencia / 1000);
      this.segundos = this.segundosTotales % 60;
      this.minutosTotales = Math.floor(this.segundosTotales / 60);
      this.minutos = this.minutosTotales % 60;
      this.horasTotales = Math.floor(this.minutosTotales / 60);
      this.horas = this.horasTotales % 24;
      this.dias = Math.floor(this.horasTotales / 24);
      // Actualizar el HTML con los valores actualizados
    }, 1000);
  }

  onComentarios(row, modal: NgbModal) {
    this.Controls.observacion.setValue(row.observacion);
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
        confirmButton: 'btn btn-warning',
        cancelButton: 'btn btn-primary'
      }
    }).then((result) => {
      if (result.value) {
        this.utilsService.showNotification('Información guardada correctamente', 'Operación satisfactoria', 1);
        this.modalService.dismissAll();
      }
    });
  }

  onClickBtn(value) {
    this.idEstado = value;
  }

  onDocumentoSearch(): void {
    if (this.Controls.ruc.value == '') {
      this.utilsService.showNotification('Ingrese N° documento proveedor', 'Alerta', 2)
      return;
    } else if (this.Controls.ruc.value.length != 8 && this.Controls.ruc.value.length != 11) {
      this.utilsService.showNotification('La cantidad de dígitos deben ser 11 (RUC)', 'Alerta', 2)
      return;
    }

    const digitCount = this.Controls.ruc.value.length;

    if (digitCount == 11) {
      this.utilsService.blockUIStart('Buscando RUC...');
      this.clienteService.sunatV2({
        documento: this.Controls.ruc.value
      }).subscribe(response => {
        this.Controls.razonSocial.setValue((response) ? response.razonSocial : '');
        this.Controls.direccion.setValue((response) ? response.direccion : '');
        this.utilsService.blockUIStop();
        if (this.Controls.razonSocial.value == '' || this.Controls.razonSocial.value == null) {
          this.utilsService.showNotification('No se encontraron coincidencias con el RUC ingresado', 'Alerta', 2);
        }
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
    }
  }

  base64: any;
  async fileOverBase(row, tipo): Promise<void> {
    console.log(this.uploader.queue);

    for (let item of this.uploader.queue) {
      this.base64 = await this.onArchivoABase64(item._file);
    }

    if (tipo == 1) {
      for (let item of this.rowsDocumentos) {
        if (item.idHomologacion == row.idHomologacion) {
          item.fileName = this.uploader.queue[0].file?.name
          item.fileTamanio = (this.uploader.queue[0].file?.size / 1024 / 1024).toFixed(2);
          item.base64 = this.base64;
        }
      }
    }

    this.uploader.queue = [];
    console.log(this.rowsDocumentos);
  }

  async onArchivoABase64(file): Promise<any> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  onSave(): void {
    this.IDSubmitted = true;
    if (this.General.invalid || this.Contact.invalid) {
      this.utilsService.showNotification("Completa los campos en color rojo.", "Revisar", 4)
      return;
    }

    this.sustentos = [];
    for (let item of this.rowsDocumentos) {
      this.sustentos.push({
        idCtrHomologacion: item.idCtrHomologacion,
        idHomologacion: item.idHomologacion,
        nombreDocumento: item.documentoName,
        idcliente: 0,
        base64: item.base64,
        archivo: item.fileName,
        tamanioArchivo: item.fileTamanio,
        tipoExtension: item.tipoExtension,
        rutaArchivo: "",
        idEstado: item.idEstado == 3 && item.fileName != '' ? 1 : item.idEstado,
        // item.idCtrHomologacion !== 0 || item.fileName != '' || 
        editado: item.base64 != '' ? true : false
      });
    }

    this.utilsService.blockUIStart("Guardando documentos en la nube...");
    this.contratistasService.contratistaSustento_InsertUpdate({
      idCliente: this.Controls.idCliente.value,
      idContratista: this.currentUser.idContratista,
      ruc: this.Controls.ruc.value,
      razonSocial: this.Controls.razonSocial.value,
      direccion: this.Controls.direccion.value,
      provincia: this.Controls.provincia.value,
      distrito: this.Controls.distrito.value,
      idRubro: this.Controls.idRubro.value,
      paginaWeb: this.Controls.paginaWeb.value,
      fechaConstitucion: this.fechaEmision.year.toString() + this.fechaEmision.month.toString().padStart(2, '0') + this.fechaEmision.day.toString().padStart(2, '0'),
      telefono: this.Controls.telefono.value,
      personaNombres: this.PControls.personaNombres.value,
      personaIdTipoDoc: this.PControls.personaIdTipoDoc.value,
      personaDoc: this.PControls.personaDoc.value,
      personaNacyRes: this.PControls.personaNacyRes.value,
      personaDom: this.PControls.personaDom.value,
      personaPuesto: this.PControls.personaPuesto.value,
      personaTelefono: this.PControls.personaTelefono.value,
      personaCorreo: this.PControls.personaCorreo.value,
      idUsuario: this.currentUser.idUsuario,
      contratistaDocumento: this.sustentos.filter(f => f.editado)
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onContratistaClienteList();
        this.utilsService.blockUIStop();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
      }
    }, error => {
      this.utilsService.showNotification('Demasiados documentos subiendose', 'Eliminar un archivo', 3);
      this.utilsService.blockUIStop();
    });
  }

  onRemoveFile(row): void {
    row.fileName = '';
    row.base64 = '';
    row.fileTamanio = 0;
  }

  generatePDF() {
    const pdf = new jsPDF();
    const options = { scale: 2 };

    html2canvas(this.qrCodeSection.nativeElement, options).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save('codigo_qr.pdf');
    });
  }
}
