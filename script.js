// المحاكاة البرمجية لنظام aruudy (لحين رفع المكتبة الخاصة بك)
const AruudySystem = {
    process: (text) => {
        if (!text.trim()) return null;
        
        // منطق التحويل من نظام المكتبة لرموزك المفضلة
        // w => o , s => / , v => o , - => /
        const rawProsody = text.replace(/اً/g, "ان").replace(/ة/g, "ت");
        let rawMeter = "";
        for (let i = 0; i < text.length; i++) {
            rawMeter += (i % 3 === 0) ? "s" : "w"; // محاكاة لرموز المكتبة
        }

        const symbols = rawMeter
            .replace(/w/g, 'o')
            .replace(/s/g, '/')
            .replace(/v/g, 'o')
            .replace(/-/g, '/');

        return {
            prosody: rawProsody,
            symbols: symbols,
            bahr: text.length > 5 ? "البحر الكامل" : "غير محدد",
            parts: ["متفاعلن", "متفاعلن"] // تفعيلات افتراضية
        };
    }
};

let verses = ['', '', '', ''];
let activeIndex = 0;

// --- نظام الوضع الداكن المحسن ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    }
}

function updateThemeIcon(isDark) {
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        lucide.createIcons();
    }
}

document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
});

// --- إدارة الأبيات والتحليل ---
function renderVerses() {
    const container = document.getElementById('verses-container');
    // لا نمسح الحاوية بالكامل لمنع مشاكل الـ Focus أثناء الكتابة
    if (container.children.length === 0) {
        setupInitialInputs();
    }
}

function setupInitialInputs() {
    const container = document.getElementById('verses-container');
    container.innerHTML = '';
    verses.forEach((verse, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = `verse-input-wrapper mb-6 transition-all duration-300 ${idx === activeIndex ? 'active' : ''}`;
        wrapper.id = `wrapper-${idx}`;
        
        wrapper.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="w-10 pt-4 flex justify-center text-text-muted/40 font-mono text-sm">${idx + 1}</div>
                <div class="flex-grow relative">
                    <input type="text" value="${verse}" 
                        class="verse-input w-full p-4 md:p-6 text-2xl font-serif bg-transparent border-b-2 border-border focus:outline-none focus:border-primary transition-all"
                        placeholder="${idx % 2 === 0 ? 'صدر البيت...' : 'عجز البيت...'}"
                        onfocus="setActive(${idx})"
                        oninput="updateVerse(${idx}, this.value)">
                </div>
            </div>
            <div id="analysis-mobile-${idx}" class="lg:hidden mt-4 animate-slide-up"></div>
        `;
        container.appendChild(wrapper);
    });
    lucide.createIcons();
}

function setActive(idx) {
    activeIndex = idx;
    document.querySelectorAll('.verse-input-wrapper').forEach((el, i) => {
        el.classList.toggle('active', i === idx);
    });
    updateAnalysisDisplay();
}

function updateVerse(idx, value) {
    verses[idx] = value;
    updateAnalysisDisplay();
}

function updateAnalysisDisplay() {
    const text = verses[activeIndex];
    const data = AruudySystem.process(text);
    const panelHTML = data ? createAnalysisUI(data) : `<p class="text-text-muted">اكتب شطراً للتحليل...</p>`;
    
    // تحديث اللوحة لسطح المكتب
    document.getElementById('desktop-analysis-panel').innerHTML = panelHTML;
    
    // تحديث اللوحة للجوال (داخل الـ wrapper النشط)
    const mobileContainer = document.getElementById(`analysis-mobile-${activeIndex}`);
    if (mobileContainer) {
        // نمسح بقية الحاويات المحمولة
        document.querySelectorAll('[id^="analysis-mobile-"]').forEach(el => el.innerHTML = '');
        mobileContainer.innerHTML = panelHTML;
    }
    lucide.createIcons();
}

function createAnalysisUI(data) {
    return `
        <div class="glass-panel rounded-3xl overflow-hidden animate-fade-in">
            <div class="bg-primary/10 p-6 border-b border-border">
                <span class="text-xs font-bold text-secondary uppercase block mb-1">نتائج التحليل</span>
                <h3 class="text-3xl font-serif font-bold text-primary">${data.bahr}</h3>
            </div>
            <div class="p-6 space-y-6">
                <div>
                    <label class="text-xs text-text-muted mb-2 block">الترميز (System):</label>
                    <div class="text-2xl font-mono tracking-widest bg-bg p-4 rounded-xl border border-border text-center" dir="ltr">
                        ${data.symbols}
                    </div>
                </div>
                <div>
                    <label class="text-xs text-text-muted mb-2 block">التفاعلات:</label>
                    <div class="flex flex-wrap gap-2">
                        ${data.parts.map(p => `<span class="bg-secondary/20 text-secondary px-3 py-1 rounded-lg text-sm font-bold">${p}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// البدء
initTheme();
renderVerses();
updateAnalysisDisplay();
