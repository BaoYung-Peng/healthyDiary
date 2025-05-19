import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

  IP: string = '172.16.1.48';
  // IP: string = 'localhost';

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
  getUserByTokenApi(postData: any) {
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
    const url = `http://${this.IP}:8080/food/insert_food`;
    return this.httpClient.post(url, postData);
  }

  //取得所有食物營養資訊
  getFoodInfoApi() {
    const url = `http://${this.IP}:8080/food/get_all_food`;
    return this.httpClient.get(url);
  }

  //查詢食物營養資訊
  saerchFoodApi(postData: any) {
    const url = `http://${this.IP}:8080/food/search_food`;
    return this.httpClient.post(url, postData);
  }

  // 紀錄飲食
  fillinMealsApi(postData: any) {
    const url = `http://${this.IP}:8080/meals/fill_in_meals`;
    return this.httpClient.post(url, postData);
  }

  // 紀錄睡眠
  fillinSleepApi(postData: any) {
    const url = `http://${this.IP}:8080/sleep/fill_in_sleep`;
    return this.httpClient.post(url, postData);
  }

  // 取得睡眠
  getTodaySleepApi(postData: any) {
    const url = `http://${this.IP}:8080/sleep/get_sleep`;
    return this.httpClient.post(url, postData);
  }

  // 紀錄運動
  fillInExercise(postData: any) {
    const url = `http://${this.IP}:8080/exercise/fill_in_exercise`;
    return this.httpClient.post(url, postData);
  }

  // 取得運動紀錄
  getCalendarExercise(postData: any) {
    const url = `http://${this.IP}:8080/exercise/get_calendar_exercise`;
    return this.httpClient.post(url, postData);
  }

  // 取得心情日誌
  getMood(postData: any) {
    const url = `http://${this.IP}:8080/mood/get_mood`;
    return this.httpClient.post(url, postData);
  }

  // 取得對應書櫃月份日誌
  getMonthMood(postData: any) {
    const url = `http://${this.IP}:8080/mood/get_month_mood`;
    return this.httpClient.post(url, postData);
  }

  // 取得飲食紀錄
  getMealApi(postData: any) {
    const url = `http://${this.IP}:8080/meals/get_meals`;
    return this.httpClient.post(url, postData);
  }

  // 取得睡眠紀錄
  getSleepApi(postData: any) {
    const url = `http://${this.IP}:8080/sleep/get_sleep`;
    return this.httpClient.post(url, postData);
  }

  // 取得運動紀錄
  getExerciseApi(postData: any) {
    const url = `http://${this.IP}:8080/exercise/get_exercise`;
    return this.httpClient.post(url, postData);
  }

  // 取得該日AI報告
  getDailyReportApi(postData: any) {
    const url = `http://${this.IP}:8080/feedback/get_daily`;
    return this.httpClient.post(url, postData);
  }

  // 取得該日所有資料 (睡眠、運動、飲食)
  getDataByDateApi(postData: any) {
    const url = `http://${this.IP}:8080/feedback/get_data_by_date`;
    return this.httpClient.post(url, postData);
  }

  // 填入每日報告
  fillInTodayReportApi(postData: any) {
    const url = `http://${this.IP}:8080/feedback/fill_in_daily`;
    return this.httpClient.post(url, postData);
  }

  // 新增心情日誌
  fillInMood(postData: any) {
    const url = `http://${this.IP}:8080/mood/fill_in_mood`;
    return this.httpClient.post(url, postData);
  }
}
