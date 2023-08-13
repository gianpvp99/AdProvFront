import { Component, ViewChild, ElementRef, Injectable, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { CoreTranslationService } from '@core/services/translation.service';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { UtilsService } from "app/shared/services/utils.service";
import { FileUploader } from 'ng2-file-upload';
import { ContratistasService } from '../../contratistas.service';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../../clientes/clientes.service';
import { User } from 'app/shared/models/auth/user';

import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
class Params {
  IdCliente: number;
  IdContratista: number;
  IdProyecto: number;
  RazonSocial: string;
}

class EmpleadoQR {
  cadenaQr: String;
  idEmpleado: number;
  nroDocumento: number;
  nombres: String;
  apellidoPaterno: String;
  apellidoMaterno: String;
  telefono: number;
  foto: string;
}

@Component({
  selector: 'app-contratista-empleados',
  templateUrl: './contratista-empleados.component.html',
  styleUrls: ['./contratista-empleados.component.scss']
})
export class ContratistaEmpleadosComponent implements OnInit {
  // @ViewChild('qrCodeSection') qrCodeSection: ElementRef;

  public currentUser: User;
  params: Params;
  public contentHeader: object;
  forPageOptions = [10, 25, 50, 100];

  public currentDate = new Date();
  fechaTrabajo = {
    year: this.currentDate.getFullYear(),
    month: this.currentDate.getMonth() + 1,
    day: this.currentDate.getDate()
  };

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };

  empleadoSettings = { ...this.tableDefaultPageSettings };
  rowsEmpleados = [];
  rowsRegimen = [];
  IDSubmitted = false;

  rowsDocumentosHomTrabajador = []
  rowsProyectos = [];
  public rowsEmpleadoQR:EmpleadoQR[] = [];

  selectedFileName: string = "Subir Foto";
  selectedFile: File | null = null;

  public cliente: string;
  public uploader: FileUploader = new FileUploader({
    isHTML5: true
  });


  public notification: boolean;
  public hasBaseDropZoneOver: boolean = false;

  public EmpForm: FormGroup;

  public featuredImage: string | ArrayBuffer | null = null;
  public base64QR: string | ArrayBuffer | null = null;

  get EControls(): { [p: string]: AbstractControl } {
    return this.EmpForm.controls;
  }

  public ColumnMode = ColumnMode;
  constructor(private calendar: NgbCalendar,
    private clienteService: ClienteService,
    public formatter: NgbDateParserFormatter,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private contratistasService: ContratistasService,
    private utilsService: UtilsService,
    private cd: ChangeDetectorRef) {
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
      contratista: ['', Validators.required],
      idCliente: [0],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      nombres: ['', Validators.required],
      nroDocumento: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      idUbigeo: [''],
      observacion: [''],

      idRegimenGeneral: [3],
      idRegimenMype: [3],
      idRegimenAgrario: [3],
      idConstruccionCivil: [3],

      fechaTrabajo: [''],
      idProyecto: [0],
      idRegimen: [0],
      nameProyect: ['', Validators.required],
      fullName: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.route.queryParams.subscribe(params => {
      this.params = {
        IdCliente: Number(params.IdCliente),
        IdContratista: Number(params.IdContratista),
        IdProyecto: Number(params.IdProyecto),
        RazonSocial: String(params.RazonSocial)
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
      this.rowsProyectos = response;
      this.EControls.idProyecto.setValue(response[0].idProyecto);
      this.empleadoSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  //#region EMPLEADOS
  onSetEmpleadoList() {
    // console.log(this.EControls.idProyecto.value);

    this.utilsService.blockUIStart('Cargando listado de Empleados...');
    this.contratistasService.empleado_list({
      idCliente: this.params.IdCliente,
      idProyecto: this.EControls.idProyecto.value,
      idContratista: this.currentUser.idContratista,
      idEstado: 0,
      search: this.empleadoSettings.searchString,
      pageIndex: this.empleadoSettings.page,
      pageSize: this.empleadoSettings.pageSize
    }).subscribe(response => {
      this.rowsEmpleados = response;
      this.empleadoSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
      // console.log(this.rowsEmpleados);
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
    this.EControls.idContratista.setValue(this.currentUser.idContratista);
    this.EControls.contratista.setValue(this.currentUser.razonSocial);
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
    this.EControls.title.setValue('Actualizar Información de (' + row.fullName + ')');
    this.EControls.idEmpleado.setValue(row.idEmpleado);
    this.EControls.idContratista.setValue(this.currentUser.idContratista);
    this.EControls.contratista.setValue(this.currentUser.razonSocial);
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
  //#endregion

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

  base64: any;
  async fileOverBase(row): Promise<void> {
    for (let item of this.uploader.queue) {
      this.base64 = await this.onArchivoABase64(item._file);
    }

    for (const item of this.rowsDocumentosHomTrabajador) {
      if (item.idHomEmpleado == row.idHomEmpleado) {
        item.fileName = this.uploader.queue[0].file?.name
        item.fileTamanio = this.uploader.queue[0].file?.size / 1024 / 1024;
        item.base64 = this.base64;
      }
    }
    this.uploader.queue = [];
  }

  async onArchivoABase64(file): Promise<any> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async CrearCarpeta(){      
    this.contratistasService.createEmp_Folder({
      idCliente: this.params.IdCliente,
      razonSocial: this.params.RazonSocial,
      idEmpleado: this.EControls.idEmpleado.value,
      empleado: this.EControls.fullName.value
    }).subscribe(response => {
      if (response) {
        console.log("Ok pass");
      } else {
        console.log("something Wrong");
      }
    }, error => {
    });
  }

  async onListarDocumentos(DEM): Promise<any> {
    this.utilsService.blockUIStart('Obteniendo información...');
    const response = await this.clienteService.documentoHomEmpleado_List({
      idCliente: this.params.IdCliente,
      idProyecto: this.EControls.idProyecto.value,
      idEmpleado: this.EControls.idEmpleado.value,
      idRegimenGeneral: this.EControls.idRegimenGeneral.value,
      idRegimenMype: this.EControls.idRegimenMype.value,
      idRegimenAgrario: this.EControls.idRegimenAgrario.value,
      idConstruccionCivil: this.EControls.idConstruccionCivil.value
    }).toPromise().catch(error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  
    if (response) {
      for (const item of response) {
        if (item.tipoExtension != 'ADPROV') {
          this.rowsDocumentosHomTrabajador.push({
            "idHomEmpleado": item.idHomEmpleado,
            "idCtrHomEmpleado": item.idCtrHomEmpleado,
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
      
      await this.CrearCarpeta();

    } else {
      this.utilsService.showNotification('[B]: An internal error has occurred', 'Error', 3);
    }
    
    this.utilsService.blockUIStop();

    setTimeout(() => {
      this.modalService.open(DEM, { windowClass: "opened", scrollable: true, backdrop: 'static' });
    }, 0); 
    
  }

  async onDocEmpleados(DEM, row) {
    this.EControls.title.setValue('Documentos del Empleado (' + row.fullName + ')');
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

    this.EControls.idEmpleado.setValue(row.idEmpleado);
    this.EControls.fullName.setValue(row.fullName);

    this.rowsDocumentosHomTrabajador = [];

    await this.onListarDocumentos(DEM);                
  }

  sustentos = [];
  onSave(): void {
    this.IDSubmitted = true;

    // if (this.ConForm.invalid) {
    //   return;
    // }    
    
    this.sustentos = [];
    for (let item of this.rowsDocumentosHomTrabajador) {
      this.sustentos.push({
        idCtrHomEmpleado: item.idCtrHomEmpleado,
        idHomologacion: item.idHomEmpleado,
        nombreDocumento: item.documentoName,
        base64: item.base64,
        archivo: item.fileName,
        tamanioArchivo: item.fileTamanio,
        tipoExtension: item.tipoExtension,
        rutaArchivo: "",
        idEstado: item.idEstado == 3 && item.fileName != '' ? 1 : item.idEstado,
        editado: item.base64 != '' ? true : false
      });
    }      

    this.utilsService.blockUIStart("Guardando documentos en la nube...");
    this.contratistasService.empleadoSustento_InsertUpdate({
      idCliente: this.params.IdCliente,
      idContratista: this.currentUser.idContratista,
      razonSocial: this.params.RazonSocial,
      idEmpleado: this.EControls.idEmpleado.value,
      empleado: this.EControls.fullName.value,
      idUsuario: this.currentUser.idUsuario,
      empleadoDocumento: this.sustentos.filter(f => f.editado)
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onSetEmpleadoList();
        this.utilsService.blockUIStop();
      } else {
        this.utilsService.showNotification(response.message, 'Error', 3);
        this.utilsService.blockUIStop();
        // this.sustentos = [...this.sustentosOld];
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onRemoveFile(row): void {
    row.fileName = '';
    row.base64 = '';
    row.fileTamanio = 0;
  }

  onComentarios(row, modal: NgbModal) {
    this.EControls.observacion.setValue(row.observacion);
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

  handleReaderLoaded(e: any) {
    this.featuredImage = e.target.result;
    // console.log(this.featuredImage);
  }

  uploadImage(event:any):void{
    const file = event.target.files[0];
    
    const filePath = URL.createObjectURL(file);
    // Verificamos que se haya seleccionado un archivo
    if (file) {
      const reader = new FileReader();
      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsDataURL(file);

      // console.log(event);
      // console.log('RUTA',filePath);

      // console.log(file);
      // console.log("Archivo seleccionado:", file.name);
      // console.log("Tipo de archivo:", file.type);
      // console.log("Tamaño:", file.size, "bytes");
      // Aquí puedes realizar más operaciones con el archivo si lo deseas
      this.selectedFileName = file.name; // Actualizamos el texto del label con el nombre del archivo seleccionado
    } else {
      console.log("No se seleccionó ningún archivo.");
      this.selectedFileName = "Subir Foto"; // Restauramos el texto del label
    }
  }

  convertCadenaQRtoBase64(rowsEmpleadoQR){
    const cadenaQr = rowsEmpleadoQR.cadenaQr;
    const encodedCadenaQr = encodeURIComponent(cadenaQr);

    if(cadenaQr){

      this.contratistasService.convertCadenaQR(
        encodedCadenaQr
        ).subscribe(res => {
        
        const fotoQr = 'data:image/jpeg;base64,' + String(res.qr);
        this.base64QR = fotoQr;
        // console.log(fotoQr);
  
      }
      , (error:any) => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
        console.error(error);
        }
      );

    } else {
      this.utilsService.showNotification('[F]: El empleado seleccionado no tiene QR', 'Warning', 2);
      this.utilsService.blockUIStop();
    }
    
  }

  onQR(QR:TemplateRef<any>, row){
    this.EControls.title.setValue('Generar código QR de (' + row.fullName + ')');
    this.rowsEmpleadoQR = row;
    console.log(this.rowsEmpleadoQR);

    this.convertCadenaQRtoBase64(this.rowsEmpleadoQR);
    
    // setTimeout(() => {
    //   this.modalService.open(QR, {
    //     scrollable: true,
    //     size: 'lg',
    //     backdrop: 'static',
    //     beforeDismiss: () => {
    //       return true;
    //     }
    //   });
    // }, 0);
    const modalRef = this.modalService.open(QR, {
      scrollable: true,
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.shown.subscribe(() => {
      // El modal se ha mostrado completamente
      // Ahora puedes acceder al elemento #qrCodeSection
      const qrCodeSection = document.getElementById('qrCodeSection');
      if (qrCodeSection) {
        this.generatePDF(qrCodeSection);
      }
    });

    modalRef.result.then(
      (result) => {
        // El modal se cerró, puedes manejar lógica adicional si es necesario
      },
      (reason) => {
        // El modal se cerró por una razón específica, puedes manejar lógica adicional si es necesario
      }
    );
  }

  generateQR(rowsEmpleadoQR){
    

    this.contratistasService.generateEmpCadenaQR({
    idEmpleado: rowsEmpleadoQR.idEmpleado,
    documentEmpleado: rowsEmpleadoQR.nroDocumento,
    foto: this.featuredImage

    }).subscribe(response => {
      this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
      this.onSetEmpleadoList();
      // this.modalService.dismissAll();
      console.log(response);
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });

    // const cadenaQr = rowsEmpleadoQR.cadenaQr;
    // this.convertCadenaQRtoBase64(cadenaQr);
  }

  generatePDF(qrCodeSection: HTMLElement) {
    if (qrCodeSection) {
      html2canvas(qrCodeSection).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF();
  
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('codigo_qr.pdf');
      });
    } else {
      console.error('El elemento qrCodeSection no está definido.');
    }
  }
  
}
