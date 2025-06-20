# 健康日記系統（Healthy Diary System）

這是一個以 **Angular 19** 開發的現代化健康日記系統，結合心情書寫、飲食運動紀錄與星空動畫等豐富功能，打造互動性強、視覺沉浸的健康管理平台。

---

## 核心功能一覽

### 使用者帳戶功能
- 使用者註冊 / 登入 / 忘記密碼流程
- Email 驗證與密碼修改功能
- 個人資料編輯與主頁瀏覽

### 心情與健康日記
- 撰寫 / 編輯 / 刪除心情日記
- 書櫃功能：以「翻書」方式瀏覽過去日記
- 使用者主頁：集中展示健康與心情紀錄

### 健康紀錄模組
- 飲食紀錄
- 運動紀錄
- 睡眠紀錄
- 健康報告產出與查閱

### 視覺與互動效果
- 流星劃過夜空的星空背景動畫
- 書櫃翻書動畫效果
- 天氣 / 氣候動畫

### 🛠️ 管理與後台功能
- 管理者模組入口
- 使用者行為與內容管理

---

## 📦 安裝與啟動方式

```bash
## 安裝與啟動方式

```bash
# 安裝所有依賴套件
npm install

# 啟動開發伺服器
ng serve

# 預設瀏覽網址
http://localhost:4200

## 專案目錄結構（src/app）

```healthyDiary
src/
└── app/
    ├── @guards/                     # 路由守衛（如 AuthGuard）
    ├── @services/                   # 共用服務模組
    │   ├── auth.service.ts          # 驗證處理
    │   ├── date.service.ts          # 日期處理服務
    │   ├── gpt.service.ts           # GPT 互動服務
    │   ├── http.service.ts          # HTTP 請求處理(API)
    │   ├── loading.service.ts       # 載入動畫狀態
    │   ├── localstorage.service.ts  # 本地儲存操作
    │   └── user.service.ts          # 使用者資訊服務
    ├── admin/                       # 管理員模組
    ├── background/background/       # 背景動畫模組
    ├── bookcase/                    # 書櫃功能模組(Route至心情日誌)
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
    ├── shooting-stars-background/   # 星星背景動畫模組(應用於sleep流星劃過夜空)
    ├── userpage/                    # 使用者個人主頁
    │   ├── diet/                    # 飲食紀錄
    │   ├── exercise/                # 運動紀錄
    │   ├── sleep/                   # 睡眠紀錄
    │   ├── report/                  # 健康報告(AI生成式報告建議)
    ├── verify/                      # 驗證流程模組
    └── write-mood/                  # 心情撰寫頁面
