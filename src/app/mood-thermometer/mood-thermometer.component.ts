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
export class MoodThermometerComponent implements OnChanges, AfterViewInit {
  @Input() moodScore: number = 5;
  @Input() snowCount: number = 20;
  @Input() sunColor: string = 'linear-gradient(to bottom, #fff9c4, #ffe082)';
  @Input() hotColor: string = '#f00';
  @Input() warmColor: string = '#fa0';
  @Input() coldColor: string = '#00f';

  @ViewChild('snowContainer') snowContainerRef!: ElementRef;
  @ViewChild('sunray') sunrayRef!: ElementRef;
  @ViewChild('sunBg') sunBgRef!: ElementRef;

  showSun: boolean = false;
  showSnow: boolean = false;
  fillHeight: string = '0%';
  fillColor: string = '#888';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['moodScore'] && this.sunrayRef && this.sunBgRef && this.snowContainerRef) {
      this.updateThermometer();
    }
  }

  ngAfterViewInit(): void {
    this.updateThermometer();
  }

  updateThermometer(): void {
    this.showSun = this.moodScore > 3;
    this.showSnow = this.moodScore <= 3;

    const percent = Math.max(0, Math.min(10, this.moodScore)) / 10;
    this.fillHeight = `${percent * 100}%`;

    // 顏色根據分數決定
    if (this.moodScore > 6) this.fillColor = this.hotColor;
    else if (this.moodScore > 3) this.fillColor = this.warmColor;
    else this.fillColor = this.coldColor;

    // 陽光動畫
    if (this.showSun && this.sunrayRef && this.sunBgRef) {
      gsap.fromTo(this.sunrayRef.nativeElement, { opacity: 0 }, { opacity: 1, duration: 1 });
      gsap.to(this.sunBgRef.nativeElement, { background: this.sunColor, duration: 1 });
    }

    // 雪花動畫
    if (this.showSnow && this.snowContainerRef) {
      this.startSnow();
    }
  }

  startSnow(): void {
    const snowContainer = this.snowContainerRef.nativeElement;
    snowContainer.innerHTML = '';

    for (let i = 0; i < this.snowCount; i++) {
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      const size = Math.random() * 5 + 2;
      flake.style.width = flake.style.height = `${size}px`;
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.top = `${-10 - Math.random() * 20}px`;
      snowContainer.appendChild(flake);

      gsap.to(flake, {
        y: 200 + Math.random() * 100,
        x: `+=${Math.random() * 20 - 10}`,
        duration: 3 + Math.random() * 2,
        ease: 'linear',
        repeat: -1,
        delay: Math.random() * 3
      });
    }
  }
}
