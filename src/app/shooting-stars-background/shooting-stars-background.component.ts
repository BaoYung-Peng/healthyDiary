import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-shooting-stars-background',
  imports: [

  ],
  templateUrl: './shooting-stars-background.component.html',
  styleUrl: './shooting-stars-background.component.scss'
})
export class ShootingStarsBackgroundComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    class ShootingStar {
      x = Math.random() * width;
      y = Math.random() * height / 2;
      length = Math.random() * 100 + 50;
      speed = Math.random() * 8 + 4;
      size = 2;
      alpha = 1;
      life = 0;

      update() {
        this.x -= this.speed;
        this.y += this.speed;
        this.life += 1;
        this.alpha = 1 - this.life / 100;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y - this.length);
        ctx.strokeStyle = `rgba(255,255,255,${this.alpha})`;
        ctx.lineWidth = this.size;
        ctx.stroke();
      }
    }

    const shootingStars: ShootingStar[] = [];

    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 30, 0.2)';
      ctx.fillRect(0, 0, width, height);

      if (Math.random() < 0.02) {
        shootingStars.push(new ShootingStar());
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.update();
        star.draw(ctx);

        if (star.alpha <= 0) {
          shootingStars.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }
}
