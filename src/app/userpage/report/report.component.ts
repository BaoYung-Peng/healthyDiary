import { HttpService } from './../../@services/http.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { GptService } from '../../@services/gpt.service';
import { CommonModule } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { LoadingService } from '../../@services/loading.service';
import { Message } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { DatePicker } from 'primeng/datepicker';
import { DateService } from '../../@services/date.service';

interface MenuItem {
  icon: string;
  command: any;
}

@Component({
  selector: 'app-report',
  imports: [
    FormsModule,
    CommonModule,

    ButtonModule,
    Dialog,
    ProgressSpinner,
    Message,
    DropdownModule,
    DatePicker,
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit {
  token: any = localStorage.getItem('token');

  loading$!: any;
  showMessage: boolean = false;
  user!: any;

  today: Date = new Date(); //今天

  selectedDate: Date = new Date(); // 選擇的日期

  exerciseList!: any; // 運動紀錄
  totalConsumed: number = 0; // 消耗的卡路里
  mealsList!: any; // 飲食紀錄
  diet!: any; // 該天三餐紀錄
  sleepList!: any; // 該天前晚睡眠紀錄
  mood!: any;
  report!: any;  // 該天AI報告

  aiRes!: any; // AI回應內容
  items: MenuItem[] = []; // 工具欄位內容
  visible: boolean = false;   // dialog 顯示

  constructor(
    private http: HttpService,
    private gptService: GptService,
    private loadingService: LoadingService,
    private dateService: DateService
  ) { }

  ngOnInit(): void {
    this.loading$ = this.loadingService.loading$;
    const req = {
      token: this.token
    }
    this.http.getUserByTokenApi(req).subscribe((res: any) => {
      this.user = res.user;
    });
    this.getData();
  }

  // 取得該天AI回應資料
  getAiResData(req: any) {
    this.http.getDailyReportApi(req).subscribe({
      next: (res: any) => {
        console.log(res);
        this.report = res.dailyFeedback ? res.dailyFeedback.feedback : null;
      }
    });
  }

  // 取的該天飲食、睡眠、運動資料
  getData() {
    console.log(this.selectedDate);

    const req = {
      token: this.token,
      date: this.dateService.changeDateFormat(this.selectedDate)
    }

    this.getAiResData(req); // 取得該天AI回應資料

    // 取得該天健康資料
    this.http.getDataByDateApi(req).subscribe({
      next: (res: any) => {
        this.mealsList = res.mealsList
        this.diet = {
          breakfast: res.mealsList.filter((meal: any) => meal.mealsType === "早餐").map((meal: any) => JSON.parse(meal.mealsName)).flat(),
          lunch: res.mealsList.filter((meal: any) => meal.mealsType === "午餐").map((meal: any) => JSON.parse(meal.mealsName)).flat(),
          dinner: res.mealsList.filter((meal: any) => meal.mealsType === "晚餐").map((meal: any) => JSON.parse(meal.mealsName)).flat(),
          other: res.mealsList.filter((meal: any) => meal.mealsType === "其他").map((meal: any) => JSON.parse(meal.mealsName)).flat()
        };

        this.sleepList = res.sleepList;

        this.exerciseList = res.exerciseList ? res.exerciseList : null;
        this.totalConsumed = this.exerciseList.reduce((sum: number, exercise: any) => sum + exercise.totalConsumed, 0);
      },
      error: (err: any) => {
        console.log('API回應', err);
      }
    });
    this.http.getMoodByDateApi(req).subscribe((res: any) => {
      this.mood = res.mood ? res.mood.diary : '';
    });
  }

  // 判斷是否為當天
  get isToday(): boolean {
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);
    const selectedTimestamp = new Date(this.selectedDate).setHours(0, 0, 0, 0);
    return todayTimestamp == selectedTimestamp;
  }

  // 產生報告
  generateReport() {
    this.loadingService.showLoading();
    this.visible = false;
    // 飲食
    const mealText = [
      this.diet.breakfast.length > 0 ? `早餐吃了${this.diet.breakfast.join("、")}， ` : "",
      this.diet.lunch.length > 0 ? `午餐吃了${this.diet.lunch.join("、")}， ` : "",
      this.diet.dinner.length > 0 ? `晚餐吃了${this.diet.dinner.join("、")}` : "",
      this.diet.other.length > 0 ? `其他時段吃了${this.diet.other.join("、")}` : ""
    ].filter(text => text).join(" ");

    // 運動
    const exerciseText = this.exerciseList.length > 0 ? this.exerciseList.map((exercise: any) => `${exercise.exerciseName} ${exercise.duration}分鐘`).join('、') : '';
    // 睡眠
    const sleepText = this.sleepList.length > 0 ? `我睡了 ${this.sleepList[this.sleepList.length - 1].hours} 小時，${this.sleepList[this.sleepList.length - 1].insomnia ? "有" : "沒"}失眠，睡前${this.sleepList[this.sleepList.length - 1].phone ? "有" : "沒"}用手機` : '';

    const sleepPrompts = [
      "早上醒來後，如果在10點內仍然想睡，可能表示昨晚的睡眠質量不足。你今天的身體感覺如何？",
      "沒有咖啡因的協助下，你今天上午的思緒清晰嗎？這或許能反映你昨晚的恢復狀況。",
      "今天是否讀了同一句話好幾遍才理解？這是大腦疲勞發出的訊號，它正在呼喚一場好覺。",
      "你這週有固定在相同時間上床與起床嗎？穩定的生理時鐘，是恢復力的起點。",
      "昨晚的運動時間是否在睡前兩小時前結束？避免臨睡前運動，能幫助身體放鬆入眠。",
      "今天的午睡是否安排在下午三點前？過晚的小睡，可能讓你難以在晚上順利入睡。",
      "你今天有曬到早晨的陽光嗎？自然光能幫助你的褪黑激素在夜晚準時釋放。",
      "若今晚輾轉難眠，別緊盯時鐘，反而可起身進行放鬆的活動，讓大腦知道『還沒到入睡時間』。",
      "今晚是否為自己安排了降溫的環境？身體核心溫度下降，是入睡的自然信號。",
      "睡眠不足不僅讓你感覺疲憊，它也會讓身體想吃更多，特別是糖與澱粉。今天的食慾是否也在提醒你該休息？",
      "昨晚的睡眠時間若過少，小心今天熱量攝取可能悄悄上升；有沒有感覺自己更難控制食慾？",
      "睡不飽讓壓力荷爾蒙皮質醇升高，而這會破壞腸道好菌。你的腸胃今天是否也有些不舒服？",
      "你是否曾發現：減肥時如果睡得少，反而容易掉肌肉、而不是脂肪？睡眠，正是重塑身體的基礎。",
      "酒精雖讓你昏沉，卻會剝奪關鍵的快速動眼期（REM sleep）。昨晚小酌後的睡眠品質如何？",
      "如果你的睡眠時間縮短，其實不是『平均縮水』，而可能是犧牲掉了某一種重要的睡眠階段。",
      "當你在床上翻來覆去，焦慮其實會加深失眠。今晚願你試著先離開床，找個方式善待此刻的自己。",
      "你願意試試今晚提早15分鐘躺平，讓身體慢慢沈入夜的節奏嗎？",
      "良好的睡眠是一種日復一日的自我照顧。今天的你，是否願意對明天的你好一點？",
      "若連續多日覺得早上難起、下午疲倦，這或許是身體說：『我累了』。可以為它調整一點生活節奏嗎？",
      "不是每一晚都能完美入睡，但每一次願意理解自己與睡眠的關係，都是成長的一步。今天，你願意給自己多一點空間嗎？"
    ];

    [{ "id": 1, "prompt": "每周進行150分鐘中等強度有氧運動，如快走，幫助你燃燒脂肪，朝理想體態邁進！" },
    { "id": 2, "prompt": "試試每周2-3次阻力訓練，比如深蹲，促進肌肉生長，讓身體更結實有力！" },
    { "id": 3, "prompt": "每周75分鐘高強度間歇訓練（HIIT），加速代謝，減脂效果超棒，繼續加油！" },
    { "id": 4, "prompt": "每日10分鐘伸展，增強靈活性，預防受傷，保持健康的身體！" },
    { "id": 5, "prompt": "每周3次跑步，每次30分鐘，改善心肺功能，幫你更有活力！" },
    { "id": 6, "prompt": "用70-85%最大負重做8-12次/組阻力訓練，增肌效果明顯，堅持下去！" },
    { "id": 7, "prompt": "每周2次瑜伽，舒緩身心，增強關節靈活性，健康從每一步開始！" },
    { "id": 8, "prompt": "避免睡前1-2小時高強度運動，保護睡眠品質，讓恢復更完美！" },
    { "id": 9, "prompt": "每周增加5-10%運動強度，循序漸進，逐步變得更強壯！" },
    { "id": 10, "prompt": "每日步行1萬步，增加日常活動量，輕鬆燃燒熱量，超棒的習慣！" },
    { "id": 11, "prompt": "每周3次全身訓練，涵蓋胸、背、腿，均衡增肌，打造完美體態！" },
    { "id": 12, "prompt": "運動後5分鐘冷身，降低心率，幫助肌肉恢復，你做得太好了！" },
    { "id": 13, "prompt": "每周2次游泳，每次45分鐘，提升心肺和肌肉耐力，享受運動樂趣！" },
    { "id": 14, "prompt": "用體重訓練如伏地挺身，隨時隨地增肌，超方便的選擇！" },
    { "id": 15, "prompt": "每周1次戶外徒步，呼吸新鮮空氣，增強心理健康，超級值得！" },
    { "id": 16, "prompt": "運動前5分鐘動態伸展，預防肌肉拉傷，讓每一步都安全！" },
    { "id": 17, "prompt": "每周3次核心訓練，如平板支撐，增強穩定性，姿勢更挺拔！" },
    { "id": 18, "prompt": "運動後補充電解質飲料，恢復鈉和鉀，保持身體最佳狀態！" },
    { "id": 19, "prompt": "每周2次自行車，每次40分鐘，鍛鍊下肢力量，騎出健康！" },
    { "id": 20, "prompt": "每日跳繩10分鐘，提升心率，燃燒熱量，輕鬆又有趣！" },
    { "id": 21, "prompt": "每周3次高強度訓練，每次20分鐘，加速代謝，減脂效果驚人！" },
    { "id": 22, "prompt": "運動後用滾輪按摩，緩解肌肉痠痛，恢復更快，超讚！" },
    { "id": 23, "prompt": "每周2次爬樓梯訓練，提升腿部力量和心肺功能，慢慢來沒問題！" },
    { "id": 24, "prompt": "每日5分鐘高膝踏步，激活全身肌肉，熱身超到位！" },
    { "id": 25, "prompt": "每周2次皮拉提斯，提升柔韌性和核心力量，讓你更健康自信！" }]



    const exercisePrompts = [
      { "id": 1, "prompt": "每日攝入1.6-2.2克/公斤體重的蛋白質，如雞胸肉，幫你增肌更有效！" },
      { "id": 2, "prompt": "選擇低熱量密度食物，如蔬菜和水果，減少體脂，保持飽足感真棒！" },
      { "id": 3, "prompt": "每日減少300-500大卡，創造熱量赤字，安全減脂，你一定行！" },
      { "id": 4, "prompt": "每日增加300-500大卡，創造熱量盈餘，支援增肌，繼續努力！" },
      { "id": 5, "prompt": "選全穀物如燕麥，穩定血糖，減少脂肪堆積，超健康選擇！" },
      { "id": 6, "prompt": "每餐攝入20-30克蛋白質，如蛋類，優化肌肉合成，棒極了！" },
      { "id": 7, "prompt": "每日攝入25-35克纖維，促進消化，助減脂，保持好習慣！" },
      { "id": 8, "prompt": "避免加工食品如薯片，減少空熱量，保護你的健康身材！" },
      { "id": 9, "prompt": "每日吃健康脂肪如橄欖油，支持激素平衡，讓身體更強壯！" },
      { "id": 10, "prompt": "運動後30分鐘內吃蛋白質和碳水化合物，加速恢復，你真聰明！" },
      { "id": 11, "prompt": "避免睡前高脂餐，防止消化干擾睡眠，助你減脂更順利！" },
      { "id": 12, "prompt": "每日吃綠葉蔬菜如菠菜，提供維生素，代謝更強，超讚！" },
      { "id": 13, "prompt": "減少甜飲料如珍奶，降低糖分攝入，體態管理更輕鬆！" },
      { "id": 14, "prompt": "空腹千萬別吃甜食，對腎臟會有很大的負擔！" },
      { "id": 15, "prompt": "選低GI食物如地瓜，減少脂肪儲存，健康又美味！" },
      { "id": 16, "prompt": "每日吃豆類如黑豆，提供蛋白質和纖維，增肌利器！" },
      { "id": 17, "prompt": "避免深夜進食，減少熱量囤積，改善睡眠，超級值得！" },
      { "id": 18, "prompt": "每日吃維生素D豐富食物如鮭魚，增強骨骼健康，棒極了！" },
      { "id": 19, "prompt": "選瘦肉蛋白如火雞，減少脂肪攝入，塑形更完美！" },
      { "id": 20, "prompt": "每日吃堅果如杏仁，提供健康脂肪，增強活力！" },
      { "id": 21, "prompt": "運動前2小時吃碳水化合物如香蕉，提供能量，超讚！" },
      { "id": 22, "prompt": "每日吃Omega-3如亞麻籽油，促進心血管健康，繼續保持！" },
      { "id": 23, "prompt": "避免高鹽食物，減少水腫，保持體態輕盈！" },
      { "id": 24, "prompt": "每日吃發酵食品如優格，改善腸道健康，超健康選擇！" },
      { "id": 25, "prompt": "選天然甜味劑如蜂蜜，減少精製糖攝入，保護你的身材！" }
    ]

    // 給 AI 的文字
    const req = `
    你是一位健康分析師，我會給你使用者的健康資訊和怎麼回應和建議的提示，請依照提示給我約100~150字的建議。
    ${sleepPrompts},${exercisePrompts}。
    我的身高${this.user.height}公分，
    體重${this.user.weight}公斤，
    性別為${this.user.gender}，
    工作型態為${this.user.workType}。
    ${mealText}。${exerciseText}。${sleepText}。`.replace(/\s+/g, ' ').trim();
    console.log(req);

    this.gptService.sendMessage(req).subscribe({
      next: (res: any) => {
        this.aiRes = res;
        if (this.aiRes) {
          this.save();
        }
      },
      error: (err: any) => {
        console.log('API錯誤', err);
        setTimeout(() => {
          this.loadingService.hideLoading();
        }, 2000);
      }
    });
  }

  save() {
    const req = {
      token: this.token,
      date: this.dateService.changeDateFormat(this.selectedDate),
      feedback: this.aiRes
    }
    console.log(req);
    this.http.fillInTodayReportApi(req).subscribe((res: any) => {
      if (res.code == 200) {
        this.loadingService.hideLoading();
        this.aiRes = null;
        this.getData();
      } else {
        setTimeout(() => {
          this.loadingService.hideLoading();
        }, 2000);
      }
    });

  }
}
