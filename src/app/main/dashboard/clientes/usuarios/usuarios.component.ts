import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'app/shared/services/utils.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreThemeCustomizerComponent } from '@core/components/theme-customizer/theme-customizer.component';
import { isThisTypeNode } from 'typescript';
import Swal from 'sweetalert2';
import { User } from 'app/shared/models/auth/user';
import { UsuarioService } from 'app/main/seguridad/usuario/usuario.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
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

  constructor(
    private utilsService: UtilsService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService
  ) {
    this.contentHeader = {
      headerTitle: 'Usuario',
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
            name: 'Seguridad',
            isLink: false,
            link: '/'
          },
          {
            name: 'Usuario',
            isLink: false
          }
        ]
      }
    };
  }

  ngOnInit(): void {
    this.onClickBtn(1);
  }

  onReloadPage() {
    this.onSetPage();
  }

  onClickBtn(value) {
    this.idEstado = value;
    this.onSetPage();
  }

  onSetPage() {
    this.utilsService.blockUIStart('Cargando listado de Contratistas...');
    this.usuarioService.usuario_list({
      idEstado: this.idEstado,
      search: this.usuarioSettings.searchString,
      pageIndex: this.usuarioSettings.page,
      pageSize: this.usuarioSettings.pageSize
    }).subscribe(response => {
      this.rowsUsuario = response;
      this.usuarioSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onNewUser(modal: NgbModal) {
    // if (!notification) {
    //   this.notification = false;
    //   this.utilsService.showNotification('No cumple con las validaciones ingresadas', 'Alerta', 2);
    //   this.cliente = 'Lula Satterfield Jr.';
    // }else{
    //   this.notification = true;
    //   this.cliente = '';
    // }
    this.usuario = '';
    this.password = '';
    this.nombre = '';
    this.aPaterno = '';
    this.aMaterno = '';
    this.telefono = '';
    this.email = '';
    this.rowMenu = [];
    this.rowMenu.push({
      "idUsuarioMenu": 1,
      "idMenu": 1,
      "menu": 'Seguridad',
      "flagLectura": false,
      "flagEscritura": false,
      "flagEditar": false,
      "flagEliminar": false,
      "flagExportar": false      
    });

    setTimeout(() => {
      this.modalService.open(modal, {
        scrollable: true,
        size: 'lg',
        centered: true,
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  onEditUser(modal: NgbModal, row) {
    this.usuario = row.usuario;
    this.password = row.clave;
    this.nombre = row.nombres;
    this.aPaterno = row.apellidoPaterno;
    this.aMaterno = row.apellidoMaterno;
    this.telefono = row.telefono;
    this.email = row.email;
    setTimeout(() => {
      this.modalService.open(modal, {
        scrollable: true,
        size: 'lg',
        centered: true,
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }

  onDeleteUser() {
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
        setTimeout(() => {
          this.utilsService.blockUIStart('Eliminando Cotización...');
        }, 1000);
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

  CancelModal() {
    this.modalService.dismissAll();
  }
}
