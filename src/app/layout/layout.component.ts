import { Component } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { Router } from '@angular/router';
import { LocalstorageService } from '../@services/localstorage.service';

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

  constructor(
    private router: Router,
    private localstorageService: LocalstorageService
  ) { }

  // ngOnInit(): void {
  //   window.addEventListener("beforeunload", this.localstorageService.removeItem);
  // }

  // ngOnDestroy() {
  //   window.removeEventListener("beforeunload", this.localstorageService.removeItem);
  // }

  get showHeader(): boolean {
    // 當路徑是 login 或 register 時，不顯示 Header
    const noHeaderRoutes = ['/login', '/register'];
    return !noHeaderRoutes.includes(this.router.url);
  }

  get showFooter(): boolean {
    // 當路徑是 home 顯示 Footer
    const noHeaderRoutes = ['/home'];
    return noHeaderRoutes.includes(this.router.url);
  }

}
