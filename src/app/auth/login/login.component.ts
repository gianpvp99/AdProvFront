import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { CoreConfigService } from "../../../@core/services/config.service";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { User } from "../../shared/models/auth/user";
import { UtilsService } from '../../shared/services/utils.service';
import { LoginService } from './login.service';

import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  public currentUser: any;
  public coreConfig: any;

  public currentSkin: string;
  
  public AdProvForm: FormGroup;
  public ClienteForm: FormGroup;
  public ContratistaForm: FormGroup;

  public loadingContratista = false;
  public loadingCliente = false;
  public loadingAdprov = false;

  public submitContratista = false;
  public submitCliente = false;
  public submitAdProv = false;

  public returnUrl: string;
  public error = '';
  public passwordTextType: boolean;
  public passwordTextTypeUser: boolean;
  public firstAccess: String;

  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private utilsService: UtilsService,
    private _router: Router,
    private loginService: LoginService,
    private _toastrService: ToastrService,
    //private _authenticationService: AuthenticationService
  ) {
    this._unsubscribeAll = new Subject();

    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  get adprov() {
    return this.AdProvForm.controls;
  }

  get cliente() {
    return this.ClienteForm.controls;
  }

  get contratista() {
    return this.ContratistaForm.controls;
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  togglePasswordTextTypeUser() {
    this.passwordTextTypeUser = !this.passwordTextTypeUser;
  }

  ngOnInit(): void {
    this.AdprovUser = 3;
    this.AdProvForm = this._formBuilder.group({
      ruc: [''],
      user: ['', [Validators.required]],
      password: ['', Validators.required]
    });

    this.ClienteForm = this._formBuilder.group({
      ruc: ['', [Validators.required]],
      password: ['', Validators.required]
    });

    this.ContratistaForm = this._formBuilder.group({
      ruc: ['', [Validators.required]],
      user: [''],
      password: ['', Validators.required]
    });

    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';

    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });

    this._coreConfigService
      .getConfig()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(config => {
        this.currentSkin = config.layout.skin;
      });
  }

  onAdprovSubmit() {
    this.submitAdProv = true;
    this.loadingAdprov = true;

    if (this.AdProvForm.invalid) {
      this.loadingAdprov = false;
      return;
    }

    this.loginService.login({
      ruc: this.adprov.ruc.value,
      usuario: this.adprov.user.value,
      clave: this.adprov.password.value,
      idSignInType: 2
    }).subscribe((response: User) => {
      if (response != null) {
        if (response.idUsuario != 0) {

          this.loginService.setMenuAccess({
            role: response.idRol,
          }).subscribe(response => {            
            localStorage.setItem('menuAux', JSON.stringify(response));
            this.firstAccess = response[0].children[0].url; // Traer el primer objeto del response

            }, error => {
            console.log(error);
            });

          this.error = response.errorMessage;
          localStorage.setItem('currentUser', JSON.stringify(response));
          setTimeout(() => {
            this._toastrService.success(
              'Inicio sesión correctamente ' +
              response.nombres + ' ' + response.apellidoPaterno + ' ' + response.apellidoMaterno,
              '👋 Bienvenido, ' + response.usuario + '!',
              { toastClass: 'toast ngx-toastr', closeButton: true }
              
            );
            // this._router.navigate(['estadisticas']);
            this._router.navigate([this.firstAccess]);
          }, 1000);
        
          
        } else {
          this.error = response.errorMessage;
          this.loadingAdprov = false;
        }
      } else {
        this.error = response.errorMessage;
        this.loadingAdprov = false;
      }
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('Error interno del servidor, comunicar al administrador', 'Error', 3);
      this.loadingAdprov = false;
      this.utilsService.blockUIStop();
    });
  }

  onClienteSubmit() {
    this.submitCliente = true;
    this.loadingCliente = true;

    if (this.ClienteForm.invalid) {
      this.loadingCliente = false;
      return;
    }

    this.loginService.login({
      ruc: this.cliente.ruc.value,
      usuario: "",
      clave: this.cliente.password.value,
      idSignInType: 4
    }).subscribe((response: User) => {
      if (response.errorMessage == '') {
        this.error = response.errorMessage;
        localStorage.setItem('currentUser', JSON.stringify(response));
        setTimeout(() => {
          this._toastrService.success(
            'Se logueo correctamente ' +
            response.nombres + ' ' + response.apellidoPaterno + ' ' + response.apellidoMaterno,
            '👋 Bienvenido, ' + response.usuario + '!',
            { toastClass: 'toast ngx-toastr', closeButton: true }
          );

          this._router.navigate(['/dashboard/clientes/cliente-contratista']);
        }, 1000);
      } else {
        this.error = response.errorMessage;
        this.loadingCliente = false;
      }
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.loadingCliente = false;
      this.utilsService.blockUIStop();
    });
  }

  onContratistaSubmit() {
    this.submitContratista = true;
    this.loadingContratista = true;

    if (this.ContratistaForm.invalid) {
      this.loadingContratista = false;
      return;
    }

    this.loginService.login({
      ruc: this.contratista.ruc.value,
      usuario: this.contratista.user.value,
      clave: this.contratista.password.value,
      idSignInType: 3
    }).subscribe((response: User) => {
        if(response.idPerfil == 3){

        this.loginService.setMenuAccess({
          role: 4,
        }).subscribe(response => {            
          localStorage.setItem('menuAux', JSON.stringify(response));
          this.firstAccess = response[0].children[0].url; // Traer el primer objeto del response

          }, error => {
          console.log(error);
          });

        this.error = response.errorMessage;
        localStorage.setItem('currentUser', JSON.stringify(response));
        setTimeout(() => {
          this._toastrService.success(
            'Se logueo correctamente ' +
            response.nombres + ' ' + response.apellidoPaterno + ' ' + response.apellidoMaterno,
            '👋 Bienvenido, ' + response.usuario + '!',
            { toastClass: 'toast ngx-toastr', closeButton: true }
          );

          this._router.navigate(['/dashboard/contratistas/contratista-clientes']);
        }, 1000);
      }else {
        this.error = 'Credenciales Incorrectas';
        this.loadingContratista = false;
      }
      this.utilsService.blockUIStop();
    }, error => {
      this.utilsService.showNotification('Error interno del servidor, comunicar al administrador', 'Error', 3);
      this.loadingContratista = false;
      this.utilsService.blockUIStop();
    });
  }

  AdprovUser: number;
  BagdeNameReturn(value): void {
    this.AdprovUser = value;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
