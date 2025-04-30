import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ProgressBar } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';

import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DividerModule } from 'primeng/divider';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RadioButton } from 'primeng/radiobutton';
import { RouterLink } from '@angular/router';
import { HttpService } from '../@services/http.service';

interface Person {
  bodyType: string;
}

interface selections {
  label: string;
  value: string;
}

@Component({
  selector: 'app-register',
  imports: [
    StepperModule,
    ButtonModule,
    InputTextModule,
    CommonModule,
    FormsModule,
    ProgressBar,
    ToastModule,
    PasswordModule, FloatLabelModule, DividerModule,
    ReactiveFormsModule, RadioButton,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  cardOrder = [0, 1, 2]; // 順時針旋轉順序
  activeStep = 1;        // card動畫
  totalSteps = 3;        // card共有幾張
  formGroup!: FormGroup;
  value: string | undefined;

  user_name = '';
  selectedGender: string = '';
  email = '';
  account: string = '';
  password: string = '';
  passwordError: string = '';
  birthDate: string='';
  age: number | null = null;
  height: number = 0;
  weight: number = 0;
  person = {bodyType: ''};
   // 當前顯示的說明
  currentDescription: string = '';

  is_edit = true; // 控制編輯狀態

  constructor(private httpservice: HttpService, private fb: FormBuilder) { }

  //進度條顏色計算
  get progressValue(): number {
    return Math.round((this.activeStep / this.totalSteps) * 100);
  }

  //進度條顏色設定
  get progressBarHex(): string {
    switch (this.activeStep) {
      case 1: return '#e53935'; // 鮮紅
      case 2: return '#f4a300'; // 土黃
      case 3: return '#43a047'; // 綠色
      default: return 'lightgray'; //灰色
    }
  }
  //計算年齡
  calculateAge() {
    if (!this.birthDate) {
      this.age = null;
      return;
    }

    const birthDate = new Date(this.birthDate);
    const today = new Date();

    // 計算年齡
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // 如果今年生日還沒到，年齡減1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.age = age;
  }

  next() {
    // console.log('身高:', this.height, '體重:', this.weight);
    // if (this.height === null || this.height <= 0 || this.height > 250) {
    //   alert('請輸入有效的身高（1~250）');
    //   return;
    // }

    // if (this.weight === null || this.weight <= 0 || this.weight > 300) {
    //   alert('請輸入有效的體重（1~300）');
    //   return;
    // }
    if (this.activeStep < this.totalSteps) {
      this.activeStep++;
    }
    // 旋轉卡片
    this.rotateCards();

  }

  //控制下一步進入下一張卡
  nextStep(accountInput: any, passwordInput: any) {
    // if (!accountInput.valid || !passwordInput.valid) {
    //   alert('請確認密碼格式正確');
    //   return;
    // }

    // step1 ++
    if (this.activeStep < this.totalSteps) {
      this.activeStep++;
    }

    // 然後旋轉卡片
    this.rotateCards();
  }
  // 保留你原有的卡片旋轉邏輯
  rotateCards() {
    // 順時針旋轉：把第一個移到最後
    this.cardOrder.push(this.cardOrder.shift()!);
  }

  getCardClass(index: number): string {
    const position = this.cardOrder.indexOf(index);
    switch (position) {
      case 0: return 'center';
      case 1: return 'right';
      case 2: return 'left';
      default: return '';
    }
  }

  //控制卡片返回上一張卡
  prevStep() {
    if (this.activeStep > 1) {
      this.activeStep--;
    }
    // 旋轉卡片
    this.rotateCardsReverse();
  }

  rotateCardsReverse() {
    // 逆時針旋轉：把最後一個移到最前
    this.cardOrder.unshift(this.cardOrder.pop()!);
  }

  //工作型態
  categories = [
    { key: 'mild', name: '輕度活動工作' },
    { key: 'moderate', name: '中度活動工作' },
    { key: 'severe', name: '重度活動工作' }
  ];

  ngOnInit() {
     // 初始化表單
     this.formGroup = this.fb.group({
      selectedCategory: ['', Validators.required]  // 預設空值，必填
    });
  }

  //確認進入userpage
  Go_userPage() {
    const registerData = {
      email: this.email,
      gender: this.selectedGender,
      password: this.password,
      name: this.user_name,
      birthdate: this.birthDate,
      height: this.height,
      weight: this.weight,
      workType:this.formGroup.value.selectedCategory, //key
      bodyType: this.person.bodyType
    }
    console.log(registerData);

    // const registerData = {
    //   email: 'a123@gmail.com',
    //   password: '000',
    //   name: 'Bob',
    //   birthdate: '2000-01-02',
    //   height: 170,
    //   weight: 50,
    //   gender: '男',
    //   workType: '輕度活動工作',
    //   bodyType: null

    // }
    // console.log(registerData);


    this.httpservice.registerApi(registerData).subscribe((res: any) => {
      console.log(res);
    });
  }
}
