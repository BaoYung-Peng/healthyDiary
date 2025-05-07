import { Component } from '@angular/core';
import { HttpService } from '../../@services/http.service';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { getLocaleMonthNames } from '@angular/common';


@Component({
  selector: 'app-user-info-edit-dialog',
  imports: [
    FormsModule,

    ButtonModule,
    FloatLabelModule,
    InputTextModule
  ],
  templateUrl: './user-info-edit-dialog.component.html',
  styleUrl: './user-info-edit-dialog.component.scss'
})
export class UserInfoEditDialogComponent {

  changeData!: any;
  person!: any;
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private httpService: HttpService
  ) {
    this.person = JSON.parse(JSON.stringify(config.data.oldData));
    this.changeData = (config.data.changeData);
    console.log(this.person);
    console.log(this.changeData);
  }

  update() {
    // 傳到後端
    const req = this.person;
    console.log(req);
    this.httpService.updateUserInfoApi(req).subscribe({
      next: (res: any) => {
        console.log('API回應:', res);
      },
      // 處理錯誤回應
      error: (err: any) => {
        console.error('API錯誤:', err);
      }
    });
  }

  fillincheck(): boolean {
    if (this.newPassword == '') {
      return false;
    }
    if (this.confirmPassword == '') {
      return false;
    }
    if (this.confirmPassword != this.newPassword) {
      return false;
    }
    return true;
  }

  confirm() {
      this.update();
      this.ref.close(this.person);
  }

  cancel() {
    this.ref.close();
  }
}
