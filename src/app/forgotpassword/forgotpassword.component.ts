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

  constructor(private router: Router, private httpservice: HttpService) { }

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    this.isFocused = false;
  }

  OTP() {
    if (!this.email || this.email.trim() === '') {
      this.message = '請輸入帳號';
      this.messageType = 'error';
      return;
    }

    const submitData = {
      email: this.email,
    }

    this.httpservice.forgotpassword(submitData).subscribe({
    next: (res: any) => {
      console.log(res);
      if (res.code === 400) {
        // Handle case when email doesn't exist
        this.message = '該信箱不存在，請重新輸入';
        this.messageType = 'error';
      } else {
        // Success case
        this.message = '驗證碼已寄出，請檢查您的信箱';
        this.messageType = 'success';
      }
    },
    error: (err) => {
      // Handle other errors
      this.message = '發生錯誤，請稍後再試';
      this.messageType = 'error';
      console.error(err);
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

