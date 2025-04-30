import { Component, signal } from '@angular/core';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DividerModule } from 'primeng/divider';

import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../@services/http.service';

import { Message } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-editpassword',
  imports: [
    PasswordModule,
    FormsModule,
    FloatLabelModule,
    DividerModule,
    Message,
    ButtonModule
  ],
  templateUrl: './editpassword.component.html',
  styleUrl: './editpassword.component.scss'
})
export class EditpasswordComponent {
  password: string = '';
  passwordError: string = '';
  token: string = '';
  visible = signal(false);

  constructor(private httpservice: HttpService, private route: ActivatedRoute,private router: Router) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // this.token = this.router.url
    // this.token = decodeURIComponent(this.router.snapshot.paramMap.get("token") || '')
    this.route.queryParams.subscribe(params => {
      this.token = params['token']
      console.log(this.token);
    })
  }

  edit() {
    // const trimmedPassword = this.password.trim();
    // const length = trimmedPassword.length;

    // console.log('密碼長度：', length);
    // console.log('密碼內容：', trimmedPassword);

    // if (length < 8 || length > 16) {
    //   this.passwordError = '密碼長度需為 8~16 字元';
    //   alert('密碼長度需為 8~16 字元');
    //   return;
    // }

    const editData = {
      token: this.token,
      password: this.password
    }

    this.httpservice.editpasswordApi(editData).subscribe({
      next: (res) => {
        this.visible.set(true); // 顯示成功訊息
        setTimeout(() => {
          this.router.navigate(['/editconfirm']); // 3 秒後跳轉到 editconfirm
        }, 3000);
      },
      error: (err) => {
        console.error(err);
        // 可以在此處顯示錯誤訊息
      }
    });
  }

}
