
import { Component, ViewChild } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { Menu } from 'primeng/menu';
import { Router, RouterLink } from '@angular/router';
import { LocalstorageService } from '../../@services/localstorage.service';

interface navItem {
  label: string;
  icon?: string;
  path?: string;
  routerLink?: string;
  command?: any;
}

@Component({
  selector: 'app-header',
  imports: [
    Toolbar,
    AvatarModule,
    Menu,
    DrawerModule,
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @ViewChild('drawerRef') drawerRef!: Drawer;

  // 顯示 toggle 按鈕
  visible = false;

  // 是否登入，初始為false
  is_login: boolean = false;

  // 登出後選單欄位
  menuItemsLoggedOut: navItem[] = [
    {
      label: '登入',
      icon: 'pi pi-sign-in',
      routerLink: 'login',
    },
    {
      label: '註冊',
      icon: 'pi pi-user-plus',
      routerLink: 'register',
    },
  ];

  // 登入後選單欄位
  menuItemsLoggedIn: navItem[] = [
    {
      label: '會員資料',
      icon: 'pi pi-user',
      routerLink: 'profile',
    },
    {
      label: '登出',
      icon: 'pi pi-sign-out',
      routerLink: '/home',
      command: () => {
        this.localstorageService.removeItem();
      }
    },
  ];

  // 側邊導航欄位
  navItems: navItem[] = [
    {
      label: '紀錄飲食',
      icon: '/imgs/diet.svg',
      path: 'userpage/diet'
    },
    {
      label: '紀錄運動',
      icon: '/imgs/exercise.svg',
      path: 'userpage/exercise'
    },
    {
      label: '紀錄睡眠',
      icon: '/imgs/sleep.svg',
      path: 'userpage/sleep'
    },
    {
      label: '健康報告',
      icon: '/imgs/report.svg',
      path: 'userpage/report'
    },
    {
      label: '會員資料',
      icon: '/imgs/person.svg',
      path: 'profile'
    },
  ];

  constructor(
    private router: Router,
    private localstorageService: LocalstorageService
  ) { }

  ngOnInit(): void {
    // 訂閱登入狀態
    this.localstorageService.isLogin$.subscribe((status) => {
      console.log(status);

      this.is_login = status;
    });
  }

  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }

  gotoPage(url: string) {
    // if(url == '/home'){
    //   this.localstorageService.removeItem();
    // }
    this.router.navigate([url]);

  }
}
