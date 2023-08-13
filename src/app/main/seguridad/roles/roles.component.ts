import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { User } from 'app/shared/models/auth/user';
import { UtilsService } from 'app/shared/services/utils.service';
import { RolesService } from './roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  
  public currentUser: User;
  public contentHeader: object;
  public searchValue = '';
  sesionUsuario: number;
  public page = 10;


  tipoUsuarioSelected: any;
  public ColumnMode = ColumnMode;
  forPageOptions = [10, 25, 50, 100];
  option = 1;

  public IDSubmitted = false;

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };

  rowMenu = [];

  rolSettings = { ...this.tableDefaultPageSettings };
  rowsRol = [];
  rowsTypeUser = [];
  rowsAccess = [];
  rowsRolAccess = [];
  searchAccessRole: number;
  row:any;



  public RolForm: FormGroup;
  public editRolForm: FormGroup;
  public accessRolForm: FormGroup;

  get UControlsAdd(): { [p: string]: AbstractControl } {
    return this.RolForm.controls;
  }

  get UControlsEdit(): { [p: string]: AbstractControl } {
    return this.editRolForm.controls;
  }

  get UControlsAccessAdd(): { [p: string]: AbstractControl } {
    return this.accessRolForm.controls;
  }

  constructor(
    private utilsService: UtilsService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private rolService: RolesService
    ) {
      
    this.RolForm = this.formBuilder.group({
      id: [0],
      nombre: ['',Validators.required],
      idTipoTablaUsuario: [null],
      user: [1],
    });

    this.editRolForm = this.formBuilder.group({
      id: [Validators.required],
      nombre: ['',Validators.required],
      idTipoTablaUsuario: [0],
      user: [1],
    })

    this.accessRolForm = this.formBuilder.group({
      id: [0],
      idAccess: [null],
      // idRol: [null],
      user:[1],
    })

    this.contentHeader = {
      headerTitle: 'Roles',
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
            name: 'Roles',
            isLink: false
          }
        ]
      }
    };
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.sesionUsuario = this.currentUser.idUsuario;
    this.onClickBtn(1);
  }

  onReloadPage() {
    this.onSetPage();
    this.onSetTypeUser();
  }

  onClickBtn(value) {
    this.option = value;
    this.onSetPage();
    this.onSetTypeUser();
  }

  onSetPage(){
    this.utilsService.blockUIStart('Cargando listado de Roles...');
    this.rolService.rol_list({
      option: this.option,
      search: this.rolSettings.searchString,
      page: this.rolSettings.page,
      pageSize: this.rolSettings.pageSize
    }).subscribe(response => {
      this.rowsRol = response;
      // console.log(response);
      this.rolSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

  onSetTypeUser() {
    this.utilsService.blockUIStart('Cargando listado de Tipo de Usuarios ...');
    this.rolService.typeUser_list(
    ).subscribe(response => {
      this.rowsTypeUser = response;
      // console.log(response);


      this.rolSettings.colletionSize = response[0] ? response[0].totalElements : 0;
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  };

  onNewRol(modal: NgbModal) {
    this.UControlsAdd.id.setValue(0);
    this.UControlsAdd.nombre.setValue('');
    this.UControlsAdd.idTipoTablaUsuario.setValue(0);
    this.UControlsAdd.user.setValue('')
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

  onSaveRol(): void {
    this.IDSubmitted = true;

    if (this.RolForm.invalid) {      
      return;
    }    
    this.rolService.rol_save({
      id: this.UControlsAdd.id.value,
      nombre: this.UControlsAdd.nombre.value,
      idTipoTablaUsuario: this.UControlsAdd.idTipoTablaUsuario.value,
      user: this.currentUser.idUsuario
    }).subscribe(response => {
      if (response == 1) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onSetPage();
        // console.log(response); //probando
      } else {
        this.utilsService.showNotification(response.message, 'Alert', 3);
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
  }

  onSaveEditRol(){

    this.IDSubmitted = true;

    if (this.editRolForm.invalid) {      
      return;
    }    
    this.rolService.rol_update({
      id: this.UControlsEdit.id.value,
      nombre: this.UControlsEdit.nombre.value,
      idTipoTablaUsuario: this.UControlsEdit.idTipoTablaUsuario.value,
      user: this.currentUser.idUsuario
    }).subscribe(response => {
      if (response == 1) {
        this.utilsService.showNotification('Informacion editada correctamente', 'Confirmación', 1);
        this.modalService.dismissAll();
        this.onSetPage();
        // console.log(response); //probando
      } else {
        this.utilsService.showNotification(response.message, 'Alert', 3);
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });

  }

  onEditRol(editmodal: NgbModal, row){

    this.UControlsEdit.id.setValue(row.idRol);
    this.UControlsEdit.nombre.setValue(row.nombreRol);
    // this.UControlsEdit.idTipoTablaUsuario.setValue(row.idTipoTablaUsuario);

    setTimeout(() => {
      this.modalService.open(editmodal, {
        scrollable: true,
        size: 'md',
        centered: true,
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }
  
  onDeleteRol(row){
    
    Swal.fire({
      title: 'Confirmación',
      text: '¿Desea eliminar este rol?, esta acción no podrá revertirse',
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
        this.rolService.rol_delete({
          idRole: row.idRol,
          iduser: this.currentUser.idUsuario
        }).subscribe(response => {
          if (response == 1) {
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
  
  onaccessRol(row){

    this.UControlsAccessAdd.id.setValue(row.idTipoTabla);
    this.rolService.access_list({
      idTipoUser: row.idTipoTabla,
    }).subscribe(response => {
    this.rowsAccess= response;
    this.row = row;

      }, error => {
        this.utilsService.showNotification('[F]: Un interno error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
      
      
  }

  onaccessRolModal(row){
    this.searchAccessRole=row;
    this.rolService.role_access_list_Modal({
      role: row,

    }).subscribe(response => {
    this.rowsRolAccess= response;
      // console.log(this.rowsRolAccess);
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
  }

  onSetRolAcess(row){
    this.rolService.role_access_list_Modal({
      role: row.id,

    }).subscribe(response => {
    this.rowsRolAccess= response;
      // console.log(this.rowsRolAccess);
      }, error => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
      });
  }

  openModalRol(accessRol: NgbModal){
    setTimeout(() => {
      this.modalService.open(accessRol, {
        scrollable: true,
        size: 'lg',
        centered: true,
        beforeDismiss: () => {
          return true;
        }
      });
    }, 0);
  }
    
  onSaveAccessRol(){
    this.rolService.rol_access_save({
      id: this.UControlsAccessAdd.id.value,
      idAccess: this.UControlsAccessAdd.idAccess.value,
      idRol: this.row.idRol,
      user: this.currentUser.idUsuario
    }).subscribe(response => {
      if (response == 1) {
        this.utilsService.showNotification('Informacion guardada correctamente', 'Confirmación', 1);
        this.onaccessRolModal(this.searchAccessRole);
        this.UControlsAccessAdd.idAccess.setValue(null);
      } else {
        this.utilsService.showNotification('EL ACCESO YA EXISTE', 'Warning', 2);
        this.UControlsAccessAdd.idAccess.setValue(null);
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });

      
  }

  onDeleteRolAccess(row){
    
    this.rolService.rol_access_delete({
      idAccessRole: row,
    }).subscribe(response => {
      if (response == 1) {
        // console.log(this.searchAccessRole);
        this.onaccessRolModal(this.searchAccessRole);
        this.utilsService.showNotification('Registro eliminado correctamente', 'Operación satisfactoria', 1);
        this.UControlsAccessAdd.idAccess.setValue(null);        
      }
      else {
        this.utilsService.showNotification(response.message, 'Error', 3);
      }
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
    });
    this.utilsService.blockUIStop(); 
  
  }
}
