import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UtilsService } from 'app/shared/services/utils.service';
import { colors } from 'app/colors.const';
import { CoreConfigService } from '@core/services/config.service';
import { User } from 'app/shared/models/auth/user';
import { DashboardService } from 'app/main/estadisticas/dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../clientes.service';

class EmpleadoList {
  fullName: string;
  cadenaQr: String;
  idEmpleado: number;
  nroDocumento: string;
  nombres: String;
  apellidoPaterno: String;
  apellidoMaterno: String;
  telefono: number;
  foto: string;
  rsContratista: string;
  estado: string;
  idCliente: number;
  idProyecto:number;
  regimenGeneral: number;
  regimenMype: number;
  regimenAgrario: number;
  construccionCivil: number;
}

@Component({
  selector: 'app-validacion-qr',
  templateUrl: './validacion-qr.component.html',
  styleUrls: ['./validacion-qr.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class ValidacionQrComponent implements OnInit {
  
  @ViewChild('goalChartRef') goalChartRef: any;
  @ViewChild('statisticsBarChartRef') statisticsBarChartRef: any;
  @ViewChild('statisticsLineChartRef') statisticsLineChartRef: any;
  @ViewChild('earningChartRef') earningChartRef: any;
  @ViewChild('revenueReportChartRef') revenueReportChartRef: any;
  @ViewChild('budgetChartRef') budgetChartRef: any;
  
  public currentUser: User;
  public contentHeader: object;
  public goalChartoptions;
  public isMenuToggled = false;
  public data: any;
  public statisticsBar;
  public statisticsLine;
  public earningChartoptions;
  public revenueReportChartoptions;
  public budgetChartoptions;
  public documentValue: Number;

  public empleadoListQr: EmpleadoList;

  public empleadoProyecto: String;

  private $goalStrokeColor2 = '#51e5a8';
  private $strokeColor = '#ebe9f1';
  private $textHeadingColor = '#5e5873';

  tableDefaultPageSettings = {
    searchString: '',
    colletionSize: 0,
    page: 1,
    pageSize: 10
  };
  
  QRSettings = { ...this.tableDefaultPageSettings };

  constructor(
    private utilsService: UtilsService,
    private _coreConfigService:CoreConfigService,
    private route: ActivatedRoute,
    private apiServiceCliente:ClienteService,
    // private _dashboardService: DashboardService,

  ) {

    this.contentHeader = {
      headerTitle: 'Validaciones QR',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Control Ingreso',
            isLink: true,
            link: '/dashboard/clientes/ingreso-empleados',
          },
          {
            name: 'Validaciones QR',
            isLink: false
          }
        ]
      }
    };

    // Goal Overview  Chart
    this.goalChartoptions = {
      chart: {
        height: 245,
        type: 'radialBar',
        sparkline: {
          enabled: true
        },
        dropShadow: {
          enabled: true,
          blur: 3,
          left: 1,
          top: 1,
          opacity: 0.1
        }
      },
      colors: [this.$goalStrokeColor2],
      plotOptions: {
        radialBar: {
          offsetY: -10,
          startAngle: -150,
          endAngle: 150,
          hollow: {
            size: '77%'
          },
          track: {
            background: this.$strokeColor,
            strokeWidth: '50%'
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              color: this.$textHeadingColor,
              fontSize: '2.86rem',
              fontWeight: '600'
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: [colors.solid.success],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100]
        }
      },
      stroke: {
        lineCap: 'round'
      },
      grid: {
        padding: {
          bottom: 30
        }
      }
    };

   }

  ngOnInit(): void {

    //  // get the currentUser details from localStorage
     this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
     console.log(this.currentUser);

    //  // Get the dashboard service data
    //  this._dashboardService.onApiDataChanged.subscribe(response => {
    //    this.data = response;
    //  });
    
    this.uploadUrl();
    this.empleadoList();
  }

  onReloadPage() {
    this.onSetPage();
  }

  onSetPage(){
    this.utilsService.blockUIStart('Cargando datos del empleado ...');
  }

  ngAfterViewInit() {
    // Subscribe to core config changes
    this._coreConfigService.getConfig().subscribe(config => {
      // If Menu Collapsed Changes
      if (
        (config.layout.menu.collapsed === true || config.layout.menu.collapsed === false) &&
        localStorage.getItem('currentUser')
      ) {
        setTimeout(() => {
          if (this.currentUser.idRol == 1) {
            // Get Dynamic Width for Charts
            this.isMenuToggled = true;
            this.statisticsBar.chart.width = this.statisticsBarChartRef?.nativeElement.offsetWidth;
            this.statisticsLine.chart.width = this.statisticsLineChartRef?.nativeElement.offsetWidth;
            this.earningChartoptions.chart.width = this.earningChartRef?.nativeElement.offsetWidth;
            this.revenueReportChartoptions.chart.width = this.revenueReportChartRef?.nativeElement.offsetWidth;
            this.budgetChartoptions.chart.width = this.budgetChartRef?.nativeElement.offsetWidth;
            this.goalChartoptions.chart.width = this.goalChartRef?.nativeElement.offsetWidth;
          }
        }, 500);
      }
    });
  }

  uploadUrl(){
    // Obtén el valor del parámetro 'document' de la URL
    this.route.queryParams.subscribe(params => {
      this.documentValue = params['document'];
      // console.log(this.documentValue);
      // this.qrForm.get('document').setValue(this.documentValue);

      // this.empleadoList(this.documentValue);
    });
  }

  empleadoList() {
    this.apiServiceCliente.empleado_List_Document({
      IdCliente: 1, // PONER EL CLIENTE QUE VIENE DEL LOCALSTORAGE
      NroDocumento: this.documentValue
    }).subscribe(
      (res: any[]) => {
        if(res !== null){
          this.empleadoListQr = res[0];

          // Divide la cadena en dos partes usando el guión como separador
          const partesEstado = this.empleadoListQr.estado.split('-');
          const primeraParte = partesEstado[0].trim();
          this.empleadoProyecto = primeraParte;
          // console.log(primeraParte);
          // console.log(this.empleadoListQr);
          // console.log(this.empleadoListQr.estado);  
        }else if( res == undefined) {
          this.utilsService.showNotification('[W]: No existe el empleado ingresado', 'Warning', 2);
          this.utilsService.blockUIStop();

        }
       
      },
      (error: any) => {
        this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
        console.error(error);
      }
    );
  }

  lisDocumentEmpleado(){
    this.apiServiceCliente.documentoHomEmpleado_List({
      idCliente: 1,
      idProyecto: this.empleadoListQr.idProyecto,
      idEmpleado: this.empleadoListQr.idEmpleado,
      idRegimenGeneral: this.empleadoListQr.regimenGeneral,
      idRegimenMype: this.empleadoListQr.regimenMype,
      idRegimenAgrario: this.empleadoListQr.regimenAgrario,
      idConstruccionCivil: this.empleadoListQr.construccionCivil
    }).subscribe((res:any) =>
    {
      console.log(res);
    }, (error:any) =>
    {
      this.utilsService.showNotification('[F]: An internal error has occurred', 'Error', 3);
        this.utilsService.blockUIStop();
        console.error(error);
    });

  }
  
}
