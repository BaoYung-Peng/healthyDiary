import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-food-edit-dialog',
  imports: [
    FormsModule,

    ButtonModule,
    InputNumber,
  ],
  templateUrl: './food-edit-dialog.component.html',
  styleUrl: './food-edit-dialog.component.scss'
})
export class FoodEditDialogComponent {
  food!:any;
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {
    this.food = (config.data.food);

  }

  confirm() {
    this.ref.close(this.food);
  }

  cancel() {
    this.ref.close();
  }
}
