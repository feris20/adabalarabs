// --- Data & Logic ---
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

function analyzeVerses(text) {
  if (!text.trim()) return { phonetic: "", symbols: "", meter: "..." };
  let phonetic = text.replace(/الت/g, "تت").replace(/اً/g, "ان").replace(/ة/g, "ت");
  let symbols = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " ") continue;
    symbols += i % 3 === 0 ? "o" : "/";
  }
  const meters = ["الطويل", "الكامل", "البسيط", "الوافر"];
  const meter = text.length > 5 ? meters[Math.floor(Math.random() * meters.length)] : "...";
  return { phonetic, symbols, meter };
}

// --- App State ---
let darkMode = false;
let verses = ['', '', '', ''];
let activeIndex = 0;
let activeQuizType = null;
let quizIndex = 0;
let score = 0;

// --- Initialize Icons ---
lucide.createIcons();

// --- Theme Toggle ---
document.getElementById('theme-toggle').addEventListener('click', () => {
  darkMode = !darkMode;
  if (darkMode) {
    document.documentElement.classList.add('dark');
    document.getElementById('theme-icon').setAttribute('data-lucide', 'sun');
  } else {
    document.documentElement.classList.remove('dark');
    document.getElementById('theme-icon').setAttribute('data-lucide', 'moon');
  }
  lucide.createIcons();
});

// --- Navigation ---
function navigate(pageId) {
  document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active-page'));
  document.getElementById(`page-${pageId}`).classList.add('active-page');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Tests Generation ---
const testsData = [
  { id: 'complete', title: 'أكمل الفراغ', desc: 'اختبر حصيلتك من أبيات الشعر الخالدة', icon: 'quote', color: 'from-orange-500/20 to-red-500/20', img: 'https://images.unsplash.com/photo-1544648151-55737bb41329?auto=format&fit=crop&q=80&w=600' },
  { id: 'meter', title: 'فراسة البحور', desc: 'هل تستطيع تمييز البحر من نظرة؟', icon: 'target', color: 'from-emerald-500/20 to-teal-500/20', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600' },
  { id: 'poet', title: 'من القائل', desc: 'أعد كل بيت مجيد إلى قائله', icon: 'feather', color: 'from-blue-500/20 to-indigo-500/20', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600' },
  { id: 'rhetoric', title: 'أسرار البلاغة', desc: 'سبر أغوار الجمال البياني في لغتنا', icon: 'book-open', color: 'from-purple-500/20 to-pink-500/20', img: 'https://images.unsplash.com/photo-1503454537195-0df99d4b600d?auto=format&fit=crop&q=80&w=600' }
];

const testsGrid = document.getElementById('tests-grid');
testsData.forEach((item, idx) => {
  const btn = document.createElement('button');
  btn.className = `group glass-panel rounded-3xl h-[280px] flex flex-col justify-end overflow-hidden relative text-right hover:scale-[1.01] transition-transform animate-slide-up`;
  btn.style.animationDelay = `${idx * 0.1}s`;
  btn.onclick = () => startQuiz(item.id);
  btn.innerHTML = `
    <div class="absolute inset-0 z-0">
      <img src="${item.img}" alt="${item.title}" class="w-full h-full object-cover opacity-30 dark:opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
      <div class="absolute inset-0 bg-gradient-to-t ${item.color} mix-blend-multiply opacity-50"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent"></div>
    </div>
    <div class="relative z-10 p-8 w-full flex flex-col gap-2">
      <div class="w-12 h-12 rounded-xl bg-text-main text-bg flex items-center justify-center mb-2 shadow-lg group-hover:-translate-y-1 transition-transform">
         <i data-lucide="${item.icon}"></i>
      </div>
      <span class="text-3xl font-serif font-bold text-text-main">${item.title}</span>
      <span class="text-text-muted font-light">${item.desc}</span>
    </div>
  `;
  testsGrid.appendChild(btn);
});

// --- Quiz Logic ---
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
  
  // Progress Bar
  const progContainer = document.getElementById('quiz-progress');
  progContainer.innerHTML = [0,1].map(i => `<div class="h-1.5 w-10 rounded-full ${i <= quizIndex ? 'bg-primary' : 'bg-border'}"></div>`).join('');
  
  // Options
  const optsContainer = document.getElementById('quiz-options');
  optsContainer.innerHTML = '';
  qData.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = "p-5 glass-panel !bg-transparent border border-border rounded-2xl text-right text-lg md:text-xl font-medium hover:!border-primary hover:text-primary transition-all shadow-sm flex justify-between items-center group";
    btn.innerHTML = `
      <span>${opt}</span>
      <div class="w-6 h-6 rounded-full border-2 border-border group-hover:border-primary flex items-center justify-center transition-colors">
        <div class="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
    `;
    btn.onclick = () => handleAnswer(i, qData.correct);
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
  // Circle Animation
  setTimeout(() => {
    document.getElementById('score-circle').style.strokeDasharray = `${(score/2)*283} 283`;
  }, 100);
}

// --- Analysis Logic ---
function createAnalysisPanel(analysisData, extraClass = "") {
  return `
    <div class="glass-panel rounded-3xl overflow-hidden flex flex-col ${extraClass}">
      <div class="bg-gradient-to-l from-primary/10 to-transparent p-6 lg:p-8 border-b border-border relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
        <span class="text-xs uppercase tracking-widest font-bold text-secondary block mb-2">البحر الشعري</span>
        <h3 class="text-4xl lg:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-text-main to-text-muted">${analysisData.meter}</h3>
      </div>
      <div class="p-6 lg:p-8 space-y-8 flex-grow">
        <div>
          <span class="text-sm font-bold text-text-muted block mb-3">الترميز العروضي</span>
          <div class="text-2xl lg:text-3xl font-mono tracking-[0.5em] text-center bg-bg/50 py-4 rounded-2xl text-primary border border-border shadow-inner" dir="ltr">
            ${analysisData.symbols || "----"}
          </div>
        </div>
        <div>
          <span class="text-sm font-bold text-text-muted block mb-3">الكتابة العروضية</span>
          <div class="text-xl lg:text-2xl font-serif text-right text-text-main/90 leading-relaxed bg-bg/30 p-5 rounded-2xl italic min-h-[90px] border border-border/50">
            ${analysisData.phonetic || "بانتظار الإلهام يتدفق من قلمك..."}
          </div>
        </div>
      </div>
      <div class="p-4 text-center border-t border-border bg-black/5 dark:bg-white/5">
        <span class="text-[11px] font-medium text-text-muted flex items-center justify-center gap-2">
          <i data-lucide="feather" class="w-3 h-3 text-secondary"></i>
          مبني على قواعد العروض للفراهيدي
        </span>
      </div>
    </div>
  `;
}

function renderVerses() {
  const container = document.getElementById('verses-container');
  container.innerHTML = '';
  verses.forEach((verse, idx) => {
    const isSadr = idx % 2 === 0;
    const isActive = activeIndex === idx;
    
    const wrapper = document.createElement('div');
    wrapper.className = "flex flex-col mb-6 verse-input-wrapper transition-all duration-300 " + (isActive ? "active" : "");
    
    const inputHtml = `
      <div class="flex items-start gap-4">
        <div class="w-10 pt-4 flex justify-center text-text-muted/40 font-mono text-sm select-none">
          ${isSadr ? String(Math.floor(idx/2)+1).padStart(2,'0') : '<i data-lucide="chevron-left" class="rotate-180 w-4 h-4"></i>'}
        </div>
        <div class="flex-grow relative">
          <input type="text" value="${verse}" placeholder="${isSadr ? 'الشطر الأول (الصدر)' : 'الشطر الثاني (العجز)'}" 
                 class="verse-input w-full p-4 md:p-6 text-2xl md:text-3xl font-serif bg-transparent border-b-2 transition-all focus:outline-none placeholder:text-text-muted/30 ${isActive ? 'border-primary text-text-main drop-shadow-md' : 'border-border text-text-main/80'}"
                 data-idx="${idx}">
          ${isActive ? '<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(155,34,38,0.6)] dark:shadow-[0_0_8px_rgba(230,57,70,0.6)]"></div>' : ''}
        </div>
      </div>
      <!-- Mobile Analysis Panel -->
      ${isActive ? `<div class="lg:hidden pl-14 overflow-hidden mt-6 animate-slide-up">${createAnalysisPanel(analyzeVerses(verse))}</div>` : ''}
    `;
    wrapper.innerHTML = inputHtml;
    container.appendChild(wrapper);
  });

  // Attach Events
  document.querySelectorAll('.verse-input').forEach(input => {
    input.addEventListener('focus', (e) => {
      activeIndex = parseInt(e.target.getAttribute('data-idx'));
      renderVerses();
      updateDesktopPanel();
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Restore cursor position
      setTimeout(() => e.target.selectionStart = e.target.selectionEnd = e.target.value.length, 0);
    });
    
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      verses[idx] = e.target.value;
      if (idx === verses.length - 1 && e.target.value.trim() !== '' && idx % 2 === 1) {
        verses.push('', ''); // Auto expand
      }
      updateDesktopPanel();
      // Only re-render mobile panel (avoiding full re-render on type for better performance)
      if (window.innerWidth < 1024) {
          renderVerses();
          const focusInput = document.querySelector(`input[data-idx="${idx}"]`);
          if(focusInput) focusInput.focus();
      }
    });
  });
  lucide.createIcons();
}

function updateDesktopPanel() {
  const currentText = verses[activeIndex] || '';
  const analysisData = analyzeVerses(currentText);
  document.getElementById('desktop-analysis-panel').innerHTML = createAnalysisPanel(analysisData, "min-h-[400px]");
  lucide.createIcons();
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

// Initial render
renderVerses();
updateDesktopPanel();
