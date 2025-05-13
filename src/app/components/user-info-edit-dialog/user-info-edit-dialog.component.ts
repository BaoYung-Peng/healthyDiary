import { Component } from '@angular/core';
import { HttpService } from '../../@services/http.service';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumber } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';


interface Items {
  label: string;
  value: string;
}

@Component({
  selector: 'app-user-info-edit-dialog',
  imports: [
    FormsModule,

    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    InputNumber,
    PasswordModule,
  ],
  templateUrl: './user-info-edit-dialog.component.html',
  styleUrl: './user-info-edit-dialog.component.scss'
})
export class UserInfoEditDialogComponent {

  wtList: Items[] = [
    { label: '輕度活動工作: 大部分從事坐著或不動的工作。 例如: 上班族、醫師', value: '輕度活動工作' },
    { label: '中度活動工作: 從事需來回走動，偶爾使用力氣之工作。例如: 護理師、警察', value: '中度活動工作' },
    { label: '重度活動工作: 從事需耗費大量力氣，時常揮汗如雨的工作。例如: 工人、農人', value: '重度活動工作' }
  ]

  btList: Items[] = [
    { label: '變瘦', value: '變瘦' },
    { label: '保持不變', value: '保持不變' },
    { label: '變精美', value: '變精美' },
    { label: '變巨巨', value: '變巨巨' },

  ]

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

  editGender(gender: string) {
    this.person.gender = gender;
    this.confirm();
  }

  editWt(wt: string) {
    this.person.workType = wt;
    this.confirm();
  }

  editBt(bt: string) {
    this.person.bodyType = bt;
    this.confirm();
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
  editPwd() {
    if (this.fillincheck()) {
      this.person.password = this.newPassword;
      console.log(this.person.password);
      this.confirm();
    }
  }

  confirm() {
    this.update();
    this.ref.close(this.person);
  }

  cancel() {
    this.ref.close();
  }
}
