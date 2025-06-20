# 健康日記系統（Healthy Diary System）

一款以 **Angular 19** 打造的現代化健康日記平台，整合心情紀錄、健康管理與動態視覺體驗。  
本系統不僅支援日常健康數據的管理，且透過動畫與互動設計，提升使用者參與感與沉浸感。

---

## 核心功能一覽

### 使用者帳戶功能
- 使用者 **註冊 / 登入 / 忘記密碼流程**
- **Email 驗證機制** 與 **密碼修改功能**
- **JWT Token 功能**
- 使用者 **個人資料編輯** 與 **主頁動態展示**

### 心情與健康日記模組
- 撰寫 / 編輯 / 刪除 **心情日記**
- **書櫃功能**：可依月份調閱過往日誌
- 整合個人書寫歷程與 UI 書籍動畫呈現

### 健康紀錄模組
- **飲食紀錄**：食物攝取紀錄與查詢
- **運動紀錄**：活動紀錄與項目統計
- **睡眠紀錄**：每日睡眠時數與品質追蹤
- **健康報告生成**：透過 AI 分析數據

### 視覺與互動體驗
- 註冊頁 **卡片翻轉動畫**（卡牌切換特效）
- 密碼信箱動畫 (模擬信箱收信過程)
- 登入後 **開門入場動畫**
- 光束擴散動畫效果（登入 / 切換場景）
- 星空背景動畫（流星劃過、閃爍光點）
- 書櫃翻頁動畫（翻書、月曆分類）
- 天氣 / 氣候動態（模擬氣象變化）
- 運動頁 **yoyo互動** （卡片選擇特效）

## 安裝與啟動方式

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
