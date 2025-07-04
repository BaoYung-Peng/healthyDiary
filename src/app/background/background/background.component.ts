import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-background',
  imports: [],
  templateUrl: './background.component.html',
  styleUrl: './background.component.scss'
})
export class BackgroundComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // 圖像資料 x: min=0 max=1455, y: min=75 max=675
  private readonly images: any[] = [
    { src: 'imgs/vegetable.png', x: 1455, y: 675, size: 200, opacity: 0.5 },
    { src: 'imgs/rice.png', x: 1000, y: 500, size: 170, opacity: 0.5 },
    { src: 'imgs/juice.png', x: 500, y: 100, size: 200, opacity: 0.5 },
    { src: 'imgs/potato.png', x: 200, y: 350, size: 190, opacity: 0.5 },
  ];

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 載入並繪製每張圖片
    this.images.forEach(({ src, x, y, size }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        ctx.drawImage(img, x, y, size, size);
      };
    });
  }
}
