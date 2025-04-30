import { GptService } from './../../@services/gpt.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';

interface Dietfrom {
  email: string;
  mealsName: string[];
}

interface Items {
  icon?: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-diet',
  imports: [
    FormsModule,

    SelectButtonModule,
    ButtonModule
  ],
  templateUrl: './diet.component.html',
  styleUrl: './diet.component.scss'
})
export class DietComponent implements OnInit {
  foodInfo!: any;
  user!: string;
  dietForm!: Dietfrom;
  mealName: string = '';
  response = '';

  // 所選擇的方法
  method!: string;
  type!: string;

  methods: Items[] = [
    { label: '煮', value: 'cook' },
    { label: '炸', value: 'fry' },
    { label: '烤', value: 'roast' },
    { label: '蒸', value: 'Steam' },
    { label: '原型食物', value: 'other' }
  ];

  types: Items[] = [
    { label: '五穀根莖', value: 'grains' },
    { label: '蛋豆魚肉', value: 'meat' },
    { label: '乳品', value: 'milk' },
    { label: '蔬菜', value: 'vegetables' },
    { label: '水果', value: 'fruits' },
    { label: '油脂與堅果種子類', value: 'nuts' },
    { label: '外食', value: 'other' },

  ];

  constructor(
    private gptService: GptService
  ){}
  ngOnInit(): void {

    this.user = localStorage.getItem('userEmail') ?? '';

    this.dietForm = {
      email: this.user,
      mealsName: []
    }
  }

  addMeal() {
    this.dietForm.mealsName.push(this.mealName);
    this.mealName = '';
    console.log(this.dietForm);
  }

  delMeal(index: number) {
    this.dietForm.mealsName.splice(index, 1);
  }

  sendMessage() {
    const userInput = `你是一位健康營養師，我會跟你說我得BMI、性別和工作型態(輕度、中度、重度)、今天吃的食物及份量
    ，要用繁體中文和我說明今天吃的是否達標，並給我一點建議或鼓勵`;
    if (!userInput.trim()) return;
    this.response = 'Loading...';
    this.gptService.sendMessage(userInput).subscribe({
      next: res => this.response = res,
      error: err => this.response = 'Error: ' + err.message,
    });
  }
}
