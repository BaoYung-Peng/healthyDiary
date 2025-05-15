import { CommonModule } from '@angular/common';
import { Component, Input, AfterViewInit, ViewChild, ElementRef, Renderer2, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';

@Component({
  selector: 'app-mood-thermometer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './mood-thermometer.component.html',
  styleUrls: ['./mood-thermometer.component.scss']
})
export class MoodThermometerComponent implements AfterViewInit, OnChanges {
  @Input() moodScore = 5;

  fillHeight = '50%';
  fillColor = 'orange';

  showSnow = false;
  snowflakes: HTMLElement[] = [];
  snowInterval: any;

  showSun = false;

  @ViewChild('snowContainer', { static: false }) snowContainer!: ElementRef;
  @ViewChild('sunray', { static: false }) sunray!: ElementRef;
  @ViewChild('sunBg', { static: false }) sunBg!: ElementRef;

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    // 初次渲染後更新 UI
    setTimeout(() => {
      this.updateThermometer();
      this.setBackgroundByScore(this.moodScore);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['moodScore'] && !changes['moodScore'].firstChange) {
      this.updateThermometer();
    }
  }

  updateThermometer(): void {
    const percentage = (this.moodScore / 10) * 100;
    this.fillColor = this.getColorByScore(this.moodScore);

    gsap.to(this, {
      duration: 0.5,
      fillHeight: `${percentage}%`,
      ease: 'power2.out',
    });

    if (this.moodScore <= 3) {
      this.startSnow();
      this.stopSun();
    } else if (this.moodScore >= 8) {
      this.stopSnow();
      this.startSun();
    } else {
      this.stopSnow();
      this.stopSun();
    }

    this.setBackgroundByScore(this.moodScore);
  }

  startSun(): void {
    if (this.showSun) return;
    this.showSun = true;

    setTimeout(() => {
      const sun = this.sunray?.nativeElement;
      const bg = this.sunBg?.nativeElement;
      if (!sun || !bg) return;

      gsap.set(sun, {
        scale: 0.2,
        opacity: 0,
      });

      gsap.to(sun, {
        scale: 6,
        opacity: 1,
        duration: 2,
        ease: 'power2.out',
      });
    }, 0);
  }

  stopSun(): void {
    this.showSun = false;
  }

  setBackgroundByScore(score: number): void {
    const bg = this.sunBg?.nativeElement;
    if (!bg) return;

    let gradient = '';

    if (score <= 3) {
      gradient = `linear-gradient(135deg, #1e3c72, #2a5298)`; // 冷色調
      bg.classList.remove('sun-animation');
    } else if (score <= 6) {
      gradient = `linear-gradient(135deg,rgb(231, 253, 235),rgba(186, 255, 182, 0.86))`; // 中性綠
      bg.classList.remove('sun-animation');
    } else if (score <= 8) {
      gradient = `linear-gradient(135deg,rgb(255, 219, 176),rgb(255, 206, 137))`; // 橘黃暖
      bg.classList.remove('sun-animation');
    } else {
      bg.classList.add('sun-animation'); // 陽光動畫 class
    }

    bg.style.background = gradient;
  }

  getColorByScore(score: number): string {
    if (score <= 3) return '#4A90E2';     // 冷藍
    if (score <= 6) return '#F5A623';     // 中橘
    return '#39ff02';                     // 高分亮綠
  }

  startSnow(): void {
    if (this.showSnow) return;
    this.showSnow = true;

    this.snowInterval = setInterval(() => {
      const snowflake = this.renderer.createElement('div');
      this.renderer.addClass(snowflake, 'snowflake');

      const layer = Math.random() < 0.6 ? 'back' : 'front';
      const startX = Math.random() * window.innerWidth;
      const baseSize = (11 - this.moodScore) * 1.5;
      const size = baseSize + Math.random() * 5;

      const duration = layer === 'back'
        ? 8 + Math.random() * 4
        : 5 + Math.random() * 3;

      const opacity = layer === 'back' ? 0.3 + Math.random() * 0.2 : 0.7 + Math.random() * 0.3;
      const blur = layer === 'back' ? 2 : 0;

      this.renderer.setStyle(snowflake, 'left', `${startX}px`);
      this.renderer.setStyle(snowflake, 'width', `${size}px`);
      this.renderer.setStyle(snowflake, 'height', `${size}px`);
      this.renderer.setStyle(snowflake, 'opacity', `${opacity}`);
      this.renderer.setStyle(snowflake, 'filter', `blur(${blur}px)`);

      const container = this.snowContainer?.nativeElement;
      if (container) container.appendChild(snowflake);
      this.snowflakes.push(snowflake);

      gsap.to(snowflake, {
        y: window.innerHeight + 50,
        x: startX + (Math.random() * 100 - 50),
        duration,
        ease: 'sine.inOut',
        onComplete: () => {
          snowflake.remove();
        },
      });
    }, 150);
  }

  stopSnow(): void {
    this.showSnow = false;
    clearInterval(this.snowInterval);
    this.snowflakes.forEach(flake => flake.remove());
    this.snowflakes = [];
  }
}
