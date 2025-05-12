import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { HttpService } from '../../@services/http.service';
import { FoodTableComponent } from '../../components/food-table/food-table.component';


import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';


interface Items {
  icon?: string;
  label: string;
  value: string;
}

interface Food {
  name: string;
  type: string;
}

@Component({
  selector: 'app-diet',
  imports: [
    FormsModule,
    CommonModule,

    FoodTableComponent,

    FloatLabelModule,
    InputTextModule,
    SelectButtonModule,
    ButtonModule,
    TableModule,
  ],
  templateUrl: './diet.component.html',
  styleUrl: './diet.component.scss'
})
export class DietComponent implements OnInit {
  // 用來呼叫子組件方法或變數
  @ViewChild(FoodTableComponent)
  foodTableComponent!: FoodTableComponent;

  // 查詢的食物名稱
  searchedName: string = '';
  searchedType: string = '';
  searchedMethod: string = '';

  methods: Items[] = [
    { label: '水煮', value: '水煮' },
    { label: '炸', value: '炸' },
    { label: '烤', value: '烤' },
    { label: '清蒸', value: '清蒸' },
    { label: '原型食物', value: '無' }
  ];

  types: Items[] = [
    { label: '主食', value: '主食' },
    { label: '甜點', value: '甜點' },
    { label: '蔬食', value: '蔬食' },
    { label: '水果', value: '水果' },
    { label: '飲品', value: '飲品' },
  ];

  foods!: Food[];
  searchedFood = [];

  constructor(
    private http: HttpService
  ) { }

  ngOnInit() {
    this.http.getFoodInfoApi().subscribe((res: any) => {
      this.foods = res.foodList;
      console.log(this.foods);
    })
  }

  searchFood() {
    this.searchedType = (this.searchedType == null) ? "" : this.searchedType;
    this.searchedMethod = (this.searchedMethod == null) ? "" : this.searchedMethod;

    const req = {
      foodName: this.searchedName,
      type: this.searchedType,
      cookingMethod: this.searchedMethod
    }
    console.log(req);


    this.http.saerchFoodApi(req).subscribe({
      next: (res: any) => {
        this.foods = res.foodList;
        console.log('API回應', res);
      },
      error: (err) => {
        console.log('API錯誤', err);
      }
    });
  }

  add(food: any) {
    this.foodTableComponent.addFood(food);
  }
}
