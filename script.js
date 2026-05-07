import 'Alexandria-Black.ttf';
import 'Alexandria-Light.ttf';
import 'Alexandria-Medium.ttf';
import 'Alexandria-Regular.ttf';
import 'Alexandria-SemiBold.ttf';
import 'Alexandria-Thin.ttf';
import 'Amiri-Bold.ttf';
import 'Amiri-BoldItalic.ttf';
import 'Amiri-Italic.ttf';
import 'Amiri-Regular.ttf';
import { createIcons } from 'lucide';

/* =============================================
   script.js
   منطق recent code كاملاً + نمط التنقل من goal code
   ============================================= */

// =============================================
// بيانات التحديات
// =============================================
const QUIZZES = {
  complete: [
    {
      question: "الخيلُ والليلُ والبيداءُ تعرفُني... والرمحُ والقرطاسُ و____",
      options: ["السيفُ", "القلمُ", "الكتابُ", "الحبرُ"],
      correct: 1
    },
    {
      question: "وما حبُّ الديارِ شغفنَ قلبي... ولكن حبُّ من ____",
      options: ["بنى الديارا", "سكنَ الديارا", "هجرَ الديارا", "زارَ الديارا"],
      correct: 1
    }
  ],
  meter: [
    {
      question: "ما البحر الذي وزنه: فعولن مفاعيلن فعولن مفاعلن؟",
      options: ["الطويل", "الكامل", "البسيط", "الوافر"],
      correct: 0
    },
    {
      question: "على أي بحر نظم الشوقي نهج البردة؟",
      options: ["البسيط", "الخفيف", "الوافر", "الكامل"],
      correct: 1
    }
  ],
  poet: [
    {
      question: "من القائل: نَقِّل فُؤادَكَ حَيثُ شِئتَ مِنَ الهَوى... ما الحُبُّ إِلّا لِلحَبيبِ الأَوَّلِ؟",
      options: ["المتنبي", "أبو تمام", "بشار بن برد", "البحتري"],
      correct: 1
    },
    {
      question: "من الملقب بـ شاعر النيل؟",
      options: ["أحمد شوقي", "حافظ إبراهيم", "إيليا أبو ماضي", "خليل مطران"],
      correct: 1
    }
  ],
  rhetoric: [
    {
      question: "ما نوع التشبيه في: 'العمر مثل الضيف'؟",
      options: ["بليغ", "مجمل", "مرسل", "مؤكد"],
      correct: 2
    },
    {
      question: "ما الغرض من الاستفهام في قوله تعالى: 'أليس الله بأحكم الحاكمين'؟",
      options: ["التقرير", "التعجب", "النفي", "التمني"],
      correct: 0
    }
  ]
};

const SAMPLE_VERSES = [
  "قِفَا نَبْكِ مِنْ ذِكْرَى حَبِيبٍ ومَنْزِلِ",
  "بِسِقْطِ اللِّوَى بَيْنَ الدَّخُولِ فَحَوْمَلِ",
  "إِذَا الشعبُ يوماً أرادَ الحياةَ",
  "فلا بدَّ أنْ يستجيبَ القدرْ"
];

// =============================================
// التحليل العروضي عبر API
// =============================================
async function analyzeVerses(text) {
  if (!text || !text.trim()) {
    return { phonetic: "", symbols: "", meter: "..." };
  }

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() })
    });

    if (!response.ok) {
      throw new Error(`خطأ من السيرفر: ${response.status}`);
    }

    const result = await response.json();
    return {
      phonetic: result.phonetic || "",
      symbols:  result.symbols  || "",
      meter:    result.meter    || "..."
    };
  } catch (err) {
    console.error("خطأ في التحليل:", err);
    return {
      phonetic: "السيرفر لا يستجيب..",
      symbols:  "---",
      meter:    "خطأ اتصال"
    };
  }
}

// =============================================
// المظهر (وضع النهار / الليل)
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
// التنقل بين الأقسام
// =============================================
const ALL_SECTIONS = ['home', 'tests', 'quiz', 'arud'];

function showSection(id) {
  ALL_SECTIONS.forEach(s => {
    const el = document.getElementById(`${s}-section`);
    if (el) el.style.display = 'none';
  });

  const target = document.getElementById(`${id}-section`);
  if (target) target.style.display = 'block';

  // تهيئة خاصة عند الانتقال للمحلل
  if (id === 'arud') {
    renderVerses();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// التحديات / Quiz
// =============================================
let activeQuizType = null;
let quizIndex = 0;
let score = 0;

function startQuiz(type) {
  activeQuizType = type;
  quizIndex = 0;
  score = 0;

  document.getElementById('quiz-container').style.display = 'block';
  document.getElementById('quiz-result').style.display   = 'none';

  renderQuiz();
  showSection('quiz');
}

function renderQuiz() {
  const qData = QUIZZES[activeQuizType][quizIndex];
  const total = QUIZZES[activeQuizType].length;

  document.getElementById('quiz-number').textContent   = `السؤال ${quizIndex + 1}`;
  document.getElementById('quiz-question').textContent = qData.question;

  // شريط التقدم
  const prog = document.getElementById('quiz-progress');
  prog.innerHTML = Array.from({ length: total }, (_, i) =>
    `<div class="progress-dot ${i <= quizIndex ? 'active' : ''}"></div>`
  ).join('');

  // خيارات الإجابة
  const optsContainer = document.getElementById('quiz-options');
  optsContainer.innerHTML = '';
  qData.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className   = 'quiz-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(i, qData.correct));
    optsContainer.appendChild(btn);
  });
}

function handleAnswer(selected, correct) {
  if (selected === correct) score++;

  const total = QUIZZES[activeQuizType].length;
  if (quizIndex < total - 1) {
    quizIndex++;
    renderQuiz();
  } else {
    showResult();
  }
}

function showResult() {
  const total = QUIZZES[activeQuizType].length;

  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('quiz-result').style.display   = 'block';
  document.getElementById('score-text').textContent       = score;
  document.getElementById('score-denom').textContent      = total;
  document.getElementById('score-message').textContent    =
    score === total ? 'مذهل! لقد أثبتّ جدارتك.' : 'لا بأس، المعرفة تراكمية.';

  // رسم دائرة النتيجة بعد لحظة
  setTimeout(() => {
    const circumference = 283;
    document.getElementById('score-circle').style.strokeDasharray =
      `${(score / total) * circumference} ${circumference}`;
  }, 120);
}

// =============================================
// المحلل العروضي — حالة التطبيق
// =============================================
let verses = ['', '', '', ''];
let activeIndex = 0;
let typingTimer;
let analysisBox = null;
let analysisContent = null;

// =============================================
// بناء لوحة التحليل (HTML)
// =============================================
function createAnalysisPanel(data, loading = false) {
  if (loading) {
    return `
      <div class="loading-box">جاري النظم عروضيًا...</div>
    `;
  }

  if (!data) {
    return `
      <div class="analysis-placeholder">
        <i data-lucide="feather"></i>
        <p>انقر على شطر لتحليله عروضياً</p>
      </div>
    `;
  }

  const meter    = data.meter    || '...';
  const phonetic = data.phonetic || 'بانتظار قلمك...';
  const symbols  = data.symbols  || '----';

  return `
    <div class="bahr-info">
      <div class="bahr-label">بحر القصيد:</div>
      <h3 class="bahr-name">${meter}</h3>
    </div>
    <div class="kitaba-section">
      <div class="label">الكتابة والتفعيلات:</div>
      <p class="kitaba-text">${phonetic}</p>
    </div>
    <div class="scansion-section">
      <div class="label">الترميز العروضي:</div>
      <div class="scansion-display">
        <p class="scansion-text" dir="ltr">${symbols}</p>
      </div>
    </div>
  `;
}

// =============================================
// تحديث واجهة التحليل
// =============================================
async function updateAnalysisUI(idx, text, inputElement) {
  if (!analysisBox) {
    analysisBox = document.getElementById('analysis-box');
    analysisContent = document.getElementById('analysis-content');
  }
  
  if (!text || text.trim().length === 0) return;

  // إظهار الصندوق
  analysisBox.style.display = 'block';
  analysisContent.innerHTML = createAnalysisPanel(null, true);

  // تحديد الموقع (متحرك ومقيد)
  if (window.innerWidth > 768 && inputElement) {
    const rect = inputElement.closest('.verse-row').getBoundingClientRect();
    if (!analysisBox.style.transform || analysisBox.style.transform.includes('-50%')) {
      analysisBox.style.top = (window.scrollY + rect.bottom + 10) + 'px';
      analysisBox.style.left = '50%';
      analysisBox.style.transform = 'translateX(-50%)';
      analysisBox.style.position = 'absolute';
    }
  } else if (window.innerWidth <= 768) {
    analysisBox.style.position = 'fixed';
    analysisBox.style.bottom = '16px';
    analysisBox.style.top = 'auto';
    analysisBox.style.left = '50%';
    analysisBox.style.transform = 'translateX(-50%)';
  }

  // جلب التحليل من API
  const data = await analyzeVerses(text);

  // تحديث اللوحة
  if (idx === activeIndex) {
    analysisContent.innerHTML = createAnalysisPanel(data);
    createIcons();
    // حفظ التحليل الحالي من أجل النسخ
    window.currentAnalysis = {
        bahr: data.meter,
        tafeela: [],
        kitaba: data.phonetic,
        scansion: data.symbols
    };
  }
}

window.closeAnalysis = () => {
    if (analysisBox) analysisBox.style.display = 'none';
};

window.copyAnalysis = () => {
    if (!window.currentAnalysis) return;
    const { bahr, kitaba, scansion } = window.currentAnalysis;
    const textToCopy = `البحر: ${bahr}\nالكتابة: ${kitaba}\nالترميز: ${scansion}`;
    navigator.clipboard.writeText(textToCopy);
    
    const btn = document.getElementById('copy-btn-text');
    if (btn) {
        btn.textContent = 'تم!';
        setTimeout(() => btn.textContent = 'نسخ', 2000);
    }
};

window.copyAllVerses = (btn) => {
    let versesText = [];
    for (let i = 0; i < verses.length; i += 2) {
        const sadr = verses[i] || '';
        const ajuz = verses[i+1] || '';
        if (sadr || ajuz) {
            versesText.push(`${sadr} ... ${ajuz}`);
        }
    }
    const textToCopy = versesText.join('\n');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    
    if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check"></i> تم النسخ';
        createIcons();
        setTimeout(() => {
            btn.innerHTML = original;
            createIcons();
        }, 2000);
    }
};

// =============================================
// رسم حقول الأبيات
// =============================================
function renderVerses() {
  const container = document.getElementById('verses-container');
  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < verses.length; i += 2) {
    const verseNum = Math.floor(i / 2) + 1;
    const sadrIdx = i;
    const ajuzIdx = i + 1;

    const wrapper = document.createElement('div');
    wrapper.className = `verse-row`;
    
    const sadrValue = (verses[sadrIdx] || '').replace(/"/g, '&quot;');
    const ajuzValue = (verses[ajuzIdx] || '').replace(/"/g, '&quot;');

    wrapper.innerHTML = `
      <div class="verse-line-num">${String(verseNum).padStart(2, '0')}</div>
      <div class="verse-inputs">
        <input
          type="text"
          value="${sadrValue}"
          placeholder="صدر البيت ${verseNum}"
          class="verse-input"
          data-idx="${sadrIdx}"
          dir="rtl"
        >
        <input
          type="text"
          value="${ajuzValue}"
          placeholder="عجز البيت ${verseNum}"
          class="verse-input"
          data-idx="${ajuzIdx}"
          dir="rtl"
        >
      </div>
    `;

    container.appendChild(wrapper);
  }

  // ربط أحداث المدخلات
  container.querySelectorAll('.verse-input').forEach(input => {
    // عند التركيز → تحليل فوري
    input.addEventListener('focus', e => {
      activeIndex = parseInt(e.target.dataset.idx, 10);
      updateAnalysisUI(activeIndex, e.target.value, e.target);
    });

    // عند الكتابة → تحليل مؤجل (debounce)
    input.addEventListener('input', e => {
      const idx = parseInt(e.target.dataset.idx, 10);
      verses[idx] = e.target.value;

      clearTimeout(typingTimer);
      typingTimer = setTimeout(() =>
        updateAnalysisUI(idx, e.target.value, e.target), 400
      );

      // إضافة بيت جديد تلقائياً عند اكتمال العجز الأخير
      const isLastSadrOrAjuz = idx >= verses.length - 2;
      const hasContent = e.target.value.trim() !== '';

      if (isLastSadrOrAjuz && hasContent) {
        // we check if both sadr and ajuz in the last row have content
        const lastAjuzIdx = verses.length - 1;
        const lastSadrIdx = verses.length - 2;
        if (verses[lastSadrIdx].trim() !== '' || verses[lastAjuzIdx].trim() !== '') {
            // ensure we only push if we don't have empty lines ahead
            if (verses.length - 1 === lastAjuzIdx) {
                verses.push('', '');
                const scrollY = window.scrollY;
                renderVerses();
                window.scrollTo(0, scrollY);
                // إعادة التركيز على نفس الحقل بعد إعادة الرسم
                const same = container.querySelector(`input[data-idx="${idx}"]`);
                if (same) {
                  same.focus();
                  same.setSelectionRange(same.value.length, same.value.length);
                }
            }
        }
      }
    });
  });

  createIcons();
}

// =============================================
// وظائف مساعدة للمحلل
// =============================================
function fillSample() {
  verses = [...SAMPLE_VERSES];
  activeIndex = 0;
  renderVerses();
  window.closeAnalysis();
}

function clearVerses() {
  verses = ['', '', '', ''];
  activeIndex = 0;
  renderVerses();
  window.closeAnalysis();
}

// Dragging Logic
let isDragging = false;
let startX, startY, initialLeft, initialTop;

document.addEventListener('mousedown', (e) => {
    const analysisHeader = e.target.closest('.analysis-header');
    if (!analysisHeader) return;
    
    if (window.innerWidth <= 768 || e.target.closest('button')) return;
    
    if (!analysisBox) analysisBox = document.getElementById('analysis-box');
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    // Get absolute position relative to document
    const rect = analysisBox.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top + window.scrollY;
    
    // Remove transform and explicitly set position in px to follow mouse
    analysisBox.style.transform = 'none';
    analysisBox.style.left = initialLeft + 'px';
    analysisBox.style.top = initialTop + 'px';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent text selection
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    analysisBox.style.left = (initialLeft + dx) + 'px';
    analysisBox.style.top = (initialTop + dy) + 'px';
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});


// =============================================
// التهيئة عند تحميل الصفحة
// =============================================
document.addEventListener('DOMContentLoaded', () => {

  // ===== بناء شبكة التحديات =====
  const testsData = [
    {
      id: 'complete',
      title: 'أكمل الفراغ',
      desc: 'اختبر حصيلتك من أبيات الشعر الخالدة.',
      icon: 'quote',
      badge: 'سهل',
      badgeClass: ''
    },
    {
      id: 'meter',
      title: 'فراسة البحور',
      desc: 'هل تستطيع تمييز البحر من نظرة واحدة؟',
      icon: 'target',
      badge: 'متوسط',
      badgeClass: 'purple'
    },
    {
      id: 'poet',
      title: 'من القائل',
      desc: 'أعد كل بيت مجيد إلى قائله الأصيل.',
      icon: 'feather',
      badge: 'متوسط',
      badgeClass: 'blue'
    },
    {
      id: 'rhetoric',
      title: 'أسرار البلاغة',
      desc: 'سبر أغوار الجمال البياني في لغة الضاد.',
      icon: 'book-open',
      badge: 'صعب',
      badgeClass: 'gold'
    }
  ];

  const grid = document.getElementById('tests-grid');
  if (grid) {
    testsData.forEach(item => {
      const el = document.createElement('div');
      el.className = 'challenge-item';
      el.innerHTML = `
        <div class="challenge-visual ${item.badgeClass}">
          <i data-lucide="${item.icon}"></i>
        </div>
        <div class="challenge-details">
          <span class="badge ${item.badgeClass}">${item.badge}</span>
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <button class="btn-primary btn-sm">ابدأ التحدي الآن</button>
        </div>
      `;
      // النقر على أي مكان في البطاقة يبدأ التحدي
      el.addEventListener('click', () => startQuiz(item.id));
      grid.appendChild(el);
    });
  }

  // ===== ربط الأحداث للتنقل (تجنب onclick المباشر) =====
  document.querySelectorAll('[data-nav-target]').forEach(el => {
      el.addEventListener('click', (e) => {
          e.preventDefault();
          showSection(el.getAttribute('data-nav-target'));
      });
  });

  const copyAnalysisBtn = document.getElementById('copy-analysis-btn');
  if (copyAnalysisBtn) copyAnalysisBtn.addEventListener('click', window.copyAnalysis);

  const closeAnalysisBtn = document.getElementById('close-analysis-btn');
  if (closeAnalysisBtn) closeAnalysisBtn.addEventListener('click', window.closeAnalysis);

  const copyAllBtn = document.getElementById('copy-all-btn');
  if (copyAllBtn) copyAllBtn.addEventListener('click', (e) => window.copyAllVerses(e.currentTarget));

  const fillSampleBtn = document.getElementById('fill-sample-btn');
  if (fillSampleBtn) fillSampleBtn.addEventListener('click', fillSample);

  const clearVersesBtn = document.getElementById('clear-verses-btn');
  if (clearVersesBtn) clearVersesBtn.addEventListener('click', clearVerses);

  // ===== تعريض الدوال للـ HTML الداخلي =====
  window.showSection  = showSection;
  window.startQuiz    = startQuiz;
  window.fillSample   = fillSample;
  window.clearVerses  = clearVerses;

  createIcons();
});
