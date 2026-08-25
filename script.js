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
// ① API — كل الطلبات تمر من هنا
// =============================================
let authToken = sessionStorage.getItem('adminToken') || null;
let isAdmin   = false;

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
let streakData = JSON.parse(localStorage.getItem('streakData')) || { count: 0, lastActiveDate: null };
let practiceUnits = JSON.parse(localStorage.getItem('practiceUnits')) || [
  { id: 1, title: 'القسم 1: مقدمة في البلاغة', desc: 'فهم الأقسام الرئيسية لعلم البلاغة', color: '#22c55e' }
];
let currentUnitId = practiceUnits[0].id;

const defaultQuestions = [
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
    type: 'mcq',
    text: 'ما نوع التشبيه في: "العلم كالنور في الهداية"؟',
    options: ['تشبيه مفصل', 'تشبيه مجمل', 'تشبيه بليغ', 'استعارة تصريحية'],
    correct: 0
  },
  {
    type: 'translate',
    text: 'العلم يرفع بيتاً لا عماد له',
    words: ['العلم', 'يرفع', 'بيتاً', 'لا', 'عماد', 'له', 'والجهل', 'يهدم'],
    correct: ['العلم', 'يرفع', 'بيتاً', 'لا', 'عماد', 'له']
  }
];

let practiceNodes = JSON.parse(localStorage.getItem('practiceNodes')) || [
  {
    id: 1,
    unitId: 1,
    type: 'lesson',
    status: 'completed',
    title: 'مقدمة البلاغة',
    desc: 'أساسيات البلاغة والتذوق',
    actionText: 'ابدأ +15 XP',
    levels: [
      { id: 1, title: 'المستوى 1', questions: defaultQuestions.slice(0, 3) },
      { id: 2, title: 'المستوى 2', questions: defaultQuestions.slice(3) }
    ]
  },
  {
    id: 2,
    unitId: 1,
    type: 'lesson',
    status: 'current',
    title: 'أركان التشبيه',
    desc: 'المشبه والمشبه به وأداة التشبيه',
    actionText: 'ابدأ التحدي +20 XP',
    currentLevelIndex: 0,
    levels: [
      { id: 1, title: 'المستوى 1', questions: [defaultQuestions[0], defaultQuestions[1], defaultQuestions[4]] },
      { id: 2, title: 'المستوى 2', questions: [defaultQuestions[2], defaultQuestions[3], defaultQuestions[5]] }
    ]
  },
  { id: 3, unitId: 1, type: 'review', status: 'locked', title: 'مراجعة التشبيه', desc: 'تثبيت المفاهيم السابقة', actionText: 'مراجعة +10 XP', levels: [{ id: 1, title: 'المستوى 1', questions: defaultQuestions }] },
  { id: 4, unitId: 1, type: 'challenge', status: 'locked', title: 'تحدي الفرسان', desc: 'اختبار السرعة والدقة', actionText: 'خوض التحدي', levels: [{ id: 1, title: 'المستوى 1', questions: defaultQuestions }] },
  { id: 5, unitId: 1, type: 'lesson', status: 'locked', title: 'الاستعارة', desc: 'الاستعارة المكنية والتصريحية', actionText: 'ابدأ +15 XP', levels: [{ id: 1, title: 'المستوى 1', questions: defaultQuestions }] },
  { id: 6, unitId: 1, type: 'lesson', status: 'locked', title: 'الكناية', desc: 'أنواع الكناية وأسرارها', actionText: 'ابدأ +15 XP', levels: [{ id: 1, title: 'المستوى 1', questions: defaultQuestions }] }
];

function savePracticeData() {
  localStorage.setItem('practiceUnits', JSON.stringify(practiceUnits));
  localStorage.setItem('practiceNodes', JSON.stringify(practiceNodes));
  localStorage.setItem('streakData', JSON.stringify(streakData));
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

function renderPracticePath() {
  const container = document.getElementById('path-container');
  if (!container) return;
  container.innerHTML = '';
  
  const adminBtn = document.getElementById('admin-add-practice-btn');
  if (adminBtn) adminBtn.style.display = isAdmin ? 'block' : 'none';
  
  practiceUnits.forEach((unit, unitIdx) => {
    // Render Unit Banner
    const banner = document.createElement('div');
    banner.className = 'unit-banner';
    banner.style.marginTop = unitIdx > 0 ? '60px' : '20px';
    if (unit.color) banner.style.backgroundColor = unit.color;
    banner.innerHTML = `
        <div class="unit-banner-content">
            <h2 class="unit-title">${unit.title}</h2>
            <p class="unit-desc">${unit.desc}</p>
        </div>
        <div class="unit-banner-icon">
            <i data-lucide="book"></i>
        </div>
    `;
    banner.onclick = openUnitSelector;
    banner.style.cursor = 'pointer';
    container.appendChild(banner);

    const nodesWrapper = document.createElement('div');
    nodesWrapper.style.position = 'relative';
    nodesWrapper.style.width = '100%';
    nodesWrapper.style.display = 'flex';
    nodesWrapper.style.flexDirection = 'column';
    nodesWrapper.style.alignItems = 'center';
    nodesWrapper.style.gap = '40px';
    nodesWrapper.style.padding = '40px 0';
    
    const unitNodes = practiceNodes.filter(n => n.unitId === unit.id);
    const svgStr = [];
    
    // فرض تسلسل منطقي (عقدة واحدة حالية فقط وما بعدها مقفل)
    let hasFoundCurrent = false;
    unitNodes.forEach((n) => {
      if (!hasFoundCurrent) {
        if (n.status !== 'completed') {
          n.status = 'current';
          hasFoundCurrent = true;
        }
      } else {
        n.status = 'locked';
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

      const ringHtml = (statusClass === "status-active") && totalLevels > 0 ? renderProgressRingSVG(ringConfig) : "";
      const badgeHtml = statusClass === "status-active" ? `<div class="start-badge">ابدأ</div>` : "";

      let icon = node.icon;
      if (!icon) {
          icon = 'star';
          if (node.type === 'lesson') icon = 'book-open';
          if (node.type === 'review') icon = 'refresh-cw';
          if (node.type === 'challenge') icon = 'zap';
          if (node.status === 'completed') icon = 'check';
      }

      let tooltipThemeClass = statusClass === 'status-active' ? 'theme-active' : (statusClass === 'status-complete' ? 'theme-complete' : 'theme-locked');
      
      let totalLevelsStr = totalLevels > 0 ? `الدرس ${completedLevels} من ${totalLevels}` : 'درس';
      if (node.status === 'completed') totalLevelsStr = 'مكتمل';

      let startBtnText = node.actionText || 'ابدأ +15 XP';
      let actionsHtml = '';
      if (node.status === 'completed') {
        actionsHtml = `
          <button type="button" class="tt-action-btn tt-review" onclick="startLesson('review', ${node.id})">
            <span>مراجعة +5 XP</span> <i data-lucide="refresh-cw" style="width:16px;height:16px;"></i>
          </button>
          <button type="button" class="tt-action-btn" onclick="startLesson('start', ${node.id})">
            <span>${node.actionText || 'إعادة +15 XP'}</span> <i data-lucide="play" style="width:16px;height:16px;"></i>
          </button>
        `;
      } else if (node.status === 'current') {
        actionsHtml = `
          <button type="button" class="tt-action-btn" onclick="startLesson('start', ${node.id})">
            <span>${startBtnText}</span> <i data-lucide="play" style="width:16px;height:16px;"></i>
          </button>
        `;
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
  
  if (window.lucide) if(window.lucide)lucide.createIcons();
}

// === Unit Selector ===
function openUnitSelector() {
  const container = document.getElementById('unit-list-container');
  container.innerHTML = practiceUnits.map(u => `
    <div style="padding: 15px; border: 1px solid var(--color-border); border-radius: 12px; cursor: pointer; display: flex; align-items:center; justify-content:space-between; ${u.id === currentUnitId ? 'border-color: var(--color-accent); background: var(--color-surface);' : ''}" onclick="selectUnit(${u.id})">
      <div style="flex: 1;">
        <h4 style="margin-bottom: 5px; color: ${u.id === currentUnitId ? 'var(--color-accent)' : 'inherit'}">${u.title}</h4>
        <p style="font-size: 0.85rem; color: var(--color-muted);">${u.desc}</p>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        ${isAdmin ? `<button class="btn-secondary btn-sm danger" style="padding: 5px; color: #e11d48; border-color: #e11d48;" onclick="event.stopPropagation(); deleteUnit(${u.id})"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>` : ''}
        ${u.id === currentUnitId ? '<i data-lucide="check" style="color: var(--color-accent)"></i>' : ''}
      </div>
    </div>
  `).join('');
  
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
  practiceUnits.push({ id: newId, title, desc, color });
  savePracticeData();
  
  document.getElementById('new-unit-title').value = '';
  document.getElementById('new-unit-desc').value = '';
  document.getElementById('new-unit-color').value = '#22c55e';
  
  selectUnit(newId);
}

// === Admin Practice Node Management ===

let editingNodeId = null;

function openAdminAddPracticeNode() {
  try {

  editingNodeId = null;
  document.getElementById('node-modal-title').textContent = 'إضافة عقدة جديدة';
  document.getElementById('new-node-title').value = '';
  document.getElementById('new-node-desc').value = '';
  document.getElementById('new-node-icon').value = '';
  document.getElementById('new-node-action-text').value = '';
  document.getElementById('new-node-type').value = 'lesson';
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
  document.getElementById('new-node-icon').value = node.icon || '';
  document.getElementById('new-node-action-text').value = node.actionText || '';
  document.getElementById('new-node-type').value = node.type || 'lesson';
  
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
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'fill_blank_text')">+ فراغ (كتابة)</button>
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'fill_blank_choice')">+ فراغ (اختيارات)</button>
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
      <input type="text" class="modal-input q-title" placeholder="مثال: أركان التشبيه" value="${qData.title || ''}" style="margin-bottom:10px;">
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">نص الشرح (يمكنك استخدام أسطر جديدة):</label>
      <textarea class="modal-textarea q-text" rows="3" placeholder="اكتب الشرح والمعلومات هنا..." style="margin-bottom:10px;">${qData.text || ''}</textarea>
      
      <label style="font-size: 0.85rem; font-weight: 700; display:block; margin-bottom:4px;">إعدادات الصوت (اختياري):</label>
      <div style="font-size: 0.75rem; color: var(--color-muted); margin-bottom: 8px;">
        * يمكنك لصق رابط مباشر لملف MP3. <br>
        * لحذف الصوت أو عدم استخدامه، اترك هذا الحقل فارغاً (سيتم الاعتماد على النطق الآلي إذا لزم الأمر).
      </div>
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
  }
  
  wrapper.innerHTML = html;
  setTimeout(() => {
    if (window.lucide) if(window.lucide)lucide.createIcons();
  }, 10);
  return wrapper;
}

function savePracticeNode() {
  const title = document.getElementById('new-node-title').value.trim();
  const desc = document.getElementById('new-node-desc').value.trim();
  const type = document.getElementById('new-node-type').value;
  const icon = document.getElementById('new-node-icon').value.trim();
  const actionText = document.getElementById('new-node-action-text').value.trim();
  
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
        if (text || titleQ) questions.push({ type: 'info_card', title: titleQ || 'معلومة', text, audioUrl, note: 'اقرأ البطاقة أو استمع للشرح ثم اضغط مفهوم' });
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
      node.title = title;
      node.desc = desc;
      node.type = type;
      node.levels = levels;
      node.icon = icon;
      node.actionText = actionText;
      delete node.questions;
    }
  } else {
    const newId = practiceNodes.length > 0 ? Math.max(...practiceNodes.map(n=>n.id)) + 1 : 1;
    practiceNodes.push({
      id: newId,
      unitId: currentUnitId,
      type: type,
      status: practiceNodes.filter(n=>n.unitId===currentUnitId).length === 0 ? 'current' : 'locked',
      title,
      desc,
      icon,
      actionText,
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
    document.querySelectorAll('.tooltip-card.visible').forEach(card => {
        card.classList.remove('visible');
        card.classList.add('hidden');
        const nodeEl = card.closest('.tile-node');
        if (nodeEl) nodeEl.style.zIndex = '2';
    });
};

document.addEventListener('click', () => {
    if (typeof closeAllTooltips === 'function') closeAllTooltips();
});

function closeNodePopup() {
    if (typeof closeAllTooltips === 'function') closeAllTooltips();
}

window.editNode = function(nodeId) {
    currentNodeId = nodeId;
    editCurrentNode();
};

window.deleteNode = function(nodeId) {
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
let selectedMatchColA = null; // For match
let selectedMatchColB = null;
let matchedPairIndices = [];
let shuffledMatchLeft = [];
let shuffledMatchRight = [];
let fillBlankInputText = ''; // For fill_blank_text
let fillBlankSelectedChoice = null; // For fill_blank_choice
let cardAudioPlaying = false;
let currentCardAudio = null;

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

function startLesson(mode, nodeId = null) {
  if (nodeId) currentNodeId = nodeId;
  if (typeof closeAllTooltips === 'function') closeAllTooltips();
  
  const node = practiceNodes.find(n => n.id === currentNodeId);
  currentLessonQuestions = [];
  nodeStartTime = Date.now();
  nodeSessionMistakes = [];
  isMistakesReviewMode = false;
  totalQuestionsAttempted = 0;
  totalQuestionsCorrectFirstTry = 0;
  
  const badge = document.getElementById('mistakes-review-badge');
  if (badge) badge.style.display = 'none';
  
  if (node) {
    if (!node.levels || node.levels.length === 0) {
      node.levels = [{ id: 1, title: 'المستوى 1', questions: defaultQuestions }];
    }
    activeNodeLevelCount = node.levels.length;
    if (typeof node.currentLevelIndex === 'undefined') node.currentLevelIndex = 0;
    
    if (mode === 'review') {
      let allQs = [];
      node.levels.forEach(l => { if(l.questions) allQs.push(...l.questions); });
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
  matchedPairIndices = [];
  fillBlankInputText = '';
  fillBlankSelectedChoice = null;
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
        ${(q.words || []).map((w) => `<button class="word-btn" onclick="selectWord('${w.replace(/'/g, "\\'")}', this)">${w}</button>`).join('')}
      </div>
    `;
  } else if (q.type === 'mcq') {
    html = `
      <h2 class="question-title">${q.text}</h2>
      <div class="mcq-options">
        ${(q.options || []).map((opt, i) => `<button class="mcq-btn" onclick="selectOption(${i}, this)">${opt}</button>`).join('')}
      </div>
    `;
  } else if (q.type === 'match') {
    // Prepare pairs
    const pairs = q.pairs || [];
    shuffledMatchLeft = pairs.map((p, idx) => ({ id: idx, text: p.left })).sort(() => 0.5 - Math.random());
    shuffledMatchRight = pairs.map((p, idx) => ({ id: idx, text: p.right })).sort(() => 0.5 - Math.random());
    
    html = `
      <h2 class="question-title">${q.title || 'صل بين الكلمات وما يناسبها'}</h2>
      <div class="match-container" id="match-container">
        <div class="match-col" id="match-col-a">
          ${shuffledMatchLeft.map((item) => `
            <div class="match-card" data-col="left" data-id="${item.id}" onclick="selectMatchCard('left', ${item.id}, this)">
              ${item.text}
            </div>
          `).join('')}
        </div>
        <div class="match-col" id="match-col-b">
          ${shuffledMatchRight.map((item) => `
            <div class="match-card" data-col="right" data-id="${item.id}" onclick="selectMatchCard('right', ${item.id}, this)">
              ${item.text}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (q.type === 'info_card') {
    btnCheck.textContent = 'مفهوم';
    btnCheck.className = 'btn-check active';
    
    const formattedText = (q.text || '').replace(/\n/g, '<br>');
    html = `
      <div class="info-card-box">
        <div class="info-card-badge"><i data-lucide="book-open"></i> بطاقة معرفية</div>
        <h2 class="info-card-title">${q.title || 'شرح وتوضيح'}</h2>
        <div class="info-card-body">${formattedText}</div>
        <div class="info-card-audio-bar">
          <span style="font-size: 0.9rem; font-weight: 700; color: var(--color-muted);">${q.note || 'استمع للشرح أو اقرأ البطاقة'}</span>
          <button type="button" class="audio-play-btn" id="card-audio-btn" onclick="toggleCardAudio()">
            <i data-lucide="volume-2" id="card-audio-icon"></i>
            <span id="card-audio-label">استمع</span>
          </button>
        </div>
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
  }
  
  area.innerHTML = html;
  if (window.lucide) if(window.lucide)lucide.createIcons();
}

// 1. Translate (Reorder)
window.selectWord = function(word, btnEl) {
  userAnswers.push(word);
  btnEl.classList.add('selected');
  renderAnswerArea();
  checkIfReady();
};

window.removeWord = function(index) {
  const word = userAnswers.splice(index, 1)[0];
  renderAnswerArea();
  const btns = document.querySelectorAll('.word-btn');
  btns.forEach(btn => {
    if (btn.textContent === word && btn.classList.contains('selected')) {
      btn.classList.remove('selected');
    }
  });
  checkIfReady();
};

function renderAnswerArea() {
  const area = document.getElementById('answer-area');
  if(!area) return;
  area.innerHTML = userAnswers.map((w, i) => `
    <button class="word-btn" onclick="removeWord(${i})" data-index="${i}">${w}</button>
  `).join('');

  if (window.Sortable && area) {
    if (area.sortableInstance) {
      area.sortableInstance.destroy();
    }
    area.sortableInstance = new Sortable(area, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: function (evt) {
        const oldIndex = evt.oldIndex;
        const newIndex = evt.newIndex;
        if (oldIndex !== newIndex) {
          const movedWord = userAnswers.splice(oldIndex, 1)[0];
          userAnswers.splice(newIndex, 0, movedWord);
          renderAnswerArea();
          checkIfReady();
        }
      },
    });
  }
}

// 2. MCQ
window.selectOption = function(index, btnEl) {
  selectedOption = index;
  const btns = document.querySelectorAll('.mcq-btn');
  btns.forEach(b => b.classList.remove('selected'));
  btnEl.classList.add('selected');
  checkIfReady();
};

// 3. Match Pairs
window.selectMatchCard = function(col, id, cardEl) {
  if (cardEl.classList.contains('matched')) return;
  
  if (col === 'left') {
    document.querySelectorAll('#match-col-a .match-card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');
    selectedMatchColA = { id, el: cardEl };
  } else {
    document.querySelectorAll('#match-col-b .match-card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');
    selectedMatchColB = { id, el: cardEl };
  }
  
  // If both selected, verify pair
  if (selectedMatchColA && selectedMatchColB) {
    const isPair = selectedMatchColA.id === selectedMatchColB.id;
    const elA = selectedMatchColA.el;
    const elB = selectedMatchColB.el;
    
    if (isPair) {
      elA.classList.remove('selected');
      elB.classList.remove('selected');
      elA.classList.add('matched');
      elB.classList.add('matched');
      matchedPairIndices.push(selectedMatchColA.id);
      selectedMatchColA = null;
      selectedMatchColB = null;
      
      const q = currentLessonQuestions[currentQuestionIndex];
      if (matchedPairIndices.length === (q.pairs || []).length) {
        document.getElementById('btn-check-answer').classList.add('active');
        // Auto trigger victory feedback after brief pause
        setTimeout(() => {
          checkAnswer();
        }, 300);
      }
    } else {
      elA.classList.add('shake-error');
      elB.classList.add('shake-error');
      setTimeout(() => {
        elA.classList.remove('selected', 'shake-error');
        elB.classList.remove('selected', 'shake-error');
        selectedMatchColA = null;
        selectedMatchColB = null;
      }, 500);
    }
  }
};

// 4. Info Card Audio
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
      speakCardText(q.title + '. ' + q.text);
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
  fillBlankSelectedChoice = null;
  const slot = document.getElementById('blank-slot-choice');
  if (slot) {
    slot.textContent = '[ اضغط لاختيار ]';
    slot.classList.remove('filled');
  }
  document.querySelectorAll('.choice-chip-btn').forEach(c => c.classList.remove('used'));
  checkIfReady();
};

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
    if (matchedPairIndices.length === (q.pairs || []).length) btn.classList.add('active');
    else btn.classList.remove('active');
  } else if (q.type === 'info_card') {
    btn.classList.add('active');
  } else if (q.type === 'fill_blank_text') {
    if (fillBlankInputText.trim().length > 0) btn.classList.add('active');
    else btn.classList.remove('active');
  } else if (q.type === 'fill_blank_choice') {
    if (fillBlankSelectedChoice !== null) btn.classList.add('active');
    else btn.classList.remove('active');
  }
}

window.checkAnswer = function() {
  const btn = document.getElementById('btn-check-answer');
  if (!btn.classList.contains('active')) return;
  
  const q = currentLessonQuestions[currentQuestionIndex];
  
  // Info card always succeeds without testing
  if (q.type === 'info_card') {
    nextQuestion();
    return;
  }
  
  totalQuestionsAttempted++;
  let isCorrect = false;
  
  if (q.type === 'translate') {
    isCorrect = JSON.stringify(userAnswers) === JSON.stringify(q.correct);
  } else if (q.type === 'mcq') {
    isCorrect = selectedOption === q.correct;
  } else if (q.type === 'match') {
    isCorrect = matchedPairIndices.length === (q.pairs || []).length;
  } else if (q.type === 'fill_blank_text') {
    const userNorm = normalizeArabic(fillBlankInputText);
    const accepted = Array.isArray(q.correct) ? q.correct : [q.correct];
    isCorrect = accepted.some(ans => normalizeArabic(ans) === userNorm);
  } else if (q.type === 'fill_blank_choice') {
    isCorrect = normalizeArabic(fillBlankSelectedChoice) === normalizeArabic(q.correct);
  }
  
  const feedback = document.getElementById('lesson-feedback-bar');
  const icon = document.getElementById('feedback-icon');
  const title = document.getElementById('feedback-title');
  const desc = document.getElementById('feedback-desc');
  
  if (isCorrect) {
    totalQuestionsCorrectFirstTry++;
    feedback.className = 'lesson-feedback-bar show success';
    icon.innerHTML = '<i data-lucide="check"></i>';
    title.textContent = 'رائع جداً!';
    desc.textContent = 'إجابة صحيحة وممتازة';
  } else {
    // Record mistake for end-of-node review
    if (!nodeSessionMistakes.some(m => m === q)) {
      nodeSessionMistakes.push(q);
    }
    
    feedback.className = 'lesson-feedback-bar show error';
    icon.innerHTML = '<i data-lucide="x"></i>';
    title.textContent = 'إجابة خاطئة';
    
    if (q.type === 'translate') desc.textContent = `الصحيح: ${q.correct.join(' ')}`;
    else if (q.type === 'mcq') desc.textContent = `الصحيح: ${q.options[q.correct]}`;
    else if (q.type === 'fill_blank_text') desc.textContent = `الصحيح: ${Array.isArray(q.correct) ? q.correct[0] : q.correct}`;
    else if (q.type === 'fill_blank_choice') desc.textContent = `الصحيح: ${q.correct}`;
    else desc.textContent = 'حاول التركيز مرة أخرى';
    
    // Reduce heart count
    const hc = document.getElementById('lesson-heart-count');
    if (hc) {
      let h = parseInt(hc.textContent);
      if (h > 0) hc.textContent = h - 1;
    }
  }
  if (window.lucide) if(window.lucide)lucide.createIcons();
};

window.nextQuestion = function() {
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
      // Completed reviewing mistakes!
      isMistakesReviewMode = false;
      showNodeAchievements(node);
      return;
    }
    
    node.currentLevelIndex++;
    
    if (node.currentLevelIndex < node.levels.length) {
      // Prompt or continue next level
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
        showNodeAchievements(node);
      }
    }
  }, 400);
}

function showNodeAchievements(node) {
  const durationSec = Math.max(1, Math.floor((Date.now() - nodeStartTime) / 1000));
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const timeFormatted = mins > 0 ? `${mins} دقيقة و ${secs} ثانية` : `${secs} ثوانٍ`;
  
  const xpEarned = Math.max(15, (node.levels?.length || 1) * 15);
  const accuracyPct = Math.min(100, Math.round((totalQuestionsCorrectFirstTry / Math.max(1, totalQuestionsAttempted)) * 100));
  
  document.getElementById('achieve-time-val').textContent = timeFormatted;
  document.getElementById('achieve-xp-val').textContent = `+${xpEarned} XP`;
  document.getElementById('achieve-accuracy-val').textContent = `${accuracyPct}%`;
  document.getElementById('achieve-levels-val').textContent = `${node.levels?.length || 1} / ${node.levels?.length || 1}`;
  document.getElementById('achievement-node-title').textContent = `أكملت عقدة "${node.title}" بنجاح وتألقت في أدب العرب!`;
  
  node.status = 'completed';
  const nodeIndex = practiceNodes.findIndex(n => n.id === node.id);
  if (nodeIndex !== -1 && nodeIndex + 1 < practiceNodes.length) {
    if (practiceNodes[nodeIndex + 1].status === 'locked') {
      practiceNodes[nodeIndex + 1].status = 'current';
    }
  }
  
  activateStreak();
  savePracticeData();
  renderPracticePath();
  
  openModal('node-achievement-modal');
  if (window.lucide) if(window.lucide)lucide.createIcons();
}

window.finishNodeAchievement = function() {
  closeModal('node-achievement-modal');
  showSection('practice');
};

// Update showSection to handle practice path rendering
const ALL_SECTIONS = ['home','tests','quiz','arud','museum','museum-poet', 'practice', 'lesson'];

function showSection(id) {
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
  if(sel===correct) score++;
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
function openModal(id){const m=document.getElementById(id);if(m){m.style.display='flex';if(window.lucide)lucide.createIcons();}}
function closeModal(id){const m=document.getElementById(id);if(m)m.style.display='none';}
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
    if(currentPoetId){document.getElementById('admin-add-btn-area').style.display='flex';renderPoetContent(currentPoetId);}
    if(document.getElementById('admin-add-practice-btn')) document.getElementById('admin-add-practice-btn').style.display = 'block';
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

  if(window.lucide)lucide.createIcons();
});
