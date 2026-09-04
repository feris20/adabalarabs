/* =============================================
   script.js — النسخة الكاملة
   ============================================= */

// =============================================
// بيانات المعلقات السبع
// =============================================
const MUALLAQAT = [
  { id:'imru_al_qays', name:'امرؤ القيس',       matla:'قِفَا نَبْكِ مِنْ ذِكْرَى حَبِيبٍ وَمَنزِلِ',    icon:'crown',   color:'gold'   },
  { id:'tarafa',       name:'طرفة بن العبد',     matla:'لِخَوْلَةَ أَطْلالٌ بِبُرْقَةِ ثَهْمَدِ',        icon:'anchor',  color:'blue'   },
  { id:'zuhair',       name:'زهير بن أبي سلمى', matla:'أَمِنْ أُمِّ أَوْفَى دِمْنَةٌ لَمْ تَكَلَّمِ',   icon:'shield',  color:'green'  },
  { id:'labid',        name:'لبيد بن ربيعة',     matla:'عَفَتِ الدِّيَارُ مَحَلُّهَا فَمُقَامُهَا',      icon:'mountain',color:'purple' },
  { id:'antara',       name:'عنترة بن شداد',     matla:'هَلْ غَادَرَ الشُّعَرَاءُ مِنْ مُتَرَدَّمِ',     icon:'sword',   color:'red'    },
  { id:'amr_kulthum',  name:'عمرو بن كلثوم',     matla:'أَلَا هُبِّي بِصَحْنِكِ فَاصْبَحِينَا',          icon:'zap',     color:'orange' },
  { id:'harith',       name:'الحارث بن حلزة',    matla:'آذَنَتْنَا بِبَيْنِهَا أَسْمَاءُ',               icon:'sun',     color:'teal'   }
];

const QUIZZES = {
  complete: [
    { question:"الخيلُ والليلُ والبيداءُ تعرفُني... والرمحُ والقرطاسُ و____", options:["السيفُ","القلمُ","الكتابُ","الحبرُ"], correct:1 },
    { question:"وما حبُّ الديارِ شغفنَ قلبي... ولكن حبُّ من ____", options:["بنى الديارا","سكنَ الديارا","هجرَ الديارا","زارَ الديارا"], correct:1 }
  ],
  meter: [
    { question:"ما البحر الذي وزنه: فعولن مفاعيلن فعولن مفاعلن؟", options:["الطويل","الكامل","البسيط","الوافر"], correct:0 },
    { question:"على أي بحر نظم الشوقي نهج البردة؟", options:["البسيط","الخفيف","الوافر","الكامل"], correct:1 }
  ],
  poet: [
    { question:"من القائل: نَقِّل فُؤادَكَ حَيثُ شِئتَ مِنَ الهَوى... ما الحُبُّ إِلّا لِلحَبيبِ الأَوَّلِ؟", options:["المتنبي","أبو تمام","بشار بن برد","البحتري"], correct:1 },
    { question:"من الملقب بـ شاعر النيل؟", options:["أحمد شوقي","حافظ إبراهيم","إيليا أبو ماضي","خليل مطران"], correct:1 }
  ],
  rhetoric: [
    { question:"ما نوع التشبيه في: 'العمر مثل الضيف'؟", options:["بليغ","مجمل","مرسل","مؤكد"], correct:2 },
    { question:"ما الغرض من الاستفهام في قوله تعالى: 'أليس الله بأحكم الحاكمين'؟", options:["التقرير","التعجب","النفي","التمني"], correct:0 }
  ]
};

const SAMPLE_VERSES = [
  "قِفَا نَبْكِ مِنْ ذِكْرَى حَبِيبٍ ومَنْزِلِ",
  "بِسِقْطِ اللِّوَى بَيْنَ الدَّخُولِ فَحَوْمَلِ",
  "إِذَا الشعبُ يوماً أرادَ الحياةَ",
  "فلا بدَّ أنْ يستجيبَ القدرْ"
];
// =============================================
// محرك المؤثرات الصوتية التفاعلية الخاص بصفحة تمرّن (Practice Sound System)
// =============================================
function isPracticeActive() {
  try {
    const practiceSec = document.getElementById('practice-section');
    const lessonSec = document.getElementById('lesson-section');
    const inPractice = practiceSec && practiceSec.style.display !== 'none';
    const inLesson = lessonSec && lessonSec.style.display !== 'none';
    const achieveModal = document.getElementById('node-achievement-modal');
    const unitModal = document.getElementById('unit-selector-modal');
    const addPracticeModal = document.getElementById('add-practice-node-modal');
    const streakModal = document.getElementById('streak-celebration-modal');

    const inAchieve = achieveModal && achieveModal.style.display === 'flex';
    const inUnit = unitModal && unitModal.style.display === 'flex';
    const inAddNode = addPracticeModal && addPracticeModal.style.display === 'flex';
    const inStreak = streakModal && streakModal.style.display === 'flex';

    return inPractice || inLesson || inAchieve || inUnit || inAddNode || inStreak;
  } catch(e) {
    return false;
  }
}

class SoundSystem {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // صوت نقرة الأزرار الخفيفة (Duolingo-style crisp tap)
  tap() {
    if (!isPracticeActive()) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.04);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
    } catch(e) {}
  }

  // صوت توصيل ناجح لزوج كلمات (Two-tone match chord)
  matchSuccess() {
    if (!isPracticeActive()) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [659.25, 987.77].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.06);
        gain.gain.setValueAtTime(0.18, t + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.18);
      });
    } catch(e) {}
  }

  // نغمة النجاح وحل السؤال (Joyful Success Arpeggio)
  success() {
    if (!isPracticeActive()) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.065);
        gain.gain.setValueAtTime(0.22, t + idx * 0.065);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.065 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.065);
        osc.stop(t + idx * 0.065 + 0.24);
      });
    } catch(e) {}
  }

  // صوت الخطأ الخفيف (Gentle Error Thud)
  error() {
    if (!isPracticeActive()) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, t);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.2);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.21);
    } catch(e) {}
  }

  // الرنين السحري الفخم لفتح النافذة والبطاقات (Magical Fairy Chime)
  magicChime() {
    if (!isPracticeActive()) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const freqs = [880, 1174.66, 1318.51, 1760, 2093];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.045);
        gain.gain.setValueAtTime(0.12, t + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.0005, t + idx * 0.045 + 0.42);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.045);
        osc.stop(t + idx * 0.045 + 0.45);
      });
    } catch(e) {}
  }

  // صوت اختفاء/إغلاق النافذة (Soft Whoosh Close)
  popupClose() {
    if (!isPracticeActive()) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.09);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch(e) {}
  }

  // انتصار وإتمام المستوى (Grand Fanfare Victory)
  levelWin() {
    if (!isPracticeActive()) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const chords = [
        { freqs: [523.25, 659.25], time: 0, dur: 0.16 },
        { freqs: [659.25, 783.99], time: 0.14, dur: 0.16 },
        { freqs: [783.99, 1046.5], time: 0.28, dur: 0.2 },
        { freqs: [1046.5, 1318.5, 1567.98], time: 0.44, dur: 0.55 }
      ];
      chords.forEach(c => {
        c.freqs.forEach(f => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, t + c.time);
          gain.gain.setValueAtTime(0.18, t + c.time);
          gain.gain.exponentialRampToValueAtTime(0.001, t + c.time + c.dur);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t + c.time);
          osc.stop(t + c.time + c.dur + 0.05);
        });
      });
    } catch(e) {}
  }
}

const soundFX = new SoundSystem();
window.soundFX = soundFX;

// تفعيل الصوت عند أول تفاعل من المستخدم
document.addEventListener('pointerdown', () => {
  if (soundFX) soundFX.init();
}, { once: true });

// =============================================
// ① API — كل الطلبات تمر من هنا
// =============================================
let authToken = sessionStorage.getItem('adminToken') || null;
let isAdmin   = false;
let heartsData = JSON.parse(localStorage.getItem('heartsData') || 'null') || {
  count: 5.0,
  infiniteHearts: false,
  promoCode: null,
  lastDailyRefill: null
};
let currentUser = null;
let userToken   = localStorage.getItem('userToken') || null;
const GOOGLE_CLIENT_ID = '612595539801-ik8h3fjp1migc6skf7iia6a79megdmhc.apps.googleusercontent.com'; // ← نفس Client ID

// =============================================
// Namespace — عزل كامل لكل حساب/زائر
// =============================================
function getUid() {
  return currentUser ? `user_${currentUser.id}` : 'guest';
}
function uKey(base) { return `${base}__${getUid()}`; }
function saveUserData(key, value) {
  try { localStorage.setItem(uKey(key), JSON.stringify(value)); } catch(e) {}
}
function loadUserData(key, fallback = null) {
  try {
    const raw = localStorage.getItem(uKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch(e) { return fallback; }
}

// 🔥 هذا المتغير يوجه كل طلبات المتحف والأدمن لتمر عبر الوسيط الشامل 🔥
const BASE_URL = '/api';

async function apiCall(method, path, body=null, auth=false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  
  // دمج المسار، مثلاً: /api/admin/login
  const fullUrl = BASE_URL + path; 
  
  const r = await fetch(fullUrl, opts);
  if (r.status === 401 && auth) { onAuthExpired(); throw new Error('unauthorized'); }
  
  // إظهار الخطأ الحقيقي إذا كان الرمز خاطئاً
  if (!r.ok) {
     const errData = await r.json().catch(()=>({}));
     throw new Error(errData.detail || `HTTP ${r.status}`);
  }
  return r.json();
}

const api = {
  get:    (path)        => apiCall('GET',    path),
  post:   (path, body)  => apiCall('POST',   path, body, true),
  postPublic: (path, b) => apiCall('POST',   path, b, false),
  put:    (path, body)  => apiCall('PUT',    path, body, true),
  delete: (path)        => apiCall('DELETE', path, null, true),
  patch:  (path, body)  => apiCall('PATCH',  path, body, true),
};

function onAuthExpired() {
  authToken = null; isAdmin = false;
  sessionStorage.removeItem('adminToken');
  renderMuseumLanding();
  if (currentPoetId) {
    document.getElementById('admin-add-btn-area').style.display = 'none';
    renderPoetContent(currentPoetId);
  }
}

async function verifyStoredToken() {
  if (!authToken) return;
  try {
    const r = await apiCall('GET', '/admin/verify', null, true);
    isAdmin = r.valid;
    if (!r.valid) { authToken = null; sessionStorage.removeItem('adminToken'); }
  } catch { authToken = null; isAdmin = false; sessionStorage.removeItem('adminToken'); }
}

// =============================================
// حفظ الأبيات في localStorage
// =============================================
const VERSES_KEY = 'arudh_verses_v1';

function saveVerses() {
  try {
    const t = [...verses];
    while (t.length > 4 && !t[t.length-1].trim() && !t[t.length-2].trim()) t.splice(t.length-2, 2);
    localStorage.setItem(VERSES_KEY, JSON.stringify(t));
  } catch {}
}

function loadVerses() {
  try {
    const s = localStorage.getItem(VERSES_KEY);
    if (!s) return;
    const p = JSON.parse(s);
    if (Array.isArray(p) && p.length >= 4) {
      verses = p;
      if (verses.length % 2 !== 0) verses.push('');
      const l = verses.length - 1;
      if ((verses[l]||'').trim() || (verses[l-1]||'').trim()) verses.push('','');
    }
  } catch {}
}

// =============================================
// التحليل العروضي
// =============================================
async function analyzeVerses(text) {
  if (!text || !text.trim()) return { phonetic: "", symbols: "", meter: "..." };
  
  try {
    // استخدم دالة api التي بنيتها بنفسك ليمر الطلب عبر /api/analyze
    const d = await api.postPublic('/analyze', { text: text.trim() });
    return { 
      phonetic: d.phonetic || "", 
      symbols: d.symbols || "", 
      meter: d.meter || "..." 
    };
  } catch (error) { 
    return { 
      phonetic: "السيرفر لا يستجيب..", 
      symbols: "---", 
      meter: "خطأ اتصال" 
    }; 
  }
}

// =============================================
// المظهر
// =============================================
let isDark = localStorage.getItem('theme') === 'dark';
function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark);
  document.getElementById('moon-icon').style.display = isDark ? 'none' : 'block';
  document.getElementById('sun-icon').style.display  = isDark ? 'block' : 'none';
}
document.getElementById('theme-toggle').addEventListener('click', () => {
  isDark = !isDark;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  applyTheme();
});
applyTheme();

// =============================================
// ارتفاع المحلل
// =============================================
function updateArudHeight() {
  const el = document.getElementById('arud-section');
  if (!el || el.style.display === 'none') return;
  el.style.height = (window.innerHeight - 64) + 'px';
}
window.addEventListener('resize', updateArudHeight);

// =============================================
// Practice Path & Streak Logic
// =============================================
let streakData = { count: 0, lastActiveDate: null }; // يُحمَّل بعد تحديد المستخدم

let practiceCourses = JSON.parse(localStorage.getItem('practiceCourses_v1')) || [
  { id: 1, title: 'البلاغة', icon: 'book', isHidden: false }
];
let currentCourseId = Number(localStorage.getItem('currentCourseId')) || practiceCourses[0].id;

let practiceUnits = JSON.parse(localStorage.getItem('practiceUnits')) || [
  { id: 1, title: 'القسم 1: مقدمة في البلاغة', desc: 'فهم الأقسام الرئيسية لعلم البلاغة', color: '#22c55e', courseId: 1 }
];
// Migrate existing units to course 1
practiceUnits.forEach(u => {
  if (!u.courseId) u.courseId = 1;
});

function getCourseUnits() {
  return practiceUnits.filter(u => Number(u.courseId) === currentCourseId);
}

let currentUnitId = practiceUnits.find(u => Number(u.courseId) === currentCourseId)?.id || practiceUnits[0].id;

const defaultQuestions = [
  {
    type: 'image_card',
    title: 'شجرة علوم البلاغة العربية',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    audioUrl: '',
    note: 'تنقسم البلاغة إلى ثلاثة علوم: علم المعاني، وعلم البيان (التشبيه والاستعارة والكناية)، وعلم البديع.'
  },
  {
    type: 'info_card',
    title: 'أركان التشبيه الأربعة',
    text: 'يقوم التشبيه في البلاغة العربية على أربعة أركان أساسية:\n١. المشبه: وهو الشيء المراد وصفه.\n٢. المشبه به: الشيء الذي يُشبه به.\n٣. أداة التشبيه: مثل (الكاف، كأن، يشبه).\n٤. وجه الشبه: الصفة المشتركة بينهما.',
    audioUrl: '',
    note: 'استمع للتوضيح الصوتي أو اقرأ البطاقة ثم اضغط "مفهوم" للمرور.'
  },
  {
    type: 'match',
    title: 'صل بين كل مفهوم بلاغي وتعريفه الصحيح:',
    pairs: [
      { left: 'التشبيه', right: 'عقد مماثلة بين شيئين في صفة' },
      { left: 'الاستعارة', right: 'تشبيه حُذف أحد طرفيه' },
      { left: 'الكناية', right: 'لفظ أُطلق وأُريد به لازم معناه' }
    ]
  },
  {
    type: 'translate',
    text: 'العلم يرفع بيتاً لا عماد له',
    words: ['العلم', 'يرفع', 'بيتاً', 'لا', 'عماد', 'له', 'والجهل', 'يهدم'],
    correct: ['العلم', 'يرفع', 'بيتاً', 'لا', 'عماد', 'له']
  },
  {
    type: 'fill_blank_text',
    title: 'أكمل الفراغ بالكلمة المناسبة كتابةً:',
    sentence: 'الخيلُ والليلُ والبيداءُ تعرفُني ... والسيفُ والرمحُ والقرطاسُ و[___]',
    correct: ['القلم', 'والقلم', 'القلمُ']
  },
  {
    type: 'fill_blank_choice',
    title: 'اختر الكلمة المناسبة لملء الفراغ:',
    sentence: 'التشبيه البليغ هو ما حُذف منه أداة التشبيه و[___].',
    options: ['وجه الشبه', 'المشبه به', 'المشبه', 'المستعار'],
    correct: 'وجه الشبه'
  },
  {
    type: 'keypad',
    title: 'تقطيع تفعيلة بحر الكامل:',
    text: 'اكتب التقطيع العروضي لتفعيلة (مُتَفَاعِلُنْ) مستخدمًا الحركات والسكنات:',
    keys: ['/', '٠', '!', '$', '؟', '،'],
    correct: ['///٠//٠', '//٠//٠', '///0//0', '///0//0/']
  },
  {
    type: 'mcq',
    text: 'ما نوع التشبيه في: "العلم كالنور في الهداية"؟',
    options: ['تشبيه مفصل', 'تشبيه مجمل', 'تشبيه بليغ', 'استعارة تصريحية'],
    correct: 0
  }
];

const initialPracticeNodes = [
  {
    id: 1,
    unitId: 1,
    type: 'lesson',
    status: 'completed',
    title: 'مقدمة البلاغة والشواهد',
    desc: 'بطاقة توضيحية وتوصيل وترتيب كلمات',
    actionText: 'ابدأ +15 XP',
    icon: 'book-open',
    levels: [
      { id: 1, title: 'المستوى 1: التأسيس', questions: [defaultQuestions[0], defaultQuestions[1], defaultQuestions[3]] },
      { id: 2, title: 'المستوى 2: التثبيت', questions: [defaultQuestions[2], defaultQuestions[7]] }
    ]
  },
  {
    id: 2,
    unitId: 1,
    type: 'lesson',
    status: 'current',
    title: 'أركان التشبيه وسلاسة الترتيب',
    desc: 'اختبارات التوصيل وملء الفراغ وترتيب الكلمات',
    actionText: 'ابدأ التحدي +20 XP',
    currentLevelIndex: 0,
    icon: 'star',
    levels: [
      { id: 1, title: 'المستوى 1: الأركان', questions: [defaultQuestions[1], defaultQuestions[2], defaultQuestions[3]] },
      { id: 2, title: 'المستوى 2: التطبيق', questions: [defaultQuestions[4], defaultQuestions[5], defaultQuestions[7]] }
    ]
  },
  {
    id: 3,
    unitId: 1,
    type: 'lesson',
    status: 'locked',
    title: 'اختبار الكيبورد العروضي والرموز',
    desc: 'تجربة لوحة المفاتيح التفاعلية للتقطيع والرموز',
    actionText: 'بدء اختبار الكيبورد',
    icon: 'keyboard',
    levels: [
      { 
        id: 1, 
        title: 'المستوى 1', 
        questions: [
          defaultQuestions[6],
          {
            type: 'keypad',
            title: 'تركيب معادلة التشبيه التام:',
            text: 'اكتب الرموز بالترتيب: [مشبه] + [أداة] + [مشبه به]',
            keys: ['[مشبه]', '+', '[أداة]', '[مشبه به]', '[وجه شبه]', '-'],
            correct: ['[مشبه] + [أداة] + [مشبه به]', '[مشبه]+[أداة]+[مشبه به]']
          },
          {
            type: 'translate',
            text: 'وإذا المنية أنشبت أظفارها',
            words: ['وإذا', 'المنية', 'أنشبت', 'أظفارها', 'ألفيت', 'كل', 'تميمة'],
            correct: ['وإذا', 'المنية', 'أنشبت', 'أظفارها']
          }
        ] 
      }
    ]
  },
  {
    id: 4,
    unitId: 1,
    type: 'countdown',
    timeLimit: 45,
    status: 'locked',
    title: 'تحدي العد التنازلي السريع (45 ثانية)',
    desc: 'أجب قبل نفاد الوقت مع مؤقت تحذيري نابض!',
    actionText: 'خوض التحدي السريع',
    icon: 'timer',
    levels: [
      { 
        id: 1, 
        title: 'المستوى السريع', 
        questions: [
          {
            type: 'mcq',
            text: 'ما هو التشبيه الذي حُذفت منه أداة التشبيه ووجه الشبه معاً؟',
            options: ['التشبيه البليغ', 'التشبيه المؤكد', 'التشبيه التمثيلي', 'الاستعارة'],
            correct: 0
          },
          {
            type: 'translate',
            text: 'العلم نور والجهل ظلام',
            words: ['العلم', 'نور', 'والجهل', 'ظلام', 'والسيف', 'أصدق'],
            correct: ['العلم', 'نور', 'والجهل', 'ظلام']
          },
          {
            type: 'fill_blank_choice',
            title: 'اختر الكلمة المناسبة:',
            sentence: 'إذا حُذف المشبه به ودُلّ عليه بشيء من لوازمه تسمى استعارة [___].',
            options: ['مكنية', 'تصريحية', 'تمثيلية', 'مرشحة'],
            correct: 'مكنية'
          }
        ] 
      }
    ]
  },
  {
    id: 5,
    unitId: 1,
    type: 'lesson',
    status: 'locked',
    title: 'الاستعارة وبطاقات الصور',
    desc: 'شواهد بصرية وبلاغية تفاعلية',
    actionText: 'ابدأ +15 XP',
    icon: 'image',
    levels: [
      {
        id: 1,
        title: 'المستوى 1',
        questions: [
          {
            type: 'image_card',
            title: 'الاستعارة التصريحية والمكنية',
            imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
            audioUrl: '',
            note: 'الاستعارة التصريحية: ما صُرح فيها بلفظ المشبه به. والاستعارة المكنية: ما حُذف منها المشبه به ورُمز له بشيء من لوازمه.'
          },
          defaultQuestions[2],
          defaultQuestions[3]
        ]
      }
    ]
  },
  {
    id: 6,
    unitId: 1,
    type: 'review',
    status: 'locked',
    title: 'تحدي الفرسان والمراجعة الشاملة',
    desc: 'تثبيت ومراجعة لجميع الأنماط البلاغية والعروضية',
    actionText: 'مراجعة +25 XP',
    icon: 'refresh-cw',
    levels: [{ id: 1, title: 'المستوى الختامي', questions: defaultQuestions }]
  }
];

const initialPracticeAds = [
  {
    id: 1,
    adType: 'path_side',
    unitId: 1,
    afterNodeIndex: 1, // appears near node 1 on the path
    side: 'right', // 'right' or 'left'
    badgeText: 'عرض حصري ✨',
    miniText: 'هل تريد اشتراكاً في "تمرّن" مجاناً؟',
    bgColor: '#6366f1',
    bgGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    modalTitle: 'احصل على اشتراك "تمرّن" المميز مجاناً!',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    modalText: 'انضم الآن إلى باقة الفرسان في تطبيق البيان:\n• قلوب وطاقة غير محدودة لمواصلة التعلّم دون توقف.\n• مراجعة ذكية فورية لجميع الأخطاء وتكرارها حتى الإتقان.\n• الوصول المبكر لجميع بحور الشعر والشواهد البلاغية المصورة.\n• وسام الفروسية الذهبي الخاص في لوحة الشرف.',
    ctaText: 'اشترك الآن مجاناً',
    ctaUrl: '#'
  },
  {
    id: 2,
    adType: 'unit_drawer',
    unitId: 2,
    badgeText: 'هدية الوحدة 🎁',
    miniText: 'احصل على ملخص شامل ومصور لقسم علم المعاني!',
    bgColor: '#059669',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    modalTitle: 'دليل وفرسان علم المعاني والمجاز',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    modalText: 'ملف PDF تفاعلي يحتوي على كافة القواعد، والشواهد القرآنية والشعرية مشروحة ومحللة بدقة تامة لتثبيت علم المعاني في ذهنك بسهولة.',
    ctaText: 'تحميل الملخص مجاناً',
    ctaUrl: '#'
  }
];

let rawNodes = JSON.parse(localStorage.getItem('practiceNodes_v4'));
if (!rawNodes || !rawNodes.some(n => n.type === 'countdown')) {
  rawNodes = initialPracticeNodes;
  // احفظ الهيكل فقط — بدون status/currentLevelIndex
  localStorage.setItem('practiceNodes_v4', JSON.stringify(
    rawNodes.map(({ status, currentLevelIndex, ...rest }) => rest)
  ));
}
let practiceNodes = rawNodes.map(n => ({
  ...n,
  status: 'locked',
  currentLevelIndex: 0
}));
// العقدة الأولى current للزائر الجديد
if (practiceNodes.length > 0) practiceNodes[0].status = 'current';

let practiceAds = JSON.parse(localStorage.getItem('practiceAds_v1')) || initialPracticeAds;
let dismissedPracticeAds = JSON.parse(sessionStorage.getItem('dismissedPracticeAds') || '[]');

// ===== Google Sign-In & User Management =====

function initGoogleSignIn() {
  if (!window.google) return;
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true
  });
  // زر التسجيل في المودال
  const container = document.getElementById('google-signin-btn-container');
  if (container) {
    google.accounts.id.renderButton(container, {
      theme: 'outline', size: 'large', locale: 'ar',
      text: 'signin_with', shape: 'rounded', width: 280
    });
  }
}

async function handleGoogleCredential(response) {
  try {
    const r = await fetch(BASE_URL + '/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.detail || data.error || 'فشل تسجيل الدخول');
 
    userToken   = data.token;
    currentUser = data.user;
    localStorage.setItem('userToken',   userToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
 
    closeModal('login-modal');
    updateNavUserDisplay();
 
    // ✅ تحديث namespace للستريك
    streakData = loadUserData('streakData', { count: 0, lastActiveDate: null });
 
    // ✅ تحميل القلوب من السيرفر أولاً (هذا يتعامل مع القلوب اليومية بشكل آمن)
    await initHearts();
 
    // ✅ تحميل الهيكل والتقدم معاً (loadPracticeFromServer تجلب التقدم من السيرفر)
    await loadPracticeFromServer();
 
    // ✅ تحديث الستريك من السيرفر
    try {
      const pr = await fetch(BASE_URL + '/user/progress', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (pr.ok) {
        const pd = await pr.json();
        if (pd.lastActiveDate) {
          const serverDate = new Date(pd.lastActiveDate);
          const localDate  = streakData.lastActiveDate ? new Date(streakData.lastActiveDate) : null;
          if (!localDate || serverDate > localDate) {
            streakData.count          = pd.streakCount    || 0;
            streakData.lastActiveDate = pd.lastActiveDate;
            saveUserData('streakData', streakData);
          }
        }
        if (currentUser) {
          currentUser.highestStreak = pd.highestStreak || currentUser.highestStreak || 0;
          currentUser.totalXP       = pd.totalXP       || currentUser.totalXP       || 0;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      }
    } catch(e) {}
 
    renderPracticePath();
    updateStreakDisplay();
    if (window.lucide) lucide.createIcons();
  } catch(e) {
    console.error('خطأ تسجيل الدخول:', e);
    alert('خطأ في تسجيل الدخول: ' + e.message);
  }
}

async function loadUserFromStorage() {
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    try { currentUser = JSON.parse(stored); } catch {}
  }
  if (userToken) {
    try {
      const r = await fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (r.ok) {
        currentUser = await r.json();
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else if (r.status === 401) {
        userToken = null; currentUser = null;
        localStorage.removeItem('userToken');
        localStorage.removeItem('currentUser');
      }
    } catch(e) {}
  }
    updateNavUserDisplay();
  if (userToken) {
    await loadProgressFromServer();
  }
}

function updateNavUserDisplay() {
  const loginBtn = document.getElementById('nav-login-btn');
  const avatar   = document.getElementById('nav-user-avatar');
  const img      = document.getElementById('nav-avatar-img');
  
  if (currentUser) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (avatar)   avatar.style.display = 'flex';
    if (img && currentUser.photo) img.src = currentUser.photo;
  } else {
    if (loginBtn) loginBtn.style.display = 'flex';
    if (avatar)   avatar.style.display = 'none';
  }
}

function openLoginModal() {
  openModal('login-modal');
  setTimeout(() => initGoogleSignIn(), 100);
}

function userSignOut() {
  if (!confirm('هل تريد تسجيل الخروج؟')) return;

  // احفظ بيانات الحساب الحالي قبل الخروج
  savePracticeData();

  userToken   = null;
  currentUser = null;
  localStorage.removeItem('userToken');
  localStorage.removeItem('currentUser');
  if (window.google) google.accounts.id.disableAutoSelect();

  // استعد بيانات الزائر (namespace = guest)
  const guestProgress = loadUserData('nodeProgress', {});
  practiceNodes = practiceNodes.map(n => {
    const p = guestProgress[String(n.id)];
    return { ...n, status: p?.status ?? 'locked', currentLevelIndex: p?.currentLevelIndex ?? 0 };
  });
  const hasP = practiceNodes.some(n => n.status !== 'locked');
  if (!hasP && practiceNodes.length > 0) practiceNodes[0].status = 'current';

  streakData = loadUserData('streakData', { count: 0, lastActiveDate: null });
  heartsData = { count: 5.0, infiniteHearts: false, promoCode: null, lastDailyRefill: null };

  updateNavUserDisplay();
  updateHeartsDisplay();
  updateStreakDisplay();
  renderPracticePath();
  showSection('home');
}

async function deleteUserAccount() {
  if (!confirm('⚠️ هل أنت متأكد من حذف حسابك نهائياً؟ لا يمكن التراجع.')) return;
  try {
    await fetch('/api/user/me', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    userSignOut();
  } catch(e) { alert('خطأ في حذف الحساب'); }
}

async function saveUserProfile() {
  if (!userToken) return;
  const name = document.getElementById('profile-name-input')?.value.trim();
  const bio  = document.getElementById('profile-bio-input')?.value.trim();
  if (!name) return alert('يرجى إدخال الاسم');
  
  try {
    const r = await fetch('/api/user/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ name, bio })
    });
    if (r.ok) {
      currentUser = await r.json();
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      renderProfileSection();
      updateNavUserDisplay();
    }
  } catch(e) { alert('خطأ في الحفظ'); }
}

async function syncProgressToServer() {
  if (!userToken || !currentUser) return;
  
  const STATUS_RANK = { locked: 0, current: 1, completed: 2 };
  const progress = {};
  
  practiceNodes.forEach(n => {
    const rank = STATUS_RANK[n.status] || 0;
    if (rank > 0) {
      progress[String(n.id)] = {
        status:            n.status,
        currentLevelIndex: n.currentLevelIndex || 0,
        unitId:            n.unitId
      };
    }
  });

  const completedCount = practiceNodes.filter(n => n.status === 'completed').length;
  const totalXP        = completedCount * 15;

  try {
    await fetch('/api/user/progress', {
      method: 'PUT',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        progress,
        totalXP,
        streakCount:    streakData.count,
        lastActiveDate: streakData.lastActiveDate,
        highestStreak:  Math.max(streakData.count, currentUser?.highestStreak || 0)
      })
    });

    if (currentUser) {
      currentUser.totalXP       = Math.max(currentUser.totalXP || 0, totalXP);
      currentUser.highestStreak = Math.max(currentUser.highestStreak || 0, streakData.count);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  } catch(e) {
    console.warn('syncProgressToServer failed:', e);
  }
}

async function loadProgressFromServer() {
  if (!userToken) return;

  try {
    const r = await fetch('/api/user/progress', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    if (!r.ok) return;

    const serverData = await r.json();
    const serverProgress = serverData.progress || {};
    const STATUS_RANK = { locked: 0, current: 1, completed: 2 };

    // طبّق التقدم على practiceNodes
    let anyChange = false;
    practiceNodes.forEach(node => {
      const nodeKey    = String(node.id);
      const serverNode = serverProgress[nodeKey];
      if (!serverNode) return;

      const serverRank = STATUS_RANK[serverNode.status] || 0;
      const localRank  = STATUS_RANK[node.status]       || 0;

      if (serverRank > localRank) {
        node.status            = serverNode.status;
        node.currentLevelIndex = serverNode.currentLevelIndex || 0;
        anyChange = true;
      } else if (serverRank === localRank && serverRank === 2) {
        // كلاهما completed — خذ الأعلى levelIndex
        if ((serverNode.currentLevelIndex || 0) > (node.currentLevelIndex || 0)) {
          node.currentLevelIndex = serverNode.currentLevelIndex;
          anyChange = true;
        }
      }
    });

    // طبّق الستريك
    if (serverData.lastActiveDate) {
      try {
        const serverDate = new Date(serverData.lastActiveDate);
        const localDate  = streakData.lastActiveDate ? new Date(streakData.lastActiveDate) : null;
        if (!localDate || serverDate > localDate) {
          streakData.count          = serverData.streakCount    || 0;
          streakData.lastActiveDate = serverData.lastActiveDate;
          saveUserData('streakData', streakData);
          updateStreakDisplay();
          anyChange = true;
        }
      } catch(e) {}
    }

    // طبّق highestStreak و totalXP على currentUser
    if (currentUser) {
      currentUser.highestStreak = serverData.highestStreak || 0;
      currentUser.totalXP       = serverData.totalXP       || 0;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    if (anyChange) {
      // احفظ محلياً مع التقدم المحدَّث
      const newProgress = {};
practiceNodes.forEach(n => {
  newProgress[String(n.id)] = { status: n.status, currentLevelIndex: n.currentLevelIndex || 0 };
});
saveUserData('nodeProgress', newProgress);
      renderPracticePath();
      console.log('✅ تم تحميل التقدم من السيرفر');
    }
  } catch(e) {
    console.warn('loadProgressFromServer failed:', e);
  }
}
// ===== Profile Section =====
function renderProfileSection() {
  const container = document.getElementById('profile-content');
  if (!container) return;
  
  if (!currentUser) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;">
        <i data-lucide="user-x" style="width:56px;height:56px;color:var(--color-muted);margin:0 auto 16px;display:block;"></i>
        <h2 style="margin-bottom:12px;">لم تسجّل الدخول</h2>
        <p style="color:var(--color-muted);margin-bottom:24px;">سجّل دخولك لعرض ملفك الشخصي</p>
        <button class="btn-primary" onclick="openLoginModal()">
          <i data-lucide="log-in"></i> تسجيل الدخول
        </button>
      </div>`;
    if(window.lucide) lucide.createIcons();
    return;
  }
  
  const completedNodes = practiceNodes.filter(n => n.status === 'completed').length;
  const totalNodes     = practiceNodes.length;
  const xp             = currentUser.totalXP || 0;
  const bestStreak     = currentUser.highestStreak || 0;
  const joinDate       = currentUser.joinedAt
    ? new Date(currentUser.joinedAt).toLocaleDateString('ar-SA', {year:'numeric',month:'long',day:'numeric'})
    : '';
  
  const photoHtml = currentUser.photo
    ? `<img src="${escHtml(currentUser.photo)}" alt="avatar" class="profile-avatar">`
    : `<div class="profile-avatar-placeholder"><i data-lucide="user" style="width:36px;height:36px;"></i></div>`;
  
  container.innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        ${photoHtml}
        <div class="profile-name">${escHtml(currentUser.name || 'مستخدم')}</div>
        <div class="profile-email">${escHtml(currentUser.email || '')}</div>
        ${currentUser.bio ? `<div class="profile-bio">${escHtml(currentUser.bio)}</div>` : ''}
        ${joinDate ? `<div style="color:rgba(255,255,255,0.5);font-size:0.75rem;margin-top:6px;">عضو منذ ${joinDate}</div>` : ''}
      </div>
      <div class="profile-stats">
        <div class="profile-stat">
          <span class="profile-stat-val" style="color:#f59e0b;">${xp}</span>
          <span class="profile-stat-label">نقاط XP</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat-val" style="color:#ea580c;">${bestStreak}</span>
          <span class="profile-stat-label">أعلى ستريك</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat-val">${completedNodes}/${totalNodes}</span>
          <span class="profile-stat-label">عقد مكتملة</span>
        </div>
      </div>
      <div class="profile-edit-form">
        <label style="font-weight:700;font-size:0.85rem;">الاسم المعروض:</label>
        <input type="text" id="profile-name-input" class="modal-input"
          value="${escHtml(currentUser.name || '')}" placeholder="اسمك..." maxlength="50">
        <label style="font-weight:700;font-size:0.85rem;">نبذة عنك (اختياري):</label>
        <textarea id="profile-bio-input" class="modal-textarea" rows="2"
          placeholder="أخبرنا عنك..." maxlength="200">${escHtml(currentUser.bio || '')}</textarea>
        <div class="profile-actions">
          <button class="btn-primary btn-sm" onclick="saveUserProfile()">
            <i data-lucide="save" style="width:14px;height:14px;"></i> حفظ التغييرات
          </button>
          <button class="btn-secondary btn-sm" onclick="showLeaderboard()">
            <i data-lucide="trophy" style="width:14px;height:14px;"></i> المتصدرون
          </button>
          <button class="btn-secondary btn-sm" onclick="userSignOut()" style="margin-right:auto;">
            <i data-lucide="log-out" style="width:14px;height:14px;"></i> خروج
          </button>
          <button class="btn-secondary btn-sm danger" onclick="deleteUserAccount()">
            <i data-lucide="trash-2" style="width:14px;height:14px;"></i> حذف الحساب
          </button>
        </div>
      </div>
    </div>`;
  
  if(window.lucide) lucide.createIcons();
}

// ===== Leaderboard Subpage & Ready-to-Connect Template =====
let cachedLeaderboardUsers = [];

// دالة مساعدة لحساب إنجاز المستخدم الحالي
function getCurrentUserProgressStats() {
  const completedNodes = (practiceNodes || []).filter(n => n.status === 'completed').length;
  const completedSections = (practiceUnits || []).filter(u => {
    const uNodes = (practiceNodes || []).filter(n => n.unitId === u.id);
    return uNodes.length > 0 && uNodes.every(n => n.status === 'completed');
  }).length;
  return { completedNodes, completedSections };
}

// احتساب ترتيب المتصدرين (طريقة داخلية تعتمد على الأقسام والعقد المكتملة دون كشف المعادلة للعامة)
function calculateBotRankScore(user) {
  const sections = Number(user.completedSections ?? user.completedSectionsCount ?? 0);
  const nodes = Number(user.completedNodes ?? user.completedNodesCount ?? 0);
  const streak = Number(user.highestStreak ?? user.streak ?? 0);
  const xp = Number(user.totalXP ?? user.xp ?? 0);
  
  // احتساب البوت: الأقسام المكتملة أولاً ثم العقد ثم الستريك ونقاط الخبرة
  return (sections * 1000) + (nodes * 50) + (streak * 10) + xp;
}

// الرتب والمراكز المعروضة للعامة بحسب المركز
function getRankHonorTitle(rankNumber) {
  if (rankNumber === 1) return { rankText: 'المركز الأول', badgeClass: 'gold', rankNumber: 1 };
  if (rankNumber === 2) return { rankText: 'المركز الثاني', badgeClass: 'silver', rankNumber: 2 };
  if (rankNumber === 3) return { rankText: 'المركز الثالث', badgeClass: 'bronze', rankNumber: 3 };
  return { rankText: `المركز ${rankNumber}`, badgeClass: '', rankNumber };
}

// قالب جلب بيانات المتصدرين المسجلين (قالب جاهز للربط عبر API أو التخزين)
async function fetchLeaderboardData() {
  // 1. محاولة جلب البيانات الحية من الخادم إذا كان متصلاً
  try {
    const r = await fetch('/api/leaderboard');
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.filter(u => u.isRegistered !== false);
      }
    }
  } catch (e) {}

  // 2. قالب التخزين المحلي للمستخدمين المسجلين للدخول (نماذج مسجلة جاهزة للربط)
  let registeredList = JSON.parse(localStorage.getItem('registeredLeaderboardUsers') || 'null');
  // التحقق من تحديث الأسماء السابقة إلى "اسم المستخدم"
  if (registeredList && Array.isArray(registeredList)) {
    const hasOldNames = registeredList.some(u => u.name && u.name.includes('كلثوم') || u.name.includes('الخنساء') || u.name.includes('حسان') || u.name.includes('سارة'));
    if (hasOldNames) {
      registeredList = null;
    }
  }

  if (!registeredList || !registeredList.length) {
    registeredList = [
      {
        id: 'user_reg_1',
        name: 'اسم المستخدم',
        photo: '',
        bio: 'مهتم بعلم البلاغة وقوافي الشعر العربي الأصيل وبحور الخليل.',
        isRegistered: true,
        completedSections: 4,
        completedNodes: 28,
        highestStreak: 19,
        totalXP: 420,
        joinedAt: '2024-01-15'
      },
      {
        id: 'user_reg_2',
        name: 'اسم المستخدم',
        photo: '',
        bio: 'باحثة في الأدب وفنون البديع والبيان والمعلقات.',
        isRegistered: true,
        completedSections: 3,
        completedNodes: 22,
        highestStreak: 14,
        totalXP: 330,
        joinedAt: '2024-02-01'
      },
      {
        id: 'user_reg_3',
        name: 'اسم المستخدم',
        photo: '',
        bio: 'أطمح لختم جميع مسارات علم العروض وتصريف الأوزان الفصيحة.',
        isRegistered: true,
        completedSections: 2,
        completedNodes: 16,
        highestStreak: 9,
        totalXP: 240,
        joinedAt: '2024-03-10'
      },
      {
        id: 'user_reg_4',
        name: 'اسم المستخدم',
        photo: '',
        bio: 'قارئة ومحبة لقصائد المعلقات وبحور الشعر العربي.',
        isRegistered: true,
        completedSections: 1,
        completedNodes: 11,
        highestStreak: 7,
        totalXP: 165,
        joinedAt: '2024-04-05'
      }
    ];
    localStorage.setItem('registeredLeaderboardUsers', JSON.stringify(registeredList));
  }

  // 3. دمج المستخدم الحالي إذا كان مسجلاً للدخول
  if (currentUser) {
    const stats = getCurrentUserProgressStats();
    const existingIndex = registeredList.findIndex(u => (currentUser.id && u.id === currentUser.id) || (currentUser.email && u.email === currentUser.email));
    const myEntry = {
      id: currentUser.id || 'current_registered_user',
      name: currentUser.name || 'اسم المستخدم',
      email: currentUser.email || '',
      photo: currentUser.photo || '',
      bio: currentUser.bio || 'طالب علم في البيان',
      isRegistered: true,
      isCurrentUser: true,
      completedSections: stats.completedSections,
      completedNodes: stats.completedNodes,
      highestStreak: (streakData && streakData.count) || currentUser.highestStreak || 0,
      totalXP: currentUser.totalXP || (stats.completedNodes * 15),
      joinedAt: currentUser.joinedAt || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      registeredList[existingIndex] = { ...registeredList[existingIndex], ...myEntry };
    } else {
      registeredList.push(myEntry);
    }
  }

  return registeredList;
}

// عرض صفحة لوحة المتصدرين
async function renderLeaderboardSection() {
  const container = document.getElementById('leaderboard-page-content');
  if (!container) return;

  container.innerHTML = `
    <div class="leaderboard-loading">
      <i data-lucide="loader-2" style="width:24px;height:24px;animation:spin 1s linear infinite;margin:0 auto 12px;display:block;"></i>
      جاري تحميل لوحة المتصدرين...
    </div>
  `;
  if (window.lucide) lucide.createIcons();

  try {
    const rawUsers = await fetchLeaderboardData();

    // فلترة المستخدمين المسجلين فقط
    const registeredUsers = rawUsers.filter(u => u.isRegistered !== false);

    if (!registeredUsers.length) {
      container.innerHTML = `
        <div class="leaderboard-hero-card">
          <div class="leaderboard-hero-trophy"><i data-lucide="trophy"></i></div>
          <h2>لوحة المتصدرين</h2>
          <p>لا يوجد متصدرون مسجلون بعد. سجّل دخولك لتكون أول المتصدرين!</p>
          ${!currentUser ? `
            <div style="margin-top:20px;">
              <button class="btn-primary" onclick="openLoginModal()">
                <i data-lucide="log-in"></i> تسجيل الدخول للمنافسة
              </button>
            </div>
          ` : ''}
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    // ترتيب المتصدرين وفق احتساب البوت (الأقسام والعقد المكتملة)
    registeredUsers.sort((a, b) => {
      const scoreA = calculateBotRankScore(a);
      const scoreB = calculateBotRankScore(b);
      return scoreB - scoreA;
    });

    // تعيين الرتب
    registeredUsers.forEach((u, i) => {
      u.rankIndex = i;
    });

    cachedLeaderboardUsers = registeredUsers;

    // استخراج الثلاثة الأوائل
    const top3 = registeredUsers.slice(0, 3);
    const remainingUsers = registeredUsers.slice(3);

    // معرفة رتبة المستخدم الحالي إن وجد
    const myIndex = currentUser ? registeredUsers.findIndex(u => u.isCurrentUser || (currentUser.id && u.id === currentUser.id) || (currentUser.email && u.email === currentUser.email)) : -1;
    const myRankInfo = myIndex >= 0 ? getRankHonorTitle(myIndex + 1) : null;

    let userBannerHtml = '';
    if (currentUser && myIndex >= 0) {
      userBannerHtml = `
        <div class="leaderboard-user-status-bar highlight">
          <div class="user-status-info">
            ${currentUser.photo 
              ? `<img src="${escHtml(currentUser.photo)}" class="user-status-avatar" alt="${escHtml(currentUser.name)}">`
              : `<div class="user-status-avatar podium-avatar-placeholder"><i data-lucide="user" style="width:20px;height:20px;"></i></div>`
            }
            <div class="user-status-text">
              <div class="user-status-title">أهلاً ${escHtml(currentUser.name || 'بك')}! رتبتك الحالية: ${myRankInfo.rankText}</div>
              <div class="user-status-sub">اضغط على أي متصدر لعرض ملفه الشخصي</div>
            </div>
          </div>
          <div class="user-status-badge">
            <i data-lucide="award" style="width:16px;height:16px;color:#f59e0b;"></i>
            <span>${myRankInfo.rankText}</span>
          </div>
        </div>
      `;
    } else if (!currentUser) {
      userBannerHtml = `
        <div class="leaderboard-user-status-bar">
          <div class="user-status-info">
            <div class="user-status-avatar podium-avatar-placeholder">
              <i data-lucide="sparkles" style="width:20px;height:20px;color:#f59e0b;"></i>
            </div>
            <div class="user-status-text">
              <div class="user-status-title">سجّل دخولك لحجز مركزك في لوحة المتصدرين</div>
              <div class="user-status-sub">يتم احتساب المراكز تلقائياً للأعضاء المسجلين بناءً على إنجاز المسارات</div>
            </div>
          </div>
          <button class="btn-primary btn-sm" onclick="openLoginModal()">
            <i data-lucide="log-in" style="width:14px;height:14px;"></i> تسجيل الدخول
          </button>
        </div>
      `;
    }

    // بناء منصة التتويج (Podium) - 2nd place, 1st place, 3rd place
    let podiumHtml = '';
    if (top3.length > 0) {
      const p1 = top3[0];
      const p2 = top3[1];
      const p3 = top3[2];

      const renderPodiumStep = (user, rankNum) => {
        if (!user) return `<div class="podium-step" style="visibility:hidden;"></div>`;
        const honor = getRankHonorTitle(rankNum);
        const avatar = user.photo
          ? `<img src="${escHtml(user.photo)}" class="podium-avatar" alt="${escHtml(user.name)}">`
          : `<div class="podium-avatar podium-avatar-placeholder"><i data-lucide="user" style="width:28px;height:28px;"></i></div>`;

        return `
          <div class="podium-step rank-${rankNum}" onclick="openPublicProfileModal('${user.id}')" title="عرض ملف ${escHtml(user.name)}">
            <div class="podium-avatar-wrapper">
              <div class="podium-halo"></div>
              ${avatar}
            </div>
            <div class="podium-name">${escHtml(user.name)}</div>
            ${user.highestStreak ? `
              <div class="podium-meta-streak" title="أيام الحماس">
                <i data-lucide="flame"></i>
                <span>${user.highestStreak} أيام</span>
              </div>
            ` : ''}
            <div class="podium-pillar">
              <div class="podium-rank-badge">${rankNum}</div>
              <div class="podium-rank-text">${honor.rankText}</div>
            </div>
          </div>
        `;
      };

      podiumHtml = `
        <div class="leaderboard-podium">
          ${renderPodiumStep(p2, 2)}
          ${renderPodiumStep(p1, 1)}
          ${renderPodiumStep(p3, 3)}
        </div>
      `;
    }

    // بناء قائمة باقي المتصدرين (المركز الرابع فما فوق)
    let listHtml = '';
    if (remainingUsers.length > 0) {
      listHtml = `
        <div class="leaderboard-list-card">
          <div class="leaderboard-list-header">
            <i data-lucide="users" style="width:16px;height:16px;color:var(--color-muted);"></i>
            <span>باقي المتصدرين المسجلين</span>
          </div>
          <div class="leaderboard-rows">
            ${remainingUsers.map(u => {
              const rankInfo = getRankHonorTitle(u.rankIndex + 1);
              const isMe = (currentUser && (u.id === currentUser.id || u.email === currentUser.email || u.isCurrentUser));
              const avatar = u.photo
                ? `<img src="${escHtml(u.photo)}" class="leaderboard-row-avatar" alt="${escHtml(u.name)}">`
                : `<div class="leaderboard-row-avatar podium-avatar-placeholder"><i data-lucide="user" style="width:20px;height:20px;"></i></div>`;

              return `
                <div class="leaderboard-row-item ${isMe ? 'is-me' : ''}" onclick="openPublicProfileModal('${u.id}')" title="عرض الملف الشخصي">
                  <div class="leaderboard-rank-pill">${u.rankIndex + 1}</div>
                  ${avatar}
                  <div class="leaderboard-row-info">
                    <div class="leaderboard-row-name">
                      ${escHtml(u.name)}
                      ${isMe ? `<span class="leaderboard-me-tag">أنت</span>` : ''}
                    </div>
                    <div class="leaderboard-row-badge">${rankInfo.rankText}</div>
                  </div>
                  ${u.highestStreak ? `
                    <div class="leaderboard-row-streak" title="أيام الحماس">
                      <i data-lucide="flame" style="width:14px;height:14px;"></i>
                      <span>${u.highestStreak}</span>
                    </div>
                  ` : ''}
                  <div class="leaderboard-view-profile-hint">
                    <i data-lucide="chevron-left" style="width:18px;height:18px;"></i>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="leaderboard-hero-card">
        <div class="leaderboard-hero-trophy"><i data-lucide="trophy"></i></div>
        <h2>لوحة المتصدرين</h2>
        <p>تصنيف المتنافسين المسجلين في ميادين الأدب والشعر</p>
      </div>

      ${userBannerHtml}

      ${podiumHtml}

      ${listHtml}
    `;

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--color-muted);">حدث خطأ أثناء تحميل المتصدرين. يرجى المحاولة مرة أخرى.</div>`;
  }
}

// فتح مودال الملف الشخصي لأحد المتصدرين
function openPublicProfileModal(userId) {
  const user = cachedLeaderboardUsers.find(u => String(u.id) === String(userId));
  if (!user) return;

  const modalBody = document.getElementById('public-profile-modal-body');
  if (!modalBody) return;

  const rankInfo = getRankHonorTitle((user.rankIndex || 0) + 1);
  const isMe = (currentUser && (user.id === currentUser.id || user.email === currentUser.email || user.isCurrentUser));
  
  const joinDateFormatted = user.joinedAt 
    ? new Date(user.joinedAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'عضو مسجل';

  const avatarHtml = user.photo
    ? `<img src="${escHtml(user.photo)}" class="public-profile-avatar" alt="${escHtml(user.name)}">`
    : `<div class="public-profile-avatar podium-avatar-placeholder" style="background:rgba(255,255,255,0.2);margin:0 auto 12px;border:3px solid rgba(255,255,255,0.6);"><i data-lucide="user" style="width:40px;height:40px;color:#fff;"></i></div>`;

  modalBody.innerHTML = `
    <div class="public-profile-header">
      <button class="public-profile-close-btn" onclick="closeModal('public-profile-modal')" title="إغلاق">
        <i data-lucide="x" style="width:18px;height:18px;"></i>
      </button>
      ${avatarHtml}
      <div class="public-profile-name">${escHtml(user.name || 'اسم المستخدم')}</div>
      <div class="public-profile-honor">
        <span><i data-lucide="award" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i></span>
        <span>${rankInfo.rankText}</span>
      </div>
    </div>
    <div class="public-profile-body">
      ${user.bio ? `
        <div class="public-profile-bio-box">
          <div style="font-size:0.75rem;font-weight:700;color:var(--color-muted);margin-bottom:4px;">النبذة الشخصية:</div>
          <div>${escHtml(user.bio)}</div>
        </div>
      ` : ''}

      <div class="public-profile-stats-grid">
        <div class="public-profile-stat-card">
          <div class="public-profile-stat-num" style="color:#ea580c;">
            <i data-lucide="flame" style="display:inline;width:18px;height:18px;vertical-align:middle;"></i>
            ${user.highestStreak || 0}
          </div>
          <div class="public-profile-stat-label">أيام الحماس المتتالية</div>
        </div>
        <div class="public-profile-stat-card">
          <div class="public-profile-stat-num" style="color:#f59e0b;">
            <i data-lucide="award" style="display:inline;width:18px;height:18px;vertical-align:middle;"></i>
            ${rankInfo.rankNumber}
          </div>
          <div class="public-profile-stat-label">${rankInfo.rankText}</div>
        </div>
      </div>

      <div style="text-align:center;font-size:0.8rem;color:var(--color-muted);margin-bottom:16px;">
        <i data-lucide="calendar" style="display:inline;width:14px;height:14px;vertical-align:middle;margin-left:4px;"></i>
        عضو مسجل منذ: ${joinDateFormatted}
      </div>

      <div style="display:flex;gap:10px;justify-content:center;">
        ${isMe ? `
          <button class="btn-primary btn-sm" onclick="closeModal('public-profile-modal'); showSection('profile');">
            <i data-lucide="edit-3"></i> تعديل ملفي الشخصي
          </button>
        ` : ''}
        <button class="btn-secondary btn-sm" onclick="closeModal('public-profile-modal')">
          إغلاق
        </button>
      </div>
    </div>
  `;

  openModal('public-profile-modal');
  if (window.lucide) lucide.createIcons();
}
window.openPublicProfileModal = openPublicProfileModal;

// التوجيه إلى صفحة المتصدرين الفرعية
function showLeaderboard() {
  showSection('leaderboard');
}
window.showLeaderboard = showLeaderboard;

function returnFromLeaderboard() {
  showSection(previousSection || 'practice');
}
window.returnFromLeaderboard = returnFromLeaderboard;

// ===== Practice Menu Animation =====
function togglePracticeMenu(event) {
  if (event) event.stopPropagation();
  const wrapper = document.getElementById('practice-stats-wrapper');
  const iconMenu = document.getElementById('hamburger-icon-menu');
  const iconX = document.getElementById('hamburger-icon-x');
  if (wrapper) {
    wrapper.classList.toggle('menu-active');
    if (wrapper.classList.contains('menu-active')) {
      if (iconMenu) iconMenu.style.display = 'none';
      if (iconX) iconX.style.display = 'block';
    } else {
      if (iconMenu) iconMenu.style.display = 'block';
      if (iconX) iconX.style.display = 'none';
    }
  }
}
window.togglePracticeMenu = togglePracticeMenu;
window.toggleHamburgerMenu = togglePracticeMenu;

// إغلاق القائمة عند النقر خارجها
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('practice-stats-wrapper');
  if (!wrapper || !wrapper.classList.contains('menu-active')) return;
  if (!e.target.closest('.practice-stats')) {
    wrapper.classList.remove('menu-active');
    const iconMenu = document.getElementById('hamburger-icon-menu');
    const iconX = document.getElementById('hamburger-icon-x');
    if (iconMenu) iconMenu.style.display = 'block';
    if (iconX) iconX.style.display = 'none';
  }
});

// ===== Admin: Edit Course Name =====
function openEditCourseModal(courseId, currentName, event) {
  event.stopPropagation();
  document.getElementById('edit-course-id').value = courseId;
  document.getElementById('edit-course-name-input').value = currentName;
  openModal('edit-course-modal');
}

function saveEditedCourseName() {
  const id   = Number(document.getElementById('edit-course-id').value);
  const name = document.getElementById('edit-course-name-input').value.trim();
  if (!name) return alert('يرجى إدخال اسم');
  
  const course = practiceCourses.find(c => Number(c.id) === id);
  if (course) {
    course.title = name;
    savePracticeData();
    closeModal('edit-course-modal');
    renderCourseSelector();
    renderPracticePath();
  }
}

// =============================================
// نظام القلوب
// =============================================
function getHeartsStorageKey() {
  // مفتاح مختلف لكل حساب
  return currentUser ? `heartsData_${currentUser.id}` : 'heartsData_guest';
}

function saveHeartsLocally() {
  try {
    localStorage.setItem(getHeartsStorageKey(), JSON.stringify(heartsData));
  } catch(e) {}
}

async function initHearts() {
  // أعد تعيين heartsData أولاً بناءً على الحساب الحالي
  const key    = getHeartsStorageKey();
  const stored = localStorage.getItem(key);
  if (stored) {
    try { heartsData = JSON.parse(stored); } catch(e) {
      heartsData = { count: 5.0, infiniteHearts: false, promoCode: null, lastDailyRefill: null };
    }
  } else {
    heartsData = { count: 5.0, infiniteHearts: false, promoCode: null, lastDailyRefill: null };
  }

  if (userToken) {
    // المستخدم مسجل — السيرفر هو المرجع دائماً
    try {
      const r = await fetch('/api/user/hearts', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (r.ok) {
        const d = await r.json();
        heartsData.count           = d.hearts;
        heartsData.infiniteHearts  = d.infiniteHearts  || false;
        heartsData.promoCode       = d.promoCodeUsed   || null;
        heartsData.lastDailyRefill = d.lastDailyRefill || null;
        saveHeartsLocally();
        if (d.dailyGiven) showHeartsToast('❤️ تمت إضافة 5 قلوب يومية!', '#e11d48');
      }
    } catch(e) { console.warn('Hearts init failed:', e); }
  } else {
    // زائر — تحقق يومي محلي
    const today = new Date().toISOString().split('T')[0];
    const isFirstEverVisit = !stored; // لا يوجد سجل سابق على هذا المتصفح إطلاقاً
    if (!heartsData.lastDailyRefill || heartsData.lastDailyRefill !== today) {
      if (isFirstEverVisit) {
        // أول زيارة على الإطلاق: الرصيد الافتراضي (5) هو نفسه رصيد اليوم، لا تُضف فوقه
        heartsData.count = heartsData.infiniteHearts ? heartsData.count : 5.0;
      } else if (!heartsData.infiniteHearts) {
        heartsData.count = Math.min((heartsData.count || 0) + 5, 10);
      }
      heartsData.lastDailyRefill = today;
      saveHeartsLocally();
    }
  }

  updateHeartsDisplay();
}

function updateHeartsDisplay() {
  const inf  = heartsData.infiniteHearts;
  const cnt  = Math.max(0, heartsData.count);
  const disp = inf ? '∞' : (cnt % 1 === 0 ? String(cnt) : cnt.toFixed(1));

  // شريط تمرّن
  const practiceVal  = document.getElementById('practice-hearts-val');
  const heartsPill   = document.getElementById('practice-hearts-pill');
  const heartsIcon   = document.getElementById('practice-hearts-icon');
  if (practiceVal) practiceVal.textContent = disp;
  if (heartsPill) {
    heartsPill.classList.toggle('infinite', inf);
    heartsPill.classList.toggle('low-hearts', !inf && cnt < 2);
  }
  if (heartsIcon) {
    heartsIcon.setAttribute('data-lucide', inf ? 'gem' : 'heart');
    if (window.lucide) lucide.createIcons();
  }

  // شريط الدرس
  const lessonCount  = document.getElementById('lesson-heart-count');
  const lessonDiv    = document.querySelector('.lesson-hearts');
  if (lessonCount) lessonCount.textContent = disp;
  if (lessonDiv)   lessonDiv.classList.toggle('infinite', inf);
}



function showHeartsToast(msg, color) {
  const n = document.createElement('div');
  n.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:10px 20px;border-radius:10px;font-size:0.85rem;font-weight:700;font-family:var(--font-sans);z-index:9999;opacity:0;transition:opacity 0.3s;pointer-events:none;`;
  n.textContent = msg;
  document.body.appendChild(n);
  requestAnimationFrame(() => {
    n.style.opacity = '1';
    setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 3000);
  });
}

function deductHeart() {
  if (heartsData.infiniteHearts) return;
  heartsData.count = Math.round((heartsData.count - 0.5) * 10) / 10;
  saveHeartsLocally();
  updateHeartsDisplay();
  scheduleHeartsSync();
}

let heartsSyncTimer = null;
function scheduleHeartsSync() {
  if (!userToken) return;
  clearTimeout(heartsSyncTimer);
  heartsSyncTimer = setTimeout(syncHeartsToServer, 2000);
}

async function syncHeartsToServer() {
  if (!userToken || heartsData.infiniteHearts) return;
  try {
    await fetch('/api/user/hearts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ count: heartsData.count })
    });
  } catch(e) {}
}

function canStartLesson() {
  return heartsData.infiniteHearts || heartsData.count >= 0.5;
}

function openHeartsModal() {
  const display      = document.getElementById('hearts-modal-display');
  const dailyInfo    = document.getElementById('hearts-daily-info');
  const promoSection = document.getElementById('hearts-promo-section');
  const infiniteInfo = document.getElementById('hearts-infinite-info');
  const loginPrompt  = document.getElementById('hearts-login-prompt');

  if (!display) return;

  if (heartsData.infiniteHearts) {
    display.innerHTML = `<div style="font-size:3.5rem;margin-bottom:8px;">💜</div>
      <div class="hearts-count-big infinite">∞</div>
      <div style="color:var(--color-muted);font-size:0.85rem;margin-top:4px;">قلوب لا نهائية</div>`;
    if (infiniteInfo) infiniteInfo.style.display = 'block';
    if (promoSection) promoSection.style.display  = 'none';
    if (loginPrompt)  loginPrompt.style.display   = 'none';
  } else {
    const cnt   = Math.max(0, heartsData.count);
    const cls   = cnt < 1 ? 'zero' : cnt < 2 ? 'low' : '';
    const emoji = cnt < 1 ? '💔' : cnt < 2 ? '🖤' : '❤️';
    display.innerHTML = `<div style="font-size:3rem;margin-bottom:8px;">${emoji}</div>
      <div class="hearts-count-big ${cls}">${cnt % 1 === 0 ? cnt : cnt.toFixed(1)}</div>
      <div style="color:var(--color-muted);font-size:0.85rem;margin-top:4px;">قلوب متبقية (الحد الأقصى 10)</div>`;
    if (infiniteInfo) infiniteInfo.style.display = 'none';
    if (!userToken) {
      if (promoSection) promoSection.style.display = 'none';
      if (loginPrompt)  loginPrompt.style.display  = 'block';
    } else {
      if (promoSection) promoSection.style.display = 'block';
      if (loginPrompt)  loginPrompt.style.display  = 'none';
    }
  }

  const today = new Date().toISOString().split('T')[0];
  if (dailyInfo) {
    dailyInfo.textContent = heartsData.lastDailyRefill === today
      ? '✅ تم استلام قلوب اليوم — القلوب التالية: غداً'
      : '⏰ ستحصل على 5 قلوب غداً عند فتح الموقع';
  }

  const promoErr = document.getElementById('promo-error');
  if (promoErr) promoErr.style.display = 'none';
  const promoInp = document.getElementById('promo-code-input');
  if (promoInp) promoInp.value = '';

  openModal('hearts-modal');
}

async function redeemPromoCode() {
  if (!userToken) { alert('يجب تسجيل الدخول أولاً'); return; }
  const input    = document.getElementById('promo-code-input');
  const errorEl  = document.getElementById('promo-error');
  const code     = (input?.value || '').trim().toUpperCase();
  if (!code) {
    if (errorEl) { errorEl.textContent = 'يرجى إدخال الكود'; errorEl.style.display = 'block'; }
    return;
  }
  try {
    const r = await fetch('/api/user/promo/redeem', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${userToken}` },
      body: JSON.stringify({ code })
    });
    const d = await r.json();
    if (r.ok) {
      heartsData.infiniteHearts = true;
      heartsData.promoCode = code;
      saveHeartsLocally();
      updateHeartsDisplay();
      if (errorEl) errorEl.style.display = 'none';
      openHeartsModal();
      if (soundFX) soundFX.levelWin();
      setTimeout(() => showHeartsToast('💜 تم تفعيل القلوب اللانهائية!', '#a855f7'), 500);
    } else {
      if (errorEl) { errorEl.textContent = d.detail || d.error || 'الكود غير صالح'; errorEl.style.display = 'block'; }
    }
  } catch(e) {
    if (errorEl) { errorEl.textContent = 'خطأ في الاتصال'; errorEl.style.display = 'block'; }
  }
}

// =============================================
// أدمن: إدارة كودات البرومو
// =============================================
async function openAdminPromosModal() {
  if (!isAdmin) return;
  openModal('admin-promos-modal');
  await loadAdminPromos();
}

async function loadAdminPromos() {
  const list = document.getElementById('admin-promos-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;color:var(--color-muted);padding:20px;">جاري التحميل...</div>';
  try {
    const codes = await apiCall('GET', '/admin/promos', null, true);
    const entries = Object.entries(codes || {});
    if (!entries.length) {
      list.innerHTML = '<div style="text-align:center;color:var(--color-muted);padding:20px;font-style:italic;">لا توجد كودات بعد</div>';
      return;
    }
    list.innerHTML = entries.map(([code, p]) => `
      <div class="promo-code-item ${p.active ? '' : 'inactive'}">
        <div class="promo-code-badge">${escHtml(code)}</div>
        <div class="promo-code-info">
          <div class="promo-code-name">${escHtml(p.name || 'بدون اسم')}</div>
          <div class="promo-code-stats">
            ${p.uses} مستخدم${p.maxUses !== -1 ? ` / ${p.maxUses}` : ' (غير محدود)'}
            ${!p.active ? ' — <span style="color:#e11d48">معطّل</span>' : ''}
          </div>
          ${p.usedEmails?.length ? `<div class="promo-code-emails" dir="ltr">${p.usedEmails.slice(0,3).join(', ')}${p.usedEmails.length>3?` +${p.usedEmails.length-3}`:''}</div>` : ''}
        </div>
        <div class="promo-code-actions">
          <button class="promo-action-btn ${p.active ? 'danger' : 'enable'}" title="${p.active ? 'تعطيل' : 'تفعيل'}"
            onclick="adminTogglePromo('${escHtml(code)}', ${!p.active})">
            <i data-lucide="${p.active ? 'toggle-right' : 'toggle-left'}" style="width:14px;height:14px;"></i>
          </button>
          <button class="promo-action-btn danger" title="حذف" onclick="adminDeletePromo('${escHtml(code)}')">
            <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
          </button>
        </div>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
  } catch(e) {
    list.innerHTML = '<div style="color:#e11d48;padding:20px;text-align:center;">فشل التحميل</div>';
  }
}

async function adminCreatePromoCode() {
  const code    = (document.getElementById('new-promo-code')?.value || '').trim().toUpperCase();
  const name    = (document.getElementById('new-promo-name')?.value || '').trim();
  const maxUses = parseInt(document.getElementById('new-promo-max')?.value || '-1');
  if (!code || !name) return alert('يرجى ملء الكود والاسم');
  try {
    await apiCall('POST', '/admin/promos', { code, name, maxUses }, true);
    document.getElementById('new-promo-code').value = '';
    document.getElementById('new-promo-name').value = '';
    document.getElementById('new-promo-max').value  = '-1';
    if (soundFX) soundFX.success();
    await loadAdminPromos();
  } catch(e) { alert('خطأ: ' + e.message); }
}

async function adminTogglePromo(code, activate) {
  try {
    await apiCall('PUT', `/admin/promos/${code}`, { active: activate }, true);
    await loadAdminPromos();
  } catch(e) { alert('خطأ: ' + e.message); }
}

async function adminDeletePromo(code) {
  if (!confirm(`حذف الكود "${code}" نهائياً؟`)) return;
  try {
    await apiCall('DELETE', `/admin/promos/${code}`, null, true);
    await loadAdminPromos();
  } catch(e) { alert('خطأ: ' + e.message); }
}

function savePracticeData() {
  // الهيكل المشترك للجميع
  localStorage.setItem('practiceCourses_v1', JSON.stringify(practiceCourses));
  localStorage.setItem('currentCourseId', currentCourseId);
  localStorage.setItem('practiceUnits', JSON.stringify(practiceUnits));
  localStorage.setItem('practiceAds_v1', JSON.stringify(practiceAds));

  // الهيكل بدون تقدم
  const cleanNodes = practiceNodes.map(({ status, currentLevelIndex, ...rest }) => rest);
  localStorage.setItem('practiceNodes_v4', JSON.stringify(cleanNodes));

  // التقدم خاص بكل مستخدم
  const progress = {};
  practiceNodes.forEach(n => {
    progress[String(n.id)] = {
      status:            n.status || 'locked',
      currentLevelIndex: n.currentLevelIndex || 0
    };
  });
  saveUserData('nodeProgress', progress);
  saveUserData('streakData', streakData);

  syncPracticeToServer();
  syncProgressToServer();
}

async function syncPracticeToServer() {
  if (!isAdmin || !authToken) return;
  try {
    const cleanNodes = practiceNodes.map(n => {
      const { status, currentLevelIndex, ...rest } = n;
      return rest;
    });
    await api.put('/practice', {
      courses: practiceCourses,
      units: practiceUnits,
      nodes: cleanNodes,
      ads: practiceAds
    });
  } catch(e) { console.warn('Practice sync failed:', e); }
}

async function loadPracticeFromServer() {
  try {
    const d = await api.get('/practice');
    if (!d || !d.nodes || d.nodes.length === 0) return;
 
    practiceCourses = d.courses?.length ? d.courses : practiceCourses;
    practiceUnits   = d.units?.length   ? d.units   : practiceUnits;
    practiceAds     = d.ads?.length     ? d.ads     : practiceAds;
 
    // ✅ الإصلاح: جلب التقدم من السيرفر مباشرة (وليس localStorage)
    let serverProgress = {};
    if (userToken) {
      try {
        const pr = await fetch(BASE_URL + '/user/progress', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        if (pr.ok) {
          const pd = await pr.json();
          serverProgress = pd.progress || {};
        }
      } catch(e) {}
    }
 
    // إذا لم يكن مسجلاً، استخدم localStorage (للزوار)
    const localProgress = userToken ? serverProgress : loadUserData('nodeProgress', {});
 
    practiceNodes = d.nodes.map(serverNode => {
      const p = localProgress[String(serverNode.id)];
      return {
        ...serverNode,
        status:            p?.status            ?? 'locked',
        currentLevelIndex: p?.currentLevelIndex ?? 0
      };
    });
 
    const hasProgress = practiceNodes.some(n => n.status !== 'locked');
    if (!hasProgress && practiceNodes.length > 0) {
      practiceNodes[0].status = 'current';
    }
 
    // حفظ الهيكل مشتركاً
    localStorage.setItem('practiceCourses_v1', JSON.stringify(practiceCourses));
    localStorage.setItem('practiceUnits',      JSON.stringify(practiceUnits));
    localStorage.setItem('practiceAds_v1',     JSON.stringify(practiceAds));
    const cleanNodes = practiceNodes.map(({ status, currentLevelIndex, ...rest }) => rest);
    localStorage.setItem('practiceNodes_v4', JSON.stringify(cleanNodes));
 
    // ✅ حفظ التقدم محلياً بعد تطبيقه
    const newProgress = {};
    practiceNodes.forEach(n => {
      newProgress[String(n.id)] = { status: n.status, currentLevelIndex: n.currentLevelIndex || 0 };
    });
    saveUserData('nodeProgress', newProgress);
 
  } catch(e) { console.warn('Practice load failed:', e); }
}

function updateStreakDisplay(animateState = null) {
  const streakItem = document.querySelector('.streak-item');
  if (!streakItem) return;
  streakItem.querySelector('span').textContent = streakData.count;
  
  streakItem.classList.remove('streak-active', 'streak-lost', 'streak-renewed');
  // force reflow
  void streakItem.offsetWidth;
  
  if (animateState) {
    streakItem.classList.add(`streak-${animateState}`);
  } else {
    const today = new Date().toDateString();
    if (streakData.lastActiveDate === today) {
      streakItem.classList.add('streak-active');
    }
  }
}

function checkStreakOnLoad() {
  const today = new Date().toDateString();
  if (streakData.lastActiveDate && streakData.lastActiveDate !== today) {
    const lastDate = new Date(streakData.lastActiveDate);
    const currDate = new Date(today);
    const diffDays = Math.floor((currDate - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
      streakData.count = 0;
      updateStreakDisplay('lost');
    }
  }
  updateStreakDisplay();
}

function activateStreak() {
  const today = new Date().toDateString();
  let animation = 'active';
  let showCelebration = false;
  
  if (streakData.lastActiveDate !== today) {
    const lastDate = streakData.lastActiveDate ? new Date(streakData.lastActiveDate) : null;
    const currDate = new Date(today);
    const diffDays = lastDate ? Math.floor((currDate - lastDate) / (1000 * 60 * 60 * 24)) : 1;
    
    if (diffDays === 1 || !streakData.lastActiveDate) {
      streakData.count++;
      animation = 'renewed';
      showCelebration = true;
    } else {
      streakData.count = 1;
      animation = 'renewed';
      showCelebration = true;
    }
    streakData.lastActiveDate = today;
    savePracticeData();
  }
  updateStreakDisplay(animation);
  
  if (showCelebration) {
    document.getElementById('streak-celebration-count').textContent = streakData.count;
    setTimeout(() => {
        openModal('streak-celebration-modal');
        if(window.lucide)lucide.createIcons(); // refresh fire icon
    }, 600);
  }
}

// Call on load
document.addEventListener('DOMContentLoaded', checkStreakOnLoad);

let currentNodeId = null;


function renderProgressRingSVG(config) {
  let {
    totalSegments = 5,
    filledSegments = 2,
    activeColor = "#58cc02",
    inactiveColor = "#e5e7eb",
  } = config;

  // الحد الأقصى للمستويات هو 5 والحد الأدنى 1
  totalSegments = Math.max(1, Math.min(totalSegments, 5));
  filledSegments = Math.max(0, Math.min(filledSegments, 5));

  const size = 96, cx = size / 2, cy = size / 2, r = 43.5, strokeWidth = 5.5;

  if (totalSegments === 1) {
    const color = filledSegments >= 1 ? activeColor : inactiveColor;
    return `<svg class="progress-ring" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" style="transform: rotate(-90deg); transform-origin: 50% 50%;"/>
    </svg>`;
  }

  const gapDegrees = totalSegments <= 2 ? 14 : totalSegments <= 3 ? 11 : totalSegments <= 4 ? 9 : 8;
  const segmentAngle = 360 / totalSegments;
  const arcAngle = segmentAngle - gapDegrees;
  let paths = "";

  for (let k = 0; k < totalSegments; k++) {
    const color = k < filledSegments ? activeColor : inactiveColor;
    const startAngle = -90 + k * segmentAngle + gapDegrees / 2;
    const endAngle = startAngle + arcAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad);
    const largeArc = arcAngle > 180 ? 1 : 0;
    paths += `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
  }

  return `<svg class="progress-ring" viewBox="0 0 ${size} ${size}">${paths}</svg>`;
}

function isUnitCompleted(unitId) {
  const nodes = practiceNodes.filter(n => Number(n.unitId) === Number(unitId));
  // ✅ قسم بلا عُقد (فارغ) لا يُعتبر عائقاً — لا يمنع فتح الأقسام التالية
  if (nodes.length === 0) return true;
  return nodes.every(n => n.status === 'completed');
}

function toggleCourseSelector() {
  if (window.soundFX) soundFX.tap();
  const bar = document.getElementById('course-selector-bar');
  if (bar.style.display === 'none' || !bar.style.display) {
    bar.style.display = 'flex';
    renderCourseSelector();
  } else {
    bar.style.display = 'none';
  }
}

function renderCourseSelector() {
  const container = document.getElementById('courses-scroll-container');
  const adminAddContainer = document.getElementById('admin-add-course-container');
  if (!container) return;
  
  if (adminAddContainer) {
    adminAddContainer.style.display = isAdmin ? 'block' : 'none';
  }

  container.innerHTML = practiceCourses
    .filter(c => !c.isHidden || isAdmin)
    .map(c => `
    <div class="course-item-card ${Number(c.id) === currentCourseId ? 'active' : ''}" onclick="selectCourse(${c.id})" style="${c.isHidden ? 'opacity: 0.5;' : ''}">
      <i data-lucide="${c.icon || 'book'}"></i>
      <span class="course-item-name">${c.title}</span>
      ${isAdmin ? `
      <div class="course-admin-actions">
        <div class="course-admin-btn hide" onclick="toggleHideCourse(${c.id}, event)" title="${c.isHidden ? 'إظهار' : 'إخفاء'}">
          <i data-lucide="${c.isHidden ? 'eye-off' : 'eye'}"></i>
        </div>
        <div class="course-admin-btn" style="color:#6366f1;" onclick="openEditCourseModal(${c.id}, '${c.title.replace(/'/g,"\\'")}', event)" title="تعديل الاسم">
  <i data-lucide="pencil"></i>
</div>
        <div class="course-admin-btn delete" onclick="deleteCourse(${c.id}, event)" title="حذف المنهج">
          <i data-lucide="trash-2"></i>
        </div>
      </div>
      ` : ''}
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function selectCourse(id) {
  currentCourseId = Number(id);
  const units = getCourseUnits();
  if (units.length > 0) {
    currentUnitId = units[0].id;
  }
  savePracticeData();
  renderCourseSelector();
  renderPracticePath();
}

function toggleHideCourse(id, event) {
  event.stopPropagation();
  const c = practiceCourses.find(c => Number(c.id) === Number(id));
  if (c) {
    c.isHidden = !c.isHidden;
    savePracticeData();
    renderCourseSelector();
  }
}

function deleteCourse(id, event) {
  event.stopPropagation();
  if (!confirm('هل أنت متأكد من حذف هذا المنهج؟ سيتم فقدان جميع الأقسام والعقد التابعة له.')) return;
  
  practiceCourses = practiceCourses.filter(c => Number(c.id) !== Number(id));
  practiceUnits = practiceUnits.filter(u => Number(u.courseId) !== Number(id));
  // Clean up nodes
  const remainingUnitIds = practiceUnits.map(u => Number(u.id));
  practiceNodes = practiceNodes.filter(n => remainingUnitIds.includes(Number(n.unitId)));
  
  if (currentCourseId === Number(id) && practiceCourses.length > 0) {
    currentCourseId = practiceCourses[0].id;
  }
  savePracticeData();
  renderCourseSelector();
  renderPracticePath();
}

function openAddCourseModal() {
  const grid = document.getElementById('course-icon-grid');
  const icons = ['book', 'pen-tool', 'code', 'database', 'globe', 'cpu', 'lightbulb', 'award', 'compass', 'layers'];
  
  grid.innerHTML = icons.map(icon => `
    <div class="icon-select-btn" onclick="selectCourseIcon('${icon}')" id="course-icon-btn-${icon}" style="display:flex; justify-content:center; align-items:center; padding:12px; border:2px solid var(--color-border); border-radius:12px; cursor:pointer; transition:all 0.2s;">
      <i data-lucide="${icon}"></i>
    </div>
  `).join('');
  
  setTimeout(() => selectCourseIcon('book'), 50);
  document.getElementById('new-course-title').value = '';
  openModal('add-course-modal');
  if (window.lucide) lucide.createIcons();
}

function selectCourseIcon(iconName) {
  document.getElementById('new-course-icon').value = iconName;
  document.querySelectorAll('#course-icon-grid .icon-select-btn').forEach(btn => {
    btn.style.borderColor = 'var(--color-border)';
    btn.style.background = 'transparent';
  });
  const activeBtn = document.getElementById(`course-icon-btn-${iconName}`);
  if (activeBtn) {
    activeBtn.style.borderColor = '#6366f1';
    activeBtn.style.background = 'rgba(99, 102, 241, 0.1)';
  }
}

function saveNewCourse() {
  const title = document.getElementById('new-course-title').value.trim();
  const icon = document.getElementById('new-course-icon').value;
  if (!title) return alert('الرجاء إدخال اسم المنهج');
  
  const newId = practiceCourses.length > 0 ? Math.max(...practiceCourses.map(c => c.id)) + 1 : 1;
  practiceCourses.push({ id: newId, title, icon, isHidden: false });
  
  // Create an initial unit for the new course
  const newUnitId = practiceUnits.length > 0 ? Math.max(...practiceUnits.map(u => u.id)) + 1 : 1;
  practiceUnits.push({ id: newUnitId, title: 'القسم الأول', desc: 'الوصف هنا', color: '#22c55e', courseId: newId });

  savePracticeData();
  closeModal('add-course-modal');
  selectCourse(newId);
}

function isUnitLocked(unitIdx) {
  const cUnits = getCourseUnits();
  if (unitIdx <= 0) return false;
  for (let i = 0; i < unitIdx; i++) {
    if (!isUnitCompleted(cUnits[i].id)) {
      return true;
    }
  }
  return false;
}

function renderPracticePath() {
  const container = document.getElementById('path-container');
  if (!container) return;
  container.innerHTML = '';
  
  const adminBtn = document.getElementById('admin-add-practice-btn');
  if (adminBtn) adminBtn.style.display = isAdmin ? 'flex' : 'none';

  // Update current unit badge in top bar
  const unitBadge = document.getElementById('practice-current-unit-badge');
  if (unitBadge) {
    const curUnit = practiceUnits.find(u => u.id === currentUnitId) || practiceUnits[0];
    if (curUnit) {
      unitBadge.textContent = curUnit.title.length > 18 ? curUnit.title.substring(0, 18) + '...' : curUnit.title;
    }
  }
  
  let globalFoundCurrent = false;

  const courseUnits = getCourseUnits();
  courseUnits.forEach((unit, unitIdx) => {
    const unitLocked = isAdmin ? false : isUnitLocked(unitIdx);
    const unitCompleted = isUnitCompleted(unit.id);

    // Container for Unit Banner and optional Dropdown Drawer Ad
    const unitBannerContainer = document.createElement('div');
    unitBannerContainer.className = 'unit-banner-container';
    unitBannerContainer.style.marginTop = unitIdx > 0 ? '60px' : '20px';

    // Render Unit Banner
    const banner = document.createElement('div');
    banner.className = `unit-banner ${unitLocked ? 'unit-banner-locked' : ''}`;
    banner.style.margin = '0';
    if (unit.color && !unitLocked) {
      banner.style.backgroundColor = unit.color;
    }

    let statusBadgeHtml = '';
    let unitIconName = 'book-open';
    if (unitLocked) {
      statusBadgeHtml = `<span class="unit-status-badge locked"><i data-lucide="lock" style="width:12px;height:12px;"></i> مقفول</span>`;
      unitIconName = 'lock';
    } else if (unitCompleted) {
      statusBadgeHtml = `<span class="unit-status-badge completed"><i data-lucide="check-circle-2" style="width:12px;height:12px;"></i> مكتمل</span>`;
      unitIconName = 'award';
    } else {
      statusBadgeHtml = '';
      unitIconName = 'book-open';
    }

    const prevUnitTitle = unitIdx > 0 ? (courseUnits[unitIdx - 1]?.title || 'القسم السابق') : '';
    const unitDescHtml = unitLocked 
      ? `أكمل جميع عقد "${prevUnitTitle}" لفتح هذا القسم`
      : unit.desc;

    banner.innerHTML = `
        <div class="unit-banner-content">
            <div class="unit-banner-header-row">
              <h2 class="unit-title" style="margin-bottom:0;">${unit.title}</h2>
              ${statusBadgeHtml}
            </div>
            <p class="unit-desc">${unitDescHtml}</p>
        </div>
        <div class="unit-banner-icon">
            <i data-lucide="${unitIconName}"></i>
        </div>
    `;

    if (unitLocked && !isAdmin) {
      banner.onclick = () => {
        alert(`🔒 هذا القسم مقفول! يجب عليك إنهاء جميع عقد "${prevUnitTitle}" أولاً لفتحه.`);
      };
    } else {
      banner.onclick = openUnitSelector;
    }
    banner.style.cursor = unitLocked && !isAdmin ? 'not-allowed' : 'pointer';
    unitBannerContainer.appendChild(banner);

    // Render Unit Drawer Banner Ads (النوع الثاني: الإعلانات المنسدلة من أسفل مربع القسم)
    const unitDrawerAds = practiceAds.filter(ad => Number(ad.unitId || 1) === Number(unit.id) && ad.adType === 'unit_drawer');
    unitDrawerAds.forEach(ad => {
      const isDismissed = dismissedPracticeAds.includes(ad.id);
      if (isDismissed && !isAdmin) return;

      const drawerEl = document.createElement('div');
      drawerEl.className = 'unit-banner-drawer-ad';
      drawerEl.id = `unit-drawer-ad-${ad.id}`;
      drawerEl.style.background = ad.bgGradient || ad.bgColor || 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';
      drawerEl.onclick = () => openPracticeAdModal(ad.id);

      let badgeHtml = (ad.badgeText && ad.badgeText.trim()) ? `<div class="unit-drawer-ad-badge">${ad.badgeText.trim()}</div>` : '';
      let adminToolsHtml = '';
      if (isAdmin) {
        adminToolsHtml = `
          <div style="display:flex; gap:4px; margin-right:4px;">
            <button type="button" class="unit-drawer-ad-close" style="width:24px;height:24px;background:rgba(0,0,0,0.5);" title="تعديل الإعلان" onclick="editPracticeAd(${ad.id}, event)"><i data-lucide="pencil" style="width:11px;height:11px;"></i></button>
            <button type="button" class="unit-drawer-ad-close" style="width:24px;height:24px;background:rgba(239,68,68,0.7);" title="حذف الإعلان" onclick="deletePracticeAd(${ad.id}, event)"><i data-lucide="trash-2" style="width:11px;height:11px;"></i></button>
          </div>
        `;
      }

      drawerEl.innerHTML = `
        <div class="unit-drawer-ad-content">
          <div class="unit-drawer-ad-icon">
            <i data-lucide="sparkles" style="width:18px;height:18px;"></i>
          </div>
          <div class="unit-drawer-ad-info">
            ${badgeHtml}
            <div class="unit-drawer-ad-title">${ad.miniText || 'عرض مميز للقسم'}</div>
          </div>
        </div>
        <div class="unit-drawer-ad-actions" onclick="event.stopPropagation()">
          ${adminToolsHtml}
          <button type="button" class="unit-drawer-ad-btn" onclick="openPracticeAdModal(${ad.id})">
            <span>عرض</span> <i data-lucide="chevron-left" style="width:14px;height:14px;"></i>
          </button>
          <button type="button" class="unit-drawer-ad-close" title="إخفاء الإعلان" onclick="dismissPracticeAd(${ad.id}, event)">
            <i data-lucide="x" style="width:14px;height:14px;"></i>
          </button>
        </div>
      `;

      unitBannerContainer.appendChild(drawerEl);
    });

    container.appendChild(unitBannerContainer);

    const nodesWrapper = document.createElement('div');
    nodesWrapper.style.position = 'relative';
    nodesWrapper.style.width = '100%';
    nodesWrapper.style.display = 'flex';
    nodesWrapper.style.flexDirection = 'column';
    nodesWrapper.style.alignItems = 'center';
    nodesWrapper.style.gap = '40px';
    nodesWrapper.style.padding = '40px 0';
    
    const unitNodes = practiceNodes.filter(n => Number(n.unitId) === Number(unit.id));
    const svgStr = [];
    
    // تسلسل العقد: للمستخدم العادي عقدة نشطة واحدة، أما للأدمن فجميع العقد متاحة للاختبار
    unitNodes.forEach((n) => {
      if (isAdmin) {
        if (n.status !== 'completed') {
          n.status = 'current';
        }
      } else {
        if (unitLocked) {
          n.status = 'locked';
        } else {
          if (n.status === 'completed') {
            // تبقى مكتملة
          } else {
            if (!globalFoundCurrent) {
              n.status = 'current';
              globalFoundCurrent = true;
            } else {
              n.status = 'locked';
            }
          }
        }
      }
    });
    
    unitNodes.forEach((node, index) => {
      if (index < unitNodes.length - 1) {
        const offsetX1 = Math.sin(index * 1.5) * 60;
        const offsetX2 = Math.sin((index + 1) * 1.5) * 60;
        const startX = 100 + offsetX1;
        const startY = index * 120 + 80; 
        const endX = 100 + offsetX2;
        const endY = (index + 1) * 120 + 80;
        svgStr.push(`
          <path d="M ${startX} ${startY} C ${startX} ${startY + 40}, ${endX} ${endY - 40}, ${endX} ${endY}"
                fill="none" stroke="var(--color-border)" stroke-width="12" stroke-linecap="round" />
        `);
      }
      
      const el = document.createElement('div');
      const offsetX = Math.sin(index * 1.5) * 60;
      el.className = 'tile-node tooltip-anchor';
      el.style.transform = `translateX(${offsetX}px)`;
      el.style.zIndex = '2';
      
      let totalLevels = node.levels ? node.levels.length : (node.questions && node.questions.length > 0 ? 1 : 0);
      if (totalLevels === 0) totalLevels = 1;
      let completedLevels = typeof node.currentLevelIndex !== 'undefined' ? node.currentLevelIndex : 0;
      if (node.status === 'completed') completedLevels = totalLevels;

      let statusClass = "status-locked";
      if (node.status === 'current') statusClass = "status-active";
      else if (node.status === 'completed') statusClass = "status-complete";

      const ringConfig = {
        totalSegments: totalLevels,
        filledSegments: completedLevels,
        activeColor: "#58cc02",
        inactiveColor: "#e5e7eb",
      };

      const isCurrentActive = statusClass === "status-active";
      const ringHtml = (isCurrentActive && totalLevels > 0) ? renderProgressRingSVG(ringConfig) : "";
      const badgeHtml = isCurrentActive ? `<div class="start-badge">ابدأ</div>` : "";

      let icon = node.icon;
      if (!icon) {
          icon = 'star';
          if (node.type === 'lesson') icon = 'book-open';
          if (node.type === 'review') icon = 'refresh-cw';
          if (node.type === 'challenge') icon = 'zap';
          if (node.type === 'countdown') icon = 'timer';
          if (node.status === 'completed') icon = 'check';
      }

      let tooltipThemeClass = statusClass === 'status-active' ? 'theme-active' : (statusClass === 'status-complete' ? 'theme-complete' : 'theme-locked');
      
      let totalLevelsStr = totalLevels > 0 ? `الدرس ${completedLevels} من ${totalLevels}` : 'درس';
      if (unitLocked && !isAdmin) {
        totalLevelsStr = `🔒 قسم مقفول (أكمل ${prevUnitTitle})`;
      } else if (node.status === 'completed') {
        totalLevelsStr = 'مكتمل';
      }

      let startBtnText = node.actionText || 'ابدأ +15 XP';
      let actionsHtml = '';
      if (unitLocked && !isAdmin) {
        actionsHtml = `
          <button type="button" class="tt-action-btn locked-btn" disabled style="opacity:0.6; cursor:not-allowed;">
            <span>قسم مقفول</span> <i data-lucide="lock" style="width:16px;height:16px;"></i>
          </button>
        `;
      } else if (node.status === 'completed') {
        actionsHtml = `
          <button type="button" class="tt-action-btn" onclick="startLesson('start', ${node.id})">
            <span>${node.actionText || 'إعادة +15 XP'}</span> <i data-lucide="play" style="width:16px;height:16px;"></i>
          </button>
        `;
            } else if (node.status === 'current' || isAdmin) {
        const lvlCost = isAdmin ? 0 : calcNodeNextLevelCost(node);
        const notEnoughHearts = !heartsData.infiniteHearts && !isAdmin && heartsData.count < Math.min(lvlCost, 0.5);
        if (notEnoughHearts) {
          actionsHtml = `
            <button type="button" class="tt-action-btn" onclick="openHeartsModal()"
              style="background:rgba(225,29,72,0.08);border-color:rgba(225,29,72,0.3);color:#e11d48;">
              <span>💔 القلوب غير كافية</span>
            </button>
          `;
        } else {
          actionsHtml = `
            <button type="button" class="tt-action-btn" onclick="startLesson('start', ${node.id})">
              <span>${startBtnText}</span> <i data-lucide="play" style="width:16px;height:16px;"></i>
            </button>
          `;
        }
      } else {
        actionsHtml = `
          <button type="button" class="tt-action-btn locked-btn" disabled style="opacity:0.6; cursor:not-allowed;">
            <span>مقفول</span> <i data-lucide="lock" style="width:16px;height:16px;"></i>
          </button>
        `;
      }

      let adminHtml = '';
      if (isAdmin) {
         adminHtml = `
            <div style="display: flex; gap: 8px; margin-top: 8px; border-top: 1px solid rgba(120,120,120,0.2); padding-top: 8px;">
               <button type="button" class="tt-action-btn" style="flex:1; padding: 6px; min-height:36px; border-bottom:2px solid rgba(0,0,0,0.1);" onclick="editNode(${node.id})"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
               <button type="button" class="tt-action-btn tt-admin-delete" style="flex:1; padding: 6px; min-height:36px; border-bottom:2px solid rgba(0,0,0,0.1);" onclick="deleteNode(${node.id})"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
            </div>
         `;
      }

      const tooltipHtml = `
        <div class="tooltip-card hidden ${tooltipThemeClass}" id="tooltip-${node.id}" onclick="event.stopPropagation()">
          <div class="tooltip-arrow"></div>
          <div>
            <div class="tt-title">${node.title}</div>
            <div class="tt-subtitle">${totalLevelsStr}</div>
          </div>
          ${actionsHtml}
          ${adminHtml}
        </div>
      `;

      el.innerHTML = `
        ${badgeHtml}
        ${ringHtml}
        <button type="button" class="tile-btn ${statusClass}" onclick="toggleTooltip(${node.id}, event)">
          <i data-lucide="${icon}"></i>
        </button>
        ${tooltipHtml}
      `;

      nodesWrapper.appendChild(el);
    });
    
    // Render Floating Mini Ad Screens on Path (with Smart Collision-Avoidance Algorithm)
    const unitPathAds = practiceAds.filter(ad => Number(ad.unitId || 1) === Number(unit.id) && (ad.adType === 'path_side' || !ad.adType));
    unitPathAds.forEach(ad => {
      const isDismissed = dismissedPracticeAds.includes(ad.id);
      if (isDismissed && !isAdmin) return;
      
      const safePos = calculateSafeAdPosition(ad, unitNodes);
      
      const adWrapper = document.createElement('div');
      adWrapper.className = `practice-ad-tile-wrapper side-${safePos.side}`;
      adWrapper.id = `practice-ad-tile-${ad.id}`;
      adWrapper.style.top = `${safePos.top}px`;
      adWrapper.style.left = `calc(50% + ${safePos.offsetX}px)`;
      
      let adminToolsHtml = '';
      if (isAdmin) {
        adminToolsHtml = `
          <div class="practice-ad-admin-bar">
            <button type="button" class="practice-ad-admin-btn" title="تعديل الإعلان" onclick="editPracticeAd(${ad.id}, event)"><i data-lucide="pencil" style="width:11px;height:11px;"></i></button>
            <button type="button" class="practice-ad-admin-btn" title="حذف الإعلان" style="color:#f87171;" onclick="deletePracticeAd(${ad.id}, event)"><i data-lucide="trash-2" style="width:11px;height:11px;"></i></button>
          </div>
        `;
      }
      
      adWrapper.innerHTML = `
        <div class="practice-ad-tile" style="background: ${ad.bgGradient || ad.bgColor || '#6366f1'};" onclick="openPracticeAdModal(${ad.id})">
          <button type="button" class="practice-ad-close-btn" title="إخفاء الإعلان" onclick="dismissPracticeAd(${ad.id}, event)">
            <i data-lucide="x" style="width:12px;height:12px;"></i>
          </button>
          ${(ad.badgeText && ad.badgeText.trim()) ? `<div class="practice-ad-badge">${ad.badgeText.trim()}</div>` : ''}
          <div class="practice-ad-text">${ad.miniText || 'إعلان'}</div>
          ${adminToolsHtml}
        </div>
      `;
      
      nodesWrapper.appendChild(adWrapper);
    });
    
    const svgWrapper = document.createElement('div');
    svgWrapper.style.position = 'absolute';
    svgWrapper.style.top = '0';
    svgWrapper.style.left = '0';
    svgWrapper.style.width = '100%';
    svgWrapper.style.height = '100%';
    svgWrapper.style.zIndex = '1';
    svgWrapper.style.display = 'flex';
    svgWrapper.style.justifyContent = 'center';
    svgWrapper.style.pointerEvents = 'none';
    svgWrapper.innerHTML = `<svg width="200" height="100%" style="overflow:visible;">${svgStr.join('')}</svg>`;
    
    nodesWrapper.insertBefore(svgWrapper, nodesWrapper.firstChild);
    container.appendChild(nodesWrapper);
  });
  
  if (window.lucide) lucide.createIcons();
}

// === Unit Selector ===
function openUnitSelector() {
  const container = document.getElementById('unit-list-container');
  container.innerHTML = practiceUnits.map((u, idx) => {
    const isCompleted = isUnitCompleted(u.id);
    const locked = isAdmin ? false : isUnitLocked(idx);
    const isSelected = u.id === currentUnitId;
    
    let statusBadge = '';
    if (locked) {
      statusBadge = `<span style="font-size: 0.75rem; background: rgba(100,116,139,0.2); color: var(--color-muted); padding: 3px 8px; border-radius: 6px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="lock" style="width:12px;height:12px;"></i> مقفول</span>`;
    } else if (isCompleted) {
      statusBadge = `<span style="font-size: 0.75rem; background: rgba(34,197,94,0.15); color: #22c55e; padding: 3px 8px; border-radius: 6px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="check" style="width:12px;height:12px;"></i> مكتمل</span>`;
    } else {
      statusBadge = '';
    }

    const prevTitle = idx > 0 ? (practiceUnits[idx - 1]?.title || 'القسم السابق') : '';
    const clickHandler = (locked && !isAdmin)
      ? `alert('🔒 هذا القسم مقفول! يجب عليك إكمال جميع عقد &quot;${prevTitle}&quot; أولاً لفتحه.')`
      : `selectUnit(${u.id})`;

    return `
      <div style="padding: 15px; border: 1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}; border-radius: 12px; cursor: ${locked && !isAdmin ? 'not-allowed' : 'pointer'}; opacity: ${locked && !isAdmin ? '0.75' : '1'}; display: flex; align-items:center; justify-content:space-between; ${isSelected ? 'background: var(--color-surface);' : ''}" onclick="${clickHandler}">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
            <h4 style="margin: 0; color: ${isSelected ? 'var(--color-accent)' : 'inherit'}">${u.title}</h4>
            ${statusBadge}
          </div>
          <p style="font-size: 0.85rem; color: var(--color-muted); margin: 0;">${locked ? `أكمل "${prevTitle}" لفتح هذا القسم` : u.desc}</p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          ${isAdmin ? `<button class="btn-secondary btn-sm danger" style="padding: 5px; color: #e11d48; border-color: #e11d48;" onclick="event.stopPropagation(); deleteUnit(${u.id})"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>` : ''}
          ${isSelected ? '<i data-lucide="check-circle-2" style="color: var(--color-accent)"></i>' : (locked ? '<i data-lucide="lock" style="color: var(--color-muted)"></i>' : '')}
        </div>
      </div>
    `;
  }).join('');
  
  const adminContainer = document.getElementById('admin-add-unit-container');
  if (adminContainer) adminContainer.style.display = isAdmin ? 'block' : 'none';
  
  openModal('unit-selector-modal');
  if(window.lucide)lucide.createIcons();
}

function deleteUnit(id) {
  if (!confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الدروس داخله.')) return;
  practiceUnits = practiceUnits.filter(u => u.id !== id);
  practiceNodes = practiceNodes.filter(n => n.unitId !== id);
  
  if (practiceUnits.length > 0 && currentUnitId === id) {
    currentUnitId = practiceUnits[0].id;
  }
  savePracticeData();
  openUnitSelector();
  renderPracticePath();
}

function selectUnit(id) {
  const unitIdx = practiceUnits.findIndex(u => Number(u.id) === Number(id));
  if (unitIdx > 0 && isUnitLocked(unitIdx) && !isAdmin) {
    const prevTitle = practiceUnits[unitIdx - 1]?.title || 'القسم السابق';
    alert(`🔒 هذا القسم مقفول! يجب عليك إكمال جميع عقد "${prevTitle}" أولاً لفتحه.`);
    return;
  }
  currentUnitId = id;
  closeModal('unit-selector-modal');
  renderPracticePath();
}

function addNewUnit() {
  const title = document.getElementById('new-unit-title').value.trim();
  const desc = document.getElementById('new-unit-desc').value.trim();
  const color = document.getElementById('new-unit-color').value;
  if (!title) return alert('يرجى إدخال عنوان القسم');
  
  const newId = practiceUnits.length > 0 ? Math.max(...practiceUnits.map(u=>u.id)) + 1 : 1;
  practiceUnits.push({ id: newId, title, desc, color, courseId: currentCourseId });
  savePracticeData();
  
  document.getElementById('new-unit-title').value = '';
  document.getElementById('new-unit-desc').value = '';
  document.getElementById('new-unit-color').value = '#22c55e';
  
  selectUnit(newId);
}

// === Practice Ad Banners (خوارزمية الأمان المانعة للتداخل وإدارة الإعلانات) ===

// خوارزمية ذكية تضمن منع ظهور الإعلان فوق أي عقدة مع مسافة أمان مؤكدة
function calculateSafeAdPosition(ad, unitNodes) {
  const adHalfWidth = 57;
  const adHalfHeight = 47;
  const nodeRadius = 46; // نصف قطر العقدة مع حلقة التقدم والشارات
  const SAFE_CLEARANCE_X = 40; // أدنى مسافة أمان أفقية تفصل بين حافة العقدة وحافة الإعلان
  const SAFE_CLEARANCE_Y = 20; // مسافة أمان رأسية

  const totalNodes = unitNodes.length;
  if (totalNodes === 0) {
    return { top: 60, offsetX: 155, side: 'right' };
  }

  const targetIndex = Math.min(Math.max(0, ad.afterNodeIndex || 0), totalNodes - 1);
  
  // نحدد الموضع الرأسي المثالي في الوادي بين العقدتين لتعظيم مسافة الخلوص
  let candidateCenterY = 80 + targetIndex * 120 + 60;
  if (targetIndex >= totalNodes - 1) {
    candidateCenterY = 80 + targetIndex * 120 + 65;
  }

  // حساب الإحداثيات الهندسية لجميع عقد الوحدة
  const nodeGeometries = unitNodes.map((n, idx) => {
    const cX = Math.sin(idx * 1.5) * 60;
    const cY = 80 + idx * 120;
    return {
      index: idx,
      centerX: cX,
      centerY: cY,
      left: cX - nodeRadius,
      right: cX + nodeRadius,
      top: cY - nodeRadius,
      bottom: cY + nodeRadius
    };
  });

  // تحديد العقد القريبة رأسياً في منطقة تأثير الإعلان
  const verticallyCloseNodes = nodeGeometries.filter(ng => {
    const distY = Math.abs(ng.centerY - candidateCenterY);
    return distY < (nodeRadius + adHalfHeight + SAFE_CLEARANCE_Y);
  });

  // حساب أقصى امتداد للعقد القريبة يميناً ويساراً
  let maxRightEdge = 0;
  let minLeftEdge = 0;
  verticallyCloseNodes.forEach(ng => {
    if (ng.right > maxRightEdge) maxRightEdge = ng.right;
    if (ng.left < minLeftEdge) minLeftEdge = ng.left;
  });

  // مسافة أساسية أدنى عن خط منتصف المسار
  const minCenterDistance = 145;

  const safeRightX = Math.max(minCenterDistance, maxRightEdge + SAFE_CLEARANCE_X + adHalfWidth);
  const safeLeftX = Math.min(-minCenterDistance, minLeftEdge - SAFE_CLEARANCE_X - adHalfWidth);

  let chosenSide = ad.side || 'auto';
  if (chosenSide === 'auto') {
    const targetNodeX = Math.sin(targetIndex * 1.5) * 60;
    // إذا كانت العقدة مائلة لليمين، يكون اليسار متسعاً جداً والعكس
    if (targetNodeX > 15) {
      chosenSide = 'left';
    } else if (targetNodeX < -15) {
      chosenSide = 'right';
    } else {
      chosenSide = (Math.abs(safeLeftX) <= Math.abs(safeRightX)) ? 'left' : 'right';
    }
  }

  const finalOffsetX = chosenSide === 'left' ? safeLeftX : safeRightX;
  const finalTop = candidateCenterY - adHalfHeight;

  return {
    top: Math.round(finalTop),
    offsetX: Math.round(finalOffsetX),
    side: chosenSide
  };
}

let currentOpenAdId = null;
let editingAdId = null;
let currentAdminAdImage = '';

function openPracticeAdModal(adId) {
  const ad = practiceAds.find(a => a.id === adId);
  if (!ad) return;
  
  currentOpenAdId = adId;
  
  const modal = document.getElementById('practice-ad-modal');
  const imgContainer = document.getElementById('ad-modal-image-container');
  const imgEl = document.getElementById('ad-modal-img');
  const badgeTag = document.getElementById('ad-modal-badge-tag');
  const badgeText = document.getElementById('ad-modal-badge-text');
  const titleEl = document.getElementById('ad-modal-title');
  const textEl = document.getElementById('ad-modal-text');
  const ctaBtn = document.getElementById('ad-modal-cta-btn');
  const ctaText = document.getElementById('ad-modal-cta-text');
  const adminActions = document.getElementById('ad-modal-admin-actions');
  
  if (ad.imageUrl) {
    imgContainer.style.display = 'block';
    imgEl.src = ad.imageUrl;
  } else {
    imgContainer.style.display = 'none';
    imgEl.src = '';
  }
  
  // شارة أعلى النافذة المنبثقة (يمكن تعديلها أو إخفاؤها)
  const displayModalBadge = (ad.modalBadgeText !== undefined) ? ad.modalBadgeText : (ad.badgeText || 'عرض حصري ✨');
  if (displayModalBadge && displayModalBadge.trim()) {
    badgeTag.style.display = 'inline-flex';
    badgeText.textContent = displayModalBadge.trim();
  } else {
    badgeTag.style.display = 'none';
  }
  
  titleEl.textContent = ad.modalTitle || ad.miniText || 'عرض خاص';
  textEl.textContent = ad.modalText || 'لا يوجد شرح تفصيلي متاح حالياً.';
  
  // زر الإجراء CTA: إمكانية إزالته بالكامل أو تخصيصه
  const shouldShowCta = (ad.showCta !== false) && ad.ctaText && ad.ctaText.trim().length > 0;
  if (shouldShowCta) {
    ctaBtn.style.display = 'flex';
    ctaText.textContent = ad.ctaText.trim();
    if (ad.bgGradient) {
      ctaBtn.style.background = ad.bgGradient;
    } else if (ad.bgColor) {
      ctaBtn.style.background = ad.bgColor;
    } else {
      ctaBtn.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
    }
  } else {
    ctaBtn.style.display = 'none';
  }
  
  if (adminActions) {
    adminActions.style.display = isAdmin ? 'flex' : 'none';
  }
  
  if (soundFX) soundFX.tap();
  openModal('practice-ad-modal');
  if (window.lucide) lucide.createIcons();
}

function handleAdCtaClick() {
  const ad = practiceAds.find(a => a.id === currentOpenAdId);
  if (!ad) return;
  
  if (ad.ctaUrl && ad.ctaUrl !== '#' && ad.ctaUrl.trim().startsWith('http')) {
    window.open(ad.ctaUrl.trim(), '_blank');
  } else {
    if (soundFX) soundFX.success();
    alert('🎉 مبارك! تم تسجيل اهتمامك بهذا العرض بنجاح.');
    closeModal('practice-ad-modal');
  }
}

let currentModalAdType = 'path_side';

function setAdminAdType(type) {
  currentModalAdType = type || 'path_side';
  const isUnitDrawer = currentModalAdType === 'unit_drawer';
  
  const pathRadio = document.querySelector('input[name="new-ad-display-type"][value="path_side"]');
  const unitRadio = document.querySelector('input[name="new-ad-display-type"][value="unit_drawer"]');
  if (pathRadio) pathRadio.checked = !isUnitDrawer;
  if (unitRadio) unitRadio.checked = isUnitDrawer;
  
  const labelPath = document.getElementById('ad-type-label-path');
  const labelUnit = document.getElementById('ad-type-label-unit');
  if (labelPath && labelUnit) {
    if (isUnitDrawer) {
      labelUnit.style.borderColor = 'var(--color-accent)';
      labelUnit.style.backgroundColor = 'rgba(99, 102, 241, 0.12)';
      labelPath.style.borderColor = 'var(--color-border)';
      labelPath.style.backgroundColor = 'var(--color-surface)';
    } else {
      labelPath.style.borderColor = 'var(--color-accent)';
      labelPath.style.backgroundColor = 'rgba(99, 102, 241, 0.12)';
      labelUnit.style.borderColor = 'var(--color-border)';
      labelUnit.style.backgroundColor = 'var(--color-surface)';
    }
  }

  const sideCol = document.getElementById('ad-side-setting-col');
  const posCol = document.getElementById('ad-pos-setting-col');
  const textLabel = document.getElementById('ad-mini-text-label');
  
  if (sideCol) sideCol.style.display = isUnitDrawer ? 'none' : 'block';
  if (posCol) posCol.style.display = isUnitDrawer ? 'none' : 'block';
  if (textLabel) {
    textLabel.textContent = isUnitDrawer 
      ? 'نص شريط الإعلان المنسدل (يظهر مباشرة أسفل القسم):' 
      : 'نص البطاقة الإعلانية المصغرة (تظهر بجانب المسار):';
  }
}

function handleAdTypeChange(type) {
  setAdminAdType(type);
}

function dismissPracticeAd(adId, event) {
  if (event) event.stopPropagation();
  if (soundFX) soundFX.tap();
  
  if (!dismissedPracticeAds.includes(adId)) {
    dismissedPracticeAds.push(adId);
    sessionStorage.setItem('dismissedPracticeAds', JSON.stringify(dismissedPracticeAds));
  }
  
  const el = document.getElementById(`practice-ad-tile-${adId}`) || document.getElementById(`unit-drawer-ad-${adId}`);
  if (el) {
    el.style.transform = 'scale(0.3) rotate(-6deg)';
    el.style.opacity = '0';
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 250);
  }
}

function toggleAdminCtaFields(show) {
  const fields = document.getElementById('admin-cta-fields');
  if (fields) {
    fields.style.display = show ? 'grid' : 'none';
  }
}

function openAdminAddPracticeAd() {
  editingAdId = null;
  currentAdminAdImage = '';
  
  document.getElementById('ad-admin-modal-title').textContent = 'إضافة إعلان جديد في المسار أو أسفل القسم';
  
  // Set default ad type
  setAdminAdType('path_side');
  
  // Populate units dropdown
  const unitSelect = document.getElementById('new-ad-unit');
  unitSelect.innerHTML = practiceUnits.map(u => `<option value="${u.id}" ${Number(u.id) === Number(currentUnitId) ? 'selected' : ''}>${u.title}</option>`).join('');
  
  document.getElementById('new-ad-side').value = 'auto';
  document.getElementById('new-ad-pos').value = '1';
  document.getElementById('new-ad-badge').value = 'عرض خاص ✨';
  document.getElementById('new-ad-mini-text').value = 'هل تريد اشتراكاً في "تمرّن" مجاناً؟';
  document.getElementById('new-ad-color').value = '#6366f1';
  document.getElementById('new-ad-modal-badge').value = 'عرض حصري ✨';
  document.getElementById('new-ad-modal-title').value = 'احصل على اشتراك "تمرّن" المميز مجاناً!';
  document.getElementById('new-ad-image-url').value = '';
  document.getElementById('new-ad-modal-text').value = 'استمتع بمميزات حصرية، طاقة غير محدودة، ومراجعة فورية لجميع بحور الشعر والشواهد البلاغية!';
  
  document.getElementById('new-ad-show-cta').checked = true;
  toggleAdminCtaFields(true);
  document.getElementById('new-ad-cta-text').value = 'اشترك الآن مجاناً';
  document.getElementById('new-ad-cta-url').value = '#';
  
  const deleteBtn = document.getElementById('admin-delete-ad-btn');
  if (deleteBtn) deleteBtn.style.display = 'none';
  
  clearAdminAdImage();
  openModal('add-practice-ad-modal');
  if (window.lucide) lucide.createIcons();
}

function editPracticeAd(adId, event) {
  if (event) event.stopPropagation();
  const ad = practiceAds.find(a => a.id === adId);
  if (!ad) return;
  
  editingAdId = adId;
  currentAdminAdImage = ad.imageUrl || '';
  
  const adType = ad.adType || 'path_side';
  document.getElementById('ad-admin-modal-title').textContent = adType === 'unit_drawer' ? 'تعديل الإعلان المنسدل أسفل القسم' : 'تعديل الشاشة الإعلانية بجانب المسار';
  
  setAdminAdType(adType);
  
  const unitSelect = document.getElementById('new-ad-unit');
  unitSelect.innerHTML = practiceUnits.map(u => `<option value="${u.id}" ${Number(u.id) === Number(ad.unitId || currentUnitId) ? 'selected' : ''}>${u.title}</option>`).join('');
  
  document.getElementById('new-ad-side').value = ad.side || 'auto';
  document.getElementById('new-ad-pos').value = ad.afterNodeIndex || 0;
  document.getElementById('new-ad-badge').value = ad.badgeText || '';
  document.getElementById('new-ad-mini-text').value = ad.miniText || '';
  document.getElementById('new-ad-color').value = ad.bgColor || '#6366f1';
  document.getElementById('new-ad-modal-badge').value = (ad.modalBadgeText !== undefined) ? ad.modalBadgeText : (ad.badgeText || '');
  document.getElementById('new-ad-modal-title').value = ad.modalTitle || '';
  document.getElementById('new-ad-image-url').value = ad.imageUrl || '';
  document.getElementById('new-ad-modal-text').value = ad.modalText || '';
  
  const hasCta = ad.showCta !== false && (ad.ctaText !== undefined ? ad.ctaText.length > 0 : true);
  document.getElementById('new-ad-show-cta').checked = hasCta;
  toggleAdminCtaFields(hasCta);
  document.getElementById('new-ad-cta-text').value = ad.ctaText || 'اشترك الآن مجاناً';
  document.getElementById('new-ad-cta-url').value = ad.ctaUrl || '#';
  
  const deleteBtn = document.getElementById('admin-delete-ad-btn');
  if (deleteBtn) deleteBtn.style.display = 'inline-flex';
  
  if (ad.imageUrl) {
    previewAdminAdImage(ad.imageUrl);
  } else {
    clearAdminAdImage();
  }
  
  openModal('add-practice-ad-modal');
  if (window.lucide) lucide.createIcons();
}

function editAdFromModal() {
  if (!currentOpenAdId) return;
  closeModal('practice-ad-modal');
  editPracticeAd(currentOpenAdId);
}

function deleteAdFromModal() {
  if (!currentOpenAdId) return;
  if (!confirm('هل أنت متأكد من رغبتك في إزالة هذا الإعلان نهائياً؟')) return;
  
  practiceAds = practiceAds.filter(a => a.id !== currentOpenAdId);
  savePracticeData();
  closeModal('practice-ad-modal');
  renderPracticePath();
}

function deleteEditingPracticeAd() {
  if (!editingAdId) return;
  if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الإعلان نهائياً؟')) return;
  
  practiceAds = practiceAds.filter(a => a.id !== editingAdId);
  savePracticeData();
  closeModal('add-practice-ad-modal');
  renderPracticePath();
}

function deletePracticeAd(adId, event) {
  if (event) event.stopPropagation();
  if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الإعلان نهائياً؟')) return;
  
  practiceAds = practiceAds.filter(a => a.id !== adId);
  savePracticeData();
  renderPracticePath();
}

function savePracticeAd() {
  const isUnitDrawer = currentModalAdType === 'unit_drawer';
  const adType = isUnitDrawer ? 'unit_drawer' : 'path_side';

  const unitId = parseInt(document.getElementById('new-ad-unit').value) || Number(practiceUnits[0]?.id) || 1;
  const side = document.getElementById('new-ad-side').value || 'auto';
  const afterNodeIndex = parseInt(document.getElementById('new-ad-pos').value) || 0;
  const badgeText = document.getElementById('new-ad-badge').value.trim();
  const miniText = document.getElementById('new-ad-mini-text').value.trim();
  const bgColor = document.getElementById('new-ad-color').value;
  const modalBadgeText = document.getElementById('new-ad-modal-badge').value.trim();
  const modalTitle = document.getElementById('new-ad-modal-title').value.trim();
  const imageUrl = currentAdminAdImage || document.getElementById('new-ad-image-url').value.trim();
  const modalText = document.getElementById('new-ad-modal-text').value.trim();
  const showCta = document.getElementById('new-ad-show-cta').checked;
  const ctaText = document.getElementById('new-ad-cta-text').value.trim();
  const ctaUrl = document.getElementById('new-ad-cta-url').value.trim() || '#';
  
  if (!miniText) return alert('يرجى كتابة نص البطاقة الإعلانية');
  
  const bgGradient = `linear-gradient(135deg, ${bgColor} 0%, ${adjustColorBrightness(bgColor, -25)} 100%)`;
  
  if (editingAdId) {
    const ad = practiceAds.find(a => a.id === editingAdId);
    if (ad) {
      ad.adType = adType;
      ad.unitId = unitId;
      ad.side = side;
      ad.afterNodeIndex = afterNodeIndex;
      ad.badgeText = badgeText;
      ad.miniText = miniText;
      ad.bgColor = bgColor;
      ad.bgGradient = bgGradient;
      ad.modalBadgeText = modalBadgeText;
      ad.modalTitle = modalTitle;
      ad.imageUrl = imageUrl;
      ad.modalText = modalText;
      ad.showCta = showCta;
      ad.ctaText = ctaText;
      ad.ctaUrl = ctaUrl;
    }
  } else {
    const newId = practiceAds.length > 0 ? Math.max(...practiceAds.map(a => a.id)) + 1 : 1;
    practiceAds.push({
      id: newId,
      adType,
      unitId,
      side,
      afterNodeIndex,
      badgeText,
      miniText,
      bgColor,
      bgGradient,
      modalBadgeText,
      modalTitle,
      imageUrl,
      modalText,
      showCta,
      ctaText,
      ctaUrl
    });
  }
  
  savePracticeData();
  closeModal('add-practice-ad-modal');
  renderPracticePath();
}

function adjustColorBrightness(hex, percent) {
  let num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function setAdColorPreset(color, gradient) {
  document.getElementById('new-ad-color').value = color;
}

function previewAdminAdImage(url) {
  const box = document.getElementById('admin-ad-img-preview-box');
  const img = document.getElementById('admin-ad-img-preview');
  if (url && url.trim()) {
    img.src = url;
    box.style.display = 'block';
    currentAdminAdImage = url;
  } else {
    box.style.display = 'none';
    img.src = '';
    currentAdminAdImage = '';
  }
}

function handleAdminAdImageUpload(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      currentAdminAdImage = e.target.result;
      document.getElementById('new-ad-image-url').value = '';
      previewAdminAdImage(currentAdminAdImage);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function clearAdminAdImage() {
  document.getElementById('new-ad-image-url').value = '';
  currentAdminAdImage = '';
  const box = document.getElementById('admin-ad-img-preview-box');
  if (box) box.style.display = 'none';
}

// دالة مساعدة لإدراج رموز الكيبورد السريعة في نافذة الأدمن
window.appendKeypadSymbol = function(btnEl, symbolStr) {
  const wrapper = btnEl.closest('.admin-question-wrapper') || btnEl.closest('div');
  const input = wrapper.querySelector('.q-keys');
  if (!input) return;
  
  let val = input.value.trim();
  if (!val) {
    input.value = symbolStr;
  } else {
    // Avoid double +
    if (val.endsWith('+')) {
      input.value = val + symbolStr;
    } else {
      input.value = val + '+' + symbolStr;
    }
  }
  input.focus();
};

// === Admin Practice Node Management ===

const AVAILABLE_ICONS = [
  'star', 'book-open', 'book', 'zap', 'feather', 'award', 'trophy', 'crown', 'scroll', 'bookmark',
  'flame', 'target', 'shield', 'compass', 'heart', 'sparkles', 'help-circle', 'check-circle-2', 'pen-tool', 'music',
  'lightbulb', 'gem', 'sword', 'flag', 'sun', 'moon', 'eye', 'clock', 'key', 'map-pin',
  'layers', 'activity', 'smile', 'globe', 'hash', 'volume-2', 'mic', 'play', 'coffee', 'bell',
  'gift', 'glasses', 'sparkle', 'medal', 'cpu', 'terminal', 'search', 'folder', 'code', 'file-text',
  'anchor', 'scissors', 'timer', 'send', 'check'
];

let editingNodeId = null;

function populateIconPicker(selected = 'star') {
  const grid = document.getElementById('icon-picker-grid');
  if (!grid) return;
  grid.innerHTML = AVAILABLE_ICONS.map(icon => `
    <div class="icon-picker-item ${icon === selected ? 'selected' : ''}" data-icon="${icon}" onclick="selectIcon('${icon}')" title="${icon}">
      <i data-lucide="${icon}"></i>
    </div>
  `).join('');
  updateSelectedIconDisplay(selected);
  if (window.lucide) lucide.createIcons();
}

window.filterIconPicker = function(query) {
  const q = (query || '').toLowerCase().trim();
  const items = document.querySelectorAll('.icon-picker-item');
  items.forEach(item => {
    const iconName = item.dataset.icon || '';
    if (!q || iconName.toLowerCase().includes(q)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
};

window.selectIcon = function(iconName) {
  if (soundFX) soundFX.tap();
  document.getElementById('new-node-icon').value = iconName;
  document.querySelectorAll('.icon-picker-item').forEach(item => {
    item.classList.toggle('selected', item.dataset.icon === iconName);
  });
  updateSelectedIconDisplay(iconName);
};

function updateSelectedIconDisplay(iconName) {
  const nameEl = document.getElementById('selected-icon-name');
  const boxEl = document.getElementById('selected-icon-box');
  if (nameEl) nameEl.textContent = iconName;
  if (boxEl) {
    boxEl.innerHTML = `<i data-lucide="${iconName}" style="width:16px;height:16px;"></i>`;
    if (window.lucide) lucide.createIcons();
  }
}

window.onNodeTypeChange = function() {
  const type = document.getElementById('new-node-type').value;
  const timerBox = document.getElementById('countdown-settings-box');
  if (timerBox) {
    timerBox.style.display = type === 'countdown' ? 'block' : 'none';
  }
};

function populateNodeUnitDropdown(selectedUnitId) {
  const unitSelect = document.getElementById('new-node-unit');
  if (!unitSelect) return;
  unitSelect.innerHTML = practiceUnits.map(u => `
    <option value="${u.id}" ${u.id === selectedUnitId ? 'selected' : ''}>الوحدة ${u.id}: ${u.title}</option>
  `).join('');
}

window.moveCurrentNodeOrder = function(direction) {
  if (!editingNodeId) return;
  const idx = practiceNodes.findIndex(n => n.id === editingNodeId);
  if (idx === -1) return;
  
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= practiceNodes.length) {
    alert(direction < 0 ? 'العقدة في بداية المسار بالفعل!' : 'العقدة في نهاية المسار بالفعل!');
    return;
  }
  
  const temp = practiceNodes[idx];
  practiceNodes[idx] = practiceNodes[targetIdx];
  practiceNodes[targetIdx] = temp;
  
  if (soundFX) soundFX.tap();
  savePracticeData();
  renderPracticePath();
  alert('تم نقل العقدة وتغيير ترتيبها بنجاح!');
};

function openAdminAddPracticeNode() {
  try {
    editingNodeId = null;
    document.getElementById('node-modal-title').textContent = 'إضافة عقدة جديدة';
    document.getElementById('new-node-title').value = '';
    document.getElementById('new-node-desc').value = '';
    document.getElementById('new-node-icon').value = 'star';
    document.getElementById('new-node-action-text').value = '';
    document.getElementById('new-node-type').value = 'lesson';
    document.getElementById('new-node-timer-sec').value = '90';
    document.getElementById('icon-search-input').value = '';
    
    const orderBox = document.getElementById('node-order-controls');
    if (orderBox) orderBox.style.display = 'none';
    
    populateNodeUnitDropdown(currentUnitId);
    populateIconPicker('star');
    onNodeTypeChange();
    
    document.getElementById('node-levels-container').innerHTML = '';
    addNodeLevel(); // Add default level
    openModal('add-practice-node-modal');
  } catch (err) {
    alert('Error opening modal: ' + err.message);
    console.error(err);
  }
}

function editCurrentNode() {
  closeNodePopup();
  const node = practiceNodes.find(n => n.id === currentNodeId);
  if (!node) return;
  
  editingNodeId = node.id;
  document.getElementById('node-modal-title').textContent = 'تعديل العقدة';
  document.getElementById('new-node-title').value = node.title || '';
  document.getElementById('new-node-desc').value = node.desc || '';
  document.getElementById('new-node-icon').value = node.icon || 'star';
  document.getElementById('new-node-action-text').value = node.actionText || '';
  document.getElementById('new-node-type').value = node.type || 'lesson';
  document.getElementById('new-node-timer-sec').value = node.timerSeconds || 90;
  document.getElementById('icon-search-input').value = '';
  
  const orderBox = document.getElementById('node-order-controls');
  if (orderBox) orderBox.style.display = 'block';
  
  populateNodeUnitDropdown(node.unitId || currentUnitId);
  populateIconPicker(node.icon || 'star');
  onNodeTypeChange();
  
  const levelsContainer = document.getElementById('node-levels-container');
  levelsContainer.innerHTML = '';
  
  if (node.levels && node.levels.length > 0) {
    node.levels.forEach((level, i) => {
      const levelEl = createLevelElement(i);
      levelsContainer.appendChild(levelEl);
      
      const qContainer = levelEl.querySelector('.level-questions-container');
      if (level.questions) {
        level.questions.forEach(q => {
          qContainer.appendChild(createQuestionElement(q));
        });
      }
    });
  } else if (node.questions && node.questions.length > 0) {
    const levelEl = createLevelElement(0);
    levelsContainer.appendChild(levelEl);
    const qContainer = levelEl.querySelector('.level-questions-container');
    node.questions.forEach(q => {
      qContainer.appendChild(createQuestionElement(q));
    });
  } else {
    addNodeLevel();
  }
  
  openModal('add-practice-node-modal');
}

function deleteCurrentNode() {
  if (!confirm('هل أنت متأكد من حذف هذه العقدة؟')) return;
  practiceNodes = practiceNodes.filter(n => n.id !== currentNodeId);
  savePracticeData();
  closeNodePopup();
  renderPracticePath();
}

function createLevelElement(index) {
  const wrapper = document.createElement('div');
  wrapper.className = 'admin-level-wrapper';
  wrapper.style.cssText = 'border: 2px solid var(--color-border); padding: 15px; border-radius: 14px; position: relative; background: var(--color-bg);';
  
  wrapper.innerHTML = `
    <button class="btn-secondary danger" style="position:absolute; top:10px; left:10px; padding: 5px 10px;" onclick="this.parentElement.remove()"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
    <h5 style="margin-bottom: 12px; color: var(--color-accent); font-weight: 800;">المستوى ${index + 1}</h5>
    <div class="level-questions-container" style="display:flex; flex-direction:column; gap:12px; margin-bottom: 14px;"></div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'translate')">+ ترتيب كلمات</button>
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'mcq')">+ خيارات</button>
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'match')">+ توصيل</button>
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'info_card')">+ بطاقة معلومات</button>
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'image_card')">+ بطاقة صورة</button>
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'fill_blank_text')">+ فراغ (كتابة)</button>
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'fill_blank_choice')">+ فراغ (اختيارات)</button>
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'keypad')">+ اختبار كيبورد</button>
    </div>
  `;
  return wrapper;
}

function addNodeLevel() {
  const container = document.getElementById('node-levels-container');
  container.appendChild(createLevelElement(container.children.length));
  setTimeout(() => { if(window.lucide)lucide.createIcons(); }, 10);
}

function addQuestionToLevel(btn, type) {
  const container = btn.closest('.admin-level-wrapper').querySelector('.level-questions-container');
  container.appendChild(createQuestionElement({ type }));
}

window.previewAdminCardImage = function(inputEl) {
  const previewBox = inputEl.closest('.admin-question-wrapper').querySelector('.admin-img-preview-box');
  const imgEl = previewBox?.querySelector('img');
  if (inputEl.value.trim().length > 5) {
    if (imgEl) imgEl.src = inputEl.value.trim();
    if (previewBox) previewBox.style.display = 'block';
  } else {
    if (previewBox) previewBox.style.display = 'none';
  }
};

window.handleAdminImageUpload = function(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const qWrapper = fileInput.closest('.admin-question-wrapper');
    const inputUrl = qWrapper.querySelector('.q-image');
    const previewBox = qWrapper.querySelector('.admin-img-preview-box');
    const imgEl = previewBox?.querySelector('img');
    if (inputUrl) inputUrl.value = dataUrl;
    if (imgEl) imgEl.src = dataUrl;
    if (previewBox) previewBox.style.display = 'block';
  };
  reader.readAsDataURL(file);
};

window.handleAdminAudioUpload = function(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const qWrapper = fileInput.closest('.admin-question-wrapper');
    const audioInput = qWrapper.querySelector('.q-audio');
    if (audioInput) {
      audioInput.value = e.target.result;
      audioInput.style.color = '#16a34a';
      audioInput.title = 'تم رفع الملف: ' + file.name;
    }
  };
  reader.readAsDataURL(file);
};

window.clearAdminCardImage = function(btnEl) {
  const qWrapper = btnEl.closest('.admin-question-wrapper');
  const inputUrl = qWrapper.querySelector('.q-image');
  const previewBox = qWrapper.querySelector('.admin-img-preview-box');
  if (inputUrl) inputUrl.value = '';
  if (previewBox) previewBox.style.display = 'none';
};

function createQuestionElement(qData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'admin-question-wrapper';
  wrapper.style.cssText = 'border: 1px solid var(--color-border); padding: 15px; border-radius: 10px; position: relative; background: var(--color-surface); margin-bottom: 12px;';
  wrapper.dataset.type = qData.type;
  
  let html = `<button class="btn-secondary danger" style="position:absolute; top:12px; left:12px; padding: 4px 8px;" onclick="this.parentElement.remove()" title="حذف هذا السؤال"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>`;
  
  if (qData.type === 'translate') {
    html += `
      <div style="font-weight:800; margin-bottom:10px; color:#0284c7; font-size: 1.1rem;"><i data-lucide="list-ordered" style="display:inline-block; vertical-align:middle; width:18px; margin-left:5px;"></i>سؤال ترتيب كلمات</div>
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">الجملة المعروضة للمستخدم:</label>
      <input type="text" class="modal-input q-text" placeholder="مثال: هذا الرجل أسد في شجاعته" value="${qData.text || ''}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">بنك الكلمات المتاحة (افصل بـ +):</label>
      <input type="text" class="modal-input q-words" placeholder="مثال: هذا+الرجل+أسد+في+شجاعته+كالأسد" value="${(qData.words || []).join('+')}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">الترتيب الصحيح (افصل بـ +):</label>
      <input type="text" class="modal-input q-correct" placeholder="مثال: هذا+الرجل+أسد+في+شجاعته" value="${(qData.correct || []).join('+')}">
    `;
  } else if (qData.type === 'mcq') {
    html += `
      <div style="font-weight:800; margin-bottom:10px; color:#0284c7; font-size: 1.1rem;"><i data-lucide="help-circle" style="display:inline-block; vertical-align:middle; width:18px; margin-left:5px;"></i>سؤال خيارات متعددة</div>
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">نص السؤال:</label>
      <input type="text" class="modal-input q-text" placeholder="اكتب السؤال هنا..." value="${qData.text || ''}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">الخيارات المتاحة (افصل بـ +):</label>
      <input type="text" class="modal-input q-options" placeholder="خيار1+خيار2+خيار3+خيار4" value="${(qData.options || []).join('+')}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">تحديد الإجابة الصحيحة:</label>
      <select class="modal-input q-correct" style="margin-bottom:0; padding: 10px;">
        <option value="1" ${qData.correct === 0 ? 'selected' : ''}>الخيار الأول (1)</option>
        <option value="2" ${qData.correct === 1 ? 'selected' : ''}>الخيار الثاني (2)</option>
        <option value="3" ${qData.correct === 2 ? 'selected' : ''}>الخيار الثالث (3)</option>
        <option value="4" ${qData.correct === 3 ? 'selected' : ''}>الخيار الرابع (4)</option>
      </select>
    `;
  } else if (qData.type === 'match') {
    let pairsStr = (qData.pairs || []).map(p => `${p.left}:${p.right}`).join(' + ');
    html += `
      <div style="font-weight:800; margin-bottom:10px; color:#16a34a; font-size: 1.1rem;"><i data-lucide="git-merge" style="display:inline-block; vertical-align:middle; width:18px; margin-left:5px;"></i>سؤال توصيل</div>
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">تعليمات السؤال:</label>
      <input type="text" class="modal-input q-title" placeholder="صل بين كل مفهوم وتعريفه:" value="${qData.title || 'صل بين كل مفهوم وتعريفه:'}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">أزواج التوصيل (الصيغة: كلمة1:تعريف1 + كلمة2:تعريف2):</label>
      <textarea class="modal-textarea q-pairs" rows="3" placeholder="مثال: التشبيه:عقد مماثلة + الاستعارة:تشبيه حذف أحد طرفيه">${pairsStr}</textarea>
    `;
  } else if (qData.type === 'info_card') {
    html += `
      <div style="font-weight:800; margin-bottom:10px; color:#9333ea; font-size: 1.1rem;"><i data-lucide="info" style="display:inline-block; vertical-align:middle; width:18px; margin-left:5px;"></i>بطاقة معلومات</div>
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">عنوان البطاقة:</label>
      <input type="text" class="modal-input q-title" placeholder="مثال: أركان التشبيه" value="${escHtml(qData.title || '')}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">نص الشرح:</label>
      <div style="background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.2); border-radius:8px; padding:8px 10px; margin-bottom:6px; font-size:0.78rem; color:var(--color-muted); line-height:1.7;">
        💡 <strong>**نص**</strong> = عريض &nbsp;|&nbsp; <strong>cنصc</strong> = لون ذهبي &nbsp;|&nbsp; <strong>c#ff0000:نصc</strong> = لون مخصص
      </div>
      <textarea class="modal-textarea q-text" rows="4" placeholder="اكتب الشرح هنا... يمكن استخدام **عريض** و cملونc" style="margin-bottom:10px;">${escHtml(qData.text || '')}</textarea>
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">الصوت (رابط أو رفع ملف):</label>
      <div style="display:flex; gap:8px; margin-bottom:8px;">
        <input type="text" class="modal-input q-audio" placeholder="https://example.com/audio.mp3 أو ارفع ملفاً" value="${escHtml(qData.audioUrl || '')}" style="margin-bottom:0; flex:1;">
        <label class="btn-secondary btn-sm" style="display:flex; align-items:center; gap:4px; cursor:pointer; margin:0; padding:0 10px; white-space:nowrap;">
          <i data-lucide="upload" style="width:13px;height:13px;"></i> رفع
          <input type="file" accept="audio/*" style="display:none;" onchange="handleAdminAudioUpload(this)">
        </label>
      </div>
      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px 10px; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.2); border-radius:8px;">
        <input type="checkbox" class="q-hide-audio" ${qData.hideAudio ? 'checked' : ''} style="width:16px;height:16px; cursor:pointer;">
        <span style="font-size:0.85rem; font-weight:700; color:#dc2626;">إخفاء زر تشغيل الصوت بالكامل</span>
      </label>
    `;
  } else if (qData.type === 'image_card') {
    html += `
      <div style="font-weight:800; margin-bottom:10px; color:#a855f7; font-size: 1.1rem;"><i data-lucide="image" style="display:inline-block; vertical-align:middle; width:18px; margin-left:5px;"></i>بطاقة صورة توضيحية</div>
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">عنوان البطاقة:</label>
      <input type="text" class="modal-input q-title" placeholder="مثال: بحور الشعر العربي الستة عشر" value="${qData.title || ''}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">رابط الصورة (URL) أو رفع صورة:</label>
      <div style="display:flex; gap:8px; margin-bottom:8px;">
        <input type="text" class="modal-input q-image" placeholder="https://example.com/diagram.png" value="${qData.imageUrl || ''}" oninput="previewAdminCardImage(this)" style="margin-bottom:0; flex:1;">
        <label class="btn-secondary btn-sm" style="display:flex; align-items:center; gap:4px; cursor:pointer; margin:0; padding: 0 12px;">
          <i data-lucide="upload" style="width:14px;height:14px;"></i> رفع صورة
          <input type="file" accept="image/*" style="display:none;" onchange="handleAdminImageUpload(this)">
        </label>
      </div>
      <div class="admin-img-preview-box" style="margin-bottom:10px; text-align:center; display:${qData.imageUrl ? 'block' : 'none'}; background:var(--color-bg); padding:8px; border-radius:10px; border:1px dashed var(--color-border);">
        <img src="${qData.imageUrl || ''}" style="max-height:120px; border-radius:8px; max-width:100%;">
        <button type="button" class="btn-secondary danger btn-sm" style="margin-top:6px; font-size:0.75rem;" onclick="clearAdminCardImage(this)">إزالة الصورة</button>
      </div>
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">إعدادات الصوت (اختياري):</label>
      <input type="text" class="modal-input q-audio" placeholder="https://example.com/audio.mp3" value="${qData.audioUrl || ''}">
    `;
  } else if (qData.type === 'fill_blank_text') {
    let corrStr = Array.isArray(qData.correct) ? qData.correct.join('+') : (qData.correct || '');
    html += `
      <div style="font-weight:800; margin-bottom:10px; color:#ca8a04; font-size: 1.1rem;"><i data-lucide="edit-3" style="display:inline-block; vertical-align:middle; width:18px; margin-left:5px;"></i>إكمال الفراغ (كتابة)</div>
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">عنوان السؤال:</label>
      <input type="text" class="modal-input q-title" placeholder="أكمل الفراغ بالكلمة المناسبة كتابةً:" value="${qData.title || 'أكمل الفراغ بالكلمة المناسبة كتابةً:'}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">الجملة (استخدم [___] لمكان الفراغ):</label>
      <input type="text" class="modal-input q-sentence" placeholder="السيف والرمح والقرطاس و[___]" value="${qData.sentence || ''}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">الكلمة/الكلمات المقبولة (افصل بـ +):</label>
      <input type="text" class="modal-input q-correct" placeholder="مثال: القلم+والقلم" value="${corrStr}">
    `;
  } else if (qData.type === 'fill_blank_choice') {
    html += `
      <div style="font-weight:800; margin-bottom:10px; color:#ca8a04; font-size: 1.1rem;"><i data-lucide="mouse-pointer-click" style="display:inline-block; vertical-align:middle; width:18px; margin-left:5px;"></i>إكمال الفراغ (اختيارات)</div>
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">عنوان السؤال:</label>
      <input type="text" class="modal-input q-title" placeholder="اختر الكلمة المناسبة لملء الفراغ:" value="${qData.title || 'اختر الكلمة المناسبة لملء الفراغ:'}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">الجملة (استخدم [___] لمكان الفراغ):</label>
      <input type="text" class="modal-input q-sentence" placeholder="التشبيه البليغ حُذف منه [___]" value="${qData.sentence || ''}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">بنك الخيارات (افصل بـ +):</label>
      <input type="text" class="modal-input q-options" placeholder="وجه الشبه+أداة التشبيه+المشبه" value="${(qData.options || []).join('+')}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">الخيار الصحيح (يجب أن يطابق أحد الخيارات):</label>
      <input type="text" class="modal-input q-correct" placeholder="وجه الشبه" value="${qData.correct || ''}">
    `;
  } else if (qData.type === 'keypad') {
    let keysStr = Array.isArray(qData.keys) ? qData.keys.join('+') : (qData.keys || '٠+/+$+!');
    html += `
      <div style="font-weight:800; margin-bottom:10px; color:#0d9488; font-size: 1.1rem;"><i data-lucide="keyboard" style="display:inline-block; vertical-align:middle; width:18px; margin-left:5px;"></i>اختبار الكيبورد الافتراضي المخصص</div>
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">عنوان السؤال / التعليمات:</label>
      <input type="text" class="modal-input q-title" placeholder="اكتب التقطيع العروضي للبيت:" value="${qData.title || 'اكتب التقطيع العروضي للبيت:'}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">النص المساعد أو البيت الشعري (اختياري):</label>
      <input type="text" class="modal-input q-text" placeholder="مثال: إذا الشّعْبُ يَوْمَاً أرَادَ الحَيَاةْ" value="${qData.text || ''}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">أزرار الكيبورد المتاحة (يمكنك كتابة أي رمز أو كلمة والفصل بـ +):</label>
      <div class="keypad-presets-bar">
        <span style="font-size:0.75rem; color:var(--color-muted); width:100%; margin-bottom:2px; font-weight:700;">إدراج سريع بنقرة واحدة:</span>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '٠')">٠ (ساكن)</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '/')">/ (متحرك)</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '//٠')">//٠</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '///٠')">///٠</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '!')">!</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '؟')">؟</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '$')">$</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '#')">#</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '@')">@</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '[مشبه]')">[مشبه]</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '[أداة]')">[أداة]</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, '[مشبه به]')">[مشبه به]</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, 'َ')">َ</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, 'ُ')">ُ</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, 'ِ')">ِ</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, 'ْ')">ْ</button>
        <button type="button" class="keypad-preset-tag" onclick="appendKeypadSymbol(this, 'ّ')">ّ</button>
      </div>
      <input type="text" class="modal-input q-keys" placeholder="مثال: ٠+/+$+!+؟+@+[مشبه]" value="${keysStr}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">النمط / الصيغة الصحيحة المطلوبة بدقة (يمكن وضع أكثر من إجابة بفصلها بـ +):</label>
      <input type="text" class="modal-input q-correct" placeholder="مثال: //٠//٠//٠ أو //0//0//0" value="${qData.correct || ''}">
    `;
  }
  
  wrapper.innerHTML = html;
  setTimeout(() => {
    if (window.lucide) lucide.createIcons();
  }, 10);
  return wrapper;
}

function savePracticeNode() {
  const title = document.getElementById('new-node-title').value.trim();
  const desc = document.getElementById('new-node-desc').value.trim();
  const type = document.getElementById('new-node-type').value;
  const icon = document.getElementById('new-node-icon').value.trim() || 'star';
  const actionText = document.getElementById('new-node-action-text').value.trim();
  const unitId = parseInt(document.getElementById('new-node-unit').value) || currentUnitId;
  const timerSeconds = parseInt(document.getElementById('new-node-timer-sec').value) || 90;
  
  if (!title) return alert('يرجى إدخال عنوان العقدة');
  
  const levels = [];
  const levelWrappers = document.querySelectorAll('.admin-level-wrapper');
  
  levelWrappers.forEach((lw, i) => {
    const questions = [];
    const qWrappers = lw.querySelectorAll('.admin-question-wrapper');
    qWrappers.forEach(w => {
      const qType = w.dataset.type;
      
      if (qType === 'translate') {
        const text = (w.querySelector('.q-text')?.value || '').trim();
        const words = (w.querySelector('.q-words')?.value || '').split('+').map(s=>s.trim()).filter(s=>s);
        const correct = (w.querySelector('.q-correct')?.value || '').split('+').map(s=>s.trim()).filter(s=>s);
        if (text) questions.push({ type: 'translate', text, words, correct });
      } else if (qType === 'mcq') {
        const text = (w.querySelector('.q-text')?.value || '').trim();
        const options = (w.querySelector('.q-options')?.value || '').split('+').map(s=>s.trim()).filter(s=>s);
        const correct = Math.max(0, (parseInt(w.querySelector('.q-correct')?.value) || 1) - 1);
        if (text) questions.push({ type: 'mcq', text, options, correct });
      } else if (qType === 'match') {
        const titleQ = (w.querySelector('.q-title')?.value || '').trim();
        const rawPairs = (w.querySelector('.q-pairs')?.value || '').split('+').map(s=>s.trim()).filter(s=>s);
        const pairs = [];
        rawPairs.forEach(rp => {
          const parts = rp.split(':').map(s=>s.trim());
          if (parts.length >= 2) pairs.push({ left: parts[0], right: parts.slice(1).join(':') });
        });
        if (pairs.length > 0) questions.push({ type: 'match', title: titleQ || 'صل بين الكلمات ومفاهيمها:', pairs });
      } else if (qType === 'info_card') {
        const titleQ = (w.querySelector('.q-title')?.value || '').trim();
        const text = (w.querySelector('.q-text')?.value || '').trim();
        const audioUrl = (w.querySelector('.q-audio')?.value || '').trim();
        const hideAudio = !!(w.querySelector('.q-hide-audio')?.checked); if (text || titleQ) questions.push({ type: 'info_card', title: titleQ || 'معلومة', text, audioUrl, hideAudio, note: 'اقرأ البطاقة أو استمع للشرح ثم اضغط مفهوم' });
      } else if (qType === 'image_card') {
        const titleQ = (w.querySelector('.q-title')?.value || '').trim();
        const imageUrl = (w.querySelector('.q-image')?.value || '').trim();
        const audioUrl = (w.querySelector('.q-audio')?.value || '').trim();
        if (titleQ || imageUrl) questions.push({ type: 'image_card', title: titleQ || 'صورة توضيحية', imageUrl, audioUrl, note: 'تأمل الصورة ثم اضغط مفهوم' });
      } else if (qType === 'fill_blank_text') {
        const titleQ = (w.querySelector('.q-title')?.value || '').trim();
        const sentence = (w.querySelector('.q-sentence')?.value || '').trim();
        const correct = (w.querySelector('.q-correct')?.value || '').split('+').map(s=>s.trim()).filter(s=>s);
        if (sentence) questions.push({ type: 'fill_blank_text', title: titleQ || 'أكمل الفراغ بالكتابة:', sentence, correct });
      } else if (qType === 'fill_blank_choice') {
        const titleQ = (w.querySelector('.q-title')?.value || '').trim();
        const sentence = (w.querySelector('.q-sentence')?.value || '').trim();
        const options = (w.querySelector('.q-options')?.value || '').split('+').map(s=>s.trim()).filter(s=>s);
        const correct = (w.querySelector('.q-correct')?.value || '').trim();
        if (sentence) questions.push({ type: 'fill_blank_choice', title: titleQ || 'اختر الكلمة المناسبة:', sentence, options, correct });
      } else if (qType === 'keypad') {
        const titleQ = (w.querySelector('.q-title')?.value || '').trim();
        const text = (w.querySelector('.q-text')?.value || '').trim();
        const keys = (w.querySelector('.q-keys')?.value || '').split('+').map(s=>s.trim()).filter(s=>s);
        const correct = (w.querySelector('.q-correct')?.value || '').trim();
        if (correct) questions.push({ type: 'keypad', title: titleQ || 'اختبار الكيبورد:', text, keys: keys.length ? keys : ['٠', '/', '$', '!'], correct });
      }
    });
    
    if (questions.length > 0) {
      levels.push({
        id: i + 1,
        title: `المستوى ${i + 1}`,
        questions
      });
    }
  });
  
  if (editingNodeId) {
    const node = practiceNodes.find(n => n.id === editingNodeId);
    if (node) {
      node.unitId = unitId;
      node.title = title;
      node.desc = desc;
      node.type = type;
      node.levels = levels;
      node.icon = icon;
      node.actionText = actionText;
      if (type === 'countdown') node.timerSeconds = timerSeconds;
      delete node.questions;
    }
  } else {
    const newId = practiceNodes.length > 0 ? Math.max(...practiceNodes.map(n=>n.id)) + 1 : 1;
    practiceNodes.push({
      id: newId,
      unitId: unitId,
      type: type,
      status: practiceNodes.filter(n=>n.unitId===unitId).length === 0 ? 'current' : 'locked',
      title,
      desc,
      icon,
      actionText,
      timerSeconds: type === 'countdown' ? timerSeconds : undefined,
      levels
    });
  }
  
  savePracticeData();
  closeAllTooltips();
  closeModal('add-practice-node-modal');
  renderPracticePath();
}

// === Tooltip Logic ===
window.toggleTooltip = function(nodeId, event) {
    event.stopPropagation();
    const tooltip = document.getElementById(`tooltip-${nodeId}`);
    const nodeEl = tooltip.closest('.tile-node');
    const isVisible = tooltip.classList.contains('visible');
    closeAllTooltips();
    if (!isVisible) {
        tooltip.classList.remove('hidden');
        tooltip.classList.add('visible');
        if (soundFX) soundFX.magicChime();
        if (nodeEl) nodeEl.style.zIndex = '50';
        
        setTimeout(() => {
            const rect = tooltip.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) {
                tooltip.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 50);
    }
};

window.closeAllTooltips = function() {
    let closedAny = false;
    document.querySelectorAll('.tooltip-card.visible').forEach(card => {
        card.classList.remove('visible');
        card.classList.add('hidden');
        const nodeEl = card.closest('.tile-node');
        if (nodeEl) nodeEl.style.zIndex = '2';
        closedAny = true;
    });
    if (closedAny && soundFX) {
        soundFX.popupClose();
    }
};

document.addEventListener('click', () => {
    if (typeof closeAllTooltips === 'function') closeAllTooltips();
});

function closeNodePopup() {
    if (typeof closeAllTooltips === 'function') closeAllTooltips();
}

window.editNode = function(nodeId) {
    if (soundFX) soundFX.tap();
    currentNodeId = nodeId;
    editCurrentNode();
};

window.deleteNode = function(nodeId) {
    if (soundFX) soundFX.tap();
    currentNodeId = nodeId;
    deleteCurrentNode();
};

// =============================================
// Comprehensive Interactive Lesson Logic
// =============================================
let currentLessonQuestions = [];
let currentQuestionIndex = 0;
let nodeStartTime = 0;
let nodeSessionMistakes = [];
let isMistakesReviewMode = false;
let totalQuestionsAttempted = 0;
let totalQuestionsCorrectFirstTry = 0;
let activeNodeLevelCount = 1;

// Question interaction states
let userAnswers = []; // For translate
let selectedOption = null; // For mcq
let selectedMatchColA = null; // For match: { id, text, el }
let selectedMatchColB = null; // For match: { id, text, el }
let matchedPairsRecord = []; // Records interchangeable matching progress
let shuffledMatchLeft = [];
let shuffledMatchRight = [];
let fillBlankInputText = ''; // For fill_blank_text
let fillBlankSelectedChoice = null; // For fill_blank_choice
let keypadCurrentVal = ''; // For keypad
let cardAudioPlaying = false;
let currentCardAudio = null;

// Countdown Challenge Timer state
let countdownTimerInterval = null;
let countdownSecondsRemaining = 0;
let isCurrentNodeCountdown = false;

// Helper to normalize Arabic text for forgiving comparison
function normalizeArabic(text) {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel (diacritics)
    .replace(/\u0640/g, '') // remove tatweel
    .replace(/[إأآٱ]/g, 'ا') // normalize alefs
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function startCountdownTimer(seconds) {
  stopCountdownTimer();
  countdownSecondsRemaining = seconds;
  const timerBadge = document.getElementById('lesson-countdown-timer');
  const timerVal = document.getElementById('countdown-timer-val');
  if (timerBadge) {
    timerBadge.style.display = 'inline-flex';
    timerBadge.classList.remove('urgent');
  }
  
  function updateDisplay() {
    const mins = Math.floor(countdownSecondsRemaining / 60);
    const secs = countdownSecondsRemaining % 60;
    const str = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    if (timerVal) timerVal.textContent = str;
    if (countdownSecondsRemaining <= 15 && timerBadge) {
      timerBadge.classList.add('urgent');
    }
  }
  
  updateDisplay();
  
  countdownTimerInterval = setInterval(() => {
    countdownSecondsRemaining--;
    updateDisplay();
    if (countdownSecondsRemaining <= 0) {
      stopCountdownTimer();
      handleCountdownExpired();
    }
  }, 1000);
}

function stopCountdownTimer() {
  if (countdownTimerInterval) {
    clearInterval(countdownTimerInterval);
    countdownTimerInterval = null;
  }
  const timerBadge = document.getElementById('lesson-countdown-timer');
  if (timerBadge) timerBadge.style.display = 'none';
}

function handleCountdownExpired() {
  if (soundFX) soundFX.error();
  alert('⌛ انتهى الوقت! لقد خسرت تحدي العد التنازلي. سيتم إعادة ضبط تقدم هذه العقدة لتجربتها مجدداً.');
  
  const node = practiceNodes.find(n => n.id === currentNodeId);
  if (node) {
    node.currentLevelIndex = 0;
    savePracticeData();
  }
  showSection('practice');
}

window.confirmExitLesson = function() {
  const node = practiceNodes.find(n => n.id === currentNodeId);
  if (isCurrentNodeCountdown && node && node.status !== 'completed') {
    const ok = confirm('⚠️ هذا تحدي عد تنازلي! الخروج الآن سيؤدي إلى إلغاء تقدمك وإعادة ضبط العقدة بالكامل. هل تريد الخروج حقاً؟');
    if (!ok) return;
    node.currentLevelIndex = 0;
    savePracticeData();
  }
  stopCountdownTimer();
  showSection('practice');
};

// احسب تكلفة مستوى معين بالقلوب (تجاهل البطاقات)
function calcLevelCost(level) {
  if (!level || !level.questions) return 0;
  const countable = level.questions.filter(
    q => q.type !== 'info_card' && q.type !== 'image_card'
  ).length;
  return countable * 0.5;
}

// احسب تكلفة المستوى الحالي للعقدة
function calcNodeNextLevelCost(node) {
  if (heartsData.infiniteHearts) return 0;
  if (!node.levels || node.levels.length === 0) return 0;
  const idx = node.currentLevelIndex || 0;
  const level = node.levels[Math.min(idx, node.levels.length - 1)];
  return calcLevelCost(level);
}

function startLesson(mode, nodeId = null) {
  if (soundFX) soundFX.tap();
  if (nodeId) currentNodeId = nodeId;
  if (typeof closeAllTooltips === 'function') closeAllTooltips();

  const node = practiceNodes.find(n => n.id === currentNodeId);
  if (!node) return;

  // ── فحص القلوب ──
    // ── فحص القلوب ──
  if (!heartsData.infiniteHearts) {
    const levelCost = calcNodeNextLevelCost(node);
    const hasEnough = heartsData.count >= Math.min(levelCost, 0.5);

    if (!hasEnough) {
      if (soundFX) soundFX.error();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - new Date();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const timerEl = document.getElementById('no-hearts-timer');
      if (timerEl) timerEl.textContent = `⏰ القلوب القادمة بعد ${h} ساعة و ${m} دقيقة`;
      const noHeartsModal = document.getElementById('no-hearts-modal');
      if (noHeartsModal) noHeartsModal.style.display = 'flex';
      return;
    }
  }
  // Strict unit locking check
  const unitIdx = practiceUnits.findIndex(u => Number(u.id) === Number(node.unitId));
  if (unitIdx > 0 && isUnitLocked(unitIdx) && !isAdmin) {
    const prevTitle = practiceUnits[unitIdx - 1]?.title || 'القسم السابق';
    alert(`🔒 هذا القسم مقفول! يجب عليك إنهاء جميع عقد "${prevTitle}" أولاً لفتحه.`);
    return;
  }

  // Strict node locking check
  if (node.status === 'locked' && !isAdmin) {
    alert('🔒 هذا الدرس مقفول! أكمل العقد السابقة أولاً لفتحه.');
    return;
  }

  currentLessonQuestions = [];
  nodeStartTime = Date.now();
  nodeSessionMistakes = [];
  isMistakesReviewMode = false;
  totalQuestionsAttempted = 0;
  totalQuestionsCorrectFirstTry = 0;

  const badge = document.getElementById('mistakes-review-badge');
  if (badge) badge.style.display = 'none';

  isCurrentNodeCountdown = (node?.type === 'countdown');

  if (isCurrentNodeCountdown) {
    const totalSecs = node.timerSeconds || 90;
    startCountdownTimer(totalSecs);
  } else {
    stopCountdownTimer();
  }

  if (node) {
    if (!node.levels || node.levels.length === 0) {
      node.levels = [{ id: 1, title: 'المستوى 1', questions: defaultQuestions }];
    }
    activeNodeLevelCount = node.levels.length;
    if (typeof node.currentLevelIndex === 'undefined') node.currentLevelIndex = 0;

    if (mode === 'review') {
      let allQs = [];
      node.levels.forEach(l => { if (l.questions) allQs.push(...l.questions); });
      if (allQs.length > 0) {
        currentLessonQuestions = allQs.sort(() => 0.5 - Math.random()).slice(0, 6);
      }
    } else {
      if (node.currentLevelIndex >= node.levels.length) node.currentLevelIndex = 0;
      let lvl = node.levels[node.currentLevelIndex];
      if (lvl && lvl.questions && lvl.questions.length > 0) {
        currentLessonQuestions = lvl.questions;
      }
    }
  }

  if (!currentLessonQuestions || currentLessonQuestions.length === 0) {
    currentLessonQuestions = defaultQuestions;
  }

  showSection('lesson');
  currentQuestionIndex = 0;
  loadQuestion();
}

function parseCardText(text) {
  if (!text) return '';
  return text
    // **نص** → bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // c#color:نصc → ملون بلون مخصص
    .replace(/c(#[0-9a-fA-F]{3,6}|[a-z]+):([^c]+)c/g,
      (_, color, content) => `<span style="color:${color}; font-weight:700;">${content}</span>`)
    // cنصc → لون ذهبي افتراضي
    .replace(/c([^c\n]+)c/g,
      (_, content) => `<span style="color:#f59e0b; font-weight:800;">${content}</span>`)
    // أسطر جديدة
    .replace(/\n/g, '<br>');
}

function loadQuestion() {
  if (currentQuestionIndex >= currentLessonQuestions.length) {
    handleLevelCompletion();
    return;
  }
  
  const q = currentLessonQuestions[currentQuestionIndex];
  const area = document.getElementById('lesson-content-area');
  
  // Reset all state
  userAnswers = [];
  selectedOption = null;
  selectedMatchColA = null;
  selectedMatchColB = null;
  matchedPairsRecord = [];
  fillBlankInputText = '';
  fillBlankSelectedChoice = null;
  keypadCurrentVal = '';
  cardAudioPlaying = false;
  
  if (currentCardAudio) {
    try { currentCardAudio.pause(); } catch(e){}
    currentCardAudio = null;
  }
  if (window.speechSynthesis) {
    try { window.speechSynthesis.cancel(); } catch(e){}
  }
  
  const btnCheck = document.getElementById('btn-check-answer');
  btnCheck.className = 'btn-check';
  btnCheck.textContent = 'تحقق';
  btnCheck.style.display = 'block';
  
  document.getElementById('lesson-feedback-bar').className = 'lesson-feedback-bar';
  
  // Update progress
  const progress = (currentQuestionIndex / currentLessonQuestions.length) * 100;
  document.getElementById('lesson-progress').style.width = `${progress}%`;
  
  let html = '';
  
  if (q.type === 'translate') {
    html = `
      <h2 class="question-title">${q.title || 'رتب الكلمات لتكوين الجملة'}</h2>
      <div class="speech-bubble">${q.text}</div>
      <div class="answer-area" id="answer-area"></div>
      <div class="word-bank" id="word-bank">
        ${(q.words || []).map((w) => `<button type="button" class="word-btn" onclick="selectWord('${w.replace(/'/g, "\\'")}', this)">${w}</button>`).join('')}
      </div>
    `;
  } else if (q.type === 'mcq') {
    html = `
      <h2 class="question-title">${q.text}</h2>
      <div class="mcq-options">
        ${(q.options || []).map((opt, i) => `<button type="button" class="mcq-btn" onclick="selectOption(${i}, this)">${opt}</button>`).join('')}
      </div>
    `;
  } else if (q.type === 'match') {
    const pairs = q.pairs || [];
    shuffledMatchLeft = pairs.map((p, idx) => ({ id: `L_${idx}_${Math.random().toString(36).substring(2, 7)}`, text: p.left })).sort(() => 0.5 - Math.random());
    shuffledMatchRight = pairs.map((p, idx) => ({ id: `R_${idx}_${Math.random().toString(36).substring(2, 7)}`, text: p.right })).sort(() => 0.5 - Math.random());
    
    html = `
      <h2 class="question-title">${q.title || 'صل بين الكلمات وما يناسبها'}</h2>
      <div class="match-container" id="match-container">
        <div class="match-col" id="match-col-a">
          ${shuffledMatchLeft.map((item) => `
            <div class="match-card" data-col="left" data-id="${item.id}" onclick="selectMatchCard('left', '${item.id}', this)">
              ${item.text}
            </div>
          `).join('')}
        </div>
        <div class="match-col" id="match-col-b">
          ${shuffledMatchRight.map((item) => `
            <div class="match-card" data-col="right" data-id="${item.id}" onclick="selectMatchCard('right', '${item.id}', this)">
              ${item.text}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (q.type === 'info_card') {
    btnCheck.textContent = 'مفهوم';
    btnCheck.className = 'btn-check active';
    
    const formattedText = parseCardText(q.text || '');
    const audioBar = q.hideAudio ? '' : `
      <div class="info-card-audio-bar">
        <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-muted);">${q.note || 'استمع للشرح أو اقرأ البطاقة'}</span>
        <button type="button" class="audio-play-btn" id="card-audio-btn" onclick="toggleCardAudio()">
          <i data-lucide="volume-2" id="card-audio-icon"></i>
          <span id="card-audio-label">استمع</span>
        </button>
      </div>`;
    html = `
      <div class="info-card-box">
        <div class="info-card-badge"><i data-lucide="book-open"></i> بطاقة معرفية</div>
        <h2 class="info-card-title">${q.title || 'شرح وتوضيح'}</h2>
        <div class="info-card-body">${formattedText}</div>
        ${audioBar}
      </div>
    `;
  } else if (q.type === 'image_card') {
    btnCheck.textContent = 'مفهوم';
    btnCheck.className = 'btn-check active';
    
    html = `
      <div class="image-card-box">
        <div class="image-card-badge"><i data-lucide="image"></i> بطاقة صورة توضيحية</div>
        <h2 class="image-card-title">${q.title || 'صورة توضيحية'}</h2>
        <div class="image-card-preview-container">
          <img src="${q.imageUrl || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80'}" class="image-card-img" alt="${q.title || 'صورة'}" />
        </div>
        ${q.audioUrl ? `
          <div class="image-card-audio-bar">
            <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-muted);">${q.note || 'استمع للشرح التوضيحي للصورة'}</span>
            <button type="button" class="audio-play-btn" id="card-audio-btn" onclick="toggleCardAudio()">
              <i data-lucide="volume-2" id="card-audio-icon"></i>
              <span id="card-audio-label">استمع</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;
  } else if (q.type === 'fill_blank_text') {
    const formattedSentence = (q.sentence || '').replace(/\[___\]/g, '<span class="blank-highlight" id="blank-highlight-preview">____</span>');
    html = `
      <h2 class="question-title">${q.title || 'أكمل الفراغ بالكلمة المناسبة كتابةً'}</h2>
      <div class="fill-blank-container">
        <div class="fill-blank-sentence-card">${formattedSentence}</div>
        <div class="fill-input-wrapper">
          <input type="text" class="fill-blank-input" id="fill-blank-input" placeholder="اكتب الكلمة هنا..." oninput="handleFillBlankInput(this.value)" autocomplete="off" autofocus>
        </div>
      </div>
    `;
  } else if (q.type === 'fill_blank_choice') {
    const formattedSentence = (q.sentence || '').replace(/\[___\]/g, '<span class="blank-slot-choice" id="blank-slot-choice" onclick="clearBlankChoice()">[ اضغط لاختيار ]</span>');
    html = `
      <h2 class="question-title">${q.title || 'اختر الكلمة المناسبة لملء الفراغ'}</h2>
      <div class="fill-blank-container">
        <div class="fill-blank-sentence-card">${formattedSentence}</div>
        <div class="choice-bank" id="choice-bank">
          ${(q.options || []).map((opt) => `
            <button type="button" class="choice-chip-btn" onclick="selectBlankChoice('${opt.replace(/'/g, "\\'")}', this)">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  } else if (q.type === 'keypad') {
    const keys = Array.isArray(q.keys) ? q.keys : (q.keys || '٠+/+$+!').split('+');
    html = `
      <h2 class="question-title">${q.title || 'اكتب النمط باستخدام المفاتيح:'}</h2>
      <div class="keypad-container">
        ${q.text ? `<div class="keypad-hint-box">${q.text}</div>` : ''}
        <div class="keypad-screen">
          <div class="keypad-display-val empty" id="keypad-display">اضغط على المفاتيح بالأسفل للكتابة...</div>
        </div>
        <div class="keypad-keys-wrapper">
          <div class="keypad-custom-keys">
            ${keys.map(k => `
              <button type="button" class="keypad-key-btn" onclick="typeKeypadChar('${k.replace(/'/g, "\\'")}')">${k}</button>
            `).join('')}
          </div>
          <div class="keypad-actions-row">
            <button type="button" class="keypad-action-btn space-btn" onclick="typeKeypadChar(' ')">مسافة</button>
            <button type="button" class="keypad-action-btn del-btn" onclick="backspaceKeypad()"><i data-lucide="delete"></i> حذف</button>
            <button type="button" class="keypad-action-btn" onclick="clearKeypad()"><i data-lucide="rotate-ccw"></i> مسح</button>
          </div>
        </div>
      </div>
    `;
  }
  
  area.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

// 1. Translate (Smooth Drag & Drop Reordering and Click to Remove)
window.selectWord = function(word, btnEl) {
  if (soundFX) soundFX.tap();
  userAnswers.push(word);
  btnEl.classList.add('selected');
  renderAnswerArea();
  checkIfReady();
};

window.removeWord = function(index) {
  if (soundFX) soundFX.tap();
  const word = userAnswers.splice(index, 1)[0];
  renderAnswerArea();
  
  // Unselect one matching button in word bank
  const btns = document.querySelectorAll('#word-bank .word-btn.selected');
  for (let btn of btns) {
    if (btn.textContent.trim() === word.trim()) {
      btn.classList.remove('selected');
      break;
    }
  }
  checkIfReady();
};

function renderAnswerArea() {
  const area = document.getElementById('answer-area');
  if (!area) return;
  
  area.innerHTML = userAnswers.map((w, i) => `
    <div class="answer-word-chip" data-index="${i}" role="button" tabindex="0" title="انقر للإزالة أو اسحب لتغيير الترتيب">
      <span class="chip-text">${w}</span>
    </div>
  `).join('');

  initAnswerChipsDrag(area);
}

function initAnswerChipsDrag(area) {
  const chips = Array.from(area.querySelectorAll('.answer-word-chip'));
  
  chips.forEach((chip) => {
    chip.onpointerdown = (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      
      const startX = e.clientX;
      const startY = e.clientY;
      const chipIndex = parseInt(chip.getAttribute('data-index'), 10);
      let isDragging = false;
      let dragAvatar = null;
      let ghostEl = chip;
      
      const initialRect = chip.getBoundingClientRect();
      
      const onPointerMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        
        if (!isDragging && Math.hypot(dx, dy) > 5) {
          isDragging = true;
          
          // Create floating avatar
          dragAvatar = document.createElement('div');
          dragAvatar.className = 'answer-word-chip sortable-fallback';
          dragAvatar.innerHTML = `<span class="chip-text">${chip.querySelector('.chip-text')?.textContent || chip.textContent}</span>`;
          dragAvatar.style.position = 'fixed';
          dragAvatar.style.left = `${initialRect.left}px`;
          dragAvatar.style.top = `${initialRect.top}px`;
          dragAvatar.style.width = `${initialRect.width}px`;
          dragAvatar.style.height = `${initialRect.height}px`;
          dragAvatar.style.margin = '0';
          dragAvatar.style.zIndex = '99999';
          dragAvatar.style.pointerEvents = 'none';
          dragAvatar.style.boxSizing = 'border-box';
          document.body.appendChild(dragAvatar);
          
          ghostEl.classList.add('sortable-ghost');
          if (soundFX) soundFX.tap();
        }
        
        if (isDragging && dragAvatar) {
          dragAvatar.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.05) rotate(1deg)`;
          
          // Find closest sibling in answer-area
          const currentChips = Array.from(area.querySelectorAll('.answer-word-chip:not(.sortable-fallback)'));
          let closestChip = null;
          let minDistance = Infinity;
          
          currentChips.forEach(c => {
            if (c === ghostEl) return;
            const r = c.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dist = Math.hypot(ev.clientX - cx, ev.clientY - cy);
            if (dist < minDistance) {
              minDistance = dist;
              closestChip = c;
            }
          });
          
          if (closestChip && minDistance < 70) {
            const r = closestChip.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            
            // RTL-aware insertion: In RTL, moving to right of center is before, left of center is after
            const isRTL = document.documentElement.dir === 'rtl' || getComputedStyle(area).direction === 'rtl';
            const isBefore = isRTL ? (ev.clientX > cx) : (ev.clientX < cx);
            
            if (isBefore) {
              if (closestChip.previousElementSibling !== ghostEl) {
                area.insertBefore(ghostEl, closestChip);
                if (soundFX) soundFX.tap();
              }
            } else {
              if (closestChip.nextElementSibling !== ghostEl) {
                area.insertBefore(ghostEl, closestChip.nextElementSibling);
                if (soundFX) soundFX.tap();
              }
            }
          }
        }
      };
      
      const onPointerUp = (ev) => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        
        if (dragAvatar && dragAvatar.parentNode) {
          dragAvatar.parentNode.removeChild(dragAvatar);
        }
        
        ghostEl.classList.remove('sortable-ghost');
        
        if (isDragging) {
          // Collect new order from DOM
          const newOrder = Array.from(area.querySelectorAll('.answer-word-chip:not(.sortable-fallback)'))
            .map(el => (el.querySelector('.chip-text')?.textContent || el.textContent).trim())
            .filter(Boolean);
          
          userAnswers = newOrder;
          renderAnswerArea();
          checkIfReady();
        } else {
          // Pure click/tap -> remove word
          removeWord(chipIndex);
        }
      };
      
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    };
  });
}

// 2. MCQ
window.selectOption = function(index, btnEl) {
  if (soundFX) soundFX.tap();
  selectedOption = index;
  const btns = document.querySelectorAll('.mcq-btn');
  btns.forEach(b => b.classList.remove('selected'));
  btnEl.classList.add('selected');
  checkIfReady();
};

// 3. Match Pairs (Flexible interchangeable matching algorithm)
window.selectMatchCard = function(col, id, cardEl) {
  if (cardEl.classList.contains('matched')) return;
  if (soundFX) soundFX.tap();
  
  const text = cardEl.textContent.trim();
  
  if (col === 'left') {
    document.querySelectorAll('#match-col-a .match-card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');
    selectedMatchColA = { id, text, el: cardEl };
  } else {
    document.querySelectorAll('#match-col-b .match-card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');
    selectedMatchColB = { id, text, el: cardEl };
  }
  
  if (selectedMatchColA && selectedMatchColB) {
    const q = currentLessonQuestions[currentQuestionIndex];
    const validPairs = q.pairs || [];
    
    const normLeft = normalizeArabic(selectedMatchColA.text);
    const normRight = normalizeArabic(selectedMatchColB.text);
    
    const totalCountInQuestion = validPairs.filter(
      p => normalizeArabic(p.left) === normLeft && normalizeArabic(p.right) === normRight
    ).length;
    
    const alreadyMatchedCount = (matchedPairsRecord || []).filter(
      p => normalizeArabic(p.left) === normLeft && normalizeArabic(p.right) === normRight
    ).length;
    
    const isPair = (totalCountInQuestion > 0) && (alreadyMatchedCount < totalCountInQuestion);
    const elA = selectedMatchColA.el;
    const elB = selectedMatchColB.el;
    
    if (isPair) {
      elA.classList.remove('selected');
      elB.classList.remove('selected');
      elA.classList.add('matched');
      elB.classList.add('matched');
      matchedPairsRecord.push({ left: selectedMatchColA.text, right: selectedMatchColB.text });
      selectedMatchColA = null;
      selectedMatchColB = null;
      
      if (matchedPairsRecord.length === validPairs.length) {
        if (soundFX) soundFX.success();
        const btn = document.getElementById('btn-check-answer');
        if (btn) btn.classList.add('active');
        setTimeout(() => {
          checkAnswer();
        }, 320);
      } else {
        if (soundFX) soundFX.matchSuccess();
      }
    } else {
      if (soundFX) soundFX.error();
      elA.classList.add('shake-error');
      elB.classList.add('shake-error');
      setTimeout(() => {
        elA.classList.remove('selected', 'shake-error');
        elB.classList.remove('selected', 'shake-error');
        selectedMatchColA = null;
        selectedMatchColB = null;
      }, 450);
    }
  }
};

// 4. Info Card / Image Card Audio
window.toggleCardAudio = function() {
  const q = currentLessonQuestions[currentQuestionIndex];
  const btn = document.getElementById('card-audio-btn');
  const label = document.getElementById('card-audio-label');
  
  if (cardAudioPlaying) {
    if (currentCardAudio) {
      currentCardAudio.pause();
      currentCardAudio = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    cardAudioPlaying = false;
    if (btn) btn.classList.remove('playing');
    if (label) label.textContent = 'استمع';
    return;
  }
  
  cardAudioPlaying = true;
  if (btn) btn.classList.add('playing');
  if (label) label.textContent = 'إيقاف';
  
  if (q.audioUrl && q.audioUrl.trim().length > 5) {
    currentCardAudio = new Audio(q.audioUrl);
    currentCardAudio.onended = () => {
      cardAudioPlaying = false;
      if (btn) btn.classList.remove('playing');
      if (label) label.textContent = 'استمع';
    };
    currentCardAudio.play().catch(() => {
      speakCardText(q.title + '. ' + (q.text || ''));
    });
  } else {
    speakCardText((q.title ? q.title + '. ' : '') + (q.text || ''));
  }
};

function speakCardText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.9;
  utterance.onend = () => {
    cardAudioPlaying = false;
    const btn = document.getElementById('card-audio-btn');
    const label = document.getElementById('card-audio-label');
    if (btn) btn.classList.remove('playing');
    if (label) label.textContent = 'استمع';
  };
  utterance.onerror = () => {
    cardAudioPlaying = false;
    const btn = document.getElementById('card-audio-btn');
    const label = document.getElementById('card-audio-label');
    if (btn) btn.classList.remove('playing');
    if (label) label.textContent = 'استمع';
  };
  window.speechSynthesis.speak(utterance);
}

// 5. Fill Blank Text
window.handleFillBlankInput = function(val) {
  fillBlankInputText = val;
  const preview = document.getElementById('blank-highlight-preview');
  if (preview) {
    preview.textContent = val.trim() ? val : '____';
  }
  checkIfReady();
};

// 6. Fill Blank Choice
window.selectBlankChoice = function(word, chipEl) {
  if (soundFX) soundFX.tap();
  fillBlankSelectedChoice = word;
  const slot = document.getElementById('blank-slot-choice');
  if (slot) {
    slot.textContent = word;
    slot.classList.add('filled');
  }
  document.querySelectorAll('.choice-chip-btn').forEach(c => c.classList.remove('used'));
  chipEl.classList.add('used');
  checkIfReady();
};

window.clearBlankChoice = function() {
  if (soundFX) soundFX.tap();
  fillBlankSelectedChoice = null;
  const slot = document.getElementById('blank-slot-choice');
  if (slot) {
    slot.textContent = '[ اضغط لاختيار ]';
    slot.classList.remove('filled');
  }
  document.querySelectorAll('.choice-chip-btn').forEach(c => c.classList.remove('used'));
  checkIfReady();
};

// 7. Virtual Keypad Controls
window.typeKeypadChar = function(char) {
  if (soundFX) soundFX.tap();
  keypadCurrentVal += char;
  updateKeypadDisplay();
  checkIfReady();
};

window.backspaceKeypad = function() {
  if (soundFX) soundFX.tap();
  if (keypadCurrentVal.length > 0) {
    keypadCurrentVal = keypadCurrentVal.slice(0, -1);
    updateKeypadDisplay();
    checkIfReady();
  }
};

window.clearKeypad = function() {
  if (soundFX) soundFX.tap();
  keypadCurrentVal = '';
  updateKeypadDisplay();
  checkIfReady();
};

function updateKeypadDisplay() {
  const disp = document.getElementById('keypad-display');
  if (!disp) return;
  if (keypadCurrentVal.length === 0) {
    disp.textContent = 'اضغط على المفاتيح بالأسفل للكتابة...';
    disp.className = 'keypad-display-val empty';
  } else {
    disp.textContent = keypadCurrentVal;
    disp.className = 'keypad-display-val';
  }
}

function checkIfReady() {
  const q = currentLessonQuestions[currentQuestionIndex];
  const btn = document.getElementById('btn-check-answer');
  if (!q || !btn) return;
  
  if (q.type === 'translate') {
    if (userAnswers.length > 0) btn.classList.add('active');
    else btn.classList.remove('active');
  } else if (q.type === 'mcq') {
    if (selectedOption !== null) btn.classList.add('active');
    else btn.classList.remove('active');
  } else if (q.type === 'match') {
    if (matchedPairsRecord.length === (q.pairs || []).length) btn.classList.add('active');
    else btn.classList.remove('active');
  } else if (q.type === 'info_card' || q.type === 'image_card') {
    btn.classList.add('active');
  } else if (q.type === 'fill_blank_text') {
    if (fillBlankInputText.trim().length > 0) btn.classList.add('active');
    else btn.classList.remove('active');
  } else if (q.type === 'fill_blank_choice') {
    if (fillBlankSelectedChoice !== null) btn.classList.add('active');
    else btn.classList.remove('active');
  } else if (q.type === 'keypad') {
    if (keypadCurrentVal.trim().length > 0) btn.classList.add('active');
    else btn.classList.remove('active');
  }
}

window.checkAnswer = function() {
  const btn = document.getElementById('btn-check-answer');
  if (!btn.classList.contains('active')) return;

    const q = currentLessonQuestions[currentQuestionIndex];

  // البطاقات لا تُخصم قلباً
  if (q.type === 'info_card' || q.type === 'image_card') {
    if (soundFX) soundFX.tap();
    nextQuestion();
    return;
  }

  // خصم 0.5 قلب لكل سؤال
  deductHeart();

  totalQuestionsAttempted++;
  let isCorrect = false;

  if (q.type === 'translate') {
    isCorrect = JSON.stringify(userAnswers) === JSON.stringify(q.correct);
  } else if (q.type === 'mcq') {
    isCorrect = selectedOption === q.correct;
  } else if (q.type === 'match') {
    isCorrect = matchedPairsRecord.length === (q.pairs || []).length;
  } else if (q.type === 'fill_blank_text') {
    const userNorm = normalizeArabic(fillBlankInputText);
    const accepted = Array.isArray(q.correct) ? q.correct : [q.correct];
    isCorrect = accepted.some(ans => normalizeArabic(ans) === userNorm);
  } else if (q.type === 'fill_blank_choice') {
    isCorrect = normalizeArabic(fillBlankSelectedChoice) === normalizeArabic(q.correct);
  } else if (q.type === 'keypad') {
    const userRaw = (keypadCurrentVal || '').trim();
    const userNorm = normalizeArabic(userRaw).replace(/\s+/g, ' ');
    const acceptedArr = (Array.isArray(q.correct)
      ? q.correct
      : (typeof q.correct === 'string' ? q.correct.split('+') : [q.correct])
    ).map(s => (s || '').trim());

    isCorrect = acceptedArr.some(acc => {
      if (acc === userRaw) return true;
      if (normalizeArabic(acc).replace(/\s+/g, ' ') === userNorm) return true;
      const convAcc  = acc.replace(/٠/g, '0');
      const convUser = userRaw.replace(/٠/g, '0');
      return convAcc === convUser;
    });
  }

  const feedback = document.getElementById('lesson-feedback-bar');
  const icon     = document.getElementById('feedback-icon');
  const title    = document.getElementById('feedback-title');
  const desc     = document.getElementById('feedback-desc');

  if (isCorrect) {
    if (soundFX) soundFX.success();
    totalQuestionsCorrectFirstTry++;
    feedback.className = 'lesson-feedback-bar show success';
    icon.innerHTML     = '<i data-lucide="check"></i>';
    title.textContent  = 'رائع جداً!';
    desc.textContent   = 'إجابة صحيحة وممتازة';
  } else {
    if (soundFX) soundFX.error();

    if (isMistakesReviewMode) {
      currentLessonQuestions.push(q);
    } else {
      if (!nodeSessionMistakes.some(m => m === q)) {
        nodeSessionMistakes.push(q);
      }
    }

    feedback.className = 'lesson-feedback-bar show error';
    icon.innerHTML     = '<i data-lucide="x"></i>';
    title.textContent  = 'إجابة خاطئة';

    if (q.type === 'translate')        desc.textContent = `الصحيح: ${q.correct.join(' ')}`;
    else if (q.type === 'mcq')         desc.textContent = `الصحيح: ${q.options[q.correct]}`;
    else if (q.type === 'fill_blank_text')  desc.textContent = `الصحيح: ${Array.isArray(q.correct) ? q.correct[0] : q.correct}`;
    else if (q.type === 'fill_blank_choice') desc.textContent = `الصحيح: ${q.correct}`;
    else if (q.type === 'keypad')      desc.textContent = `النمط الصحيح: ${q.correct}`;
    else desc.textContent = 'حاول التركيز مرة أخرى';
  }

  if (window.lucide) lucide.createIcons();
};
    

window.nextQuestion = function() {
  if (soundFX) soundFX.tap();
  currentQuestionIndex++;
  if (currentQuestionIndex < currentLessonQuestions.length) {
    loadQuestion();
  } else {
    handleLevelCompletion();
  }
};

function handleLevelCompletion() {
  document.getElementById('lesson-progress').style.width = '100%';
  
  setTimeout(() => {
    const nodeIndex = practiceNodes.findIndex(n => n.id === currentNodeId);
    if (nodeIndex === -1) {
      showSection('practice');
      return;
    }
    
    const node = practiceNodes[nodeIndex];
    if (!node.levels || node.levels.length === 0) {
      node.levels = [{ id: 1, questions: defaultQuestions }];
    }
    if (typeof node.currentLevelIndex === 'undefined') node.currentLevelIndex = 0;
    
    // If currently in Mistakes Review mode
    if (isMistakesReviewMode) {
      if (currentQuestionIndex < currentLessonQuestions.length) {
        loadQuestion();
        return;
      }
      // Completed reviewing mistakes!
      isMistakesReviewMode = false;
      stopCountdownTimer();
      showNodeAchievements(node);
      return;
    }
    
    node.currentLevelIndex++;
    
    if (node.currentLevelIndex < node.levels.length) {
      // Continue next level
      savePracticeData();
      currentLessonQuestions = node.levels[node.currentLevelIndex].questions || defaultQuestions;
      currentQuestionIndex = 0;
      document.getElementById('lesson-progress').style.width = '0%';
      loadQuestion();
    } else {
      // Completed all levels of this node!
      // Check if there are mistakes to review first
      if (nodeSessionMistakes.length > 0) {
        isMistakesReviewMode = true;
        const badge = document.getElementById('mistakes-review-badge');
        if (badge) badge.style.display = 'inline-flex';
        
        currentLessonQuestions = [...nodeSessionMistakes];
        nodeSessionMistakes = [];
        currentQuestionIndex = 0;
        document.getElementById('lesson-progress').style.width = '0%';
        loadQuestion();
      } else {
        stopCountdownTimer();
        showNodeAchievements(node);
      }
    }
  }, 400);
}

function showNodeAchievements(node) {
  if (soundFX) soundFX.levelWin();
  const durationSec = Math.max(1, Math.floor((Date.now() - nodeStartTime) / 1000));
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const timeFormatted = mins > 0 ? `${mins} دقيقة و ${secs} ثانية` : `${secs} ثوانٍ`;

  const xpEarned    = Math.max(15, (node.levels?.length || 1) * 15);
  const accuracyPct = Math.min(100, Math.round(
    (totalQuestionsCorrectFirstTry / Math.max(1, totalQuestionsAttempted)) * 100
  ));

  document.getElementById('achieve-time-val').textContent     = timeFormatted;
  document.getElementById('achieve-xp-val').textContent       = `+${xpEarned} XP`;
  document.getElementById('achieve-accuracy-val').textContent = `${accuracyPct}%`;
  document.getElementById('achieve-levels-val').textContent   =
    `${node.levels?.length || 1} / ${node.levels?.length || 1}`;

  node.status = 'completed';

  const curUnit      = practiceUnits.find(u => Number(u.id) === Number(node.unitId));
  const curUnitIdx   = practiceUnits.findIndex(u => Number(u.id) === Number(node.unitId));
  const curUnitFinished = curUnit && isUnitCompleted(curUnit.id);

  if (curUnitFinished && curUnitIdx + 1 < practiceUnits.length) {
    const nextUnit = practiceUnits[curUnitIdx + 1];
    document.getElementById('achievement-node-title').textContent =
      `🎉 مبروك! لقد أنهيت جميع عقد "${curUnit.title}" بنجاح، وتم فتح القسم التالي "${nextUnit.title}"!`;
  } else {
    document.getElementById('achievement-node-title').textContent =
      `أكملت عقدة "${node.title}" بنجاح وتألقت في أدب العرب!`;
  }

  activateStreak();
  savePracticeData();
  syncProgressToServer();

  // مكافأة القلوب: +2 عند إكمال العقدة
  if (!heartsData.infiniteHearts) {
    heartsData.count = Math.min(heartsData.count + 2, 10);
    saveHeartsLocally();
    updateHeartsDisplay();
    setTimeout(() => showHeartsToast('❤️ +2 قلب مكافأة إكمال العقدة!', '#22c55e'), 600);
  }

  // مزامنة مع السيرفر (Anti-cheat: مكافأة مرة واحدة لكل عقدة)
  if (userToken) {
    fetch('/api/user/hearts/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ nodeId: String(node.id) })
    }).then(r => r.json()).then(data => {
      if (typeof data.hearts === 'number') {
        heartsData.count = data.hearts;
        saveHeartsLocally();
        updateHeartsDisplay();
      }
    }).catch(() => {});
  }

  renderPracticePath();
  openModal('node-achievement-modal');
  if (window.lucide) lucide.createIcons();
}
   
window.finishNodeAchievement = function() {
  closeModal('node-achievement-modal');
  showSection('practice');
};

// Update showSection to handle practice path and leaderboard subpage
let previousSection = 'home';
let currentActiveSection = 'home';

const ALL_SECTIONS = ['home','tests','quiz','arud','museum','museum-poet', 'practice', 'lesson', 'profile', 'leaderboard'];

function showSection(id) {
  if (currentActiveSection !== id && id !== 'lesson') {
    previousSection = currentActiveSection;
  }
  currentActiveSection = id;

  ALL_SECTIONS.forEach(s => {
    const el = document.getElementById(`${s}-section`);
    if (el) {
      el.style.display = 'none';
      el.classList.remove('section-enter');
    }
  });
  
  if (id === 'practice') {
    renderPracticePath();
  }

  if (id === 'arud') {
    document.documentElement.classList.add('arud-active');
    document.body.style.overflow = 'hidden';
    document.getElementById('arud-section').style.display = 'flex';
    updateArudHeight();
    renderVerses();
  } else {
    document.documentElement.classList.remove('arud-active');
    document.body.style.overflow = '';
    const t = document.getElementById(`${id}-section`);
    if (t) {
      if (id === 'practice' || id === 'lesson') {
        t.style.display = 'flex';
      } else {
        t.style.display = 'block';
      }
      t.classList.add('section-enter');
    }
    if (id === 'museum') renderMuseumLanding();
    if (id === 'profile') renderProfileSection();
    if (id === 'leaderboard') renderLeaderboardSection();
  }
  
  window.scrollTo({ top:0, behavior:'smooth' });
}

// =============================================
// Quiz
// =============================================
let activeQuizType=null, quizIndex=0, score=0;

function startQuiz(type) {
  activeQuizType=type; quizIndex=0; score=0;
  document.getElementById('quiz-container').style.display='block';
  document.getElementById('quiz-result').style.display='none';
  renderQuiz(); showSection('quiz');
}

function renderQuiz() {
  const q=QUIZZES[activeQuizType][quizIndex], total=QUIZZES[activeQuizType].length;
  document.getElementById('quiz-number').textContent=`السؤال ${quizIndex+1}`;
  document.getElementById('quiz-question').textContent=q.question;
  document.getElementById('quiz-progress').innerHTML=
    Array.from({length:total},(_,i)=>`<div class="progress-dot ${i<=quizIndex?'active':''}"></div>`).join('');
  const opts=document.getElementById('quiz-options'); opts.innerHTML='';
  q.options.forEach((opt,i)=>{
    const btn=document.createElement('button');
    btn.className='quiz-option'; btn.textContent=opt;
    btn.addEventListener('click',()=>handleAnswer(i,q.correct));
    opts.appendChild(btn);
  });
}

function handleAnswer(sel,correct) {
  const isRight = sel === correct;
  if(isRight) {
    score++;
  }
  const total=QUIZZES[activeQuizType].length;
  if(quizIndex<total-1){quizIndex++;renderQuiz();}else showResult();
}

function showResult() {
  const total=QUIZZES[activeQuizType].length;
  document.getElementById('quiz-container').style.display='none';
  document.getElementById('quiz-result').style.display='block';
  document.getElementById('score-text').textContent=score;
  document.getElementById('score-denom').textContent=total;
  document.getElementById('score-message').textContent=score===total?'مذهل! لقد أثبتّ جدارتك.':'لا بأس، المعرفة تراكمية.';
  setTimeout(()=>{
    const c=283;
    document.getElementById('score-circle').style.strokeDasharray=`${(score/total)*c} ${c}`;
  },120);
}

// =============================================
// المحلل — الحالة
// =============================================
let verses=['','','',''], activeIndex=0, typingTimer;
let manualClosed=false;
let analysisBox=null, analysisContent=null;
let userMovedBox=false;
let inlineBox=null, inlineContent=null, inlineActiveRow=null;

function createAnalysisPanel(data, loading=false) {
  if (loading) return `<div class="loading-box">جاري النظم عروضيًا...</div>`;
  if (!data)   return `<div class="loading-box">—</div>`;
  return `
    <div class="bahr-info">
      <div class="bahr-label">بحر القصيد:</div>
      <h3 class="bahr-name">${data.meter||'...'}</h3>
    </div>
    <div class="kitaba-section">
      <div class="label">الكتابة والتفعيلات:</div>
      <p class="kitaba-text">${data.phonetic||'بانتظار قلمك...'}</p>
    </div>
    <div class="scansion-section">
      <div class="label">الترميز العروضي:</div>
      <div class="scansion-display"><p class="scansion-text" dir="ltr">${data.symbols||'----'}</p></div>
    </div>`;
}

function getInlineBox() {
  if (!inlineBox) {
    inlineBox = document.createElement('div');
    inlineBox.className = 'inline-analysis';
    inlineBox.innerHTML = `
      <div class="inline-analysis-inner">
        <div class="inline-analysis-header">
          <span class="inline-analysis-label">التحليل العروضي</span>
          <button class="inline-close-btn" onclick="window.closeInlineAnalysis()">✕</button>
        </div>
        <div class="inline-analysis-body"></div>
      </div>`;
    inlineContent = inlineBox.querySelector('.inline-analysis-body');
  }
  return inlineBox;
}

async function updateAnalysisMobile(idx, text, inputElement) {
  try {
    const box=getInlineBox(), targetRow=inputElement.closest('.verse-row');
    if (!targetRow||!targetRow.isConnected) return;
    const alreadyThere=box.previousElementSibling===targetRow;
    if (!alreadyThere) {
      if (box.classList.contains('open')) {
        box.classList.remove('open');
        await new Promise(r=>setTimeout(r,420));
        if (manualClosed||!targetRow.isConnected) return;
      }
      targetRow.after(box); inlineActiveRow=targetRow;
    }
    if (!inlineContent) inlineContent=box.querySelector('.inline-analysis-body');
    inlineContent.innerHTML=createAnalysisPanel(null,true);
    if (!box.classList.contains('open'))
      requestAnimationFrame(()=>requestAnimationFrame(()=>box.classList.add('open')));
    const data=await analyzeVerses(text);
    if (idx===activeIndex&&!manualClosed&&targetRow.isConnected) {
      inlineContent.innerHTML=createAnalysisPanel(data);
      if(window.lucide)lucide.createIcons();
      window.currentAnalysis={bahr:data.meter,kitaba:data.phonetic,scansion:data.symbols};
    }
  } catch(e){ console.warn('mobile analysis:',e); }
}

async function updateAnalysisDesktop(idx, text, inputElement) {
  try {
    if (!analysisBox){analysisBox=document.getElementById('analysis-box');analysisContent=document.getElementById('analysis-content');}
    analysisBox.style.display='block';
    analysisContent.innerHTML=createAnalysisPanel(null,true);
    if (!userMovedBox) positionBox(inputElement);
    const data=await analyzeVerses(text);
    if (idx===activeIndex&&!manualClosed&&analysisBox.style.display!=='none') {
      analysisContent.innerHTML=createAnalysisPanel(data);
      if(window.lucide)lucide.createIcons();
      window.currentAnalysis={bahr:data.meter,kitaba:data.phonetic,scansion:data.symbols};
    }
  } catch(e){ console.warn('desktop analysis:',e); }
}

async function updateAnalysisUI(idx, text, inputElement) {
  if (!text||text.trim().length===0||manualClosed) return;
  if (window.innerWidth<=768) await updateAnalysisMobile(idx,text,inputElement);
  else await updateAnalysisDesktop(idx,text,inputElement);
}

function positionBox(inputElement) {
  if (!analysisBox||!inputElement||window.innerWidth<=768||userMovedBox) return;
  const rect=inputElement.getBoundingClientRect(), boxW=380, boxH=310;
  let left=rect.left+rect.width/2-boxW/2;
  left=Math.max(16,Math.min(left,window.innerWidth-boxW-16));
  analysisBox.style.cssText+=`;position:fixed;width:${boxW}px;left:${left}px;right:auto;transform:none;`;
  const spaceBelow=window.innerHeight-rect.bottom;
  if (spaceBelow>=boxH+16){analysisBox.style.top=(rect.bottom+12)+'px';analysisBox.style.bottom='auto';}
  else{analysisBox.style.top='auto';analysisBox.style.bottom=(window.innerHeight-rect.top+12)+'px';}
}

window.closeInlineAnalysis=()=>{clearTimeout(typingTimer);manualClosed=true;if(inlineBox)inlineBox.classList.remove('open');};
window.closeAnalysis=()=>{clearTimeout(typingTimer);manualClosed=true;if(analysisBox)analysisBox.style.display='none';if(inlineBox)inlineBox.classList.remove('open');};
window.copyAnalysis=()=>{if(!window.currentAnalysis)return;const{bahr,kitaba,scansion}=window.currentAnalysis;navigator.clipboard.writeText(`البحر: ${bahr}\nالكتابة: ${kitaba}\nالترميز: ${scansion}`);const btn=document.getElementById('copy-btn-text');if(btn){btn.textContent='تم!';setTimeout(()=>btn.textContent='نسخ',2000);}};
window.copyAllVerses=(btn)=>{const l=[];for(let i=0;i<verses.length;i+=2){const s=verses[i]||'',a=verses[i+1]||'';if(s||a)l.push(`${s} ... ${a}`);}if(!l.length)return;navigator.clipboard.writeText(l.join('\n'));if(btn){const o=btn.innerHTML;btn.innerHTML='<i data-lucide="check"></i> تم النسخ';if(window.lucide)lucide.createIcons();setTimeout(()=>{btn.innerHTML=o;if(window.lucide)lucide.createIcons();},2000);}};

// =============================================
// رسم حقول الأبيات
// =============================================
function renderVerses() {
  const container=document.getElementById('verses-container');
  if(!container)return; container.innerHTML='';
  for(let i=0;i<verses.length;i+=2){
    const n=Math.floor(i/2)+1,si=i,ai=i+1;
    const w=document.createElement('div'); w.className='verse-row';
    w.innerHTML=`
      <div class="verse-line-num">${String(n).padStart(2,'0')}</div>
      <div class="verse-inputs">
        <input type="text" value="${(verses[si]||'').replace(/"/g,'&quot;')}" placeholder="صدر البيت ${n}" class="verse-input" data-idx="${si}" dir="rtl">
        <input type="text" value="${(verses[ai]||'').replace(/"/g,'&quot;')}" placeholder="عجز البيت ${n}" class="verse-input" data-idx="${ai}" dir="rtl">
      </div>`;
    container.appendChild(w);
  }
  container.querySelectorAll('.verse-input').forEach(input=>{
    input.addEventListener('focus',e=>{manualClosed=false;activeIndex=parseInt(e.target.dataset.idx,10);updateAnalysisUI(activeIndex,e.target.value,e.target);});
    input.addEventListener('input',e=>{
      const idx=parseInt(e.target.dataset.idx,10);
      verses[idx]=e.target.value; saveVerses();
      clearTimeout(typingTimer);
      typingTimer=setTimeout(()=>updateAnalysisUI(idx,e.target.value,e.target),400);
      if(idx>=verses.length-2&&e.target.value.trim()){
        const lS=verses.length-2,lA=verses.length-1;
        if((verses[lS]||'').trim()||(verses[lA]||'').trim()){
          if(verses.length-1===lA){verses.push('','');saveVerses();const st=container.scrollTop;renderVerses();container.scrollTop=st;const s=container.querySelector(`input[data-idx="${idx}"]`);if(s){s.focus();s.setSelectionRange(s.value.length,s.value.length);}}
        }
      }
    });
  });
  if(window.lucide)lucide.createIcons();
}

function fillSample(){verses=[...SAMPLE_VERSES];activeIndex=0;userMovedBox=false;saveVerses();renderVerses();window.closeAnalysis();}
function clearVerses(){verses=['','','',''];activeIndex=0;userMovedBox=false;saveVerses();renderVerses();window.closeAnalysis();}

// =============================================
// ② Drag من أي حافة
// =============================================
let isDragging=false, startX, startY, initialLeft, initialTop;
const EDGE=12;

function isOnEdge(e,rect){return e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom&&(e.clientX-rect.left<EDGE||rect.right-e.clientX<EDGE||e.clientY-rect.top<EDGE||rect.bottom-e.clientY<EDGE);}

document.addEventListener('mousemove',e=>{
  if(isDragging){e.preventDefault();analysisBox.style.left=(initialLeft+e.clientX-startX)+'px';analysisBox.style.top=(initialTop+e.clientY-startY)+'px';return;}
  if(!analysisBox||analysisBox.style.display==='none'||window.innerWidth<=768)return;
  const rect=analysisBox.getBoundingClientRect();
  const inside=e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;
  if(!inside){analysisBox.style.cursor='';return;}
  analysisBox.style.cursor=isOnEdge(e,rect)?'move':'default';
});

document.addEventListener('mousedown',e=>{
  if(window.innerWidth<=768)return;
  if(!analysisBox||analysisBox.style.display==='none')return;
  if(e.target.closest('button,input,textarea,[contenteditable]'))return;
  const rect=analysisBox.getBoundingClientRect();
  if(!isOnEdge(e,rect))return;
  isDragging=true;userMovedBox=true;
  startX=e.clientX;startY=e.clientY;
  initialLeft=rect.left;initialTop=rect.top;
  analysisBox.style.transform='none';
  analysisBox.style.left=initialLeft+'px';analysisBox.style.top=initialTop+'px';analysisBox.style.bottom='auto';
  e.preventDefault();
});

document.addEventListener('mouseup',()=>{isDragging=false;});

// =============================================
// ========== متحف المعلقات ==========
// =============================================
let museumData     = {}; // cache للبيانات المجلوبة
let currentPoetId  = null;
let editingEntryId = null;
let annotationCtx  = null;
let museumModalVerses = [];

// ----- Modals -----
function openModal(id){
  const m=document.getElementById(id);
  if(m){
    m.style.display='flex';
    if(soundFX) soundFX.magicChime();
    if(window.lucide)lucide.createIcons();
  }
}
function closeModal(id){
  const m=document.getElementById(id);
  if(m) {
    m.style.display='none';
    if(soundFX) soundFX.popupClose();
  }
}
function handleModalBackdrop(e,id){if(e.target===e.currentTarget)closeModal(id);}

async function tryAdminLogin() {
  const input=document.getElementById('admin-code-input');
  const err=document.getElementById('admin-error');
  if(!input)return;
  
  try {
    const result = await api.postPublic('/admin/login', {code: input.value.trim()});
    authToken = result.token;
    sessionStorage.setItem('adminToken', authToken);
    isAdmin = true;
    closeModal('admin-modal');
    input.value=''; err.style.display='none';
    renderMuseumLanding();
    if(typeof renderCourseSelector === 'function') renderCourseSelector();
    if(typeof renderPracticePath === 'function') renderPracticePath();
    if(currentPoetId){document.getElementById('admin-add-btn-area').style.display='flex';renderPoetContent(currentPoetId);}
    if(document.getElementById('admin-add-practice-btn')) document.getElementById('admin-add-practice-btn').style.display = 'flex';
  } catch (error) {
    // 🔥 عرض رسالة الخطأ القادمة من السيرفر أو خطأ الاتصال
    err.textContent = error.message === 'Failed to fetch' ? 'لا يمكن الاتصال بالسيرفر' : error.message;
    err.style.display='block'; 
    input.value=''; input.focus();
  }
}

async function adminLogout(e) {
  if(e) e.stopPropagation();
  try { await api.postPublic('/admin/logout'); } catch {}
  authToken=null; isAdmin=false;
  sessionStorage.removeItem('adminToken');
  renderMuseumLanding();
  if(typeof renderCourseSelector === 'function') renderCourseSelector();
  if(typeof renderPracticePath === 'function') renderPracticePath();
  if(currentPoetId){document.getElementById('admin-add-btn-area').style.display='none';renderPoetContent(currentPoetId);}
  if(document.getElementById('admin-add-practice-btn')) document.getElementById('admin-add-practice-btn').style.display = 'none';
}

// ----- ① جلب بيانات الشاعر من السيرفر -----
async function loadPoetData(poetId) {
  try {
    const entries = await api.get(`/museum/${poetId}`);
    museumData[poetId] = entries;
  } catch { museumData[poetId] = []; }
}

// ----- رسم صفحة المتحف -----
function renderMuseumLanding() {
  const grid=document.getElementById('museum-grid');
  if(!grid)return; grid.innerHTML='';

  MUALLAQAT.forEach(poet=>{
    const card=document.createElement('div');
    card.className='museum-card';
    card.innerHTML=`
      <div class="museum-card-icon ${poet.color}"><i data-lucide="${poet.icon}"></i></div>
      <div class="museum-card-details">
        <h3 class="museum-poet-name">${poet.name}</h3>
        <p class="museum-matla">"${poet.matla}"</p>
        <button class="btn-primary btn-sm">دخول المتحف</button>
      </div>`;
    card.addEventListener('click',()=>showMuseumPoet(poet.id));
    grid.appendChild(card);
  });

  // بطاقة الأدمن
  const adminCard=document.createElement('div');
  adminCard.className=`museum-card admin-card${isAdmin?' logged-in':''}`;
  if(isAdmin){
    adminCard.innerHTML=`
      <div class="museum-card-icon muted"><i data-lucide="shield-check"></i></div>
      <div class="museum-card-details">
        <h3 class="museum-poet-name">وضع الأدمن</h3>
        <p class="museum-matla">أنت مسجل الدخول — الجلسة تنتهي بعد 24 ساعة</p>
        <button class="btn-secondary btn-sm" onclick="adminLogout(event)">تسجيل الخروج</button>
      </div>`;
  } else {
    adminCard.innerHTML=`
      <div class="museum-card-icon muted"><i data-lucide="lock"></i></div>
      <div class="museum-card-details">
        <h3 class="museum-poet-name">سجل دخول كأدمن</h3>
        <p class="museum-matla">للإدارة والنشر في متحف المعلقات</p>
        <button class="btn-secondary btn-sm">دخول</button>
      </div>`;
    adminCard.addEventListener('click',()=>openModal('admin-modal'));
  }
  grid.appendChild(adminCard);
  if(window.lucide)lucide.createIcons();
}

// ----- صفحة الشاعر -----
async function showMuseumPoet(poetId) {
  currentPoetId=poetId;
  const poet=MUALLAQAT.find(p=>p.id===poetId);
  if(!poet)return;
  showSection('museum-poet');

  document.getElementById('poet-title-area').innerHTML=`
    <div class="poet-page-title">
      <div class="poet-icon-sm ${poet.color}"><i data-lucide="${poet.icon}"></i></div>
      <div>
        <h1 class="page-title">${poet.name}</h1>
        <p class="poet-matla-hero">"${poet.matla}"</p>
      </div>
    </div>`;

  document.getElementById('admin-add-btn-area').style.display=isAdmin?'flex':'none';

  // اعرض مؤشر تحميل
  document.getElementById('poet-content-area').innerHTML='<div class="empty-state"><p style="opacity:0.5">جاري التحميل...</p></div>';
  if(window.lucide)lucide.createIcons();

  await loadPoetData(poetId);
  renderPoetContent(poetId);
}

function renderPoetContent(poetId) {
  const entries=museumData[poetId]||[];
  const container=document.getElementById('poet-content-area');
  container.innerHTML='';

  if(entries.length===0){
    container.innerHTML=`<div class="empty-state"><i data-lucide="scroll"></i><p>لم يُضَف محتوى بعد لهذه المعلقة</p></div>`;
    if(window.lucide)lucide.createIcons();return;
  }

  entries.forEach(entry=>{
    const el=document.createElement('div');
    el.className='museum-entry';
    el.dataset.entryId=entry.id;
    el.innerHTML=entry.type==='text'?buildTextHTML(entry,poetId):buildVersesHTML(entry,poetId);
    container.appendChild(el);
  });

  if(window.lucide)lucide.createIcons();
  setupAnnotationEvents(poetId);
}

// ----- ③ بناء HTML — Collapsible -----
function buildTextHTML(entry, poetId) {
  const preview = entry.title||getTextPreview(entry.html||'');
  const adminCtrl = isAdmin ? `
    <div class="entry-admin-controls">
      <button class="admin-ctrl-btn edit" onclick="showAddTextModal('${entry.id}')" title="تعديل"><i data-lucide="pencil"></i></button>
      <button class="admin-ctrl-btn delete" onclick="deleteEntry('${poetId}','${entry.id}')" title="حذف"><i data-lucide="trash-2"></i></button>
    </div>` : '';
  return `
    <div class="text-entry">
      <div class="entry-header" onclick="toggleTextEntry(this)">
        <div class="entry-title">${escHtml(preview)}</div>
        <i data-lucide="chevron-down" class="entry-chevron"></i>
      </div>
      <div class="entry-body">
        <div class="entry-content">${entry.html||''}</div>
      </div>
    </div>
    ${adminCtrl}`;
}

function buildVersesHTML(entry, poetId) {
  const linesHtml = entry.verses.map((v,i)=>{
    const hasAnno = v.annotation && v.annotation.trim();
    const annoBtn = isAdmin ? `
      <button class="verse-annotate-btn${hasAnno?' has-annotation':''}" title="${hasAnno?'تعديل الشرح':'إضافة شرح'}" onclick="event.stopPropagation();showAnnotationModal('${poetId}','${entry.id}',${i})">
        <i data-lucide="${hasAnno?'message-square':'message-square-plus'}"></i>
      </button>` : '';

    return `
      <div class="museum-verse-line${hasAnno?' has-annotation':''}" data-entry-id="${entry.id}" data-verse-idx="${i}"
           onclick="toggleVerseAnnotation(this)">
        <div style="flex:1">
          <div class="museum-verse-text">
            <span>${escHtml(v.sadr)}</span>
            <span class="verse-sep">...</span>
            <span>${escHtml(v.ajuz)}</span>
          </div>
          ${hasAnno?`<div class="verse-annotation-wrap"><div class="verse-annotation-display">${escHtml(v.annotation)}</div></div>`:''}
        </div>
        ${hasAnno?'<i data-lucide="chevron-down" class="verse-anno-toggle"></i>':''}
        ${annoBtn}
      </div>`;
  }).join('');

  const adminCtrl = isAdmin ? `
    <div class="entry-admin-controls">
      <button class="admin-ctrl-btn edit" onclick="showAddVersesModal('${entry.id}')" title="تعديل"><i data-lucide="pencil"></i></button>
      <button class="admin-ctrl-btn delete" onclick="deleteEntry('${poetId}','${entry.id}')" title="حذف"><i data-lucide="trash-2"></i></button>
    </div>` : '';

  return `<div class="verses-entry"><div class="museum-verses-display">${linesHtml}</div>${adminCtrl}</div>`;
}

// Accordion toggles
function toggleTextEntry(header) {
  const body=header.nextElementSibling;
  const isOpen=body.classList.contains('open');
  body.classList.toggle('open',!isOpen);
  header.classList.toggle('open',!isOpen);
}

function toggleVerseAnnotation(line) {
  const wrap=line.querySelector('.verse-annotation-wrap');
  if(!wrap)return;
  const isOpen=wrap.classList.contains('open');
  wrap.classList.toggle('open',!isOpen);
  line.classList.toggle('anno-open',!isOpen);
}

function getTextPreview(html) {
  const d=document.createElement('div'); d.innerHTML=html;
  const t=d.textContent.trim();
  return t.length>55?t.substring(0,55)+'...':t||'نص أدبي';
}

// ----- تعليقات الأبيات -----
function setupAnnotationEvents(poetId) {
  if(!isAdmin)return;
  const container=document.getElementById('poet-content-area');
  if(window.innerWidth<=768){
    let lpTimer=null;
    container.querySelectorAll('.museum-verse-line').forEach(line=>{
      line.addEventListener('touchstart',()=>{
        lpTimer=setTimeout(()=>{
          navigator.vibrate&&navigator.vibrate(50);
          showAnnotationModal(poetId,line.dataset.entryId,parseInt(line.dataset.verseIdx));
        },600);
      },{passive:true});
      line.addEventListener('touchend',()=>clearTimeout(lpTimer));
      line.addEventListener('touchmove',()=>clearTimeout(lpTimer));
    });
  }
}

function showAnnotationModal(poetId, entryId, verseIdx) {
  const entry=(museumData[poetId]||[]).find(e=>e.id===entryId);
  if(!entry||!entry.verses)return;
  const verse=entry.verses[verseIdx];
  if(!verse)return;
  annotationCtx={poetId,entryId,verseIdx};
  document.getElementById('annotation-verse-preview').textContent=`${verse.sadr} ... ${verse.ajuz}`;
  document.getElementById('annotation-text').value=verse.annotation||'';
  document.getElementById('delete-annotation-btn').style.display=verse.annotation?'flex':'none';
  openModal('annotation-modal');
  setTimeout(()=>document.getElementById('annotation-text').focus(),100);
}

async function saveAnnotation() {
  if(!annotationCtx)return;
  const {poetId,entryId,verseIdx}=annotationCtx;
  const text=document.getElementById('annotation-text').value.trim();
  try {
    await api.patch(`/museum/${poetId}/${entryId}/verse/${verseIdx}`,{annotation:text});
    await loadPoetData(poetId);
    closeModal('annotation-modal');
    renderPoetContent(poetId);
    annotationCtx=null;
  } catch { alert('خطأ في الحفظ'); }
}

async function deleteAnnotation() {
  if(!annotationCtx)return;
  const{poetId,entryId,verseIdx}=annotationCtx;
  try {
    await api.patch(`/museum/${poetId}/${entryId}/verse/${verseIdx}`,{annotation:''});
    await loadPoetData(poetId);
    closeModal('annotation-modal');
    renderPoetContent(poetId);
    annotationCtx=null;
  } catch { alert('خطأ في الحذف'); }
}

// ----- إضافة محتوى -----
function showAddContentOptions(){openModal('add-options-modal');}

function showAddTextModal(entryId) {
  editingEntryId=entryId;
  document.getElementById('text-modal-title').textContent=entryId?'تعديل النص':'إضافة نص';
  const editor=document.getElementById('text-editor');
  const titleInput=document.getElementById('text-entry-title');
  if(entryId){
    const entry=(museumData[currentPoetId]||[]).find(e=>e.id===entryId);
    titleInput.value=entry?entry.title:'';
    editor.innerHTML=entry?entry.html:'';
  } else { titleInput.value=''; editor.innerHTML=''; }
  openModal('text-modal');
  setTimeout(()=>editor.focus(),100);
}

// ④ تنظيف HTML من ألوان inline قبل الحفظ
function cleanEditorHTML(html) {
  const div=document.createElement('div'); div.innerHTML=html;
  div.querySelectorAll('*').forEach(el=>{
    el.style.removeProperty('color');
    el.style.removeProperty('background-color');
    el.style.removeProperty('background');
    // اختياري: احذف font-family أيضاً إن أردت
  });
  return div.innerHTML;
}

async function publishText() {
  const title=document.getElementById('text-entry-title').value.trim();
  const rawHtml=document.getElementById('text-editor').innerHTML.trim();
  const html=cleanEditorHTML(rawHtml);
  if(!html||html==='<br>'){alert('يرجى إضافة نص');return;}
  const entry={type:'text',title,html,createdAt:Date.now()};
  try {
    if(editingEntryId){
      entry.id=editingEntryId;
      await api.put(`/museum/${currentPoetId}/${editingEntryId}`,entry);
    } else {
      await api.post(`/museum/${currentPoetId}`,entry);
    }
    await loadPoetData(currentPoetId);
    closeModal('text-modal');
    renderPoetContent(currentPoetId);
    editingEntryId=null;
  } catch(e){alert('خطأ في الحفظ: '+e.message);}
}

function showAddVersesModal(entryId) {
  editingEntryId=entryId;
  document.getElementById('verses-modal-title').textContent=entryId?'تعديل الأبيات':'إضافة أبيات';
  if(entryId){
    const entry=(museumData[currentPoetId]||[]).find(e=>e.id===entryId);
    museumModalVerses=entry?entry.verses.map(v=>[v.sadr,v.ajuz]):[['','']];
  } else { museumModalVerses=[['','']]; }
  renderMuseumVersesInput();
  openModal('verses-modal');
}

function renderMuseumVersesInput() {
  const c=document.getElementById('museum-verses-container'); c.innerHTML='';
  museumModalVerses.forEach((v,i)=>{
    const row=document.createElement('div'); row.className='museum-verse-input-row';
    row.innerHTML=`
      <span class="verse-num-label">${String(i+1).padStart(2,'0')}</span>
      <input type="text" value="${escHtml(v[0])}" placeholder="صدر البيت ${i+1}" class="modal-verse-input" data-r="${i}" data-c="0" dir="rtl">
      <input type="text" value="${escHtml(v[1])}" placeholder="عجز البيت ${i+1}" class="modal-verse-input" data-r="${i}" data-c="1" dir="rtl">
      ${museumModalVerses.length>1?`<button class="verse-del-btn" onclick="removeMuseumVerse(${i})">✕</button>`:''}`;
    c.appendChild(row);
  });
  c.querySelectorAll('.modal-verse-input').forEach(inp=>{
    inp.addEventListener('input',e=>{
      museumModalVerses[parseInt(e.target.dataset.r)][parseInt(e.target.dataset.c)]=e.target.value;
    });
  });
}

function addMuseumVersePair(){museumModalVerses.push(['','']);renderMuseumVersesInput();}
function removeMuseumVerse(i){museumModalVerses.splice(i,1);renderMuseumVersesInput();}

async function publishVerses() {
  const valid=museumModalVerses.filter(v=>v[0].trim()||v[1].trim());
  if(!valid.length){alert('يرجى إضافة بيت واحد على الأقل');return;}
  const entry={type:'verses',verses:valid.map(v=>({sadr:v[0],ajuz:v[1],annotation:''})),createdAt:Date.now()};
  try {
    if(editingEntryId){
      // حافظ على التعليقات الموجودة
      const existing=(museumData[currentPoetId]||[]).find(e=>e.id===editingEntryId);
      entry.verses=valid.map((v,i)=>({sadr:v[0],ajuz:v[1],annotation:(existing?.verses[i]?.annotation)||''}));
      entry.id=editingEntryId;
      await api.put(`/museum/${currentPoetId}/${editingEntryId}`,entry);
    } else {
      await api.post(`/museum/${currentPoetId}`,entry);
    }
    await loadPoetData(currentPoetId);
    closeModal('verses-modal');
    renderPoetContent(currentPoetId);
    editingEntryId=null;
  } catch(e){alert('خطأ في الحفظ: '+e.message);}
}

async function deleteEntry(poetId, entryId) {
  if(!confirm('هل أنت متأكد من حذف هذا المحتوى؟'))return;
  try {
    await api.delete(`/museum/${poetId}/${entryId}`);
    await loadPoetData(poetId);
    renderPoetContent(poetId);
  } catch(e){alert('خطأ في الحذف: '+e.message);}
}

// ----- محرر النص -----
function execFmt(cmd){document.execCommand(cmd,false,null);document.getElementById('text-editor').focus();}
function execBlk(tag){document.execCommand('formatBlock',false,tag);document.getElementById('text-editor').focus();}
function applySpanStyle(cls) {
  const editor=document.getElementById('text-editor');if(!editor)return;
  const sel=window.getSelection();if(!sel.rangeCount)return;
  const range=sel.getRangeAt(0);if(range.collapsed)return;
  const span=document.createElement('span');span.className=cls;
  try{range.surroundContents(span);}catch{const f=range.extractContents();span.appendChild(f);range.insertNode(span);}
  editor.focus();
}

// مساعد
function escHtml(str){return(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// =============================================
// التهيئة
// =============================================
document.addEventListener('DOMContentLoaded', async ()=>{
  // ① التحقق من الجلسة المحفوظة
  await verifyStoredToken();
await loadUserFromStorage();
streakData = loadUserData('streakData', { count: 0, lastActiveDate: null });

// migration/تطبيق التقدم المحلي: هذا فقط للزوار (غير المسجلين).
// ✅ للمستخدم المسجّل: loadUserFromStorage() طبّقت أعلاه التقدم الصحيح القادم من السيرفر بالفعل،
//    وإعادة قراءته من localStorage هنا (وقد يكون فارغاً/قديماً على جهاز جديد) كانت تمحو ذلك التقدم
//    وتُظهر العُقد "مقفولة" حتى تُصحَّح لاحقاً — لذلك نتخطى هذه الخطوة كلياً لهم.
if (!userToken) {
  // migration: إذا لم يكن nodeProgress موجوداً بعد، اقرأ التقدم القديم من practiceNodes_v4
  let savedProg = loadUserData('nodeProgress', null);
  if (!savedProg) {
    const oldNodes = JSON.parse(localStorage.getItem('practiceNodes_v4') || '[]');
    savedProg = {};
    oldNodes.forEach(n => {
      if (n.status && n.status !== 'locked') {
        savedProg[String(n.id)] = {
          status: n.status,
          currentLevelIndex: n.currentLevelIndex || 0
        };
      }
    });
    // احفظ التقدم المُهاجَر فوراً
    saveUserData('nodeProgress', savedProg);
  }
  practiceNodes = practiceNodes.map(n => {
    const p = savedProg[String(n.id)];
    return { ...n, status: p?.status ?? 'locked', currentLevelIndex: p?.currentLevelIndex ?? 0 };
  });
}
const hasProg = practiceNodes.some(n => n.status !== 'locked');
if (!hasProg && practiceNodes.length > 0) practiceNodes[0].status = 'current';
await initHearts();
await loadPracticeFromServer();
if (userToken) await loadProgressFromServer();
   
  loadVerses();

  // إشعار استرجاع الأبيات
  if(verses.some(v=>v.trim())){
    const n=document.createElement('div');
    n.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--color-text);color:var(--color-bg);padding:10px 20px;border-radius:8px;font-size:0.8rem;font-family:var(--font-sans);z-index:999;opacity:0;transition:opacity 0.3s;pointer-events:none;';
    n.textContent='تم استرجاع أبياتك المحفوظة ✓';
    document.body.appendChild(n);
    requestAnimationFrame(()=>{n.style.opacity='1';setTimeout(()=>{n.style.opacity='0';setTimeout(()=>n.remove(),300);},3000);});
  }

  const testsData=[
    {id:'complete',title:'أكمل الفراغ', desc:'اختبر حصيلتك من أبيات الشعر الخالدة.',  icon:'quote',     badge:'سهل',   badgeClass:''},
    {id:'meter',   title:'فراسة البحور',desc:'هل تستطيع تمييز البحر من نظرة واحدة؟',  icon:'target',    badge:'متوسط', badgeClass:'purple'},
    {id:'poet',    title:'من القائل',   desc:'أعد كل بيت مجيد إلى قائله الأصيل.',     icon:'feather',   badge:'متوسط', badgeClass:'blue'},
    {id:'rhetoric',title:'أسرار البلاغة',desc:'سبر أغوار الجمال البياني في لغة الضاد.',icon:'book-open', badge:'صعب',   badgeClass:'gold'}
  ];
  const grid=document.getElementById('tests-grid');
  if(grid){
    testsData.forEach(item=>{
      const el=document.createElement('div');el.className='challenge-item';
      el.innerHTML=`<div class="challenge-visual ${item.badgeClass}"><i data-lucide="${item.icon}"></i></div><div class="challenge-details"><span class="badge ${item.badgeClass}">${item.badge}</span><h3>${item.title}</h3><p>${item.desc}</p><button class="btn-primary btn-sm">ابدأ التحدي الآن</button></div>`;
      el.addEventListener('click',()=>startQuiz(item.id));
      grid.appendChild(el);
    });
  }

  // تعريض الدوال عالمياً
  window.showSection=showSection; window.startQuiz=startQuiz;
  window.fillSample=fillSample;   window.clearVerses=clearVerses;
  window.closeModal=closeModal;   window.handleModalBackdrop=handleModalBackdrop;
  window.openModal=openModal;     window.tryAdminLogin=tryAdminLogin;
  window.adminLogout=adminLogout; window.showAddContentOptions=showAddContentOptions;
  window.showAddTextModal=showAddTextModal; window.publishText=publishText;
  window.showAddVersesModal=showAddVersesModal; window.publishVerses=publishVerses;
  window.deleteEntry=deleteEntry; window.addMuseumVersePair=addMuseumVersePair;
  window.removeMuseumVerse=removeMuseumVerse; window.saveAnnotation=saveAnnotation;
  window.deleteAnnotation=deleteAnnotation; window.execFmt=execFmt;
  window.execBlk=execBlk; window.applySpanStyle=applySpanStyle;
  window.toggleTextEntry=toggleTextEntry; window.toggleVerseAnnotation=toggleVerseAnnotation;
  window.showAnnotationModal=showAnnotationModal;
  window.openUnitSelector=openUnitSelector; window.addNewUnit=addNewUnit; window.selectUnit=selectUnit;
  window.openAdminAddPracticeNode=openAdminAddPracticeNode; window.addNodeLevel=addNodeLevel; window.addQuestionToLevel=addQuestionToLevel; window.editCurrentNode=editCurrentNode; window.deleteCurrentNode=deleteCurrentNode;
  window.savePracticeNode=savePracticeNode;
  window.openHeartsModal      = openHeartsModal;
  window.redeemPromoCode      = redeemPromoCode;
  window.openAdminPromosModal = openAdminPromosModal;
  window.adminCreatePromoCode = adminCreatePromoCode;
  window.adminTogglePromo     = adminTogglePromo;
  window.adminDeletePromo     = adminDeletePromo;

  // تفاعل الأصوات للنقرات محصور حصرياً بصفحة تمرّن والدرس وشاشاتها
  document.addEventListener('click', (e) => {
    const inPracticeZone = e.target.closest('#practice-section, #lesson-section, #node-achievement-modal, #unit-selector-modal, #add-practice-node-modal, #streak-celebration-modal, .tooltip-card');
    if (!inPracticeZone) return;

    const btn = e.target.closest('button, .nav-btn, .btn-primary, .btn-secondary, .theme-btn, .unit-banner, .modal-close, .admin-btn-accent, .tt-action-btn, .choice-btn, .match-card, .word-btn, .mcq-btn, .choice-chip-btn');
    if (btn && soundFX) {
      soundFX.tap();
    }
  });

  if(window.lucide)lucide.createIcons();
});
