import {Injectable} from '@angular/core';
import {BlockUI, NgBlockUI} from 'ng-block-ui';
import {ToastrService} from 'ngx-toastr';

class Mes {
  idMes: number;
  mes: string;
}

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  @BlockUI() blockUI: NgBlockUI;

  meses: Mes[] = [];

  constructor(
    private toastr: ToastrService
  ) {
  }

  showNotification(message: string, title: string, idType: number): void {
    if (idType === 1) {
      this.toastr.success(message, title, {
        progressBar: true,
        toastClass: 'toast ngx-toastr',
        closeButton: true
      });
    } else if (idType === 2) {
      this.toastr.warning(message, title, {
        progressBar: true,
        toastClass: 'toast ngx-toastr',
        closeButton: true
      });
    } else if (idType === 3) {
      this.toastr.error(message, title, {
        progressBar: true,
        toastClass: 'toast ngx-toastr',
        closeButton: true
      });
    } else if (idType === 4) {
      this.toastr.info(message, title, {
        progressBar: true,
        toastClass: 'toast ngx-toastr',
        closeButton: true
      });
    }
  }

  blockUIStart(message: string): void {
    this.blockUI.start(message);
  }

  blockUIStop(): void {
    this.blockUI.stop();
  }

  mesCombo(): Mes[] {
    this.meses = [
      {
        idMes: 1,
        mes: 'Enero'
      },
      {
        idMes: 2,
        mes: 'Febrero'
      },
      {
        idMes: 3,
        mes: 'Marzo'
      },
      {
        idMes: 4,
        mes: 'Abril'
      },
      {
        idMes: 5,
        mes: 'Mayo'
      },
      {
        idMes: 6,
        mes: 'Junio'
      },
      {
        idMes: 7,
        mes: 'Julio'
      },
      {
        idMes: 8,
        mes: 'Agosto'
      },
      {
        idMes: 9,
        mes: 'Setiembre'
      },
      {
        idMes: 10,
        mes: 'Octubre'
      },
      {
        idMes: 11,
        mes: 'Noviembre'
      },
      {
        idMes: 12,
        mes: 'Diciembre'
      }
    ];

    return this.meses;
  }

  autoIncrement(array: any[]): number {
    const ids = array.map(m => m.idFila);

    if (ids.length > 0) {
      const sorted = ids.sort((a, b) => a - b);
      return sorted[sorted.length - 1] + 1;
    }
    return 1;
  }

  formatoFecha_YYYYMMDD($event: any): string {
    if ($event === null)
      return null;

    return `${$event.year}${String($event.month).padStart(2, "0")}${String($event.day).padStart(2, "0")}`;
  }
}
