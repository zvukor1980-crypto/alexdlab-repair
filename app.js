let db;
const $ = id => document.getElementById(id);
const selects = {category:$('category'),brand:$('brand'),model:$('model'),fault:$('fault')};

async function init(){
  const res = await fetch('data/devices.json');
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
function model(){ return brand()?.models.find(x=>x.id===selects.model.value); }
function fault(){ return model()?.faults.find(x=>x.id===selects.fault.value); }
function onCategory(){
  fill(selects.brand, cat()?.brands||[], cat()?.brands?.length?'Выберите производителя':'База готова к наполнению');
  fill(selects.model, [], 'Сначала производитель');
  fill(selects.fault, [], 'Сначала модель');
}
function onBrand(){ fill(selects.model, brand()?.models||[], 'Выберите модель'); fill(selects.fault, [], 'Сначала модель'); }
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
  badge.textContent=f.verification==='verified'?'проверено':'демо / нужен источник';
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
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  let deferred;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('installBtn').hidden=false;});
  $('installBtn').addEventListener('click',async()=>{if(deferred){deferred.prompt();deferred=null;$('installBtn').hidden=true;}});
}
init().catch(err=>{console.error(err);$('flow').innerHTML='<div class="empty-state">Не удалось загрузить базу данных.</div>';});
