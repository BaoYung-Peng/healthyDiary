import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumber } from 'primeng/inputnumber';
import { GptService } from '../../@services/gpt.service';

@Component({
  selector: 'app-food-edit-dialog',
  imports: [
    FormsModule,

    ButtonModule,
    InputNumber,
  ],
  templateUrl: './food-edit-dialog.component.html',
  styleUrl: './food-edit-dialog.component.scss'
})
export class FoodEditDialogComponent {
  food!: any;
  detail!: any;
  response: string = '';

  user!: any;
  dietForm!: any;
  type!: string;
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private gptService: GptService
  ) {
    if (config.data.food) {
      this.food = (config.data.food);
    } else {
      this.user = (config.data.user);
      this.detail = (config.data.detail);
      this.dietForm = (config.data.dietForm);
    }
    this.type = (config.data.type);
  }
  ngOnInit(): void {
    if(this.type == 'save'){
      this.sendMessage();
    }
  }

  // AI回應
  sendMessage() {
    const req = `你是一位健康營養師，依據我給你的個人訊息及飲食資訊，分析今天吃的是否達標，
  並給我一點建議或鼓勵，用繁體中文回答，字數在300字以內。
  我的身高${this.user.height}公分，
  體重${this.user.weight}公斤，
  性別為${this.user.gender}，
  工作型態為${this.user.workType}。
  吃了${this.dietForm.mealsName}。
  補充說明:${this.detail}`;
    console.log(req);


    if (!req.trim()) return;
    this.response = 'Loading...';
    this.gptService.sendMessage(req).subscribe({
      next: res => {
        this.response = res
        console.log(res);

      },
      error: err => this.response = 'Error: ' + err.message,
    });
  }

  confirm() {
    this.ref.close(this.food);
  }

  cancel() {
    this.ref.close();
  }
}
