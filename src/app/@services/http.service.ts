import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

  IP:string = 'localhost';

  // 登入
  loginApi(postData: any) {
    const url = `http://${this.IP}:8080/daily/login`;
    return this.httpClient.post(url, postData);
  }

  // 註冊
  registerApi(postData: any) {
    const url = `http://${this.IP}:8080/daily/register`;
    return this.httpClient.post(url, postData);
  }

  // 註冊認證
  verifyRegApi(postData: any) {
    const url = `http://${this.IP}:8080/daily/verify`;
    return this.httpClient.post(url, postData);
  }

  // 忘記密碼
  forgotpasswordApi(postData: any) {
    const url = `http://${this.IP}:8080/daily/send_reset_password`;
    return this.httpClient.post(url, postData);
  }

  // 重設密碼寄驗證信(傳email)
  sendVerifyPwdApi(postData: any) {
    const url = `http://${this.IP}:8080/daily/send_reset_password`;
    return this.httpClient.post(url, postData);
  }

  // 重設密碼()
  resetPwdApi(postData: any) {
    const url = `http://${this.IP}:8080/daily/reset_password`;
    return this.httpClient.post(url, postData);
  }

  // 變更密碼
  editpasswordApi(postData: any) {
    const url = `http://${this.IP}:8080/daily/editpassword`;
    return this.httpClient.post(url, postData);
  }

  // 取得使用者資料
  getUserByEmailApi(postData: any) {
    const url = `http://${this.IP}:8080/daily/get_user_info`;
    return this.httpClient.post(url, postData);
  }

  // 更新使用者資料
  updateUserInfoApi(postData: any) {
    const url = `http://${this.IP}:8080/daily/update_user`;
    return this.httpClient.post(url, postData);
  }

  //新增食物營養資訊
  addFoodInfoApi(postData: any) {
    const url = `http://${this.IP}:8080/food/foodInsert`;
    return this.httpClient.post(url, postData);
  }

  //取的所有食物營養資訊
  getFoodInfoApi() {
    const url = `http://${this.IP}:8080/food/get_all_food`;
    return this.httpClient.get(url);
  }

  //查詢食物營養資訊
  saerchFoodApi(postData: any) {
    const url = `http://${this.IP}:8080/food/search_food`;
    return this.httpClient.post(url, postData);
  }

  fillinMealsApi(postData: any) {
    const url = `http://${this.IP}:8080/meals/fillin_meals`;
    return this.httpClient.post(url, postData);
  }

  // 紀錄運動
  fillInExerciseApi(postData: any) {
    const url = `http://${this.IP}:8080/daily/insert_sports`;
    return this.httpClient.post(url, postData);
  }



}
