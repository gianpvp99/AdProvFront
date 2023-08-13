import { Component, Input } from '@angular/core';

import { CoreMenuItem } from '@core/types';

@Component({
  selector: '[core-menu-vertical-item]',
  templateUrl: './item.component.html',  
  styleUrls: ['./item.component.scss']
})
export class CoreMenuVerticalItemComponent {
  @Input()
  item: CoreMenuItem;
}
