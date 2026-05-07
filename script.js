// بيانات التحديات
const QUIZZES = {
    complete: [
        { question: "الخيلُ والليلُ والبيداءُ تعرفُني... والرمحُ والقرطاسُ و____", options: ["السيفُ", "القلمُ", "الكتابُ", "الحبرُ"], correct: 1 },
        { question: "وما حبُّ الديارِ شغفنَ قلبي... ولكن حبُّ من ____", options: ["بنى الديارا", "سكنَ الديارا", "هجرَ الديارا", "زارَ الديارا"], correct: 1 }
    ],
    meter: [
        { question: "ما البحر الذي وزنه: فعولن مفاعيلن فعولن مفاعلن؟", options: ["الطويل", "الكامل", "البسيط", "الوافر"], correct: 0 }
    ],
    poet: [
        { question: "من القائل: نَقِّل فُؤادَكَ حَيثُ شِئتَ مِنَ الهَوى... ما الحُبُّ إِلّا لِلحَبيبِ الأَوَّلِ؟", options: ["المتنبي", "أبو تمام", "بشار بن برد", "البحتري"], correct: 1 }
    ],
    rhetoric: [
        { question: "ما نوع التشبيه في: 'العمر مثل الضيف'؟", options: ["بليغ", "مجمل", "مرسل", "مؤكد"], correct: 2 }
    ]
};

const SAMPLE_VERSES = ["قِفَا نَبْكِ مِنْ ذِكْرَى حَبِيبٍ ومَنْزِلِ", "بِسِقْطِ اللِّوَى بَيْنَ الدَّخُولِ فَحَوْمَلِ", "إِذَا الشعبُ يوماً أرادَ الحياةَ", "فلا بدَّ أنْ يستجيبَ القدرْ"];

let verses = ['', '', '', ''];
let activeIndex = 0;
let isDark = localStorage.getItem('theme') === 'dark';

// التنقل
function showSection(id) {
    ['home', 'tests', 'quiz', 'arud'].forEach(s => {
        const el = document.getElementById(`${s}-section`);
        if (el) el.style.display = 'none';
    });
    const target = document.getElementById(`${id}-section`);
    if (target) target.style.display = 'block';
    if (id === 'arud') renderVerses();
    lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// الثيم
function applyTheme() {
    document.documentElement.classList.toggle('dark', isDark);
    document.getElementById('moon-icon').style.display = isDark ? 'none' : 'block';
    document.getElementById('sun-icon').style.display = isDark ? 'block' : 'none';
}

// المحلل العروضي
async function analyzeVerses(text) {
    if (!text || !text.trim()) return { phonetic: "", symbols: "", meter: "..." };
    // محاكاة للتحليل في حال عدم توفر API حالياً
    return { phonetic: "كِ-تا-بُن عُ-رُوض-يُن", symbols: "|//|//|/", meter: "بحر الطويل (تجريبي)" };
}

function renderVerses() {
    const container = document.getElementById('verses-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < verses.length; i += 2) {
        const row = document.createElement('div');
        row.className = 'verse-row';
        row.innerHTML = `
            <div class="verse-line-num">${Math.floor(i/2)+1}</div>
            <div class="verse-inputs">
                <input type="text" class="verse-input" data-idx="${i}" value="${verses[i]}" placeholder="صدر البيت">
                <input type="text" class="verse-input" data-idx="${i+1}" value="${verses[i+1]}" placeholder="عجز البيت">
            </div>`;
        container.appendChild(row);
    }
    
    container.querySelectorAll('.verse-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = e.target.dataset.idx;
            verses[idx] = e.target.value;
            if (idx == verses.length - 1 && e.target.value) {
                verses.push('', ''); renderVerses(); 
                container.querySelectorAll('.verse-input')[idx].focus();
            }
        });
    });
}

function fillSample() { verses = [...SAMPLE_VERSES]; renderVerses(); }
function clearVerses() { verses = ['', '', '', '']; renderVerses(); closeAnalysis(); }
function closeAnalysis() { document.getElementById('analysis-box').style.display = 'none'; }

// التحديات
function startQuiz(type) {
    activeQuizType = type; quizIndex = 0; score = 0;
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('quiz-result').style.display = 'none';
    renderQuiz(); showSection('quiz');
}

function renderQuiz() {
    const qData = QUIZZES[activeQuizType][quizIndex];
    document.getElementById('quiz-question').textContent = qData.question;
    const opts = document.getElementById('quiz-options');
    opts.innerHTML = '';
    qData.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.onclick = () => {
            if (i === qData.correct) score++;
            if (quizIndex < QUIZZES[activeQuizType].length - 1) {
                quizIndex++; renderQuiz();
            } else {
                showSection('quiz');
                document.getElementById('quiz-container').style.display = 'none';
                document.getElementById('quiz-result').style.display = 'block';
                document.getElementById('score-text').textContent = score;
                document.getElementById('score-denom').textContent = QUIZZES[activeQuizType].length;
            }
        };
        opts.appendChild(btn);
    });
}

// البدء
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    document.getElementById('theme-toggle').onclick = () => { isDark = !isDark; localStorage.setItem('theme', isDark?'dark':'light'); applyTheme(); };
    
    const grid = document.getElementById('tests-grid');
    if (grid) {
        Object.keys(QUIZZES).forEach(key => {
            const card = document.createElement('div');
            card.className = 'challenge-item';
            card.innerHTML = `<h3>${key === 'complete' ? 'أكمل الفراغ' : key}</h3><button class="btn-primary">ابدأ</button>`;
            card.onclick = () => startQuiz(key);
            grid.appendChild(card);
        });
    }
    lucide.createIcons();
});

window.showSection = showSection;
window.copyAllVerses = (btn) => { alert("تم نسخ الأبيات بنجاح!"); };
