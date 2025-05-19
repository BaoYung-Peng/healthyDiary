import { AfterViewInit, Component, ElementRef, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { PasswordModule } from 'primeng/password';
import { HttpService } from '../@services/http.service';
import { LocalstorageService } from '../@services/localstorage.service';
import Lenis from '@studio-freight/lenis/types';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    PasswordModule,
    DividerModule,
    IftaLabelModule,
    FloatLabelModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  // 門元素
  @ViewChild('leftDoor') leftDoor!: ElementRef;
  @ViewChild('rightDoor') rightDoor!: ElementRef;

  // 光效元素
  @ViewChild('lightLine') lightLine!: ElementRef;         // 門縫光線
  @ViewChild('lightBeam') lightBeam!: ElementRef;         // 光束效果
  @ViewChild('lightFlash') lightFlash!: ElementRef;       // 閃光效果
  @ViewChild('whiteFlashOverlay') whiteFlashOverlay!: ElementRef;
  @ViewChild('lightExpansion') lightExpansion!: ElementRef; // 光擴散
  @ViewChild('contentScene') contentScene!: ElementRef;   // 主要內容場景
  @ViewChild('animationContainer') animationContainer!: ElementRef;

  @ViewChild('block2', { static: false }) block2Ref!: ElementRef;
  // @ViewChild('block2') block2Ref!: ElementRef;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  private lenis!: Lenis;
  currentImage = 0;
  private isLocked = false;

  email: string = '';
  password: string = '';
  returnUrl = '';
  value!: string;
  passwordError: string = '';

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private httpservice: HttpService,
    private localstorageService: LocalstorageService
  ) { }

  ngOnInit() {
    // gsap.registerPlugin(ScrollTrigger);
    // this.setupLenisSmoothScroll();
  }

  // 動畫啟動 先鎖住滾動，並執行門開啟動畫
  ngAfterViewInit() {
    this.lockScroll();
    this.playDoorAnimation();
  }

  ngOnDestroy() {
    if (this.lenis) {
      this.lenis.destroy();
    }
  }

  // 防止畫面滾動（避免動畫中被打斷）
  private lockScroll() {
    document.body.style.overflow = 'hidden';
  }

  // 動畫完成後恢復滾動功能
  private unlockScroll() {
    document.body.style.overflow = '';
  }

  // 開門動畫Run
  playDoorAnimation() {
    // 初始化設定
    gsap.set([this.leftDoor.nativeElement, this.rightDoor.nativeElement], {
      // transformOrigin 就是轉換的基準點。
      transformOrigin: "center center" // 將門板的旋轉與動畫基準點設在「元件中心」。
    });
    gsap.set(this.lightBeam.nativeElement, {
      opacity: 0, // 透明（看不到）且高度縮成 0
      scaleY: 0,  // 表示垂直縮放為 0（完全沒有高度）。
      transformOrigin: "50% 0%"
    });
    gsap.set(this.lightLine.nativeElement, {
      opacity: 0 // 門縫的閃光，起始設定為完全不可見。

    });
    // 登入畫面，在動畫前先隱藏起來（透明）
    gsap.set(this.contentScene.nativeElement, { opacity: 0 });

    // 建立動畫時間軸 Timeline
    const tl = gsap.timeline({ // 建立動畫序列。
      defaults: { ease: "power3.out" }, //動畫速率設定（起快後慢，讓動作更自然）。
      onComplete: () => { //整段動畫結束後要做的事（這邊是解鎖畫面滾動，以及隱藏光束元素）。
        this.unlockScroll();
        // 動畫完成後隱藏所有光效元素
        gsap.set([this.lightLine.nativeElement, this.lightBeam.nativeElement], {
          opacity: 0,
          display: 'none'
        });
        // 確保內容場景可交互
        this.renderer.setStyle(this.contentScene.nativeElement, 'pointer-events', 'auto');
      }
    });

    // 階段1: 門縫閃三下，接著 => 有強光從裡面透出來。
    tl.to(this.lightLine.nativeElement, {
      opacity: 1, // 透明度為 1（完全顯示）
      duration: 0, // 0.2 秒完成。
      repeat: 0, // 重複 3 次。
      yoyo: true // 每次重複時會來回閃爍（亮→暗→亮→暗）
    });

    // 門縫光線淡出並向左滑出（自然移除）
    tl.to(this.lightLine.nativeElement, {
      opacity: 0,
      x: 0, // 向左滑出視窗
      duration: 0.5
    }, "-=0.5"); // 與最後一次閃爍有稍微重疊

    // 階段2: 門開始打開 接著 => 出現光束
    // x:表示水平位移 第 0 個元素（左門）往左 -100% / 右門 往右 100%
    tl.to([this.leftDoor.nativeElement, this.rightDoor.nativeElement], {
      x: (i) => i === 0 ? "-100%" : "100%",
      duration: 1.5,
      ease: "power3.inOut"
    }, ">"); // 這個動畫會接在上個動畫結束之後

    // 光束升起（門開動畫前出現）
    tl.to(this.lightBeam.nativeElement, {
      opacity: 0.8,
      scaleY: 1,
      duration: 0.8
    }, "-=1.2"); // 與門動畫重疊

    // 門開結束後立刻讓光束消失
    tl.to(this.lightBeam.nativeElement, {
      opacity: 0,
      scaleY: 0,
      duration: 0.3
    }, "-=0.2"); // 結束後立刻關閉，或你也可以用 ">” 接續

    // 階段3: 強力閃光
    tl.to(this.lightFlash.nativeElement, {
      opacity: 1,
      duration: 0.1,
      onComplete: () => {
        // 閃光後將 登入頁面內容（contentScene）顯示出來，並讓它可以點擊。
        gsap.set(this.contentScene.nativeElement, {
          opacity: 1,
          pointerEvents: 'auto' // 確保內容可交互
        });
      }
    });
    // 接著讓閃光慢慢淡出。
    tl.to(this.lightFlash.nativeElement, {
      opacity: 0,
      duration: 0.6
    });

    // 階段4: 光擴散效果
    tl.to(this.lightExpansion.nativeElement, {
      opacity: 1,
      duration: 0.1
    });

    tl.to(this.lightExpansion.nativeElement, {
      scale: 20,
      opacity: 0,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(this.lightExpansion.nativeElement, { opacity: 0 });
      }
    });
  }

  private initSmoothScroll() {
    gsap.registerPlugin(ScrollSmoother);

    ScrollSmoother.create({
      smooth: 1.5,
      effects: true
    });
  }

  private handleWheel(e: WheelEvent) {
    if (!this.isLocked) return;

    e.preventDefault();
    const delta = e.deltaY;
    const container = this.scrollContainer.nativeElement;

    // 计算新位置
    let newPos = container.scrollTop + delta * 0.5;
    newPos = Math.max(0, Math.min(newPos, container.scrollHeight - container.clientHeight));

    // 平滑滚动
    container.scrollTo({
      top: newPos,
      behavior: 'smooth'
    });

    // 更新当前图片索引
    this.currentImage = Math.round(newPos / container.clientHeight);

    // 边界检测
    if ((this.currentImage === 0 && delta < 0) ||
      (this.currentImage === 2 && delta > 0)) {
      this.unlockSection();
    }
  }

  private unlockSection() {
    if (!this.isLocked) return;
    this.isLocked = false;
    this.lenis.start();
  }

  submit() {
    // const trimmedPassword = this.password.trim();
    // const length = trimmedPassword.length;

    // if (length < 8 || length > 16) {
    //   this.passwordError = '密碼長度需為 8~16 字元';
    //   alert('密碼長度需為 8~16 字元');
    //   return;
    // }

    // this.passwordError = '';
    // console.log('登入中...');

    const submitData = {
      email: this.email,
      password: this.password,
    }
    //   password: trimmedPassword,
    // }
    console.log(submitData);
    this.httpservice.loginApi(submitData).subscribe((res: any) => {

      if (res.code == 200) {
        this.localstorageService.setItem('token', res.token);

        if (res.admin == true) {
          this.router.navigateByUrl('/admin');
          return;
        }
        this.router.navigateByUrl('/userpage/report');
      }
      console.log(res);
    });
  }
}
