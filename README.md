# 健康日記系統

這是一個基於 **Angular 19** 開發的心情日記系統，搭配現代化的前端模組設計與多樣化的功能，例如：星空背景動畫、書櫃功能、登入註冊、心情撰寫與查閱等。

---

## 專案功能簡介

- 使用者註冊 / 登入 / 忘記密碼流程
- 修改密碼、Email 驗證功能
- 書櫃與心情日記瀏覽功能
- 撰寫心情、編輯與刪除日記
- 個人主頁與個人資料頁
- 使用者互動式頁面設計
- 流星劃過夜空背景
- 書櫃、翻書動畫效果
- 氣候動畫效果
  
---

## 安裝與啟動方式

```bash
# 安裝依賴
npm install

# 啟動 Angular 專案
ng serve

# 開啟瀏覽器進入 http://localhost:4200



## 📁 專案目錄結構（src/app）

```healthyDiary
src/
└── app/
    ├── @guards/                     # 路由守衛（如 AuthGuard）
    ├── @services/                   # 共用服務模組
    │   ├── auth.service.ts          # 驗證處理
    │   ├── date.service.ts          # 日期處理服務
    │   ├── gpt.service.ts           # GPT 互動服務
    │   ├── http.service.ts          # HTTP 請求處理
    │   ├── loading.service.ts       # 載入動畫狀態
    │   ├── localstorage.service.ts  # 本地儲存操作
    │   └── user.service.ts          # 使用者資訊服務
    ├── admin/                       # 管理員模組
    ├── background/background/       # 背景動畫模組
    ├── bookcase/                    # 書櫃功能模組
    ├── components/                  # 可重用元件
    │   ├── food-edit-dialog/        # 食物編輯對話框
    │   ├── food-table/              # 食物紀錄表格元件
    │   ├── report-dialog/           # 回報用的 Dialog
    │   └── user-info-edit-dialog/   # 使用者資訊編輯 Dialog
    ├── edit-verify/                 # 編輯流程驗證模組
    ├── editpassword/                # 修改密碼頁面
    ├── forgotpassword/              # 忘記密碼頁面
    ├── home/                        # 首頁模組
    ├── layout/                      # 共用頁面版型結構
    │   ├── footer/                  # 頁尾
    │   ├── header/                  # 頁首
    ├── login/                       # 登入頁面
    ├── mood-diary/                  # 心情日記功能
    ├── not-found/                   # 404 頁面
    ├── profile/                     # 個人資料頁面
    ├── register/                    # 註冊帳號頁
    ├── shooting-stars-background/   # 星星背景動畫
    ├── userpage/                    # 使用者個人主頁
    │   ├── diet/                    # 飲食紀錄
    │   ├── exercise/                # 運動紀錄
    │   ├── sleep/                   # 睡眠紀錄
    │   ├── report/                  # 健康報告
    ├── verify/                      # 驗證流程模組
    └── write-mood/                  # 心情撰寫頁面
