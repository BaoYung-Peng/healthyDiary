import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  constructor(private router: Router){}

  goTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  get showGoTopBtn(): boolean {
    const hasGoTopBtnRoutes = ['/home', '/userpage'];
    return hasGoTopBtnRoutes.includes(this.router.url);
  }
}
