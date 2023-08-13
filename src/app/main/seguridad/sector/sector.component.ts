import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'app/shared/services/utils.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreThemeCustomizerComponent } from '@core/components/theme-customizer/theme-customizer.component';
import Swal from 'sweetalert2';
import { User } from 'app/shared/models/auth/user';
import { UsuarioService } from '../usuario/usuario.service';
import { ClienteService } from 'app/main/dashboard/clientes/clientes.service';

@Component({
  selector: 'app-sector',
  templateUrl: './sector.component.html',
  styleUrls: ['./sector.component.scss']
})
export class SectorComponent implements OnInit {
  public currentUser: User;
  public contentHeader: object;
  public searchValue = '';
  public page = 10;
  public rows = [{
    nombres: 'Jacynthe Padberg',
    telefono: '87873130',
    email: 'lela81@hotmail.com',
    estado: 'Activo',
    idEstado: 1
  }, {
    nombres: 'Alena Schultz',
    telefono: '948704598',
    email: 'amina.connelly@hilpert.biz',
    estado: 'Activo',
    idEstado: 1
  }, {
    nombres: 'Maribel Cole',
    telefono: '858356910',
    email: 'caitlyn.hermiston@murazik.com',
    estado: 'Activo',
    idEstado: 1
  }, {
    nombres: 'Mr. Humberto Pacocha DDS',
    telefono: '9342205148',
    email: 'xjacobs@yahoo.com',
    estado: 'Inactivo',
    idEstado: 2
  }];
  public ColumnMode = ColumnMode;
  forPageOptions = [10, 25, 50, 100];
  idEstado = 1;

  public IDSubmitted = false;

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };

  usuario: string;
  password: string;
  nombre: string;
  aPaterno: string;
  aMaterno: string;
  telefono: string;
  email: string;

  public passwordTextTypeOld: boolean;
  public passwordTextTypeNew: boolean;
  public passwordTextTypeEqual: boolean;

  rowMenu = [];

  usuarioSettings = { ...this.tableDefaultPageSettings };
  rowsUsuario = [];
  public rowsTipoDoc = [];

  public UserForm: FormGroup;

  get UControls(): { [p: string]: AbstractControl } {
    return this.UserForm.controls;
  }

  constructor(
    private utilsService: UtilsService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private clienteService: ClienteService,
    private usuarioService: UsuarioService,    
  ) {

    this.UserForm = this.formBuilder.group({
      idEstado: [1],
      usuarioEstado: [1],
      // filterEstado: [15],
      idUsuario: [0],
      // idPerfil: [1],
      // perfil: [''],      
      usuario: ['', Validators.required],
      clave: ['', Validators.required],
      email: ['', Validators.required],
      telefono: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
    
    });

    this.contentHeader = {
      headerTitle: 'Sector',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Seguridad',
            isLink: false,
            link: '/'
          },          
          {
            name: 'Sector',
            isLink: false
          }
        ]
      }
    };
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.onClickBtn(1);
    //this.UploadFile();
  }

  //#region CONNECTION TO GOOGLE DRIVE FAILED
  // async UploadFile(){
  //   const { google } = require('googleapis');
  //   const path = require('path');
  //   const fs = require('fs');

  //   const CLIENT_ID = '520433600010-7bf9ljsascq1mu3rqlpv4mqh9h8k3ks5.apps.googleusercontent.com';
  //   const CLIENT_SECRET = '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';
  //   const REDIRECT_URL = 'https://developers.google.com/oauthplayground';

  //   const REFRESH_TOKEN = '1//04wXL88OUAhK8CgYIARAAGAQSNwF-L9IrwUCxZ-9cQJ4Sk0A8clGR1oN64untrzSqPSkEdTLwQtmbu0Ucopo8Rd49tccoV2vhh74';

  //   const oauth2client = new google.auth.OAuth2(
  //     CLIENT_ID,
  //     CLIENT_SECRET,
  //     REDIRECT_URL
  //   )

  //   oauth2client.setCredentials({refresh_token: REFRESH_TOKEN})

  //   const drive = google.drive({
  //     version: 'v3',
  //     auth: oauth2client
  //   })

  //   const filePath = path.join(__dirname, 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8&w=1000&q=80')     

  //   try {
  //     const response = await drive.files.create({
  //       requestBody: {
  //         name: 'beautifulpicture.jpg',
  //         mimeType: 'image/jpg',
  //       },
  //       media: {
  //         mimeType: 'image/jpg',
  //         body: fs.createReadStream(filePath),
  //       },
  //     });

  //     console.log(response.data);
      
  //   } catch (error) {
  //     console.log(error.message);
      
  //   }  
  // }
  //#endregion
  

  onReloadPage() {
    this.onSetPage();
  }

  onClickBtn(value) {
    this.idEstado = value;
    this.onSetPage();
  }

  onSetPage() {
    // this.utilsService.blockUIStart('Cargando listado de Contratistas...');
    this.clienteService.dropdown({
      idTabla: 14
    }).subscribe(
      response => {
        this.rowsTipoDoc = response;
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
  }

  onNewUser(NST: NgbModal) {
    this.UControls.idUsuario.setValue(0);
    this.UControls.usuario.setValue('');
    this.UControls.clave.setValue('');
    this.UControls.email.setValue('');
    this.UControls.telefono.setValue('');
    this.UControls.nombres.setValue('');
    this.UControls.apellidoPaterno.setValue('');
    this.UControls.apellidoMaterno.setValue('');
    // this.UControls.perfil.setValue('');
    this.UControls.usuarioEstado.setValue(1);

    setTimeout(() => {
      this.modalService.open(NST, {
        scrollable: true,
        size: 'md',
        centered: true,
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  onEditUser(NST: NgbModal, row) {
    this.UControls.idUsuario.setValue(row.idUsuario);
    this.UControls.usuario.setValue(row.usuario);
    this.UControls.clave.setValue(row.clave);
    this.UControls.email.setValue(row.email);
    this.UControls.telefono.setValue(row.telefono);
    this.UControls.nombres.setValue(row.nombres);
    this.UControls.apellidoPaterno.setValue(row.apellidoPaterno);
    this.UControls.apellidoMaterno.setValue(row.apellidoMaterno);
    // this.UControls.idPerfil.setValue(row.idPerfil);
    // this.UControls.perfil.setValue(row.perfil);
    //this.UControls.usuarioEstado.setValue(row.idEstado);

    // this.UControls.fechaCreacion.setValue(row.fechaCreacion);
    // this.UControls.usuarioCreacion.setValue(row.usuarioCreacion);
    // this.UControls.fechaModificacion.setValue(row.fechaModificacion);
    // this.UControls.usuarioModificacion.setValue(row.usuarioModificacion);
    setTimeout(() => {
      this.modalService.open(NST, {
        scrollable: true,
        size: 'md',
        centered: true,
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  onSaveUser(): void {
    this.IDSubmitted = true;

    if (this.UserForm.invalid) {
      return;
    }

    this.usuarioService.usuario_save({
      idUsuario: this.UControls.idUsuario.value,
      usuario: this.UControls.usuario.value,
      clave: this.UControls.clave.value,
      email: this.UControls.email.value,
      telefono: this.UControls.telefono.value,
      nombres: this.UControls.nombres.value,
      apellidoPaterno: this.UControls.apellidoPaterno.value,
      apellidoMaterno: this.UControls.apellidoMaterno.value,
      idEstado: this.UControls.usuarioEstado.value,
      idUsuarioAud: this.currentUser.idUsuario
    }).subscribe(response => {
      if (response.ok) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onSetPage();
      } else {
        this.utilsService.showNotification(response.message, 'Alert', 3);
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  onDeleteUser(row) {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Desea eliminar este usuario?, esta acción no podrá revertirse',
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
        this.usuarioService.usuario_delete({
          idUsuario: row.idUsuario,
          idUsuarioAud: this.currentUser.idUsuario
        }).subscribe(response => {
          if (response.ok == 1) {
            this.utilsService.showNotification('Registro eliminado correctamente', 'Operación satisfactoria', 1);
            this.onSetPage();
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

  showPassword(value) {
    if (value == 1) {
      this.passwordTextTypeOld = !this.passwordTextTypeOld;
    }
    else if (value == 2) {
      this.passwordTextTypeNew = !this.passwordTextTypeNew;
    }
    else {
      this.passwordTextTypeEqual = !this.passwordTextTypeEqual;
    }
  }
}
