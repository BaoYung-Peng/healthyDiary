import { HttpService } from '../@services/http.service';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-edit-verify',
  imports: [
    ButtonModule,
    RouterLink
  ],
  templateUrl: './edit-verify.component.html',
  styleUrl: './edit-verify.component.scss'
})
export class EditVerifyComponent {
  token!: string;
  loading: boolean = true;

  constructor(
    private http: HttpService,
    private router: ActivatedRoute,
  ) { }
  ngOnInit(): void {
    this.router.queryParams.subscribe(params => {
      this.token = params['token']
    });

    const req = {
      token: this.token,
    }

    this.http.resetPwdApi(req).subscribe({
      next: (res: any) => {
        console.log("API回應", res);
        this.loading = false;
      },
      error: (err) => {
        console.log("API報錯", err);
        this.loading = false;

      }
    });
  }
}
