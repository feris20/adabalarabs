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
// ADMIN_SECRET ليس هنا — هو في السيرفر فقط
// =============================================
let authToken = sessionStorage.getItem('adminToken') || null;
let isAdmin   = false;

// 🔥 ضع رابط السيرفر الخاص بك هنا! 🔥
// إذا كان السيرفر يعمل على استضافة، ضع الرابط هنا، مثلاً:
// const BASE_URL = 'https://your-server-domain.com';
// إذا كنت تجربه على جهازك (Localhost):
const BASE_URL = 'http://0.0.0.0:21346'; // تأكد من البورت!

async function apiCall(method, path, body=null, auth=false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  
  // دمج الرابط الأساسي مع المسار
  const fullUrl = BASE_URL + path; 
  
  const r = await fetch(fullUrl, opts); // استخدام الرابط الكامل
  
  if (r.status === 401 && auth) { onAuthExpired(); throw new Error('unauthorized'); }
  
  // إذا لم يكن السيرفر يستجيب بشكل صحيح (مثلاً الرمز خطأ)
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
  if (!text||!text.trim()) return {phonetic:"",symbols:"",meter:"..."};
  try {
    const r = await fetch('/analyze', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text.trim()})});
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    return {phonetic:d.phonetic||"",symbols:d.symbols||"",meter:d.meter||"..."};
  } catch { return {phonetic:"السيرفر لا يستجيب..",symbols:"---",meter:"خطأ اتصال"}; }
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
// التنقل
// =============================================
const ALL_SECTIONS = ['home','tests','quiz','arud','museum','museum-poet'];

function showSection(id) {
  ALL_SECTIONS.forEach(s => {
    const el = document.getElementById(`${s}-section`);
    if (el) el.style.display = 'none';
  });
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
    if (t) t.style.display = 'block';
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

// ----- ① Auth عبر السيرفر -----
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
  } catch {
    err.style.display='block'; input.value=''; input.focus();
  }
}

async function adminLogout(e) {
  if(e) e.stopPropagation();
  try { await api.postPublic('/admin/logout'); } catch {}
  authToken=null; isAdmin=false;
  sessionStorage.removeItem('adminToken');
  renderMuseumLanding();
  if(currentPoetId){document.getElementById('admin-add-btn-area').style.display='none';renderPoetContent(currentPoetId);}
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

  lucide.createIcons();
});
