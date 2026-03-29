'use strict';
const App={
_data:null,_loading:false,
/* Performance optimized data loading with caching */
async loadData(){
  if(this._data)return this._data;
  if(this._loading)return new Promise(r=>setTimeout(()=>r(this.loadData()),100));
  this._loading=true;
  try{
    const resp=await fetch('data/subjects.json');
    if(!resp.ok)throw new Error('HTTP '+resp.status);
    this._data=await resp.json();
  }catch(e){
    console.warn('Data load failed:',e.message);
    this._data={subjects:[]};
  }
  this._loading=false;
  this._mergeAdminData();
  return this._data;
},
_mergeAdminData(){
  if(!this._data)return;
  const ov=this._parseLS('vm_overrides',{});
  const ad=this._parseLS('vm_admin_data',{subjects:[],quiz:[],pdfs:[],ncertTopics:[],announcements:[],teachers:[],animations:[],images:[],activities:[]});
  this._data.subjects.forEach(s=>{
    s.chapters.forEach(ch=>{
      const key=`${s.id}::${ch.id}`,o=ov[key];if(!o)return;
      if(o.videoId&&ch.lessons?.length)ch.lessons[0].videoId=o.videoId;
      if(o.lesson0Title&&ch.lessons?.length)ch.lessons[0].title=o.lesson0Title;
      if(o.extraLessons?.length)ch.lessons=[...(ch.lessons||[]),...o.extraLessons];
      if(o.adminNote)ch._adminNote=o.adminNote;
      if(o.extraTopics?.length)ch.ncertTopics=[...(ch.ncertTopics||[]),...o.extraTopics];
      if(o.extraQuiz?.length)ch.quiz=[...(ch.quiz||[]),...o.extraQuiz];
      if(o.replaceQuiz?.length)ch.quiz=o.replaceQuiz;
      if(o.extraAnimations?.length)ch.animations=[...(ch.animations||[]),...o.extraAnimations];
      if(o.extraImages?.length)ch.images=[...(ch.images||[]),...o.extraImages];
      if(o.extraActivities?.length)ch.activities=[...(ch.activities||[]),...o.extraActivities];
    });
  });
  (ad.subjects||[]).forEach(cs=>{
    if(!this._data.subjects.find(s=>s.id===cs.id)){
      this._data.subjects.push({id:cs.id||this._slug(cs.name),name:cs.name,nameHi:'',icon:cs.icon||'📖',description:cs.desc||'',chapters:cs.chapters||[],gradient:`linear-gradient(135deg,${cs.color||'#6C63FF'},#4F46E5)`,glow:'rgba(108,99,255,.1)',bg:'rgba(108,99,255,.07)',border:'rgba(108,99,255,.2)',color:cs.color||'#6C63FF'});
    }
  });
},
saveOverride(sid,cid,patch){const ov=this._parseLS('vm_overrides',{});const key=`${sid}::${cid}`;ov[key]={...(ov[key]||{}),...patch};this._saveLS('vm_overrides',ov);this._data=null;},
getOverride(sid,cid){return(this._parseLS('vm_overrides',{}))[`${sid}::${cid}`]||{};},
_parseLS(k,def){try{return JSON.parse(localStorage.getItem(k)||'null')??def;}catch{return def;}},
_saveLS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
_slug(s){return(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');},
getSubject(id){return(this._data?.subjects||[]).find(s=>s.id===id)||null;},
getChapter(sid,cid){return(this.getSubject(sid)?.chapters||[]).find(c=>c.id===cid)||null;},
getParam(k){return new URLSearchParams(location.search).get(k);},
/* Profile */
getProfile(){return this._parseLS('vm_profile',null);},
saveProfile(p){this._saveLS('vm_profile',p);},
hasProfile(){const p=this.getProfile();return!!(p?.name);},
showOnboarding(cb){
  const el=document.createElement('div');el.className='wall-overlay';el.id='obOverlay';
  let step=0,selSubj='',obName='',role='student';
  const subs=[{id:'mathematics',icon:'📐',name:'Mathematics'},{id:'science',icon:'🔬',name:'Science'},{id:'social-science',icon:'🌍',name:'Social Science'}];
  const render=()=>{
    if(step===0){
      el.innerHTML=`<div class="wall-card ob-step">
        <span class="wall-icon">✨</span>
        <div class="wall-title">Welcome to Class 10Edu</div>
        <div class="wall-sub">Choose your role — we’ll personalise the experience.</div>
        <div class="ob-option${role==='student'?' picked':''}" data-role="student"><span class="ob-icon">🎓</span><span class="ob-label">Student</span><span class="ob-check">${role==='student'?'✓':''}</span></div>
        <div class="ob-option${role==='teacher'?' picked':''}" data-role="teacher"><span class="ob-icon">👨‍🏫</span><span class="ob-label">Teacher</span><span class="ob-check">${role==='teacher'?'✓':''}</span></div>
        <button class="btn btn-b" id="obR1" style="width:100%;justify-content:center;margin-top:12px">Continue →</button>
      </div>`;
      el.querySelectorAll('.ob-option').forEach(o=>o.addEventListener('click',()=>{role=o.dataset.role;render();}));
      el.querySelector('#obR1').addEventListener('click',()=>{step=1;render();});
      return;
    }
    if(step===1){
      el.innerHTML=`<div class="wall-card ob-step">
        <span class="wall-icon">👋</span>
        <div class="wall-title">Let’s set you up</div>
        <div class="wall-sub">Quick setup — 10 seconds.</div>
        <div class="fg"><label>Your Name</label><input class="fc" id="obName" placeholder="e.g. Arjun Sharma" maxlength="40" autocomplete="given-name" autofocus></div>
        <button class="btn btn-b" id="obN1" style="width:100%;justify-content:center;margin-top:4px">Continue →</button>
      </div>`;
      const inp=el.querySelector('#obName');
      setTimeout(()=>inp?.focus(),100);
      el.querySelector('#obN1').addEventListener('click',()=>{
        const v=VidyaSec.sanitize((inp?.value||'').trim());
        if(!v){inp?.focus();return;}
        obName=v;step=2;render();
      });
      inp?.addEventListener('keydown',e=>{if(e.key==='Enter')el.querySelector('#obN1')?.click();});
    } else {
      el.innerHTML=`<div class="wall-card ob-step">
        <span class="wall-icon">📚</span>
        <div class="wall-title">Hi, ${VidyaSec.sanitize(obName)}!</div>
        <div class="wall-sub">Pick your favourite subject — we'll show it first on your dashboard.</div>
        ${subs.map(s=>`<div class="ob-option${selSubj===s.id?' picked':''}" data-id="${s.id}"><span class="ob-icon">${s.icon}</span><span class="ob-label">${s.name}</span><span class="ob-check">${selSubj===s.id?'✓':''}</span></div>`).join('')}
        <button class="btn btn-b" id="obDone" style="width:100%;justify-content:center;margin-top:12px"${selSubj?'':' disabled'}>Start Learning →</button>
      </div>`;
      el.querySelectorAll('.ob-option').forEach(o=>o.addEventListener('click',()=>{selSubj=o.dataset.id;render();}));
      el.querySelector('#obDone')?.addEventListener('click',()=>{
        this.saveProfile({role,name:obName,favourite:selSubj,joinedAt:Date.now()});
        el.style.opacity='0';el.style.transition='opacity .3s';
        setTimeout(()=>{el.remove();if(cb)cb();},300);
      });
    }
  };
  document.body.appendChild(el);render();
},
/* Progress */
getProgress(){return this._parseLS('vm_prog',{});},
saveProgress(p){this._saveLS('vm_prog',p);},
_ep(p,sid){if(!p[sid])p[sid]={done:[],scores:{},last:null,watched:[]};},
markDone(sid,cid){const p=this.getProgress();this._ep(p,sid);if(!p[sid].done.includes(cid))p[sid].done.push(cid);this.saveProgress(p);this.updateStreak();},
saveScore(sid,cid,score,total){const p=this.getProgress();this._ep(p,sid);p[sid].scores[cid]={score,total,pct:Math.round(score/total*100),ts:Date.now()};this.saveProgress(p);},
setLast(sid,cid,title){const p=this.getProgress();this._ep(p,sid);p[sid].last={cid,title,ts:Date.now()};this.saveProgress(p);},
markWatched(sid,cid,lid){if(!lid)return;const p=this.getProgress();this._ep(p,sid);const k=`${cid}::${lid}`;if(!p[sid].watched.includes(k))p[sid].watched.push(k);this.saveProgress(p);},
getSubjPct(sid,subj){const p=this.getProgress()[sid]||{};return subj.chapters.length?Math.round(((p.done||[]).length/subj.chapters.length)*100):0;},
getBookmarks(){return this._parseLS('vm_bm',[]);},
toggleBookmark(s,c){const bm=this.getBookmarks(),k=`${s}::${c}`,i=bm.indexOf(k);if(i>=0)bm.splice(i,1);else bm.push(k);this._saveLS('vm_bm',bm);return i<0;},
isBookmarked(s,c){return this.getBookmarks().includes(`${s}::${c}`);},
updateStreak(){const today=new Date().toDateString(),last=localStorage.getItem('vm_sdate');let s=parseInt(localStorage.getItem('vm_streak')||'0');if(last!==today){s=(last===new Date(Date.now()-86400000).toDateString())?s+1:1;localStorage.setItem('vm_streak',s);localStorage.setItem('vm_sdate',today);}},
/* Theme */
applyMode(){document.documentElement.setAttribute('data-mode',localStorage.getItem('vm_mode')||'light');},
setMode(m){document.documentElement.setAttribute('data-mode',m);localStorage.setItem('vm_mode',m);document.querySelectorAll('.mt-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));const btn=document.getElementById('modeBtn');if(btn)btn.innerHTML=m==='dark'?'☀️':'🌙';},
toggleMode(){this.setMode((localStorage.getItem('vm_mode')||'light')==='dark'?'light':'dark');},
setScheme(s){document.documentElement.setAttribute('data-scheme',s);localStorage.setItem('vm_scheme',s);App.toast('Theme updated');},
/* Ads */
isFocus(){return localStorage.getItem('vm_focus')==='1';},
adNative(slot){
  if(this.isFocus()) return '';
  const ads={
    dashboard:{logo:'📘',title:'Unlock full mock papers',desc:'500+ CBSE Board questions with detailed solutions',cta:'Try Free',href:'#'},
    subjects:{logo:'🎯',title:'Personalised study plans',desc:'Expert teachers · Adaptive learning · Board-focused',cta:'Learn More',href:'#'}
  };
  const ad=ads[slot]||ads.dashboard;
  return`<div class="ad-native"><div class="ad-logo">${ad.logo}</div><div class="ad-body"><div class="ad-title">${ad.title}</div><div class="ad-desc">${ad.desc}</div></div><a href="${ad.href}" class="ad-cta" target="_blank" rel="noopener sponsored">${ad.cta}</a></div>`;
},
adBanner(){
  if(this.isFocus()) return '';
  return`<div class="ad-banner"><div class="ad-banner-icon">🏆</div><div class="ad-banner-text"><div class="ad-banner-title">Previous Years' Board Papers</div><div class="ad-banner-sub">2015–2024 with full solutions — free to download</div></div><a href="#" class="ad-banner-btn" target="_blank" rel="noopener sponsored">View →</a></div>`;
},
/* Navbar */
navbarHTML(){
  const profile=this.getProfile();
  const name=VidyaSec.sanitize(profile?.name||'Student');
  const initials=name[0]?.toUpperCase()||'S';
  const site=VidyaSec.sanitize(localStorage.getItem('vm_site_name')||'Class 10Edu');
  const mode=localStorage.getItem('vm_mode')||'light';
  return `<nav class="topnav au glass-nav" id="mainNav">
    <button class="nav-ic mob-burger" onclick="App.toggleSidebar()" style="display:none">☰</button>
    <a href="dashboard.html" class="nav-brand">
      <div class="nav-gem">C</div>
      <div class="nav-wordmark">
        <span class="nav-title">${site}</span>
        <span class="nav-sub">Class 10 · Premium</span>
      </div>
    </a>
    <div class="nav-search">
      <span class="nav-sico">⌕</span>
      <input type="text" id="searchInput" placeholder="Search for chapters, topics..." autocomplete="off" oninput="App.doSearch(this.value)" onfocus="App.showSearch()" onblur="setTimeout(()=>App.hideSearch(),200)">
      <div class="search-drop" id="searchDrop"></div>
    </div>
    <div class="nav-right">
      <button class="nav-ic" onclick="App.toggleMode()" id="modeBtn" title="Toggle Appearance">${mode==='dark'?'☀️':'🌙'}</button>
      <button class="nav-ic" onclick="ThemeEngine.toggle()" title="Themes">🎨</button>
      <div class="user-pill" onclick="App._showProfileEdit()">
        <div class="user-av">${initials}</div>
        <span class="user-nm">${name}</span>
      </div>
    </div>
  </nav>`;
},
/* Sidebar */
sidebarHTML(active){
  const role = localStorage.getItem('vm_user_role') || 'student';
  const subs=[{id:'mathematics',name:'Math',icon:'📐'},{id:'science',name:'Science',icon:'🔬'},{id:'social-science',name:'SST',icon:'🌍'}];
  
  let navLinks;
  if (role === 'teacher') {
    navLinks = `
      <div class="sb-lbl">Teacher Tools</div>
      <a href="dashboard.html" class="sb-link ${active==='dashboard'?'on':''}"><span class="sb-icon">🏠</span> Dashboard</a>
      <a href="question-papers.html" class="sb-link ${active==='question-papers'?'on':''}"><span class="sb-icon">✍️</span> Question Papers</a>
      <a href="admin.html" class="sb-link ${active==='admin'?'on':''}"><span class="sb-icon">⚙️</span> Content Admin</a>
    `;
  } else {
    navLinks = `
      <div class="sb-lbl">Learning Path</div>
      <a href="dashboard.html" class="sb-link ${active==='dashboard'?'on':''}"><span class="sb-icon">🏠</span> Dashboard</a>
      <a href="todo.html" class="sb-link ${active==='todo'?'on':''}"><span class="sb-icon">✅</span> Study Planner</a>
      <a href="bookmarks.html" class="sb-link ${active==='bookmarks'?'on':''}"><span class="sb-icon">🔖</span> Bookmarks</a>
    `;
  }

  return `<aside class="sidebar au-1" id="sidebar">
    ${navLinks}
    <div class="sb-div"></div>
    <div class="sb-lbl">Subjects</div>
    ${subs.map(s=>`<a href="subject.html?id=${s.id}" class="sb-link ${active===s.id?'on':''}"><span class="sb-icon">${s.icon}</span> ${s.name}</a>`).join('')}
    <div class="sb-div"></div>
    <a href="#" onclick="App.logout()" class="sb-link" style="margin-top:auto; opacity:0.6"><span class="sb-icon">↩️</span> Sign Out</a>
  </aside>`;
},
/* Toast Notifications */
showToast(message, type='info', duration=3000){
  let container = document.getElementById('toastContainer');
  if(!container){
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = {success: '✓', error: '✕', info: 'ℹ'};
  toast.innerHTML = `<span style="font-size:18px">${icons[type]}</span><span style="font-weight:600">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
},

/* Bottom Navigation for Mobile */
bottomNavHTML(active='dashboard'){
  const items = [
    {id:'dashboard', icon:'🏠', label:'Home'},
    {id:'subjects', icon:'📚', label:'Subjects'},
    {id:'todo', icon:'✅', label:'Tasks'},
    {id:'bookmarks', icon:'🔖', label:'Saved'},
    {id:'profile', icon:'👤', label:'Profile'}
  ];
  return `<nav class="bottom-nav">
    <div class="bottom-nav-inner">
      ${items.map(item => `<a href="${item.id}.html" class="bn-item ${active===item.id?'active':''}">
        <span class="bn-icon">${item.icon}</span>
        <span class="bn-label">${item.label}</span>
      </a>`).join('')}
    </div>
  </nav>`;
},

/* Skeleton Loading HTML */
skeletonDashboardHTML(){
  return `<div class="skeleton-dashboard page-transition">
    <div class="skeleton-main">
      <div class="skeleton skeleton-card" style="height:180px;"></div>
      <div class="skeleton skeleton-card" style="height:140px;"></div>
      <div class="skeleton-grid-3">
        <div class="skeleton skeleton-card" style="height:100px;"></div>
        <div class="skeleton skeleton-card" style="height:100px;"></div>
        <div class="skeleton skeleton-card" style="height:100px;"></div>
      </div>
    </div>
    <div class="skeleton-sidebar">
      <div class="skeleton skeleton-card" style="height:120px;"></div>
      <div class="skeleton skeleton-card" style="height:80px;"></div>
      <div class="skeleton skeleton-card" style="height:200px;"></div>
    </div>
  </div>`;
},

skeletonSubjectHTML(){
  return `<div class="skeleton-subject page-transition">
    <div class="skeleton skeleton-header" style="height:120px;margin-bottom:24px;"></div>
    <div class="skeleton-list">
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
    </div>
  </div>`;
},

skeletonChapterHTML(){
  return `<div class="skeleton-chapter page-transition">
    <div class="skeleton skeleton-header" style="height:80px;margin-bottom:24px;"></div>
    <div class="skeleton skeleton-video" style="height:200px;margin-bottom:24px;"></div>
    <div class="skeleton skeleton-text" style="width:90%;"></div>
    <div class="skeleton skeleton-text" style="width:75%;"></div>
    <div class="skeleton skeleton-text" style="width:85%;"></div>
    <div class="skeleton skeleton-text short"></div>
  </div>`;
},

/* Preload next page - Instant navigation */
preloadPage(url){
  if(!url || this._preloading) return;
  this._preloading = true;
  
  // Create hidden iframe to preload
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden;';
  iframe.src = url;
  
  // Remove after load or timeout
  const cleanup = () => {
    iframe.remove();
    this._preloading = false;
  };
  
  iframe.onload = cleanup;
  setTimeout(cleanup, 5000); // 5s timeout
  
  document.body.appendChild(iframe);
},

/* Progressive content loader - Show immediately, fill gradually */
progressiveLoad(container, contentArray, delay=50){
  container.innerHTML = '';
  container.classList.add('stagger-children');
  
  contentArray.forEach((item, index) => {
    const el = document.createElement('div');
    el.innerHTML = item;
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    container.appendChild(el);
    
    // Staggered animation
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, index * delay);
    });
  });
},

/* Optimistic UI update - Update before server confirms */
optimisticUpdate(element, newState, rollbackFn){
  const previousState = element.innerHTML;
  element.innerHTML = newState;
  
  // Return rollback function for error handling
  return () => {
    element.innerHTML = previousState;
    if(rollbackFn) rollbackFn();
  };
},

/* Haptic Feedback - Ultra-fast 20ms */
haptic(duration=50){
  if('vibrate' in navigator) navigator.vibrate(duration);
},

/* Pull to Refresh Setup */
setupPullToRefresh(callback){
  if(window.innerWidth > 768) return; // Mobile only
  let startY = 0;
  let pulling = false;
  const main = document.querySelector('.main-area');
  if(!main) return;
  
  main.addEventListener('touchstart', (e) => {
    if(main.scrollTop === 0) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  }, {passive: true});
  
  main.addEventListener('touchmove', (e) => {
    if(!pulling) return;
    const y = e.touches[0].clientY;
    const diff = y - startY;
    if(diff > 80 && main.scrollTop === 0) {
      pulling = false;
      this.haptic(20);
      if(callback) callback();
    }
  }, {passive: true});
},

/* Logout */
logout(){
  localStorage.removeItem('vm_user_role');
  window.location.href = 'login.html';
},
 /* Pomodoro Timer */
 timerHTML(){
  return `<div class="timer-widget au-4" id="timerWidget" style="position:fixed; bottom:32px; left:32px; z-index:1000">
    <div class="premium-card timer-card" id="timerCard" style="padding:16px; display:flex; align-items:center; gap:12px; min-width:220px; transition:all 0.2s ease-out;">
      <div id="timerIcon" style="font-size:24px; cursor:pointer;" onclick="App.toggleMinimizeTimer()">⏱️</div>
      <div id="timerContent" style="flex:1; display:flex; flex-direction:column; gap:2px;">
        <div id="timerDisplay" style="font-size:1.2rem; font-weight:900; font-family:var(--mono)">25:00</div>
        <div id="timerLabel" style="font-size:0.65rem; font-weight:700; color:var(--ink-4); text-transform:uppercase">Focus Session</div>
      </div>
      <button class="btn btn-gh" id="timerMinimizeBtn" style="width:32px; height:32px; padding:0; border-radius:8px; flex-shrink:0; font-size:16px;" onclick="App.toggleMinimizeTimer()">−</button>
      <div id="timerControls" style="display:flex; align-items:center; gap:8px;">
        <button class="btn btn-primary" id="timerBtn" style="width:40px; height:40px; padding:0; border-radius:12px; flex-shrink:0;" onclick="App.toggleTimer()">▶</button>
      </div>
    </div>
  </div>`;
 },
 _timer: null,
 _timeLeft: 1500,
 _timerMinimized: false,
 toggleMinimizeTimer(){
   const widget = document.getElementById('timerWidget');
   const card = document.getElementById('timerCard');
   const content = document.getElementById('timerContent');
   const controls = document.getElementById('timerControls');
   const minBtn = document.getElementById('timerMinimizeBtn');
   const icon = document.getElementById('timerIcon');
   
   if (!widget || !card) return; // Safety check
   
   this._timerMinimized = !this._timerMinimized;
   
   // Toggle class for CSS-based styling
   widget.classList.toggle('minimized', this._timerMinimized);
   
   if (this._timerMinimized) {
     // Minimized state - compact pill
     card.style.padding = '8px 12px';
     card.style.minWidth = 'auto';
     card.style.borderRadius = '50px';
     if (content) content.style.display = 'none';
     if (controls) controls.style.display = 'none';
     if (icon) icon.style.fontSize = '20px';
     if (minBtn) {
       minBtn.innerHTML = '+';
       minBtn.style.display = 'inline-flex';
     }
     widget.style.cursor = 'pointer';
     widget.onclick = null;
   } else {
     // Expanded state - full widget
     card.style.padding = '16px';
     card.style.minWidth = '220px';
     card.style.borderRadius = '16px';
     if (content) content.style.display = 'flex';
     if (controls) controls.style.display = 'flex';
     if (icon) icon.style.fontSize = '24px';
     if (minBtn) minBtn.innerHTML = '−';
     widget.style.cursor = 'default';
     widget.onclick = null;
   }
 },
 toggleTimer(){
   const btn=document.getElementById('timerBtn'), disp=document.getElementById('timerDisplay');
   if(this._timer){
     clearInterval(this._timer); this._timer=null;
     btn.innerHTML='▶'; btn.style.background='var(--accent)';
   } else {
     btn.innerHTML='■'; btn.style.background='#EF4444';
     this._timer=setInterval(()=>{
       this._timeLeft--;
       if(this._timeLeft<=0){
         clearInterval(this._timer); this._timer=null;
         this.toast('Session Complete! Take a break. ☕');
         this._timeLeft=1500; btn.innerHTML='▶';
       }
       const m=Math.floor(this._timeLeft/60), s=this._timeLeft%60;
       disp.innerHTML=`${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
     },1000);
   }
 },
/* Progress Ring Helper */
progressRingHTML(pct, size=64){
  const r=(size/2)-4, circ=2*Math.PI*r, off=circ-(pct/100*circ);
  return `<div class="progress-ring" style="width:${size}px;height:${size}px;position:relative">
    <svg width="${size}" height="${size}" class="progress-ring-svg">
      <circle class="progress-ring-bg" cx="${size/2}" cy="${size/2}" r="${r}"></circle>
      <circle class="progress-ring-fill" cx="${size/2}" cy="${size/2}" r="${r}" style="stroke-dasharray:${circ};stroke-dashoffset:${off}"></circle>
    </svg>
    <div class="progress-val" style="font-size:${size/4.5}px">${pct}%</div>
  </div>`;
},
/* Theme panel */
themeHTML(){
  const mode=localStorage.getItem('vm_mode')||'light';
  const focus=this.isFocus();
  return`<div class="slide-panel" id="themePanel">
    <div class="sp-head"><h3> Appearance</h3><button class="btn btn-gh btn-sm" onclick="ThemeEngine.toggle()">✕</button></div>
    <span class="sp-lbl">Colour Mode</span>
    <div class="mode-toggle">
      <div class="mt-btn ${mode==='light'?'active':''}" data-mode="light" onclick="App.setMode('light')">☀️ Light</div>
      <div class="mt-btn ${mode==='dark'?'active':''}" data-mode="dark" onclick="App.setMode('dark')">🌙 Dark</div>
    </div>
    <span class="sp-lbl">Focus Mode</span>
    <div class="gcard" style="padding:12px;margin-bottom:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div>
          <div style="font-size:.82rem;font-weight:800;color:var(--ink);margin-bottom:2px">Distraction-free</div>
          <div style="font-size:.74rem;color:var(--ink-3);line-height:1.5">Hide ads and reduce non-essential prompts.</div>
        </div>
        <button class="btn ${focus?'btn-b':'btn-gh'} btn-sm" id="focusBtn" onclick="App.toggleFocus()">${focus?'On':'Off'}</button>
      </div>
    </div>
    <span class="sp-lbl">Extract from Photo</span>
    <div class="upload-drop" onclick="document.getElementById('themeFileInp').click()">
      <input type="file" id="themeFileInp" accept="image/*" style="display:none" onchange="ThemeEngine.handleUpload(event)">
      <div style="font-size:24px;margin-bottom:5px">🖼️</div>
      <p style="font-size:.82rem;color:var(--ink-3);font-weight:600;margin-bottom:2px">Upload any image</p>
      <span style="font-size:.72rem;color:var(--ink-4)">Colours extracted automatically</span>
    </div>
    <div id="themePreviewWrap" style="display:none">
      <img id="themePreviewImg" src="" alt="" style="width:100%;height:78px;object-fit:cover;border-radius:8px;margin-bottom:8px">
      <div class="swatches-row" id="swatchRow"></div>
      <button class="btn btn-b" style="width:100%;margin-bottom:6px" onclick="ThemeEngine.applyExtracted()">✨ Apply Colours</button>
      <button class="btn btn-gh" style="width:100%" onclick="ThemeEngine.reset()">↺ Reset</button>
    </div>
  </div>
  <div class="backdrop" id="themeBack" onclick="ThemeEngine.toggle()"></div>`;
},
toggleFocus(){
  const on=this.isFocus();
  localStorage.setItem('vm_focus', on?'0':'1');
  this.toast(on?'Focus mode off':'Focus mode on','focus karo');
  // Soft refresh for ad slots & panels
  setTimeout(()=>location.reload(),250);
},
todoPanelHTML(){return`<div class="slide-panel" id="todoPanel"><div class="sp-head"><h3>✅ My Tasks</h3><button class="btn btn-gh btn-sm" onclick="TodoPanel.toggle()">✕</button></div><div id="todoPanelBody"></div></div><div class="backdrop" id="todoBack" onclick="TodoPanel.toggle()"></div>`;},
_showProfileEdit(){
  const profile=this.getProfile()||{};
  const ov=document.createElement('div');ov.className='wall-overlay';
  ov.innerHTML=`<div class="wall-card"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px"><div class="wall-title" style="font-size:1.2rem">Edit Profile</div><button class="btn btn-gh btn-sm" id="cpClose">✕</button></div><div class="fg"><label>Your Name</label><input class="fc" id="cpName" value="${VidyaSec.sanitize(profile.name||'')}" maxlength="40"></div><button class="btn btn-b" id="cpSave" style="width:100%;justify-content:center;margin-top:4px">Save</button></div>`;
  document.body.appendChild(ov);
  ov.querySelector('#cpClose').addEventListener('click',()=>ov.remove());
  ov.querySelector('#cpSave').addEventListener('click',()=>{
    const name=VidyaSec.sanitize((ov.querySelector('#cpName').value||'').trim());
    if(!name)return;
    this.saveProfile({...profile,name});ov.remove();
    const nb=document.getElementById('nb');if(nb)nb.innerHTML=this.navbarHTML();
    App.toast('Profile updated ✅');
  });
},
/* Optimized search with debouncing */
_searchTimeout:null,
async doSearch(q){
  const drop=document.getElementById('searchDrop');if(!drop)return;
  const sq=q.trim();
  if(!sq){drop.classList.remove('open');return;}
  
  // Debounce search for performance
  clearTimeout(this._searchTimeout);
  this._searchTimeout=setTimeout(async()=>{
    const data=await this.loadData();
    const lq=sq.toLowerCase(),res=[];
    
    // Limit search results for performance
    data.subjects.forEach(s=>{
      if(s.name.toLowerCase().includes(lq))res.push({icon:s.icon,title:s.name,sub:`${s.chapters.length} chapters`,url:`subject.html?id=${s.id}`});
      s.chapters.slice(0,5).forEach(ch=>{ // Limit chapters per subject
        if(ch.title.toLowerCase().includes(lq))res.push({icon:'📄',title:ch.title,sub:s.name,url:`chapter.html?subject=${s.id}&chapter=${ch.id}`});
        (ch.lessons||[]).slice(0,3).forEach(l=>{ // Limit lessons per chapter
          if(l.title.toLowerCase().includes(lq))res.push({icon:'▶️',title:l.title,sub:`${s.name} › ${ch.title}`,url:`chapter.html?subject=${s.id}&chapter=${ch.id}&lesson=${l.id}`});
        });
        (ch.ncertTopics||[]).slice(0,3).forEach(t=>{ // Limit topics
          if(t.text.toLowerCase().includes(lq))res.push({icon:'⭐',title:t.text.slice(0,55),sub:`${s.name} › ${ch.title}`,url:`chapter.html?subject=${s.id}&chapter=${ch.id}`});
        });
      });
    });
    
    drop.innerHTML=res.length?res.slice(0,7).map(r=>`<a class="sd-row" href="${r.url}"><div class="sd-ico">${r.icon}</div><div><div class="sd-title">${VidyaSec.sanitize(r.title)}</div><div class="sd-sub">${VidyaSec.sanitize(r.sub)}</div></div></a>`).join(''):`<div class="sd-row"><div class="sd-sub">No results for "${VidyaSec.sanitize(sq)}"</div></div>`;
    drop.classList.add('open');
  },300);
},
showSearch(){const v=document.getElementById('searchInput')?.value;if(v)this.doSearch(v);},
hideSearch(){document.getElementById('searchDrop')?.classList.remove('open');},
/* Enhanced mobile navigation with backdrop */
toggleSidebar(){  
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop') || this._createBackdrop();
  const mainArea = document.querySelector('.main-area');
  
  if(sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    backdrop.classList.remove('show');
    mainArea?.classList.remove('sidebar-open');
    document.body.style.overflow = '';
  } else {
    sidebar.classList.add('open');
    backdrop.classList.add('show');
    mainArea?.classList.add('sidebar-open');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }
},

_createBackdrop(){
  const backdrop = document.createElement('div');
  backdrop.id = 'sidebarBackdrop';
  backdrop.className = 'sidebar-backdrop';
  backdrop.addEventListener('click', () => this.closeSidebar());
  document.body.appendChild(backdrop);
  return backdrop;
},

closeSidebar(){  
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const mainArea = document.querySelector('.main-area');
  
  if(sidebar) {
    sidebar.classList.remove('open');
  }
  if(backdrop) {
    backdrop.classList.remove('show');
  }
  if(mainArea) {
    mainArea.classList.remove('sidebar-open');
  }
  document.body.style.overflow = '';
},
handleTouchStart(e){this._touchStartX=e.touches[0].clientX;this._touchStartY=e.touches[0].clientY;this._touchStartTime=Date.now();},
handleTouchEnd(e){if(!this._touchStartX)return;const endX=e.changedTouches[0].clientX;const endY=e.changedTouches[0].clientY;const deltaX=endX-this._touchStartX;const deltaY=Math.abs(endY-this._touchStartY);const deltaTime=Date.now()-this._touchStartTime;if(Math.abs(deltaX)>50&&deltaY<100&&deltaTime<300){if(deltaX>50){this.closeSidebar();}else if(deltaX<-50&&this._touchStartX<50){this.toggleSidebar();}}this._touchStartX=null;},
handleTouchMove(e){if(!this._touchStartX)return;const currentX=e.touches[0].clientX;const deltaX=currentX-this._touchStartX;const sidebar=document.getElementById('sidebar');if(sidebar&&sidebar.classList.contains('open')&&deltaX>0){const progress=Math.min(deltaX/280,1);sidebar.style.transform=`translateX(${-280+deltaX}px)`;}else if(sidebar&&!sidebar.classList.contains('open')&&this._touchStartX<50&&deltaX<0){const progress=Math.min(Math.abs(deltaX)/280,1);sidebar.style.transform=`translateX(${-280+Math.abs(deltaX)}px)`;}},
/* Optimized toast with cleanup */
_toastTimeout:null,
toast(msg,ico='✅'){
  let t=document.getElementById('appToast');
  if(!t){
    t=document.createElement('div');
    t.id='appToast';
    t.className='toast';
    t.setAttribute('role','alert');
    document.body.appendChild(t);
  }
  
  // Clear existing timeout
  if(this._toastTimeout)clearTimeout(this._toastTimeout);
  
  t.innerHTML=`<span>${ico}</span> ${VidyaSec.sanitize(msg)}`;
  t.classList.add('show');
  this._toastTimeout=setTimeout(()=>{
    t.classList.remove('show');
    this._toastTimeout=null;
  },2500); // Reduced timeout for better UX
},
initPage(active){
  const role = localStorage.getItem('vm_user_role');
  if (!role && window.location.pathname.indexOf('login.html') === -1) {
    window.location.href = 'login.html';
    return;
  }

  this.applyMode();
  const nb=document.getElementById('nb'),sb=document.getElementById('sb'),bn=document.getElementById('bn');
  if(nb)nb.innerHTML=this.navbarHTML();
  if(sb)sb.innerHTML=this.sidebarHTML(active);
  if(bn)bn.innerHTML=this.bottomNavHTML(active);

  // Avoid inserting duplicate panels/widgets when initPage runs multiple times
  if(!document.getElementById('themePanel')) document.body.insertAdjacentHTML('beforeend',this.themeHTML());
  if(!document.getElementById('todoPanel')) document.body.insertAdjacentHTML('beforeend',this.todoPanelHTML());
  if(!document.getElementById('timerWidget')) document.body.insertAdjacentHTML('beforeend',this.timerHTML());
  if(!document.getElementById('sidebarBackdrop')){
    document.body.insertAdjacentHTML('beforeend',`<div class="backdrop" id="sidebarBackdrop" onclick="App.closeSidebar()"></div>`);
  }

  ThemeEngine.init();
  TodoPanel.init();
  
  // Mobile touch gestures
  if('ontouchstart' in window){
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), {passive: true});
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e), {passive: true});
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), {passive: true});
  }
  
  // Close sidebar on escape key
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') this.closeSidebar();
  });
  
  // Prevent body scroll when sidebar is open on mobile
  const sidebar = document.getElementById('sidebar');
  if(sidebar){
    const observer = new MutationObserver(() => {
      if(sidebar.classList.contains('open')){
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        // Reset transform after animation
        sidebar.style.transform = '';
      }
    });
    observer.observe(sidebar, {attributes: true, attributeFilter: ['class']});
    
    // Add touch end listener to cleanup transform
    sidebar.addEventListener('touchend', () => {
      setTimeout(() => {
        if(!sidebar.classList.contains('open')) {
          sidebar.style.transform = '';
        }
      }, 300);
    });
  }
  
  // Add ripple effect to buttons on mobile
  if('ontouchstart' in window){
    document.addEventListener('touchstart', (e) => {
      const btn = e.target.closest('.btn, .btn-sm, .btn-icon, .al-link, .stat-card, .quick-card, .content-type-card, .subj-card, .premium-card');
      if(btn && !btn.classList.contains('no-ripple')){
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.touches[0].clientX - rect.left - size/2;
        const y = e.touches[0].clientY - rect.top - size/2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;
        
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      }
    });
  }
  
  // Add button press effects for all buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .btn-sm, .btn-cta, .btn-primary, .btn-secondary');
    if (btn && !btn.classList.contains('no-press')) {
      btn.classList.add('animate-press');
      setTimeout(() => btn.classList.remove('animate-press'), 150);
    }
  });
  
  // Add hover lift effects to cards
  document.querySelectorAll('.card, .dash-card, .stat-card, .subj-card').forEach(card => {
    card.classList.add('hover-lift');
  });
  
  // Add ripple effect to buttons on mobile
  if('ontouchstart' in window){
    document.addEventListener('touchstart', (e) => {
      const btn = e.target.closest('.btn, .btn-sm, .btn-icon, .al-link, .stat-card, .quick-card, .content-type-card, .subj-card, .premium-card');
      if(btn && !btn.classList.contains('no-ripple')){
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.touches[0].clientX - rect.left - size/2;
        const y = e.touches[0].clientY - rect.top - size/2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;
        
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      }
    });
  }
  
  // Add button press effects for all buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .btn-sm, .btn-cta, .btn-primary, .btn-secondary');
    if (btn && !btn.classList.contains('no-press')) {
      btn.classList.add('animate-press');
      setTimeout(() => btn.classList.remove('animate-press'), 150);
    }
  });
  
  // Add hover lift effects to cards
  document.querySelectorAll('.card, .dash-card, .stat-card, .subj-card').forEach(card => {
    card.classList.add('hover-lift');
  });
  
  const m=localStorage.getItem('vm_mode')||'light';
  const btn=document.getElementById('modeBtn');if(btn)btn.innerHTML=m==='dark'?'☀️':'🌙';
  document.querySelectorAll('.mt-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));
}
};
