/* =============================================
   script.js
   ============================================= */

const QUIZZES = {
  complete: [
    { question: "الخيلُ والليلُ والبيداءُ تعرفُني... والرمحُ والقرطاسُ و____", options: ["السيفُ","القلمُ","الكتابُ","الحبرُ"], correct: 1 },
    { question: "وما حبُّ الديارِ شغفنَ قلبي... ولكن حبُّ من ____", options: ["بنى الديارا","سكنَ الديارا","هجرَ الديارا","زارَ الديارا"], correct: 1 }
  ],
  meter: [
    { question: "ما البحر الذي وزنه: فعولن مفاعيلن فعولن مفاعلن؟", options: ["الطويل","الكامل","البسيط","الوافر"], correct: 0 },
    { question: "على أي بحر نظم الشوقي نهج البردة؟", options: ["البسيط","الخفيف","الوافر","الكامل"], correct: 1 }
  ],
  poet: [
    { question: "من القائل: نَقِّل فُؤادَكَ حَيثُ شِئتَ مِنَ الهَوى... ما الحُبُّ إِلّا لِلحَبيبِ الأَوَّلِ؟", options: ["المتنبي","أبو تمام","بشار بن برد","البحتري"], correct: 1 },
    { question: "من الملقب بـ شاعر النيل؟", options: ["أحمد شوقي","حافظ إبراهيم","إيليا أبو ماضي","خليل مطران"], correct: 1 }
  ],
  rhetoric: [
    { question: "ما نوع التشبيه في: 'العمر مثل الضيف'؟", options: ["بليغ","مجمل","مرسل","مؤكد"], correct: 2 },
    { question: "ما الغرض من الاستفهام في قوله تعالى: 'أليس الله بأحكم الحاكمين'؟", options: ["التقرير","التعجب","النفي","التمني"], correct: 0 }
  ]
};

const SAMPLE_VERSES = [
  "قِفَا نَبْكِ مِنْ ذِكْرَى حَبِيبٍ ومَنْزِلِ",
  "بِسِقْطِ اللِّوَى بَيْنَ الدَّخُولِ فَحَوْمَلِ",
  "إِذَا الشعبُ يوماً أرادَ الحياةَ",
  "فلا بدَّ أنْ يستجيبَ القدرْ"
];

// =============================================
// API
// =============================================
async function analyzeVerses(text) {
  if (!text || !text.trim()) return { phonetic: "", symbols: "", meter: "..." };
  try {
    const r = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() })
    });
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    return { phonetic: d.phonetic||"", symbols: d.symbols||"", meter: d.meter||"..." };
  } catch {
    return { phonetic: "السيرفر لا يستجيب..", symbols: "---", meter: "خطأ اتصال" };
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
// ضبط ارتفاع قسم المحلل
// =============================================
function updateArudHeight() {
  const el = document.getElementById('arud-section');
  if (!el || el.style.display === 'none') return;
  el.style.height = (window.innerHeight - 64) + 'px';
}
window.addEventListener('resize', updateArudHeight);

// =============================================
// التنقل
// =============================================
const ALL_SECTIONS = ['home', 'tests', 'quiz', 'arud'];

function showSection(id) {
  ALL_SECTIONS.forEach(s => {
    const el = document.getElementById(`${s}-section`);
    if (el) el.style.display = 'none';
  });

  if (id === 'arud') {
    document.documentElement.classList.add('arud-active');
    document.body.style.overflow = 'hidden';
    const t = document.getElementById('arud-section');
    t.style.display = 'flex';
    updateArudHeight();
    renderVerses();
  } else {
    document.documentElement.classList.remove('arud-active');
    document.body.style.overflow = '';
    const t = document.getElementById(`${id}-section`);
    if (t) t.style.display = 'block';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// Quiz
// =============================================
let activeQuizType = null, quizIndex = 0, score = 0;

function startQuiz(type) {
  activeQuizType = type; quizIndex = 0; score = 0;
  document.getElementById('quiz-container').style.display = 'block';
  document.getElementById('quiz-result').style.display   = 'none';
  renderQuiz();
  showSection('quiz');
}

function renderQuiz() {
  const q = QUIZZES[activeQuizType][quizIndex];
  const total = QUIZZES[activeQuizType].length;
  document.getElementById('quiz-number').textContent   = `السؤال ${quizIndex + 1}`;
  document.getElementById('quiz-question').textContent = q.question;
  const prog = document.getElementById('quiz-progress');
  prog.innerHTML = Array.from({length:total},(_,i)=>
    `<div class="progress-dot ${i<=quizIndex?'active':''}"></div>`).join('');
  const opts = document.getElementById('quiz-options');
  opts.innerHTML = '';
  q.options.forEach((opt,i) => {
    const btn = document.createElement('button');
    btn.className='quiz-option'; btn.textContent=opt;
    btn.addEventListener('click',()=>handleAnswer(i,q.correct));
    opts.appendChild(btn);
  });
}

function handleAnswer(sel, correct) {
  if (sel === correct) score++;
  const total = QUIZZES[activeQuizType].length;
  if (quizIndex < total-1) { quizIndex++; renderQuiz(); } else showResult();
}

function showResult() {
  const total = QUIZZES[activeQuizType].length;
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('quiz-result').style.display   = 'block';
  document.getElementById('score-text').textContent  = score;
  document.getElementById('score-denom').textContent = total;
  document.getElementById('score-message').textContent =
    score===total ? 'مذهل! لقد أثبتّ جدارتك.' : 'لا بأس، المعرفة تراكمية.';
  setTimeout(() => {
    const c=283;
    document.getElementById('score-circle').style.strokeDasharray=`${(score/total)*c} ${c}`;
  }, 120);
}

// =============================================
// المحلل — الحالة
// =============================================
let verses      = ['','','',''];
let activeIndex = 0;
let typingTimer;
let manualClosed  = false;

// ديسكتوب
let analysisBox     = null;
let analysisContent = null;
let userMovedBox    = false;

// موبايل — inline
let inlineBox        = null;
let inlineContent    = null;
let inlineActiveRow  = null;

// =============================================
// بناء محتوى التحليل (مشترك بين الوضعين)
// =============================================
function createAnalysisPanel(data, loading = false) {
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
      <div class="scansion-display">
        <p class="scansion-text" dir="ltr">${data.symbols||'----'}</p>
      </div>
    </div>`;
}

// =============================================
// الحصول على inline box أو إنشاؤه
// =============================================
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

// =============================================
// تحديث التحليل — موبايل (inline accordion)
// =============================================
async function updateAnalysisMobile(idx, text, inputElement) {
  const box       = getInlineBox();
  const targetRow = inputElement.closest('.verse-row');

  // هل البوكس مباشرةً بعد هذا السطر؟
  const alreadyAfterRow = box.previousElementSibling === targetRow;

  if (!alreadyAfterRow) {
    // أغلق الـ box الحالي بانيميشن إن كان مفتوحاً
    if (box.classList.contains('open')) {
      box.classList.remove('open');
      await new Promise(r => setTimeout(r, 420)); // انتظر انتهاء الانيميشن
      if (manualClosed) return;
    }
    // انقله للسطر الجديد
    targetRow.after(box);
    inlineActiveRow = targetRow;
  }

  // أظهر حالة التحميل
  inlineContent.innerHTML = createAnalysisPanel(null, true);

  // افتح بانيميشن إن لم يكن مفتوحاً
  if (!box.classList.contains('open')) {
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('open')));
  }

  // اجلب التحليل
  const data = await analyzeVerses(text);

  if (idx === activeIndex && !manualClosed) {
    inlineContent.innerHTML = createAnalysisPanel(data);
    lucide.createIcons();
    window.currentAnalysis = { bahr: data.meter, kitaba: data.phonetic, scansion: data.symbols };
  }
}

// =============================================
// تحديث التحليل — ديسكتوب (box عائم)
// =============================================
async function updateAnalysisDesktop(idx, text, inputElement) {
  if (!analysisBox) {
    analysisBox     = document.getElementById('analysis-box');
    analysisContent = document.getElementById('analysis-content');
  }

  analysisBox.style.display = 'block';
  analysisContent.innerHTML = createAnalysisPanel(null, true);

  if (!userMovedBox) positionBox(inputElement);

  const data = await analyzeVerses(text);

  if (idx === activeIndex && !manualClosed && analysisBox.style.display !== 'none') {
    analysisContent.innerHTML = createAnalysisPanel(data);
    lucide.createIcons();
    window.currentAnalysis = { bahr: data.meter, kitaba: data.phonetic, scansion: data.symbols };
  }
}

// =============================================
// الدالة الرئيسية للتحديث — تُوجَّه حسب الجهاز
// =============================================
async function updateAnalysisUI(idx, text, inputElement) {
  if (!text || text.trim().length === 0) return;
  if (manualClosed) return;

  if (window.innerWidth <= 768) {
    await updateAnalysisMobile(idx, text, inputElement);
  } else {
    await updateAnalysisDesktop(idx, text, inputElement);
  }
}

// =============================================
// تحديد موضع البوكس العائم (ديسكتوب)
// =============================================
function positionBox(inputElement) {
  if (!analysisBox || !inputElement || window.innerWidth <= 768) return;
  if (userMovedBox) return;

  const rect = inputElement.getBoundingClientRect();
  const boxW = 380, boxH = 310;

  let left = rect.left + rect.width/2 - boxW/2;
  left = Math.max(16, Math.min(left, window.innerWidth - boxW - 16));

  analysisBox.style.position  = 'fixed';
  analysisBox.style.width     = boxW + 'px';
  analysisBox.style.left      = left + 'px';
  analysisBox.style.right     = 'auto';
  analysisBox.style.transform = 'none';

  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow >= boxH + 16) {
    analysisBox.style.top    = (rect.bottom + 12) + 'px';
    analysisBox.style.bottom = 'auto';
  } else {
    analysisBox.style.top    = 'auto';
    analysisBox.style.bottom = (window.innerHeight - rect.top + 12) + 'px';
  }
}

// =============================================
// إغلاق
// =============================================
window.closeInlineAnalysis = () => {
  clearTimeout(typingTimer);
  manualClosed = true;
  if (inlineBox) inlineBox.classList.remove('open');
};

window.closeAnalysis = () => {
  clearTimeout(typingTimer);
  manualClosed = true;
  if (analysisBox)  analysisBox.style.display = 'none';
  if (inlineBox)    inlineBox.classList.remove('open');
};

// =============================================
// نسخ
// =============================================
window.copyAnalysis = () => {
  if (!window.currentAnalysis) return;
  const { bahr, kitaba, scansion } = window.currentAnalysis;
  navigator.clipboard.writeText(`البحر: ${bahr}\nالكتابة: ${kitaba}\nالترميز: ${scansion}`);
  const btn = document.getElementById('copy-btn-text');
  if (btn) { btn.textContent='تم!'; setTimeout(()=>btn.textContent='نسخ',2000); }
};

window.copyAllVerses = (btn) => {
  const lines = [];
  for (let i=0; i<verses.length; i+=2) {
    const s=verses[i]||'', a=verses[i+1]||'';
    if (s||a) lines.push(`${s} ... ${a}`);
  }
  if (!lines.length) return;
  navigator.clipboard.writeText(lines.join('\n'));
  if (btn) {
    const orig=btn.innerHTML;
    btn.innerHTML='<i data-lucide="check"></i> تم النسخ';
    lucide.createIcons();
    setTimeout(()=>{ btn.innerHTML=orig; lucide.createIcons(); },2000);
  }
};

// =============================================
// رسم حقول الأبيات
// =============================================
function renderVerses() {
  const container = document.getElementById('verses-container');
  if (!container) return;

  // الـ inline box سيُزال مع innerHTML=''، لا بأس
  container.innerHTML = '';

  for (let i=0; i<verses.length; i+=2) {
    const n=Math.floor(i/2)+1, si=i, ai=i+1;
    const w=document.createElement('div');
    w.className='verse-row';
    w.innerHTML=`
      <div class="verse-line-num">${String(n).padStart(2,'0')}</div>
      <div class="verse-inputs">
        <input type="text" value="${(verses[si]||'').replace(/"/g,'&quot;')}"
               placeholder="صدر البيت ${n}" class="verse-input" data-idx="${si}" dir="rtl">
        <input type="text" value="${(verses[ai]||'').replace(/"/g,'&quot;')}"
               placeholder="عجز البيت ${n}" class="verse-input" data-idx="${ai}" dir="rtl">
      </div>`;
    container.appendChild(w);
  }

  container.querySelectorAll('.verse-input').forEach(input => {

    input.addEventListener('focus', e => {
      manualClosed = false;  // المستخدم يتفاعل من جديد
      userMovedBox = false;
      activeIndex  = parseInt(e.target.dataset.idx, 10);
      updateAnalysisUI(activeIndex, e.target.value, e.target);
    });

    input.addEventListener('input', e => {
      const idx = parseInt(e.target.dataset.idx, 10);
      verses[idx] = e.target.value;
      clearTimeout(typingTimer);
      typingTimer = setTimeout(()=>updateAnalysisUI(idx, e.target.value, e.target), 400);

      // بيت جديد تلقائياً
      if (idx >= verses.length-2 && e.target.value.trim()) {
        const lS=verses.length-2, lA=verses.length-1;
        if ((verses[lS]||'').trim()||(verses[lA]||'').trim()) {
          if (verses.length-1===lA) {
            verses.push('','');
            const st=container.scrollTop;
            renderVerses();
            container.scrollTop=st;
            const same=container.querySelector(`input[data-idx="${idx}"]`);
            if (same) { same.focus(); same.setSelectionRange(same.value.length,same.value.length); }
          }
        }
      }
    });
  });

  lucide.createIcons();
}

function fillSample() {
  verses=[...SAMPLE_VERSES]; activeIndex=0;
  renderVerses(); window.closeAnalysis();
}

function clearVerses() {
  verses=['','','','']; activeIndex=0;
  renderVerses(); window.closeAnalysis();
}

// =============================================
// Drag — ديسكتوب فقط
// =============================================
let isDragging=false, startX, startY, initialLeft, initialTop;

document.addEventListener('mousedown', e => {
  if (!e.target.closest('.analysis-header')) return;
  if (window.innerWidth<=768 || e.target.closest('button')) return;
  if (!analysisBox) analysisBox=document.getElementById('analysis-box');
  isDragging=true; userMovedBox=true;
  startX=e.clientX; startY=e.clientY;
  const r=analysisBox.getBoundingClientRect();
  initialLeft=r.left; initialTop=r.top;
  analysisBox.style.transform='none';
  analysisBox.style.left=initialLeft+'px';
  analysisBox.style.top=initialTop+'px';
  analysisBox.style.bottom='auto';
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  e.preventDefault();
  analysisBox.style.left=(initialLeft+e.clientX-startX)+'px';
  analysisBox.style.top=(initialTop+e.clientY-startY)+'px';
});

document.addEventListener('mouseup', ()=>{ isDragging=false; });

// =============================================
// التهيئة
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  const testsData = [
    { id:'complete', title:'أكمل الفراغ',  desc:'اختبر حصيلتك من أبيات الشعر الخالدة.',   icon:'quote',     badge:'سهل',   badgeClass:'' },
    { id:'meter',    title:'فراسة البحور', desc:'هل تستطيع تمييز البحر من نظرة واحدة؟',   icon:'target',    badge:'متوسط', badgeClass:'purple' },
    { id:'poet',     title:'من القائل',    desc:'أعد كل بيت مجيد إلى قائله الأصيل.',      icon:'feather',   badge:'متوسط', badgeClass:'blue' },
    { id:'rhetoric', title:'أسرار البلاغة',desc:'سبر أغوار الجمال البياني في لغة الضاد.', icon:'book-open', badge:'صعب',   badgeClass:'gold' }
  ];

  const grid=document.getElementById('tests-grid');
  if (grid) {
    testsData.forEach(item=>{
      const el=document.createElement('div');
      el.className='challenge-item';
      el.innerHTML=`
        <div class="challenge-visual ${item.badgeClass}"><i data-lucide="${item.icon}"></i></div>
        <div class="challenge-details">
          <span class="badge ${item.badgeClass}">${item.badge}</span>
          <h3>${item.title}</h3><p>${item.desc}</p>
          <button class="btn-primary btn-sm">ابدأ التحدي الآن</button>
        </div>`;
      el.addEventListener('click',()=>startQuiz(item.id));
      grid.appendChild(el);
    });
  }

  window.showSection=showSection;
  window.startQuiz=startQuiz;
  window.fillSample=fillSample;
  window.clearVerses=clearVerses;

  lucide.createIcons();
});
