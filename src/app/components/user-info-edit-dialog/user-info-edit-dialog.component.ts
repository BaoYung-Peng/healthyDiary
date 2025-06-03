import { Component } from '@angular/core';
import { HttpService } from '../../@services/http.service';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumber } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

interface Items {
  label: string;
  value: string;

}

interface Items {
  img: string;
}

@Component({
  selector: 'app-user-info-edit-dialog',
  imports: [
    FormsModule,
    CommonModule,
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
    {
      label: '靜態活動工作: 大部分從事坐著或不動的工作。例如: 上班族、醫師',
      value: '靜態活動工作',
      img: 'imgs/wt-static.png'
    },
    {
      label: '輕度活動工作: 從事需來回走動，偶爾使用力氣之工作。例如: 護理師、警察',
      value: '輕度活動工作',
      img: 'imgs/wt-light.png'
    },
    {
      label: '重度活動工作: 從事需耗費大量力氣，時常揮汗如雨的工作。例如: 工人、農人',
      value: '重度活動工作',
      img: 'imgs/wt-heavy.png'
    }
  ];

  btList: Items[] = [
    { label: '變瘦', value: '變瘦', img: 'imgs/thin.png' },
    { label: '維持身材', value: '維持身材', img: 'imgs/maintain.png' },
    { label: '變精美', value: '變精美', img: 'imgs/toned.png' },
    { label: '變巨巨', value: '變巨巨', img: 'imgs/muscular.png' },
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
    if (this.newPassword.length < 8) {
      console.log('長度<8');
      return false;
    }
    if (this.confirmPassword != this.newPassword) {
      console.log('和確認密碼不同');
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
