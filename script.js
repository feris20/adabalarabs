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
  { id: 1, title: 'القسم 1: مقدمة في البلاغة', desc: 'فهم الأقسام الرئيسية لعلم البلاغة' }
];
let currentUnitId = practiceUnits[0].id;

const defaultQuestions = [
  { type: 'translate', text: 'هذا الرجل أسدٌ في شجاعته', words: ['هذا', 'الرجل', 'أسدٌ', 'في', 'شجاعته', 'شجاع', 'كالأسد'], correct: ['هذا', 'الرجل', 'أسدٌ', 'في', 'شجاعته'] },
  { type: 'mcq', text: 'ما نوع التشبيه في: "العلم كالنور"؟', options: ['تشبيه بليغ', 'تشبيه مجمل', 'تشبيه مفصل', 'استعارة'], correct: 1 }
];

let practiceNodes = JSON.parse(localStorage.getItem('practiceNodes')) || [
  { id: 1, unitId: 1, type: 'lesson', status: 'completed', title: 'مقدمة', desc: 'أساسيات البلاغة', questions: [] },
  { id: 2, unitId: 1, type: 'lesson', status: 'completed', title: 'التشبيه', desc: 'أركان التشبيه وأنواعه', questions: [] },
  { id: 3, unitId: 1, type: 'review', status: 'current', title: 'مراجعة', desc: 'مراجعة ما سبق', questions: [] },
  { id: 4, unitId: 1, type: 'challenge', status: 'locked', title: 'تحدي', desc: 'اختبار قصير', questions: [] },
  { id: 5, unitId: 1, type: 'lesson', status: 'locked', title: 'الاستعارة', desc: 'الاستعارة المكنية والتصريحية', questions: [] },
  { id: 6, unitId: 1, type: 'lesson', status: 'locked', title: 'الكناية', desc: 'أنواع الكناية', questions: [] },
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
        lucide.createIcons(); // refresh fire icon
    }, 600);
  }
}

// Call on load
document.addEventListener('DOMContentLoaded', checkStreakOnLoad);

let currentNodeId = null;

function renderPracticePath() {
  const container = document.getElementById('path-container');
  if (!container) return;
  container.innerHTML = '';
  
  // Show/Hide Admin Add Node button
  const adminBtn = document.getElementById('admin-add-practice-btn');
  if (adminBtn) adminBtn.style.display = isAdmin ? 'block' : 'none';
  
  // Update unit banner
  const unit = practiceUnits.find(u => u.id === currentUnitId);
  if (unit) {
    document.getElementById('practice-unit-title').textContent = unit.title;
    document.getElementById('practice-unit-desc').textContent = unit.desc;
  }
  
  const unitNodes = practiceNodes.filter(n => n.unitId === currentUnitId);
  const svgStr = [];
  
  unitNodes.forEach((node, index) => {
    // SVG Line to next node
    if (index < unitNodes.length - 1) {
      const offsetX1 = Math.sin(index * 1.5) * 60;
      const offsetX2 = Math.sin((index + 1) * 1.5) * 60;
      const startX = 100 + offsetX1;
      const startY = 20 + index * 110 + 35; 
      const endX = 100 + offsetX2;
      const endY = 20 + (index + 1) * 110 + 35;
      svgStr.push(`
        <path d="M ${startX} ${startY} C ${startX} ${startY + 40}, ${endX} ${endY - 40}, ${endX} ${endY}"
              fill="none" stroke="var(--color-border)" stroke-width="12" stroke-linecap="round" />
      `);
    }

    const el = document.createElement('div');
    const offsetX = Math.sin(index * 1.5) * 60;
    el.className = `path-node node-${node.status}`;
    
    // Winding path calculation (sine wave)
    el.style.transform = `translateX(${offsetX}px)`;
    
    let icon = 'star';
    if (node.type === 'lesson') icon = 'book-open';
    if (node.type === 'review') icon = 'refresh-cw';
    if (node.type === 'challenge') icon = 'zap';
    if (node.status === 'completed') icon = 'check';
    
    el.innerHTML = `<i data-lucide="${icon}"></i>`;
    
    el.onclick = () => openNodePopup(node);
    
    container.appendChild(el);
  });
  
  // Insert SVG background
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
  svgWrapper.innerHTML = `<svg width="200" height="100%" style="overflow:visible;">
    ${svgStr.join('')}
  </svg>`;
  container.insertBefore(svgWrapper, container.firstChild);
  
  lucide.createIcons();
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
  lucide.createIcons();
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
  if (!title) return alert('يرجى إدخال عنوان القسم');
  
  const newId = practiceUnits.length > 0 ? Math.max(...practiceUnits.map(u=>u.id)) + 1 : 1;
  practiceUnits.push({ id: newId, title, desc });
  savePracticeData();
  
  document.getElementById('new-unit-title').value = '';
  document.getElementById('new-unit-desc').value = '';
  
  selectUnit(newId);
}

// === Admin Practice Node Management ===

let editingNodeId = null;

function openAdminAddPracticeNode() {
  editingNodeId = null;
  document.getElementById('node-modal-title').textContent = 'إضافة عقدة جديدة';
  document.getElementById('new-node-title').value = '';
  document.getElementById('new-node-desc').value = '';
  document.getElementById('new-node-type').value = 'lesson';
  document.getElementById('node-levels-container').innerHTML = '';
  addNodeLevel(); // Add default level
  openModal('add-practice-node-modal');
}

function editCurrentNode() {
  closeNodePopup();
  const node = practiceNodes.find(n => n.id === currentNodeId);
  if (!node) return;
  
  editingNodeId = node.id;
  document.getElementById('node-modal-title').textContent = 'تعديل العقدة';
  document.getElementById('new-node-title').value = node.title || '';
  document.getElementById('new-node-desc').value = node.desc || '';
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
    // Legacy support for single level questions
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
  wrapper.style.cssText = 'border: 2px solid var(--color-border); padding: 15px; border-radius: 12px; position: relative; background: var(--color-bg);';
  
  wrapper.innerHTML = `
    <button class="btn-secondary danger" style="position:absolute; top:10px; left:10px; padding: 5px 10px;" onclick="this.parentElement.remove()"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
    <h5 style="margin-bottom: 10px; color: var(--color-accent);">مستوى جديد</h5>
    <div class="level-questions-container" style="display:flex; flex-direction:column; gap:10px; margin-bottom: 10px;"></div>
    <div style="display: flex; gap: 10px;">
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'translate')" style="flex:1;">+ سؤال ترتيب</button>
        <button class="btn-secondary btn-sm" onclick="addQuestionToLevel(this, 'mcq')" style="flex:1;">+ سؤال خيارات</button>
    </div>
  `;
  return wrapper;
}

function addNodeLevel() {
  const container = document.getElementById('node-levels-container');
  container.appendChild(createLevelElement(container.children.length));
  setTimeout(() => lucide.createIcons(), 10);
}

function addQuestionToLevel(btn, type) {
  const container = btn.parentElement.previousElementSibling;
  container.appendChild(createQuestionElement({ type }));
}

function createQuestionElement(qData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'admin-question-wrapper';
  wrapper.style.cssText = 'border: 1px dashed var(--color-border); padding: 10px; border-radius: 8px; position: relative; background: var(--color-surface);';
  wrapper.dataset.type = qData.type;
  
  let html = `<button class="btn-secondary danger" style="position:absolute; top:10px; left:10px; padding: 5px 10px;" onclick="this.parentElement.remove()"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>`;
  
  if (qData.type === 'translate') {
    html += `
      <strong>سؤال ترتيب:</strong>
      <input type="text" class="modal-input q-text" placeholder="النص الأصلي" value="${qData.text || ''}" style="margin-top:5px; margin-bottom:5px;">
      <input type="text" class="modal-input q-words" placeholder="الكلمات المتاحة (افصل بـ +)" value="${(qData.words || []).join('+')}" style="margin-bottom:5px;">
      <input type="text" class="modal-input q-correct" placeholder="الإجابة الصحيحة بالترتيب (افصل بـ +)" value="${(qData.correct || []).join('+')}" style="margin-bottom:5px;">
    `;
  } else if (qData.type === 'mcq') {
    html += `
      <strong>سؤال خيارات:</strong>
      <input type="text" class="modal-input q-text" placeholder="نص السؤال" value="${qData.text || ''}" style="margin-top:5px; margin-bottom:5px;">
      <input type="text" class="modal-input q-options" placeholder="الخيارات المتاحة (افصل بـ +)" value="${(qData.options || []).join('+')}" style="margin-bottom:5px;">
      <input type="number" class="modal-input q-correct" placeholder="رقم الخيار الصحيح (1-4)" min="1" value="${qData.correct !== undefined ? qData.correct + 1 : ''}" style="margin-bottom:5px;">
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
  
  if (!title) return alert('يرجى إدخال عنوان العقدة');
  
  const levels = [];
  const levelWrappers = document.querySelectorAll('.admin-level-wrapper');
  
  levelWrappers.forEach((lw, i) => {
    const questions = [];
    const qWrappers = lw.querySelectorAll('.admin-question-wrapper');
    qWrappers.forEach(w => {
      const qType = w.dataset.type;
      const text = w.querySelector('.q-text').value.trim();
      if (!text) return;
      
      if (qType === 'translate') {
        const words = w.querySelector('.q-words').value.split('+').map(s=>s.trim()).filter(s=>s);
        const correct = w.querySelector('.q-correct').value.split('+').map(s=>s.trim()).filter(s=>s);
        questions.push({ type: 'translate', text, words, correct });
      } else if (qType === 'mcq') {
        const options = w.querySelector('.q-options').value.split('+').map(s=>s.trim()).filter(s=>s);
        const correct = parseInt(w.querySelector('.q-correct').value) - 1;
        questions.push({ type: 'mcq', text, options, correct });
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
      delete node.questions; // clean up old format
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
      levels
    });
  }
  
  savePracticeData();
  renderPracticePath();
  closeModal('add-practice-node-modal');
}

function openNodePopup(node) {
  currentNodeId = node.id;
  document.getElementById('popup-title').textContent = node.title;
  document.getElementById('popup-desc').textContent = node.desc;
  
  const levelsInfo = document.getElementById('popup-levels-info');
  if (levelsInfo) {
    const numLevels = node.levels ? node.levels.length : (node.questions && node.questions.length > 0 ? 1 : 0);
    levelsInfo.textContent = numLevels > 0 ? `يحتوي على ${numLevels} مستوى` : 'لا توجد أسئلة بعد';
  }
  
  const actionsContainer = document.getElementById('popup-actions-container');
  if (actionsContainer) {
    if (node.status === 'completed') {
      actionsContainer.innerHTML = `
        <button class="btn-review" onclick="startLesson('review')">
            مراجعة +5 <i data-lucide="refresh-cw"></i>
        </button>
        <button class="btn-start" onclick="startLesson('start')">
            إعادة التحدي +15 <i data-lucide="play"></i>
        </button>
      `;
    } else if (node.status === 'current' || node.status === 'locked') {
      actionsContainer.innerHTML = `
        <button class="btn-start" onclick="startLesson('start')">
            اجتياز المرحلة +15 <i data-lucide="play"></i>
        </button>
      `;
    }
  }
  
  const adminControls = document.getElementById('admin-node-controls');
  if (adminControls) adminControls.style.display = isAdmin ? 'flex' : 'none';
  
  document.getElementById('node-popup').style.display = 'flex';
  lucide.createIcons();
}

function closeNodePopup() {
  document.getElementById('node-popup').style.display = 'none';
}

// =============================================
// Lesson Logic
// =============================================
let currentLessonQuestions = [
  {
    type: 'translate',
    text: 'هذا الرجل أسدٌ في شجاعته',
    words: ['هذا', 'الرجل', 'أسدٌ', 'في', 'شجاعته', 'شجاع', 'كالأسد'],
    correct: ['هذا', 'الرجل', 'أسدٌ', 'في', 'شجاعته']
  },
  {
    type: 'mcq',
    text: 'ما نوع التشبيه في: "العلم كالنور"؟',
    options: ['تشبيه بليغ', 'تشبيه مجمل', 'تشبيه مفصل', 'استعارة'],
    correct: 1 // index of correct option
  }
];
let currentQuestionIndex = 0;
let userAnswers = []; // For translate type
let selectedOption = null; // For mcq type

function startLesson(mode) {
  closeNodePopup();
  
  const node = practiceNodes.find(n => n.id === currentNodeId);
  currentLessonQuestions = [];
  
  if (node) {
    if (node.levels && node.levels.length > 0) {
      node.levels.forEach(level => {
        if (level.questions) currentLessonQuestions.push(...level.questions);
      });
    } else if (node.questions && node.questions.length > 0) {
      currentLessonQuestions = node.questions;
    }
  }
  
  if (currentLessonQuestions.length === 0) {
    currentLessonQuestions = defaultQuestions; // fallback
  }
  
  showSection('lesson');
  currentQuestionIndex = 0;
  loadQuestion();
}

function loadQuestion() {
  const q = currentLessonQuestions[currentQuestionIndex];
  const area = document.getElementById('lesson-content-area');
  
  // Reset state
  userAnswers = [];
  selectedOption = null;
  document.getElementById('btn-check-answer').className = 'btn-check';
  document.getElementById('lesson-feedback-bar').className = 'lesson-feedback-bar';
  
  // Update progress
  const progress = (currentQuestionIndex / currentLessonQuestions.length) * 100;
  document.getElementById('lesson-progress').style.width = `${progress}%`;
  
  let html = '';
  if (q.type === 'translate') {
    html = `
      <h2 class="question-title">رتب الكلمات لتكوين الجملة</h2>
      <div class="speech-bubble">${q.text}</div>
      <div class="answer-area" id="answer-area"></div>
      <div class="word-bank" id="word-bank">
        ${q.words.map((w, i) => `<button class="word-btn" onclick="selectWord('${w}', this)">${w}</button>`).join('')}
      </div>
    `;
  } else if (q.type === 'mcq') {
    html = `
      <h2 class="question-title">${q.text}</h2>
      <div class="mcq-options">
        ${q.options.map((opt, i) => `<button class="mcq-btn" onclick="selectOption(${i}, this)">${opt}</button>`).join('')}
      </div>
    `;
  }
  area.innerHTML = html;
}

window.selectWord = function(word, btnEl) {
  userAnswers.push(word);
  btnEl.classList.add('selected');
  renderAnswerArea();
  checkIfReady();
};

window.removeWord = function(index) {
  const word = userAnswers.splice(index, 1)[0];
  renderAnswerArea();
  // Unselect in word bank
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

window.selectOption = function(index, btnEl) {
  selectedOption = index;
  const btns = document.querySelectorAll('.mcq-btn');
  btns.forEach(b => b.classList.remove('selected'));
  btnEl.classList.add('selected');
  checkIfReady();
};

function checkIfReady() {
  const q = currentLessonQuestions[currentQuestionIndex];
  const btn = document.getElementById('btn-check-answer');
  if (q.type === 'translate') {
    if (userAnswers.length > 0) btn.classList.add('active');
    else btn.classList.remove('active');
  } else if (q.type === 'mcq') {
    if (selectedOption !== null) btn.classList.add('active');
    else btn.classList.remove('active');
  }
}

window.checkAnswer = function() {
  const btn = document.getElementById('btn-check-answer');
  if (!btn.classList.contains('active')) return;
  
  const q = currentLessonQuestions[currentQuestionIndex];
  let isCorrect = false;
  
  if (q.type === 'translate') {
    isCorrect = JSON.stringify(userAnswers) === JSON.stringify(q.correct);
  } else if (q.type === 'mcq') {
    isCorrect = selectedOption === q.correct;
  }
  
  const feedback = document.getElementById('lesson-feedback-bar');
  const icon = document.getElementById('feedback-icon');
  const title = document.getElementById('feedback-title');
  const desc = document.getElementById('feedback-desc');
  
  if (isCorrect) {
    feedback.className = 'lesson-feedback-bar show success';
    icon.innerHTML = '<i data-lucide="check"></i>';
    title.textContent = 'رائع!';
    desc.textContent = 'إجابة صحيحة';
  } else {
    feedback.className = 'lesson-feedback-bar show error';
    icon.innerHTML = '<i data-lucide="x"></i>';
    title.textContent = 'إجابة خاطئة';
    if (q.type === 'translate') desc.textContent = `الصحيح هو: ${q.correct.join(' ')}`;
    if (q.type === 'mcq') desc.textContent = `الصحيح هو: ${q.options[q.correct]}`;
    
    // Reduce hearts
    const hc = document.getElementById('lesson-heart-count');
    let h = parseInt(hc.textContent);
    if(h > 0) hc.textContent = h - 1;
  }
  lucide.createIcons();
};

window.nextQuestion = function() {
  currentQuestionIndex++;
  if (currentQuestionIndex < currentLessonQuestions.length) {
    loadQuestion();
  } else {
    // Finish lesson
    document.getElementById('lesson-progress').style.width = '100%';
    setTimeout(() => {
      alert("أكملت الدرس بنجاح!");
      
      // Mark current node as completed and unlock next
      const nodeIndex = practiceNodes.findIndex(n => n.id === currentNodeId);
      if (nodeIndex !== -1) {
        practiceNodes[nodeIndex].status = 'completed';
        if (nodeIndex + 1 < practiceNodes.length) {
          if (practiceNodes[nodeIndex + 1].status === 'locked') {
            practiceNodes[nodeIndex + 1].status = 'current';
          }
        }
      }
      activateStreak();
      savePracticeData();
      renderPracticePath();
      showSection('practice');
    }, 500);
  }
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
      lucide.createIcons();
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
      lucide.createIcons();
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
window.copyAllVerses=(btn)=>{const l=[];for(let i=0;i<verses.length;i+=2){const s=verses[i]||'',a=verses[i+1]||'';if(s||a)l.push(`${s} ... ${a}`);}if(!l.length)return;navigator.clipboard.writeText(l.join('\n'));if(btn){const o=btn.innerHTML;btn.innerHTML='<i data-lucide="check"></i> تم النسخ';lucide.createIcons();setTimeout(()=>{btn.innerHTML=o;lucide.createIcons();},2000);}};

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
  lucide.createIcons();
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
function openModal(id){const m=document.getElementById(id);if(m){m.style.display='flex';lucide.createIcons();}}
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
  lucide.createIcons();
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
  lucide.createIcons();

  await loadPoetData(poetId);
  renderPoetContent(poetId);
}

function renderPoetContent(poetId) {
  const entries=museumData[poetId]||[];
  const container=document.getElementById('poet-content-area');
  container.innerHTML='';

  if(entries.length===0){
    container.innerHTML=`<div class="empty-state"><i data-lucide="scroll"></i><p>لم يُضَف محتوى بعد لهذه المعلقة</p></div>`;
    lucide.createIcons();return;
  }

  entries.forEach(entry=>{
    const el=document.createElement('div');
    el.className='museum-entry';
    el.dataset.entryId=entry.id;
    el.innerHTML=entry.type==='text'?buildTextHTML(entry,poetId):buildVersesHTML(entry,poetId);
    container.appendChild(el);
  });

  lucide.createIcons();
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

  lucide.createIcons();
});
