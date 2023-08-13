import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from 'app/shared/services/utils.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreThemeCustomizerComponent } from '@core/components/theme-customizer/theme-customizer.component';
import { isThisTypeNode } from 'typescript';
import Swal from 'sweetalert2';
import { User } from 'app/shared/models/auth/user';
import { UsuarioService } from './usuario.service';
import { RolesService } from '../roles/roles.service';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
})
export class UsuarioComponent implements OnInit {
  public currentUser: User;
  public contentHeader: object;
  public searchValue = '';
  public page = 10;
  
  public ColumnMode = ColumnMode;
  forPageOptions = [10, 25, 50, 100];
  idEstado = 1;
  option = 1;

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
  rolSettings = { ...this.tableDefaultPageSettings };

  rowsUsuario = [];
  rowsTypeUser = [];
  rowsRol = [];
  rowsCliente = [];
  TypeUserSelected: any;
  RolSelected: any;
  ClienteSelected: any;

  public UserForm: FormGroup;

  get UControls(): { [p: string]: AbstractControl } {
    return this.UserForm.controls;
  }

  constructor(
    private utilsService: UtilsService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private rolService: RolesService
  ) {

    this.UserForm = this.formBuilder.group({
      idEstado: [1],
      usuarioEstado: [1],
      idUsuario: [0],
      usuario: ['', Validators.required],
      clave: ['', Validators.required],
      email: ['', Validators.required],
      telefono: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],

      // idTipoTablaUsuario: [null],

    });

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
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.onClickBtn(1);
  }

  onReloadPage() {
    this.onSetPage();
  }

  onClickBtn(value) {
    this.idEstado = value;
    this.onSetPage();
    this.onSetTypeUser();
    this.onCliente();
  }

  onSetPage() {
    this.utilsService.blockUIStart('Cargando listado de Usuarios...');
    this.usuarioService.usuario_list({
      idEstado: this.idEstado,
      search: this.usuarioSettings.searchString,
      pageIndex: this.usuarioSettings.page,
      pageSize: this.usuarioSettings.pageSize
    }).subscribe(response => {
      this.rowsUsuario = response;
      console.log(response);
      this.usuarioSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onNewUser(modal: NgbModal) {
    this.UControls.idUsuario.setValue(0);
    this.UControls.usuario.setValue('');
    this.UControls.clave.setValue('');
    this.UControls.email.setValue('');
    this.UControls.telefono.setValue('');
    this.UControls.nombres.setValue('');
    this.UControls.apellidoPaterno.setValue('');
    this.UControls.apellidoMaterno.setValue('');
    this.UControls.usuarioEstado.setValue(1);
    this.RolSelected = null;
    this.TypeUserSelected = null;

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
    this.UControls.idUsuario.setValue(row.idUsuario);
    this.UControls.usuario.setValue(row.usuario);
    this.UControls.clave.setValue(row.clave);
    this.UControls.email.setValue(row.email);
    this.UControls.telefono.setValue(row.telefono);
    this.UControls.nombres.setValue(row.nombres);
    this.UControls.apellidoPaterno.setValue(row.apellidoPaterno);
    this.UControls.apellidoMaterno.setValue(row.apellidoMaterno);
    this.TypeUserSelected = row.idTipoTablaUsuario,
    this.updateRol();
    // this.RolSelected = row.idRol,

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

  onSaveUser(): void {
    this.IDSubmitted = true;

    if (this.UserForm.invalid) {      
      return;
    }
    const typeUserValue = this.TypeUserSelected;
    const rolValue = this.RolSelected;
    const clienteValue = this.ClienteSelected;

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
      idUsuarioAud: this.currentUser.idUsuario,

      idTipoTablaUsuario: typeUserValue,
      idRol: rolValue,
      idUsertablaUsuario: clienteValue,
    }).subscribe(response => {
      console.log(response);
      if (response.ok == 0) {
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

  onSetTypeUser() {
    this.rolService.typeUser_list(
    ).subscribe(response => {
      this.rowsTypeUser = response;
      // console.log(response);

      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  };


  updateRol(): void {
    this.usuarioService.rolForTypeUser_list({
      idTypeUser: this.TypeUserSelected,
    }).subscribe(response => {
    //  console.log(response)
     this.rowsRol = response;
     this.RolSelected = null;
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
    this.utilsService.blockUIStop();
  }
  
  onCliente(): void {
    this.usuarioService.cliente_list({
      idCliente: 0,
      idEstado: this.idEstado,
      Search: this.tableDefaultPageSettings.searchString,
      pageIndex: this.tableDefaultPageSettings.page,
      PageSize: this.tableDefaultPageSettings.pageSize

    }).subscribe(response => {
    //  console.log(response.clientes);
     this.rowsCliente = response.clientes;
     this.RolSelected = null;
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
    this.utilsService.blockUIStop();
  }
    
}
