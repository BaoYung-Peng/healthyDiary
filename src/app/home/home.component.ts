import { LocalstorageService } from './../@services/localstorage.service';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AccordionModule } from 'primeng/accordion';

import Lenis from '@studio-freight/lenis';
import { BackgroundComponent } from "../background/background/background.component";


@Component({
  selector: 'app-home',
  imports: [
    AccordionModule,
    RouterLink,
    BackgroundComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('block1') block1!: ElementRef;
  @ViewChild('title') title!: ElementRef;
  @ViewChild('block2') block2Ref!: ElementRef;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private lenis!: Lenis;
  currentImage = 0;
  private isLocked = false;

  constructor(private router: Router) { }
  tabs = [
    { title: '為何營養計算機你們主要提供外食的資訊?', content: '因為我們想讓大家知道外食時常藏有你所不知道的營養陷阱', value: '0' },
    { title: '你們的網站會不會突然消失，讓我的心血都消失了？', content: '不會，如果真的有倒閉的一天，我們一定也會把所有資訊打包好寄到您的電子信箱裡。', value: '1' },
    { title: '我每天的健康分數都好差，我不想用了？', content: '我們希望能陪你一起面對所有困難，但如果想要休息一下也沒關係，我們隨時都在', value: '2' },
  ];



  register() {
    this.router.navigateByUrl('/register');
  }

  goTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  ngAfterViewInit() {
    this.initSmoothScroll();
    this.setupScrollLock();
  }

  ngOnDestroy() {
    if (this.lenis) this.lenis.destroy();
  }

  private initSmoothScroll() {
    this.lenis = new Lenis({
      lerp: 0.1,
      syncTouch: true,
      wheelMultiplier: 0.8
    });

    const raf = (time: number) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  private setupScrollLock() {
    // 监听全局滚动事件
    window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // 锁定区域检测
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.lockSection();
        } else {
          this.unlockSection();
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px -10% 0px'
    });

    observer.observe(this.block2Ref.nativeElement);
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

  private lockSection() {
    if (this.isLocked) return;
    this.isLocked = true;
    this.lenis.stop();
    console.log('锁定区域');
  }

  private unlockSection() {
    if (!this.isLocked) return;
    this.isLocked = false;
    this.lenis.start();
    console.log('解锁区域');
  }
}
