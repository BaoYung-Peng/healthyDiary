import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

  // 登入
  loginApi(postData: any) {
    const url = "http://172.16.1.45:8080/daily/login";
    return this.httpClient.post(url, postData);
  }

  // 註冊
  registerApi(postData: any) {
    const url = "http://172.16.1.45:8080/daily/register";
    return this.httpClient.post(url, postData);
  }

  // 註冊認證
  verifyApi(postData: any) {
    const url = "http://172.16.1.45:8080/daily/verify";
    return this.httpClient.post(url, postData);
  }

  // 取得使用者資料
  getUserByEmailApi(postData: any) {
    const url = "http://172.16.0.86:8080/daily/get_user_info";
    return this.httpClient.post(url, postData);
  }

  // 更新使用者資料
  updateUserInfoApi(postData: any) {
    const url = "http://172.16.0.86:8080/daily/update_user";
    return this.httpClient.post(url, postData);
  }

  //新增食物營養資訊
  addFoodInfoApi(postData: any) {
    const url = "http://172.16.1.106:8080/food/foodInsert";
    return this.httpClient.post(url, postData);
  }

  //取的食物營養資訊
  getFoodInfo(postData: any) {
    const url = "http://172.16.1.106:8080/food/selectFood";
    return this.httpClient.post(url, postData);
  }
}
