import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'app/shared/services/utils.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CoreConfigService } from '@core/services/config.service';
import { ContratistasService } from '../../contratistas.service';

class Params {
  IdCliente: number;
  IdClienteGrupo: number;
  NombreGrupo: string;
  IdContratista: number;
  Especialista: string;
  FechaCreacion: string;
  constructor(IdCliente: number, IdClienteGrupo: number, NombreGrupo: string,
    IdContratista: number, Especialista: string, FechaCreacion: string) {
    this.IdCliente = IdCliente;
    this.IdClienteGrupo = IdClienteGrupo;
    this.NombreGrupo = NombreGrupo;
    this.IdContratista = IdContratista;
    this.Especialista = Especialista;
    this.FechaCreacion = FechaCreacion;
  }
}
@Component({
  selector: 'app-certificado',
  templateUrl: './certificado.component.html',
  styleUrls: ['./certificado.component.scss']
})
export class CertificadoComponent implements OnInit {

  rowsPuntajeList = [];
  params: Params;
  private _unsubscribeAll: Subject<any>;
  public coreConfig: any;

  constructor(
    private _coreConfigService: CoreConfigService,
    private route: ActivatedRoute,
    private _router: Router,
    private utilsService: UtilsService,
    private contratistasService: ContratistasService
  ) {
    this._unsubscribeAll = new Subject();
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.params = {
        IdCliente: Number(params.IdCliente),
        IdClienteGrupo: Number(params.IdClienteGrupo),
        NombreGrupo: String(params.NombreGrupo),
        IdContratista: Number(params.IdContratista),
        Especialista: String(params.Especialista),
        FechaCreacion: String(params.FechaCreacion)
      };
    });

    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
    this.onSetPuntajeFinal();
  }

  val1: any; val2: any; val3: any; val4: any; val5: any; val6: any; val7: any; val8: any; val9: any; val10: any;
  valTotal: number; resTotal: number; puntajeMin: number; resultado: string; alerta: boolean;
  res1: any; res2: any; res3: any; res4: any; res5: any; res6: any; res7: any; res8: any; res9: any; res10: any;
  razonSocial: any; rucContratista: any; razonSocialContratista: any; letter: string; fechaven: string;
  onSetPuntajeFinal() {
    this.contratistasService.puntajeFinal_List({
      idCliente: this.params.IdCliente,
      idClienteGrupo: this.params.IdClienteGrupo,
      idContratista: this.params.IdContratista,

    }).subscribe(response => {
      this.rowsPuntajeList = response;
      this.val1 = response[0].generales;
      this.val2 = response[0].seguySalud;
      this.val3 = response[0].laborales;
      this.val4 = response[0].ambiental;
      this.val5 = response[0].compliance;
      this.val6 = response[0].responsabilidad;
      this.val7 = response[0].financiera;
      this.val8 = response[0].comercial;
      this.val9 = response[0].calidad;
      this.val10 = response[0].otros;

      this.puntajeMin = response[1].puntajeMinimo;
      this.razonSocial = response[1].razonSocial;
      this.rucContratista = response[1].rucContratista;
      this.razonSocialContratista = response[1].rsContratista;
      this.res1 = response[1].generales;
      this.res2 = response[1].seguySalud;
      this.res3 = response[1].laborales;
      this.res4 = response[1].ambiental;
      this.res5 = response[1].compliance;
      this.res6 = response[1].responsabilidad;
      this.res7 = response[1].financiera;
      this.res8 = response[1].comercial;
      this.res9 = response[1].calidad;
      this.res10 = response[1].otros;

      this.fechaven = response[1].fechaVencimiento;

      this.valTotal = response[0].generales + response[0].seguySalud + response[0].laborales + response[0].ambiental + response[0].compliance +
        response[0].responsabilidad + response[0].financiera + response[0].comercial + response[0].calidad + response[0].otros;

      this.resTotal = response[1].generales + response[1].seguySalud + response[1].laborales + response[1].ambiental + response[1].compliance +
        response[1].responsabilidad + response[1].financiera + response[1].comercial + response[1].calidad + response[1].otros

      this.resTotal < this.puntajeMin ? this.resultado = 'NO HABLITADO' : this.resultado = 'HABLITADO'
      this.resTotal < this.puntajeMin ? this.alerta = true : this.alerta = false


      if (this.resTotal >= 0 && this.resTotal <= 699) {
        this.letter = 'E';
      } else if (this.resTotal >= 700 && this.resTotal <= 799) {
        this.letter = 'D';
      } else if (this.resTotal >= 800 && this.resTotal <= 849) {
        this.letter = 'C';
      } else if (this.resTotal >= 850 && this.resTotal <= 899) {
        this.letter = 'B';
      } else if (this.resTotal >= 900 && this.resTotal <= 1000) {
        this.letter = 'A';
      }

    }, error => {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
      this.utilsService.blockUIStop();
    });
  }

}
