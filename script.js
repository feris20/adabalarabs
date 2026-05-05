// --- البيانات والمنطق ---
const QUIZZES = {
  complete: [
    { question: "الخيلُ والليلُ والبيداءُ تعرفُني... والرمحُ والقرطاسُ و____", options: ["السيفُ", "القلمُ", "الكتابُ", "الحبرُ"], correct: 1 },
    { question: "وما حبُّ الديارِ شغفنَ قلبي... ولكن حبُّ من ____", options: ["بنى الديارا", "سكنَ الديارا", "هجرَ الديارا", "زارَ الديارا"], correct: 1 }
  ],
  meter: [
    { question: "ما البحر الذي وزنه: فعولن مفاعيلن فعولن مفاعلن؟", options: ["الطويل", "الكامل", "البسيط", "الوافر"], correct: 0 },
    { question: "على أي بحر نظم الشوقي نهج البردة؟", options: ["البسيط", "الخفيف", "الوافر", "الكامل"], correct: 1 }
  ],
  poet: [
    { question: "من القائل: نَقِّل فُؤادَكَ حَيثُ شِئتَ مِنَ الهَوى... ما الحُبُّ إِلّا لِلحَبيبِ الأَوَّلِ؟", options: ["المتنبي", "أبو تمام", "بشار بن برد", "البحتري"], correct: 1 },
    { question: "من الملقب بـ شاعر النيل؟", options: ["أحمد شوقي", "حافظ إبراهيم", "إيليا أبو ماضي", "خليل مطران"], correct: 1 }
  ],
  rhetoric: [
    { question: "ما نوع التشبيه في: 'العمر مثل الضيف'؟", options: ["بليغ", "مجمل", "مرسل", "مؤكد"], correct: 2 },
    { question: "ما الغرض من الاستفهام في قوله تعالى: 'أليس الله بأحكم الحاكمين'؟", options: ["التقرير", "التعجب", "النفي", "التمني"], correct: 0 }
  ]
};

const SAMPLE_VERSES = [
  "قِفَا نَبْكِ مِنْ ذِكْرَى حَبِيبٍ ومَنْزِلِ",
  "بِسِقْطِ اللِّوَى بَيْنَ الدَّخُولِ فَحَوْمَلِ",
  "إِذَا الشعبُ يوماً أرادَ الحياةَ",
  "فلا بدَّ أنْ يستجيبَ القدرْ"
];

// --- محرك التحليل العروضي (API) ---
async function analyzeVerses(text) {
  if (!text.trim()) return { phonetic: "", symbols: "", meter: "..." };

  try {
    // الاتصال بسيرفر Pterodactyl الخاص بك
    const response = await fetch('http://fi13.bot-hosting.cloud:21346/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    });

    if (!response.ok) throw new Error('سيرفر التحليل غير متاح');

    const pyResult = await response.json();
    return {
      phonetic: pyResult.phonetic || "",
      symbols: pyResult.symbols || "",
      meter: pyResult.meter || "..."
    };
  } catch (error) {
    console.error("خطأ API:", error);
    return { phonetic: "السيرفر لا يستجيب..", symbols: "---", meter: "خطأ اتصال" };
  }
}

// --- حالة التطبيق ---
let darkMode = false;
let verses = ['', '', '', ''];
let activeIndex = 0;
let activeQuizType = null;
let quizIndex = 0;
let score = 0;
let typingTimer;

// --- الأيقونات والمظهر ---
lucide.createIcons();

document.getElementById('theme-toggle').addEventListener('click', () => {
  darkMode = !darkMode;
  document.documentElement.classList.toggle('dark', darkMode);
  document.getElementById('theme-icon').setAttribute('data-lucide', darkMode ? 'sun' : 'moon');
  lucide.createIcons();
});

function navigate(pageId) {
  document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active-page'));
  document.getElementById(`page-${pageId}`).classList.add('active-page');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- منطق التحديات ---
function startQuiz(type) {
  activeQuizType = type;
  quizIndex = 0;
  score = 0;
  document.getElementById('quiz-container').classList.remove('hidden');
  document.getElementById('quiz-result').classList.add('hidden');
  renderQuiz();
  navigate('quiz');
}

function renderQuiz() {
  const qData = QUIZZES[activeQuizType][quizIndex];
  document.getElementById('quiz-number').innerText = `السؤال ${quizIndex + 1}`;
  document.getElementById('quiz-question').innerText = qData.question;
  
  const progContainer = document.getElementById('quiz-progress');
  progContainer.innerHTML = [0,1].map(i => `<div class="h-1.5 w-10 rounded-full ${i <= quizIndex ? 'bg-primary' : 'bg-border'}"></div>`).join('');
  
  const optsContainer = document.getElementById('quiz-options');
  optsContainer.innerHTML = '';
  qData.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = "p-5 glass-panel !bg-transparent border border-border rounded-2xl text-right text-lg md:text-xl font-medium hover:!border-primary hover:text-primary transition-all flex justify-between items-center group";
    btn.innerHTML = `<span>${opt}</span><div class="w-6 h-6 rounded-full border-2 border-border group-hover:border-primary flex items-center justify-center"><div class="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div></div>`;
    btn.addEventListener('click', () => handleAnswer(i, qData.correct));
    optsContainer.appendChild(btn);
  });
}

function handleAnswer(selectedIndex, correctIndex) {
  if (selectedIndex === correctIndex) score++;
  if (quizIndex < 1) {
    quizIndex++;
    renderQuiz();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById('quiz-container').classList.add('hidden');
  document.getElementById('quiz-result').classList.remove('hidden');
  document.getElementById('score-text').innerText = score;
  document.getElementById('score-message').innerText = score === 2 ? 'مذهل! لقد أثبتّ جدارتك.' : 'لا بأس، المعرفة تراكمية.';
  setTimeout(() => {
    document.getElementById('score-circle').style.strokeDasharray = `${(score/2)*283} 283`;
  }, 100);
}

// --- تحديث الواجهة والنتائج ---
async function updateAnalysisUI(idx, text) {
  const analysis = await analyzeVerses(text);
  
  if (idx === activeIndex) {
    const desktopPanel = document.getElementById('desktop-analysis-panel');
    if (desktopPanel) {
      desktopPanel.innerHTML = createAnalysisPanel(analysis, "min-h-[400px]");
      lucide.createIcons();
    }
  }

  const mobilePanel = document.getElementById(`mobile-panel-${idx}`);
  if (mobilePanel) {
    mobilePanel.innerHTML = createAnalysisPanel(analysis);
    lucide.createIcons();
  }
}

function createAnalysisPanel(analysisData, extraClass = "") {
  return `
    <div class="glass-panel rounded-3xl overflow-hidden flex flex-col ${extraClass} animate-fade-in">
      <div class="bg-gradient-to-l from-primary/10 to-transparent p-6 lg:p-8 border-b border-border relative">
        <span class="text-xs uppercase tracking-widest font-bold text-secondary block mb-2">البحر الشعري</span>
        <h3 class="text-3xl lg:text-4xl font-serif font-bold text-blue-600">${analysisData.meter || '...'}</h3>
      </div>
      <div class="p-6 lg:p-8 space-y-6 flex-grow">
        <div>
          <span class="text-sm font-bold text-text-muted block mb-3">الترميز العروضي</span>
          <div class="text-xl lg:text-2xl font-mono tracking-[0.2em] text-center bg-bg/50 py-4 rounded-2xl text-primary border border-border shadow-inner break-all px-2" dir="ltr">
            ${analysisData.symbols || "----"}
          </div>
        </div>
        <div>
          <span class="text-sm font-bold text-text-muted block mb-3">الكتابة والتفعيلات</span>
          <div class="text-lg lg:text-xl font-serif text-right text-text-main/90 leading-relaxed bg-bg/30 p-5 rounded-2xl italic min-h-[90px] border border-border/50">
            ${analysisData.phonetic || "بانتظار قلمك..."}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderVerses() {
  const container = document.getElementById('verses-container');
  container.innerHTML = '';
  verses.forEach((verse, idx) => {
    const isSadr = idx % 2 === 0;
    const wrapper = document.createElement('div');
    wrapper.className = `flex flex-col mb-6 verse-input-wrapper ${activeIndex === idx ? 'active' : ''}`;
    
    wrapper.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="w-10 pt-4 flex justify-center text-text-muted/40 font-mono text-sm">
          ${isSadr ? String(Math.floor(idx/2)+1).padStart(2,'0') : '←'}
        </div>
        <div class="flex-grow relative">
          <input type="text" value="${verse}" placeholder="${isSadr ? 'صدر البيت...' : 'عجز البيت...'}" 
                 class="verse-input w-full p-4 md:p-6 text-2xl md:text-3xl font-serif bg-transparent border-b-2 border-border focus:border-primary focus:outline-none transition-all"
                 data-idx="${idx}">
        </div>
      </div>
      <div id="mobile-panel-${idx}" class="lg:hidden mt-4"></div>
    `;
    container.appendChild(wrapper);
  });

  document.querySelectorAll('.verse-input').forEach(input => {
    input.addEventListener('focus', (e) => {
      activeIndex = parseInt(e.target.getAttribute('data-idx'));
      document.querySelectorAll('.verse-input-wrapper').forEach((w, i) => w.classList.toggle('active', i === activeIndex));
      updateAnalysisUI(activeIndex, e.target.value);
    });
    
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      verses[idx] = e.target.value;
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => updateAnalysisUI(idx, e.target.value), 300);

      if (idx === verses.length - 1 && e.target.value.trim() !== '' && idx % 2 === 1) {
        verses.push('', ''); 
        renderVerses(); 
        const nextInput = document.querySelector(`input[data-idx="${idx}"]`);
        nextInput.focus();
        nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
      }
    });
  });
  lucide.createIcons();
}

function updateDesktopPanel() {
  updateAnalysisUI(activeIndex, verses[activeIndex] || '');
}

function fillSample() {
  verses = [...SAMPLE_VERSES];
  activeIndex = 0;
  renderVerses();
  updateDesktopPanel();
}

function clearVerses() {
  verses = ['', '', '', ''];
  activeIndex = 0;
  renderVerses();
  updateDesktopPanel();
}

// تهيئة أولية
document.addEventListener('DOMContentLoaded', () => {
  const testsGrid = document.getElementById('tests-grid');
  const testsData = [
    { id: 'complete', title: 'أكمل الفراغ', desc: 'اختبر حصيلتك من أبيات الشعر الخالدة', icon: 'quote', color: 'from-orange-500/20 to-red-500/20', img: 'https://images.unsplash.com/photo-1544648151-55737bb41329?auto=format&fit=crop&q=80&w=600' },
    { id: 'meter', title: 'فراسة البحور', desc: 'هل تستطيع تمييز البحر من نظرة؟', icon: 'target', color: 'from-emerald-500/20 to-teal-500/20', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600' },
    { id: 'poet', title: 'من القائل', desc: 'أعد كل بيت مجيد إلى قائله', icon: 'feather', color: 'from-blue-500/20 to-indigo-500/20', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600' },
    { id: 'rhetoric', title: 'أسرار البلاغة', desc: 'سبر أغوار الجمال البياني في لغتنا', icon: 'book-open', color: 'from-purple-500/20 to-pink-500/20', img: 'https://images.unsplash.com/photo-1503454537195-0df99d4b600d?auto=format&fit=crop&q=80&w=600' }
  ];

  testsData.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.className = `group glass-panel rounded-3xl h-[280px] flex flex-col justify-end overflow-hidden relative text-right hover:scale-[1.01] transition-transform animate-slide-up`;
    btn.style.animationDelay = `${idx * 0.1}s`;
    btn.addEventListener('click', () => startQuiz(item.id));
    btn.innerHTML = `
      <div class="absolute inset-0 z-0">
        <img src="${item.img}" class="w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
        <div class="absolute inset-0 bg-gradient-to-t ${item.color} mix-blend-multiply opacity-50"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent"></div>
      </div>
      <div class="relative z-10 p-8 w-full flex flex-col gap-2">
        <div class="w-12 h-12 rounded-xl bg-text-main text-bg flex items-center justify-center mb-2 shadow-lg group-hover:-translate-y-1 transition-transform">
           <i data-lucide="${item.icon}"></i>
        </div>
        <span class="text-3xl font-serif font-bold text-text-main">${item.title}</span>
        <span class="text-text-muted font-light">${item.desc}</span>
      </div>`;
    testsGrid.appendChild(btn);
  });

  // ربط أزرار التنقل
  document.getElementById('btn-nav-analysis')?.addEventListener('click', () => navigate('analysis'));
  document.getElementById('btn-nav-tests')?.addEventListener('click', () => navigate('tests'));
  document.getElementById('btn-back-home-tests')?.addEventListener('click', () => navigate('home'));
  document.getElementById('btn-back-tests')?.addEventListener('click', () => navigate('tests'));
  document.getElementById('btn-back-home-analysis')?.addEventListener('click', () => navigate('home'));
  document.getElementById('btn-fill-sample')?.addEventListener('click', fillSample);
  document.getElementById('btn-clear-verses')?.addEventListener('click', clearVerses);

  renderVerses();
  updateDesktopPanel();
});
