import { Component } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  constructor(private router: Router) { }

  get showHeader(): boolean {
    // 當路徑是 login 或 register 時，不顯示 Header
    const noHeaderRoutes = ['/login', '/register'];
    return !noHeaderRoutes.includes(this.router.url);
  }

}
