import { HttpService } from '../@services/http.service';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-verify',
  imports: [
    ButtonModule,
    RouterLink
  ],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss'
})
export class VerifyComponent {
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

    this.http.verifyRegApi(req).subscribe({
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
