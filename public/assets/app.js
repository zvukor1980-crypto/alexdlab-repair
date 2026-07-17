
const $=(s)=>document.querySelector(s);
const stage=$('#stage'), img=$('#boardImage');
if(stage && img){
 let scale=1, x=0, y=0, dragging=false, sx=0, sy=0, startX=0, startY=0;
 const zoomLabel=$('#zoomLabel');
 function fit(){
   const sw=stage.clientWidth, sh=stage.clientHeight;
   const iw=img.naturalWidth||1, ih=img.naturalHeight||1;
   scale=Math.min((sw-40)/iw,(sh-40)/ih);
   x=0;y=0;render();
 }
 function render(){
   img.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) scale(${scale})`;
   zoomLabel.textContent=Math.round(scale*100)+'%';
 }
 function zoom(f,cx=stage.clientWidth/2,cy=stage.clientHeight/2){
   const old=scale; scale=Math.max(.08,Math.min(8,scale*f));
   const rect=stage.getBoundingClientRect();
   const px=cx-rect.left-stage.clientWidth/2-x, py=cy-rect.top-stage.clientHeight/2-y;
   x-=px*(scale/old-1); y-=py*(scale/old-1); render();
 }
 img.onload=fit; if(img.complete) fit();
 $('#zoomIn').onclick=()=>zoom(1.25); $('#zoomOut').onclick=()=>zoom(.8); $('#fit').onclick=fit; $('#reset').onclick=()=>{scale=1;x=0;y=0;render()};
 stage.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.12:.89,e.clientX,e.clientY)},{passive:false});
 stage.addEventListener('mousedown',e=>{dragging=true;stage.classList.add('dragging');sx=e.clientX;sy=e.clientY;startX=x;startY=y});
 window.addEventListener('mousemove',e=>{if(!dragging)return;x=startX+e.clientX-sx;y=startY+e.clientY-sy;render()});
 window.addEventListener('mouseup',()=>{dragging=false;stage.classList.remove('dragging')});
 let current='a';
 document.querySelectorAll('[data-side]').forEach(b=>b.onclick=()=>{
   current=b.dataset.side;
   document.querySelectorAll('[data-side]').forEach(n=>n.classList.toggle('active',n===b));
   img.src=current==='a'?'../assets/iphone5-board-side-a.jpg':current==='b'?'../assets/iphone5-board-side-b.jpg':'../assets/iphone5-board-both.jpg';
 });
}
const findInput=$('#boardSearch');
if(findInput){
 findInput.addEventListener('keydown',e=>{
   if(e.key==='Enter'){
     const q=findInput.value.trim();
     $('#searchResult').innerHTML=q?`<div class="card"><b>Поиск: ${q}</b><p>На текущем этапе изображение увеличивается для визуального поиска маркировки. Автоматическая координатная подсветка будет добавлена после построения индекса компонентов.</p></div>`:'';
   }
 });
}
