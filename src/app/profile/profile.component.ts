import { UserService } from './../@services/user.service';
import { HttpService } from './../@services/http.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserInfoEditDialogComponent } from '../components/user-info-edit-dialog/user-info-edit-dialog.component';

import { AvatarModule } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    CommonModule,
    AvatarModule,
  ],
  providers: [DialogService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  today: string = new Date().toISOString().slice(0, 10);
  is_edit: boolean = false;

  // 後端使用者資料
  emailReq = {
    email: ''
  }
  // 使用者資料
  resData!: any;
  photo: string = '';
  age: number = 0;

  person: any = {
    email: '',
    name: '',
    birthdate: '',
    gender: '',
    height: 0,
    weight: 0,
    workType: '',
    bodyType: '',
    active: false,
    admin: false,
    password: '',
    note: ''
  };
  prePassword!: string;
  passwordCheck!: string;

  visible: boolean = false;
  ref: DynamicDialogRef | undefined;

  constructor(
    private httpService: HttpService,
    private dialogService: DialogService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // 撈使用者資料
    this.emailReq.email = localStorage.getItem('userEmail') ?? '';
    this.httpService.getUserByEmailApi(this.emailReq).subscribe((res: any) => {
      // res.user 賦值給 resData
      this.resData = res.user;
      // 讓person 和 res.user 記憶體位置不同
      this.person = JSON.parse(JSON.stringify(res.user));
      console.log(this.person);
    })
  }

  // dialog
  edit(t: string) {
    this.is_edit = true;
    if (this.is_edit) {
      this.ref = this.dialogService.open(UserInfoEditDialogComponent, {
        data: {
          oldData: this.person,
          changeData: t
        },
        modal: true,
        dismissableMask: true
      });

      this.ref.onClose.subscribe((result) => {
        if (result) {
          this.person = result;
          console.log('對話框返回的資料:', result);
        }
      });
    }
  }


  // 更新照片
  changeAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.userService.convertToBase64(input.files[0])
        .then((base64: any) => {
          this.person.photo = base64;
          input.value = '';
          this.update();

        })
        .catch(err => {
          alert(err); // 顯示錯誤訊息
        });
    }
  }

  update() {
    // 傳到後端
    this.is_edit = false;
    const req = this.person;
    console.log(req);

    this.httpService.updateUserInfoApi(req).subscribe((res: any) => {
      console.log(res);
    });
  }
}
