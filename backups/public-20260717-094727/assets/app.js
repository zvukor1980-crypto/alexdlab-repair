
document.querySelectorAll('[data-component]').forEach(el=>{
  el.addEventListener('click',()=>{
    const name=el.dataset.component;
    const title=document.querySelector('[data-info-title]');
    const ref=document.querySelector('[data-info-ref]');
    if(title) title.textContent=name;
    if(ref) ref.textContent=el.dataset.ref||'—';
  });
});

const search=document.querySelector('[data-search]');
if(search){
  search.addEventListener('input',()=>{
    const q=search.value.toLowerCase().trim();
    document.querySelectorAll('[data-searchable]').forEach(el=>{
      el.style.display=!q||el.textContent.toLowerCase().includes(q)?'':'none';
    });
  });
}
