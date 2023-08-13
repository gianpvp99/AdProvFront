import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '../../../model/user';
import { CoreMenuService } from '@core/components/core-menu/core-menu.service';

@Component({
  selector: '[core-menu]',
  templateUrl: './core-menu.component.html',
  styleUrls: ['./core-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreMenuComponent implements OnInit {
  public currentUser: User;

  @Input()
  layout = 'vertical';

  @Input()
  menu: any;

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   *
   * @param {ChangeDetectorRef} _changeDetectorRef
   * @param {CoreMenuService} _coreMenuService
   */
  constructor(private _changeDetectorRef: ChangeDetectorRef, private _coreMenuService: CoreMenuService) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    
    // Set the menu either from the input or from the service
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Subscribe to the current menu changes
    this._coreMenuService.onMenuChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.menu = this._coreMenuService.getCurrentMenu();
      // let menuAux: any;
      // menuAux = localstorage.getItem("menuAux");
      // if (menuAux == "undefined" || menuAux == null) {
      //   localstorage.setItem('menuAux', JSON.stringify(this.menu));
      // }
      
      // Load menu
      this.menu = [...JSON.parse(localStorage.getItem("menuAux"))];

      this._changeDetectorRef.markForCheck();
    });

    // this.onSetPage();
  }

}
