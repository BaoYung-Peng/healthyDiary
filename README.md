# 🌟 Angular 19 心情日記系統

這是一個基於 **Angular 19** 開發的心情日記系統，搭配現代化的前端模組設計與多樣化的功能，例如：星空背景動畫、書櫃功能、登入註冊、心情撰寫與查閱等。

---

## 🚀 專案功能簡介

- 使用者註冊 / 登入 / 忘記密碼流程
- 修改密碼、Email 驗證功能
- 書櫃與心情日記瀏覽功能
- 撰寫心情、編輯與刪除日記
- 個人主頁與個人資料頁
- 星空背景與動畫效果
- 管理者介面模組

---

## 🛠️ 安裝與啟動方式

```bash
# 安裝依賴
npm install

# 啟動 Angular 專案
ng serve

# 開啟瀏覽器進入 http://localhost:4200



```

src/
└── app/
    ├── @guards/                  # 路由守衛 (如 AuthGuard)
    ├── @services/                # 共用服務 (API, 狀態管理)
    ├── admin/                    # 管理員相關功能
    ├── background/background/    # 背景模組（含動畫）
    ├── bookcase/                 # 書櫃功能模組
    ├── components/               # 可重用 UI 元件
    ├── edit-verify/              # 資料編輯驗證流程
    ├── editpassword/             # 修改密碼功能
    ├── forgotpassword/           # 忘記密碼頁面
    ├── home/                     # 首頁內容與入口
    ├── layout/                   # 共用版型與頁框架
    ├── login/                    # 登入功能
    ├── mood-diary/               # 心情日記列表與詳細
    ├── not-found/                # 404 頁面
    ├── profile/                  # 個人資料頁
    ├── register/                 # 註冊新帳號
    ├── shooting-stars-background/ # 星空背景效果
    ├── userpage/                 # 使用者個人主頁
    ├── verify/                   # 驗證信箱等流程
    └── write-mood/               # 撰寫心情頁面

```
