import {chapters, exhibits, media, flow, flowNotes} from './museum-content.js';

const $ = id => document.getElementById(id);
const el = (tag, text, cls) => {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (cls) n.className = cls;
  return n;
};
const button = (text, fn, cls) => {
  const b = el('button', text, cls); b.type = 'button'; b.onclick = fn; return b;
};
const link = (text, url) => {
  const a = el('a', text); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
};
function photo(src, alt, width=960, height=720) {
  const img = el('img'); img.src = src; img.alt = alt; img.width = width; img.height = height;
  img.decoding = 'async'; return img;
}

let saved = {visited: [], notes: {}, light: false};
try {
  const s = JSON.parse(localStorage.getItem('dau-an-v2'));
  if (s && Array.isArray(s.visited) && s.notes && typeof s.notes === 'object') {
    saved.visited = s.visited.filter(id=>exhibits.some(e=>e.id===id));
    for (const e of exhibits) if (typeof s.notes[e.id] === 'string') saved.notes[e.id] = s.notes[e.id].slice(0,3000);
    saved.light = s.light === true;
  }
} catch {}
let storageWorks = true, zone = -1, world = null, activeExhibit = null, activeModal = '', autosave = null;
let lastFocus = null, catalogueState = {filter: 0, query: ''};
let focusedFrame=null, focusedIndex=0, guideStep=-1;
const initial = new URL(location.href);
function route(values) {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === '' || value === undefined) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  history.replaceState(null, '', url);
}
function persist() {
  try { localStorage.setItem('dau-an-v2', JSON.stringify(saved)); return true; }
  catch { storageWorks = false; return false; }
}
function progress() {
  $('progress').textContent = `${saved.visited.length}/18`;
  document.querySelectorAll('.exhibit-row').forEach(b=>b.setAttribute('aria-current',b.dataset.id===activeExhibit));
}
function flushNote() {
  if (autosave) { clearTimeout(autosave); autosave = null; persist(); }
}
function modal(title, kind, id) {
  flushNote(); activeModal = kind;
  if (!$('modal').open) lastFocus = document.activeElement;
  $('detail').replaceChildren(el('h2',title)); $('detail').firstChild.id = 'dialog-title';
  if (!$('modal').open) $('modal').showModal();
  world?.suspend(true);
  $('modal').scrollTop = 0;
  route({view:kind, exhibit:id||null});
  // A stable close target is present even when replacing the entire modal body.
  $('close').focus({preventScroll:true});
}
$('close').onclick = () => $('modal').close();
$('modal').addEventListener('click', e => { if (e.target === $('modal')) {
  const r=$('modal').getBoundingClientRect();
  if (e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) $('modal').close();
}});
$('modal').addEventListener('close', () => {
  flushNote(); activeModal = ''; route({view:null,exhibit:null}); $('detail').replaceChildren();
  world?.suspend(false);
  if (lastFocus?.isConnected && lastFocus.getClientRects().length) lastFocus.focus({preventScroll:true});
  else $('catalogue').focus({preventScroll:true});
});
addEventListener('pagehide', flushNote);

function openPhoto(e) {
  modal('Tư liệu ảnh / '+e.title, 'photo', e.id);
  $('detail').append(photo(e.image,media[e.image].caption,960,720));
  $('detail').lastChild.className='full-photo';
  $('detail').append(el('p',media[e.image].caption),el('small',`${media[e.image].credit} · ${media[e.image].license} · Hiển thị nguyên ảnh, không cắt nội dung.`),el('p'));
  $('detail').lastChild.append(link('Hồ sơ ảnh gốc ↗',media[e.image].url));
  $('detail').append(button('← Trở về hồ sơ',()=>openExhibit(e)));
}
function openExhibit(e) {
  if (!e) return;
  if (zone !== e.zone) select(e.zone);
  activeExhibit=e.id;
  if (!saved.visited.includes(e.id)) { saved.visited.push(e.id); persist(); }
  progress(); modal(e.title,'exhibit',e.id);
  $('detail').prepend(el('small',`CHƯƠNG ${e.chapter} / MỤC ${e.section} · HỒ SƠ ${e.index+1}/6`));
  const reading=el('div',undefined,'reading'), figure=el('figure'), m=media[e.image];
  const enlarge=button('',()=>openPhoto(e),'photo-button'); enlarge.setAttribute('aria-label','Phóng to ảnh '+e.title);
  enlarge.append(photo(e.image,m.caption));
  const caption=el('figcaption',`${m.caption} ${m.credit}. `); caption.append(link('Nguồn ảnh ↗',m.url),el('br'),el('span','Chạm ảnh để xem lớn. Ảnh minh họa, không thay thế nguồn kiến thức.'));
  figure.append(enlarge,caption);
  const copy=el('div'); copy.append(el('p',e.lead,'lead'),el('p',e.body),el('small',`Giáo trình tr. ${e.pages} · diễn giải ngắn, không phải trích nguyên văn.`),el('p',e.question,'reflection'));
  reading.append(figure,copy); $('detail').append(reading);
  const notes=el('section',undefined,'note-section');
  const label=el('label','Suy nghĩ của bạn'); label.htmlFor='note';
  const note=el('textarea'); note.id='note'; note.name='reflection'; note.autocomplete='off'; note.maxLength=3000; note.placeholder='Một điều bạn muốn mang vào đời sống…'; note.value=saved.notes[e.id]||'';
  const msg=el('p','Tự lưu trên thiết bị này · không gửi lên máy chủ.','toast'); msg.setAttribute('role','status');
  note.oninput=()=>{saved.notes[e.id]=note.value;clearTimeout(autosave);msg.textContent='Đang lưu…';autosave=setTimeout(()=>{autosave=null;msg.textContent=persist()?'Đã lưu trên thiết bị này.':'Không lưu được lâu dài. Hãy xuất sổ để giữ ghi chú.'},350)};
  notes.append(label,note,msg,el('small','Câu hỏi và ghi chú là vận dụng cá nhân, không phải lời trích giáo trình.'));
  const actions=el('div',undefined,'modal-actions');
  actions.append(button('← Hồ sơ trước',()=>openExhibit(exhibits[(exhibits.indexOf(e)+17)%18])),button('Về danh mục',()=>catalogue(e.chapter)),button('Hồ sơ tiếp theo →',()=>openExhibit(exhibits[(exhibits.indexOf(e)+1)%18]),'primary'));
  $('detail').append(notes,actions);
}

const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
function catalogue(filter=catalogueState.filter) {
  if (typeof filter==='number') catalogueState.filter=filter;
  modal('Danh mục tư tưởng','catalogue');
  $('detail').append(el('p','Chọn một hồ sơ để đọc, xem ảnh và ghi lại suy nghĩ. Bạn không cần điều khiển 3D để khám phá đủ ba chương.'));
  const label=el('label','Tìm theo tên hoặc nội dung'); label.htmlFor='search';
  const search=el('input'); search.id='search'; search.name='search'; search.type='search'; search.autocomplete='off'; search.placeholder='Ví dụ: pháp quyền, khoan dung, cần kiệm…'; search.value=catalogueState.query;
  const tabs=el('div',undefined,'chapter-tabs'), grid=el('div',undefined,'catalogue-grid'), count=el('p',undefined,'toast');count.setAttribute('role','status');
  function render() {
    const q=normalize(search.value); catalogueState.query=search.value;
    const list=exhibits.filter(e=>(!catalogueState.filter||e.chapter===catalogueState.filter)&&normalize(e.title+' '+e.lead+' '+e.body).includes(q));
    grid.replaceChildren(); count.textContent=`${list.length} hồ sơ${catalogueState.filter?' · Chương '+catalogueState.filter:''}`;
    list.forEach(e=>{
      const b=button('',()=>openExhibit(e),'card'), img=photo(e.image,'',960,720);img.loading='lazy';
      const copy=el('span',undefined,'card-copy'); copy.append(el('small',`CHƯƠNG ${e.chapter} / ${e.section}${saved.visited.includes(e.id)?' · ĐÃ MỞ':''}`),el('strong',e.title),el('span',`Giáo trình tr. ${e.pages}`)); b.append(img,copy);grid.append(b);
    });
    if (!list.length) grid.append(el('p','Không tìm thấy hồ sơ. Thử từ khóa khác hoặc chọn Tất cả.'));
    tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.filter)===catalogueState.filter));
    route({filter:catalogueState.filter||null,q:search.value||null});
  }
  [0,4,5,6].forEach(id=>{const b=button(id?'Chương '+id:'Tất cả',()=>{catalogueState.filter=id;render()}); b.dataset.filter=id; tabs.append(b)});
  search.oninput=render; $('detail').append(label,search,tabs,count,grid); render();
}
function unity() {
  modal('Từ nhân dân đến sức mạnh chung','unity');
  $('detail').append(el('p','Sơ đồ diễn giải của nhóm từ mục 5.1.1–5.1.5, tr. 99–106; không phải mô hình sáu bước được trích nguyên văn.'));
  const bar=el('div',undefined,'flow'), copy=el('p',flowNotes[0],'flow-copy');copy.setAttribute('role','status');
  flow.forEach((s,i)=>{const b=button('',()=>{bar.querySelectorAll('button').forEach((x,k)=>x.setAttribute('aria-pressed',i===k));copy.textContent=flowNotes[i];world?.stage(i)},'flow-step');b.append(el('small',`0${i+1}`),el('span',s));b.setAttribute('aria-pressed',i===0);bar.append(b)});
  $('detail').append(bar,copy,el('blockquote','“Đoàn kết toàn dân, phụng sự Tổ quốc”','quote'),el('small','Giáo trình tr. 100; lời phát biểu ngày 03/03/1951. Dẫn Hồ Chí Minh Toàn tập (2011), tập 6, tr. 183.'),el('div',undefined,'modal-actions'));
  $('detail').lastChild.append(button('Đọc về Mặt trận →',()=>openExhibit(exhibits.find(e=>e.id==='5-3')),'primary'));
}
function notebook() {
  modal('Sổ Dấu Ấn / Mang theo một giá trị','notebook');
  const passport=el('div',undefined,'passport');
  chapters.forEach(c=>{const n=exhibits.filter(e=>e.chapter===c.id&&saved.visited.includes(e.id)).length;const s=el('div',undefined,'stamp');s.append(el('small','CHƯƠNG '+c.id),el('strong',c.short),el('p',`${n}/6 hồ sơ đã mở`));passport.append(s)});
  $('detail').append(passport,el('p','Sổ tham quan cá nhân, không phải bài kiểm tra. Ghi chú tự lưu trên thiết bị; bạn có thể xuất để giữ lại hoặc chia sẻ.'));
  const notes=exhibits.filter(e=>saved.notes[e.id]?.trim());
  if (!notes.length) $('detail').append(el('p','Chưa có ghi chú. Mở một hồ sơ và viết một việc bạn muốn thực hiện.','reflection'));
  notes.forEach(e=>{const n=el('section',undefined,'reflection');n.append(el('h3',e.title),el('p',saved.notes[e.id],'user-note'),button('Chỉnh ghi chú',()=>openExhibit(e)));$('detail').append(n)});
  $('detail').append(button('Xuất sổ (.txt)',()=>{
    flushNote();const text=['DẤU ẤN — Sổ tham quan',...notes.map(e=>`\n${e.title}\nNguồn: giáo trình tr. ${e.pages}\nSuy nghĩ cá nhân: ${saved.notes[e.id]}`)].join('\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF',text],{type:'text/plain;charset=utf-8'}));const a=el('a');a.href=url;a.download='So-Dau-An.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  },'primary'));
}
function sources() {
  modal('Nguồn và giới hạn triển lãm','sources');
  $('detail').append(el('p','Nguồn kiến thức chính: PDF giáo trình Tư tưởng Hồ Chí Minh do người dùng cung cấp. Nội dung diễn giải chọn lọc Chương 4, 5, 6, không thay thế giáo trình. Số trang là số in trên trang. Phần vận dụng theo bối cảnh bản giáo trình, không phải cập nhật pháp luật hiện hành.'),el('p','Không gian 3D, sơ đồ và câu hỏi là thiết kế của nhóm. Ảnh lịch sử và ảnh di sản đương đại được phân biệt trong chú thích; không coi ảnh minh họa là bằng chứng cho từng luận điểm.'));
  Object.entries(media).forEach(([src,m])=>{const s=el('section',undefined,'source-entry'),img=photo(src,'',960,720);img.loading='lazy';const copy=el('div');copy.append(el('h3',m.credit),el('p',m.caption),el('small',m.license+' · Hiển thị nguyên ảnh. '),link('Hồ sơ gốc ↗',m.url));if(m.licenseUrl)copy.append(el('span',' · '),link('Giấy phép ↗',m.licenseUrl));s.append(img,copy);$('detail').append(s)});
  $('detail').append(el('h3','Mã nguồn mở'),el('p','Three.js r170 và OrbitControls, giấy phép MIT. Font Be Vietnam Pro và Noto Serif theo SIL Open Font License 1.1. Thư viện và font lưu cùng dự án, không phụ thuộc CDN để mở không gian. Không dùng mô hình hoặc panorama độc quyền của trang tham khảo.'));
  const credits=el('p');credits.append(link('Three.js / mã nguồn ↗','https://github.com/mrdoob/three.js'),el('span',' · '),link('OrbitControls / hướng dẫn ↗','https://threejs.org/docs/pages/OrbitControls.html'));$('detail').append(credits);
  $('detail').append(el('h3','Tư liệu bổ sung'),el('p','Liên kết tìm kiếm video theo chủ đề trên YouTube; không phải video đã thẩm định, không dùng làm nguồn kiến thức của hồ sơ.'));
  chapters.forEach(c=>{const p=el('p');p.append(link(`YouTube: ${c.short} ↗`,`https://www.youtube.com/results?search_query=${encodeURIComponent('VTV tư tưởng Hồ Chí Minh '+c.short)}`));$('detail').append(p)});
  const refs=el('p');refs.append(link('VR3D ↗','https://vr3d.vn/trienlam/bao-tang-ao-vr3d'),el('span',' · '),link('Bảo tàng Hồ Chí Minh ↗','https://baotang.hochiminh.vn/'));$('detail').append(el('h3','Tham khảo hình thức'),refs);
}
function help() {
  modal('Tham quan theo cách của bạn','help');
  const steps=[['1. Chọn một chương','Ba nút phía dưới đưa bạn đến ba cánh trưng bày.'],['2. Khám phá không gian','Kéo để xoay, cuộn hoặc dùng hai ngón để zoom. Nút xoay và zoom là lựa chọn thay thế. Toàn cảnh đưa bạn về sảnh.'],['3. Đọc hồ sơ','Chạm dấu + hoặc chọn ảnh trong danh sách. Danh mục chứa đủ 18 hồ sơ, kể cả khi không dùng 3D.'],['4. Mang theo một giá trị','Ghi chú được tự lưu. Mở Sổ cá nhân để đọc lại và xuất TXT.'],['Máy yếu hoặc chuyển động gây khó chịu?','Bật Chế độ nhẹ. Trang tự tôn trọng thiết lập giảm chuyển động của thiết bị. Không có chuyển động tự chạy.']];
  steps.forEach(([h,p])=>$('detail').append(el('h3',h),el('p',p)));
  $('detail').append(el('h3','Xem gần trong 3D'),el('p','Chạm trực tiếp một khung ảnh để camera tiến đến trước khung. Chạm lần nữa, dấu + hoặc Đọc hồ sơ để đọc. Dùng ‹ / › chuyển giữa ba khung trong cánh hiện tại; bấm vào tên khung để đặt lại góc nhìn gần. Chọn lại chương để xem cả cánh, hoặc Toàn cảnh để về sảnh.'),el('p','Khi bàn phím đang ở vùng 3D: ← / → xoay; + / − zoom; [ / ] đổi khung; Enter xem gần hoặc đọc khung đang chọn; Home đặt lại góc nhìn của cánh.'));
  const reading=el('a','Mở chế độ đọc, không tải 3D →');reading.href='museum-3d.html?mode=read';
  const actions=el('div',undefined,'modal-actions');actions.append(reading,button('Nguồn tư liệu',sources));
  if(world)actions.prepend(button('Thử hướng dẫn trong phòng →',()=>{$('modal').addEventListener('close',startGuide,{once:true});$('modal').close()},'primary'));
  $('detail').append(actions);
}
function updateView(e,z,index) {
  if(z>=0&&zone!==z)select(z,true,false);
  focusedFrame=e;focusedIndex=index??0;
  $('focus-frame').textContent=e?`${index+1}/3 · ${e.title}`:'Xem gần khung ảnh';
  $('focus-frame').setAttribute('aria-label',e?'Đặt lại góc nhìn gần: '+e.title:'Xem gần khung ảnh đầu tiên');
  $('frame-read').hidden=!e;
  if(!e)$('status').textContent='Kéo để xoay · chạm khung ảnh để xem gần.';
}
const guideSteps=[
  ['1/4 · Làm quen với sảnh','Kéo để xoay; cuộn hoặc dùng hai ngón để zoom. Các nút ↶ ↷ ＋ − bên dưới cũng làm được việc này.',()=>overview()],
  ['2/4 · Chọn cánh trưng bày','Bạn đang ở Chương 5. Ba nút chương bên dưới luôn đưa bạn về góc nhìn của từng cánh.',()=>select(1)],
  ['3/4 · Đứng trước một khung ảnh','Camera đã đưa bạn đến khung đầu. Kéo nhẹ để nhìn nghiêng, zoom để xem gần; bấm tên khung để đặt lại góc.',()=>world.focusFrame(0,1)],
  ['4/4 · Tiếp tục và đọc','Dùng ‹ / › để đổi khung. Chọn Đọc hồ sơ hoặc dấu + để đọc. Toàn cảnh đưa bạn về sảnh bất cứ lúc nào.',()=>world.focusFrame(1,1)]
];
function showGuideStep(){const [title,copy,action]=guideSteps[guideStep];$('guide-title').textContent=title;$('guide-copy').textContent=copy;$('guide-next').textContent=guideStep===3?'Hoàn tất ✓':'Tiếp →';action()}
function startGuide(){if(!world)return;guideStep=0;$('guide-panel').hidden=false;$('scene-guide').setAttribute('aria-expanded','true');showGuideStep();$('guide-next').focus({preventScroll:true})}
function closeGuide(){guideStep=-1;$('guide-panel').hidden=true;$('scene-guide').setAttribute('aria-expanded','false');$('scene-guide').focus({preventScroll:true})}
$('scene-guide').setAttribute('aria-controls','guide-panel');$('scene-guide').setAttribute('aria-expanded','false');$('scene-guide').onclick=()=>guideStep>=0?closeGuide():startGuide();
$('guide-next').onclick=()=>{if(guideStep===3)closeGuide();else{guideStep++;showGuideStep()}};$('guide-close').onclick=closeGuide;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&guideStep>=0&&!$('modal').open){e.preventDefault();closeGuide()}});
$('frame-prev').onclick=()=>world?.nextFrame(-1);$('frame-next').onclick=()=>world?.nextFrame(1);
$('focus-frame').onclick=()=>world?.focusFrame(focusedIndex);
$('frame-read').onclick=()=>openExhibit(focusedFrame);
function fillList(z) {
  $('art-list').replaceChildren();const list=z>=0?exhibits.filter(e=>e.zone===z):[exhibits[0],exhibits[6],exhibits[12]];
  list.forEach(e=>{const b=button('',()=>openExhibit(e),'exhibit-row');b.dataset.id=e.id;const img=photo(e.image,'',62,54);img.loading='lazy';const text=el('span');text.append(el('strong',e.title),el('small',`Chương ${e.chapter} · mục ${e.section}`));b.append(img,text);$('art-list').append(b)});progress();
  $('list-summary').replaceChildren(el('span',z>=0?'6 hồ sơ · chạm để mở':'Bắt đầu với 3 hồ sơ'),el('span','⌄'));
}
function select(z, updateURL=true, moveCamera=true) {
  zone=z;const c=chapters[z];$('stage-title').textContent=c.title;$('chapter-label').textContent=`CHƯƠNG ${c.id} / ${c.short.toUpperCase()}`;$('title').textContent=c.short;$('description').textContent=c.intro;fillList(z);
  $('special').textContent=z===1?'Sơ đồ Đại đoàn kết →':'Danh mục Chương '+c.id+' →';$('special').onclick=z===1?unity:()=>catalogue(c.id);
  document.querySelectorAll('[data-zone]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.zone)===z));if(moveCamera)world?.select(z);
  if(updateURL)route({chapter:c.id});
}
function overview() {
  zone=-1;$('stage-title').textContent='Ba cánh. Một hành trình.';$('chapter-label').textContent='TRIỂN LÃM TƯƠNG TÁC / 4 · 5 · 6';$('title').textContent='Hiểu để tiếp nối.';$('description').textContent='Chọn một chương để tham quan, hoặc bắt đầu với danh mục ảnh bên dưới.';fillList(-1);$('special').textContent='Khám phá Đại đoàn kết →';$('special').onclick=unity;document.querySelectorAll('[data-zone]').forEach(b=>b.setAttribute('aria-pressed','false'));world?.overview();route({chapter:null});
}
$('catalogue').onclick=()=>catalogue(0);$('fallback-read').onclick=()=>catalogue(0);$('notebook').onclick=notebook;$('sources').onclick=sources;$('help').onclick=help;$('special').onclick=unity;$('overview').onclick=overview;
document.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>select(Number(b.dataset.zone)));
$('zoom-in').onclick=()=>world?.zoom(.85);$('zoom-out').onclick=()=>world?.zoom(1.15);$('turn-left').onclick=()=>world?.turn(-.15);$('turn-right').onclick=()=>world?.turn(.15);
$('quality').setAttribute('aria-pressed',saved.light);$('quality').onclick=()=>{saved.light=!saved.light;persist();$('quality').setAttribute('aria-pressed',saved.light);world?.quality(saved.light);$('status').textContent=saved.light?'Chế độ nhẹ: giảm độ phân giải và bỏ bóng đổ.':'Kéo để xoay · cuộn / hai ngón để zoom.'};
const mobile=matchMedia('(max-width:760px)');$('chapter-details').open=!mobile.matches;mobile.addEventListener('change',e=>$('chapter-details').open=!e.matches);
fillList(-1);progress();
const z=chapters.findIndex(c=>c.id===Number(initial.searchParams.get('chapter')));if(z>=0)select(z,false);
catalogueState={filter:[4,5,6].includes(Number(initial.searchParams.get('filter')))?Number(initial.searchParams.get('filter')):0,query:initial.searchParams.get('q')||''};
const requested=initial.searchParams.get('view'), requestedExhibit=exhibits.find(e=>e.id===initial.searchParams.get('exhibit'));
if(requested==='exhibit'&&requestedExhibit)openExhibit(requestedExhibit);
else if(requested==='photo'&&requestedExhibit)openPhoto(requestedExhibit);
else if(requested==='catalogue')catalogue(catalogueState.filter);
else if(requested==='unity')unity();else if(requested==='notebook')notebook();else if(requested==='sources')sources();else if(requested==='help')help();
// Lazy, locally hosted renderer: knowledge and notes remain usable without WebGL.
if(initial.searchParams.get('mode')==='read')fallback('Chế độ đọc được chọn qua URL');
else try {
  const {createMuseum}=await import('./museum-scene.js?v=3d-guide-1');
  await document.fonts.ready;
  world=createMuseum({host:$('scene'),labels:$('labels'),exhibits,open:openExhibit,light:saved.light,status:message=>$('status').textContent=message,onView:updateView});
  document.querySelectorAll('.frame-tools button').forEach(b=>b.disabled=false);
  if(zone>=0)world.select(zone);
  if($('modal').open)world.suspend(true);
} catch(e) { fallback(e.message); }
function fallback(reason) {
  document.body.classList.add('fallback');document.querySelector('.fallback-card').hidden=false;
  const reading=initial.searchParams.get('mode')==='read';
  $('status').textContent=reading?'Chế độ đọc · không tải thư viện 3D.':'3D không khả dụng · mở Danh mục để đọc toàn bộ nội dung.';
  if(reading)document.querySelector('.fallback-card p').textContent='Bạn đang dùng chế độ đọc nhẹ. Khám phá đủ 18 hồ sơ, xem ảnh và ghi chú mà không cần tải không gian 3D.';
  document.querySelectorAll('#zoom-in,#zoom-out,#turn-left,#turn-right,#quality').forEach(b=>b.disabled=true);
  if(!reading)console.warn('Museum reading fallback:',reason);
}
