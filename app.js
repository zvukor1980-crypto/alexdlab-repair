let db;
const $ = id => document.getElementById(id);
const selects = {category:$('category'),brand:$('brand'),model:$('model'),fault:$('fault')};

const IPHONES=[
['iphone','iPhone'],['iphone-3g','iPhone 3G'],['iphone-3gs','iPhone 3GS'],['iphone-4','iPhone 4'],['iphone-4s','iPhone 4s'],['iphone-5','iPhone 5'],['iphone-5c','iPhone 5c'],['iphone-5s','iPhone 5s'],['iphone-6','iPhone 6'],['iphone-6-plus','iPhone 6 Plus'],['iphone-6s','iPhone 6s'],['iphone-6s-plus','iPhone 6s Plus'],['iphone-se-1','iPhone SE (1st gen)'],['iphone-7','iPhone 7'],['iphone-7-plus','iPhone 7 Plus'],['iphone-8','iPhone 8'],['iphone-8-plus','iPhone 8 Plus'],['iphone-x','iPhone X'],['iphone-xr','iPhone XR'],['iphone-xs','iPhone XS'],['iphone-xs-max','iPhone XS Max'],['iphone-11','iPhone 11'],['iphone-11-pro','iPhone 11 Pro'],['iphone-11-pro-max','iPhone 11 Pro Max'],['iphone-se-2','iPhone SE (2nd gen)'],['iphone-12-mini','iPhone 12 mini'],['iphone-12','iPhone 12'],['iphone-12-pro','iPhone 12 Pro'],['iphone-12-pro-max','iPhone 12 Pro Max'],['iphone-13-mini','iPhone 13 mini'],['iphone-13','iPhone 13'],['iphone-13-pro','iPhone 13 Pro'],['iphone-13-pro-max','iPhone 13 Pro Max'],['iphone-se-3','iPhone SE (3rd gen)'],['iphone-14','iPhone 14'],['iphone-14-plus','iPhone 14 Plus'],['iphone-14-pro','iPhone 14 Pro'],['iphone-14-pro-max','iPhone 14 Pro Max'],['iphone-15','iPhone 15'],['iphone-15-plus','iPhone 15 Plus'],['iphone-15-pro','iPhone 15 Pro'],['iphone-15-pro-max','iPhone 15 Pro Max'],['iphone-16','iPhone 16'],['iphone-16-plus','iPhone 16 Plus'],['iphone-16-pro','iPhone 16 Pro'],['iphone-16-pro-max','iPhone 16 Pro Max'],['iphone-16e','iPhone 16e'],['iphone-17','iPhone 17'],['iphone-17-pro','iPhone 17 Pro'],['iphone-17-pro-max','iPhone 17 Pro Max'],['iphone-air','iPhone Air'],['iphone-17e','iPhone 17e']
].map(([id,name])=>({id,name}));

async function init(){
  const res = await fetch('data/devices.json',{cache:'no-store'});
  db = await res.json();
  fill(selects.category, db.categories, 'Выберите категорию');
  selects.category.addEventListener('change', onCategory);
  selects.brand.addEventListener('change', onBrand);
  selects.model.addEventListener('change', onModel);
  $('startBtn').addEventListener('click', renderDiagnostic);
  $('saveNotes').addEventListener('click', saveNotes);
  $('analyzeBtn').addEventListener('click', analyze);
  onCategory();
  registerPWA();
}
function fill(el, items, placeholder){
  el.innerHTML = `<option value="">${placeholder}</option>` + (items||[]).map(x=>`<option value="${x.id}">${x.name}</option>`).join('');
}
function cat(){ return db.categories.find(x=>x.id===selects.category.value); }
function brand(){ return cat()?.brands.find(x=>x.id===selects.brand.value); }
function isApple(){ return selects.category.value==='phones' && selects.brand.value==='apple'; }
function model(){
  const b=brand();
  const exact=b?.models.find(x=>x.id===selects.model.value);
  if(exact) return exact;
  if(isApple() && selects.model.value){
    const picked=IPHONES.find(x=>x.id===selects.model.value);
    const template=b?.models?.[0];
    if(picked && template) return {...template,id:picked.id,name:picked.name,revision:'iPhone diagnostic profile'};
  }
}
function fault(){ return model()?.faults.find(x=>x.id===selects.fault.value); }
function onCategory(){
  fill(selects.brand, cat()?.brands||[], cat()?.brands?.length?'Выберите производителя':'База готова к наполнению');
  fill(selects.model, [], 'Сначала производитель');
  fill(selects.fault, [], 'Сначала модель');
}
function onBrand(){
  if(isApple()) fill(selects.model, IPHONES, 'Выберите iPhone');
  else fill(selects.model, brand()?.models||[], 'Выберите модель');
  fill(selects.fault, [], 'Сначала модель');
}
function onModel(){ fill(selects.fault, model()?.faults||[], 'Выберите неисправность'); renderDocs(); loadNotes(); }
function renderDocs(){
  const m=model();
  $('docs').innerHTML = !m ? '<span class="muted">Выберите устройство.</span>' : (m.documents||[]).map(d=>`<div class="doc"><b>${d.name}</b><span>${d.status}</span></div>`).join('');
}
function renderDiagnostic(){
  const m=model(), f=fault();
  if(!m||!f){ $('diagTitle').textContent='Выберите модель и неисправность'; return; }
  $('diagTitle').textContent = `${m.name} — ${f.name}`;
  const badge=$('sourceBadge');
  badge.className='badge '+(f.verification==='verified'?'verified':'demo');
  badge.textContent=f.verification==='verified'?'проверено':'алгоритм / нужен источник для точных точек';
  $('tools').innerHTML=(f.tools||[]).map(t=>`<span class="chip">${t}</span>`).join('');
  $('flow').classList.remove('empty');
  $('flow').innerHTML=f.steps.map((s,i)=>`<div class="step"><div class="step-top"><div class="step-num">${i+1}</div><div><h4>${s.title}</h4><p>${s.text}</p><div class="meta">${s.instrument?`<span class="tag">Прибор: ${s.instrument}</span>`:''}${s.mode?`<span class="tag">Режим: ${s.mode}</span>`:''}${s.risk?`<span class="tag">⚠ ${s.risk}</span>`:''}${s.source?`<span class="tag">Источник: ${s.source}</span>`:''}</div><div class="decision"><button onclick="markStep(this,'ok')">✓ Выполнено</button><button onclick="markStep(this,'problem')">! Есть отклонение</button></div></div></div></div>`).join('');
}
window.markStep=(btn,state)=>{ btn.closest('.step').style.outline=state==='ok'?'1px solid #5b7727':'1px solid #806226'; };
function noteKey(){ return `repairlab:${selects.model.value||'general'}:notes`; }
function saveNotes(){ localStorage.setItem(noteKey(),$('notes').value); $('saveNotes').textContent='Сохранено'; setTimeout(()=>$('saveNotes').textContent='Сохранить локально',900); }
function loadNotes(){ $('notes').value=localStorage.getItem(noteKey())||''; }
function analyze(){
  const val=parseFloat(String($('measureValue').value).replace(',','.'));
  if(Number.isNaN(val)){ $('measureResult').textContent='Введите числовое значение.'; return; }
  const unit={voltage:'V',resistance:'Ω',current:'A',frequency:'Hz'}[$('measureType').value];
  $('measureResult').innerHTML=`Получено: <b>${val} ${unit}</b>. Автоматическая оценка не выполняется без выбранной контрольной точки с подтверждённым диапазоном. Это защита от выдуманных «норм».`;
}
function registerPWA(){
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>r.update());
  let deferred;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('installBtn').hidden=false;});
  $('installBtn').addEventListener('click',async()=>{if(deferred){deferred.prompt();deferred=null;$('installBtn').hidden=true;}});
}
init().catch(err=>{console.error(err);$('flow').innerHTML='<div class="empty-state">Не удалось загрузить базу данных.</div>';});
