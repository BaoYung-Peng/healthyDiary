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
  food!: any;
  detail!: any;
  response: string = '';

  user!: any;
  dietForm!: any;
  type!: string;
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {
    if (config.data.food) {
      this.food = (config.data.food);
    } else {
      this.user = (config.data.user);
      this.detail = (config.data.detail);
      this.dietForm = (config.data.dietForm);
    }
    this.type = (config.data.type);
  }

  confirm() {
    this.ref.close(this.food);
  }

  cancel() {
    this.ref.close();
  }
}
