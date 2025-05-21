import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Router } from '@angular/router';
import { HttpService } from '../@services/http.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgotpassword',
  imports: [
    FloatLabelModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.scss'
})
export class ForgotpasswordComponent {
  email: string = '';
  isFocused: boolean = false; // 👈 加這個
  message: string = ''; // 提示訊息
  messageType: 'success' | 'error' = 'success'; // 控制訊息樣式
  showAnimation: boolean = false;

  constructor(private router: Router, private httpservice: HttpService) { }

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    this.isFocused = false;
  }

  OTP() {
    // 重置訊息和動畫狀態
    this.message = '';
    this.showAnimation = false;

    // 驗證輸入
    if (!this.email || this.email.trim() === '') {
      this.message = '請輸入帳號';
      this.messageType = 'error';
      return;
    }

    const submitData = {
      email: this.email,
    }

    // 顯示載入狀態（可選）
    // this.isLoading = true;

    this.httpservice.sendVerifyPwdApi(submitData).subscribe({
      next: (res: any) => {
        console.log(res);

        if (res.code === 400) {
          // 信箱不存在的情況
          this.message = '該信箱不存在，請重新輸入';
          this.messageType = 'error';
        } else {
          // 成功發送驗證碼
          this.message = '驗證碼已寄出，請檢查您的信箱';
          this.messageType = 'success';

          // 顯示動畫效果
          this.showAnimation = true;

          // 5秒後自動隱藏動畫，保留成功訊息
          setTimeout(() => {
            this.showAnimation = false;
          }, 5000);
        }
      },
      error: (err) => {
        // 處理其他錯誤
        this.message = '發生錯誤，請稍後再試';
        this.messageType = 'error';
        console.error(err);
      },
      complete: () => {
        // 無論成功或失敗都隱藏載入狀態（如果有的話）
        // this.isLoading = false;
      }
    });
  }
}
//     this.httpservice
//       .postApi('http://172.16.1.106:8080/daily/send_reset_password', submitData)
//       .subscribe({
//         next: (res: any) => {
//           console.log(res);
//           this.message = '驗證碼已寄出，請檢查您的信箱';
//           this.messageType = 'success';
//           if (res.code === 400,)
//             this.

//         },
//         error: (err) => {
//           console.error(err);
//           if (err.status === 400) {
//             this.message = '查無此帳號，請重新輸入';
//           } else {
//             this.message = '發送失敗，請稍後再試';
//           }
//           this.messageType = 'error';
//         }
//       });
//   }
// }

// const req ="http://172.16.1.106:8080/daily/send_reset_password?email="+this.email
//   console.log(submitData);
//   this.httpservice.postApi("http://172.16.1.106:8080/daily/send_reset_password", submitData).subscribe((res: any) => {
//     console.log(res);
//   });
// }

