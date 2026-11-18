import { composePrompt, presets, validateNotes, mergeNotes } from './tools-model.mjs';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile = window.matchMedia('(max-width: 760px)');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const closeMenu = () => {
  if (!nav || !menuButton) return;
  nav.classList.toggle('is-collapsed', mobile.matches);
  menuButton.setAttribute('aria-expanded', 'false');
};
if (menuButton && nav) {
  const updateMenu = () => { menuButton.hidden = !mobile.matches; closeMenu(); };
  updateMenu();
  mobile.addEventListener('change', updateMenu);
  menuButton.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(opening));
    nav.classList.toggle('is-collapsed', !opening);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); }
  });
}

const universe = document.querySelector('[data-parallax]');
const planet = document.querySelector('[data-orbit]');
if (universe && planet) {
  let step = 0;
  const captions = ['想法，在这里发生。', '写下来，就有了新的起点。', '好奇心，值得一次动手。', '慢慢来，让想法继续生长。'];
  if (window.matchMedia('(pointer: fine)').matches) {
    universe.addEventListener('pointermove', event => {
      if (reducedMotion.matches) return;
      const rect = universe.getBoundingClientRect();
      universe.style.setProperty('--mx', ((event.clientX-rect.left)/rect.width-.5)*2);
      universe.style.setProperty('--my', ((event.clientY-rect.top)/rect.height-.5)*2);
    });
    universe.addEventListener('pointerleave', () => { universe.style.setProperty('--mx',0); universe.style.setProperty('--my',0); });
  }
  planet.addEventListener('click', () => {
    step++;
    universe.classList.toggle('is-spinning', step % 2 === 1);
    document.querySelector('#orbit-caption').textContent = captions[step % captions.length];
    if (!reducedMotion.matches) {
      const burst = document.createElement('span');
      burst.className = 'hero-idea-burst'; burst.textContent = '✦'; burst.setAttribute('aria-hidden','true');
      universe.append(burst);
      burst.addEventListener('animationend', () => burst.remove(), {once:true});
    }
  });
}

// Decorative sky pauses off screen, in background tabs, and for reduced motion.
const canvas = document.querySelector('.sky-particles');
if (canvas && canvas.getContext('2d')) {
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, frame = 0, visible = true;
  const points = Array.from({length:48}, () => ({x:Math.random(),y:Math.random(),size:Math.random()*1.15+.35,speed:Math.random()*.000018+.000006}));
  const draw = () => {
    ctx.clearRect(0,0,width,height);
    for (const point of points) {
      if (!reducedMotion.matches) point.y = (point.y+point.speed)%1;
      ctx.beginPath();ctx.arc(point.x*width,point.y*height,point.size,0,Math.PI*2);
      ctx.fillStyle = 'rgba(236,246,255,.65)';ctx.fill();
    }
  };
  const tick = () => { draw(); frame = requestAnimationFrame(tick); };
  const update = () => {
    cancelAnimationFrame(frame);
    if (!reducedMotion.matches && visible && !document.hidden) tick(); else draw();
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width=rect.width;height=rect.height;
    const ratio=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw();
  };
  resize();window.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',update);reducedMotion.addEventListener('change',update);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible=entries[0].isIntersecting;update(); }).observe(canvas);
  update();
}

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('reveal-enter'); reveal.unobserve(entry.target); }
  }, {threshold:.08});
  document.querySelectorAll('.entrance,.experiment-card,.about-copy').forEach(element => reveal.observe(element));
}

const searchInput = document.querySelector('[data-search-input]');
if (searchInput) {
  let category = 'all';
  const rows = [...document.querySelectorAll('[data-post]')];
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const filter = () => {
    const query=searchInput.value.trim().toLocaleLowerCase();
    let count=0;
    for (const row of rows) {
      const show=(category==='all'||row.dataset.category===category)&&row.dataset.search.toLocaleLowerCase().includes(query);
      row.hidden=!show;if(show)count++;
    }
    document.querySelector('[data-search-count]').textContent=`${count} 篇记录`;
    document.querySelector('[data-search-empty]').hidden=count>0;
  };
  searchInput.addEventListener('input',filter);
  filterButtons.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.filter;
    filterButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    filter();
  }));
}

function downloadFile(contents, filename, type) {
  const url=URL.createObjectURL(new Blob([contents],{type}));
  const link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

const promptForm=document.querySelector('#prompt-form');
if (promptForm) {
  const output=document.querySelector('#prompt-output');
  const status=document.querySelector('[data-prompt-status]');
  const names=['role','goal','context','constraints','format'];
  const updatePrompt=()=>{ output.textContent=composePrompt(Object.fromEntries(names.map(name=>[name,promptForm.elements[name].value])));status.textContent=''; };
  promptForm.addEventListener('submit',event=>event.preventDefault());
  promptForm.addEventListener('input',updatePrompt);
  promptForm.elements.preset.addEventListener('change',event=>{
    const preset=presets[event.target.value];
    if(preset)names.forEach(name=>{promptForm.elements[name].value=preset[name];});
    updatePrompt();
  });
  promptForm.addEventListener('reset',()=>{queueMicrotask(updatePrompt);});
  document.querySelector('[data-copy-prompt]').addEventListener('click',async()=>{
    try {
      if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(output.textContent);status.textContent='已复制，可以粘贴到你使用的 AI 工具。';
    } catch {
      const range=document.createRange();range.selectNodeContents(output);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);output.focus();
      status.textContent='浏览器未允许自动复制，已选中内容，请按 Ctrl+C（Mac 为 ⌘C）或下载文本。';
    }
  });
  document.querySelector('[data-download-prompt]').addEventListener('click',()=>{downloadFile(output.textContent,'我的提示词.txt','text/plain;charset=utf-8');status.textContent='提示词文本已准备下载。';});
  updatePrompt();
}

const noteForm=document.querySelector('#notes-form');
if(noteForm){
  const key='lincod518-idea-notes-v1';
  const status=document.querySelector('[data-notes-status]');
  const list=document.querySelector('[data-notes-list]');
  const empty=document.querySelector('[data-notes-empty]');
  const undoBar=document.querySelector('[data-undo-bar]');
  const cancelButton=document.querySelector('[data-cancel-edit]');
  let notes=[], editingId=null, removed=null, storageReadable=true;
  const makeId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const tell=(message,error=false)=>{status.textContent=message;status.classList.toggle('is-error',error);};
  try { const saved=localStorage.getItem(key);if(saved)notes=validateNotes(JSON.parse(saved)); }
  catch { storageReadable=false;tell('无法读取原有本地数据。为避免覆盖，暂时只保存在当前页面；请导出新便签后再处理浏览器存储。',true); }
  const persist=()=>{
    if(!storageReadable){tell('当前只在页面内保存。请及时导出备份，刷新后这些更改不会保留。',true);return false;}
    try{localStorage.setItem(key,JSON.stringify({version:1,notes}));return true;}
    catch{tell('浏览器无法保存这次更改，请立即导出备份；刷新页面会丢失未保存的内容。',true);return false;}
  };
  const stopEditing=()=>{editingId=null;noteForm.reset();cancelButton.hidden=true;document.querySelector('[data-note-form-title]').textContent='写下一点想法';};
  const render=()=>{
    list.replaceChildren();empty.hidden=notes.length>0;document.querySelector('[data-notes-count]').textContent=String(notes.length);
    const sorted=[...notes].sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
    for(const note of sorted){
      const card=document.createElement('article');card.className='note-card';
      const title=document.createElement('h3');title.textContent=note.title||'还没取名的想法';
      const body=document.createElement('p');body.textContent=note.body;
      const bottom=document.createElement('div');bottom.className='note-card-bottom';
      const time=document.createElement('time');time.dateTime=note.updatedAt;time.textContent=new Date(note.updatedAt).toLocaleDateString('zh-CN');
      const actions=document.createElement('div');
      const edit=document.createElement('button');edit.type='button';edit.textContent='编辑';edit.setAttribute('aria-label',`编辑：${note.title||'未命名便签'}`);
      edit.addEventListener('click',()=>{editingId=note.id;noteForm.elements.title.value=note.title;noteForm.elements.body.value=note.body;cancelButton.hidden=false;document.querySelector('[data-note-form-title]').textContent='继续打磨这个想法';noteForm.elements.body.focus();});
      const remove=document.createElement('button');remove.type='button';remove.textContent='移除';remove.setAttribute('aria-label',`移除：${note.title||'未命名便签'}`);
      remove.addEventListener('click',()=>{removed={...note};notes=notes.filter(item=>item.id!==note.id);if(editingId===note.id)stopEditing();undoBar.hidden=false;const saved=persist();render();if(saved)tell('已移除一条便签，可以点“撤销”恢复。');});
      actions.append(edit,remove);bottom.append(time,actions);card.append(title,body,bottom);list.append(card);
    }
  };
  noteForm.addEventListener('submit',event=>{
    event.preventDefault();
    const body=noteForm.elements.body.value.trim(),title=noteForm.elements.title.value.trim();
    if(!body){tell('先写下一点内容再保存。',true);noteForm.elements.body.focus();return;}
    if(!editingId&&notes.length>=1000){tell('当前最多保存 1000 条便签，请先导出并整理旧记录。',true);return;}
    const now=new Date().toISOString();
    if(editingId)notes=notes.map(note=>note.id===editingId?{...note,title,body,updatedAt:now}:note);
    else notes.push({id:makeId(),title,body,createdAt:now,updatedAt:now});
    const saved=persist();stopEditing();render();if(saved)tell('已保存在当前浏览器。也可以导出一份备份。');
  });
  cancelButton.addEventListener('click',()=>{stopEditing();tell('已取消编辑，原便签保持不变。');});
  document.querySelector('[data-undo-note]').addEventListener('click',()=>{
    if(!removed)return;
    try{notes=mergeNotes(notes,[removed],makeId);}catch(error){tell(error.message,true);return;}
    removed=null;undoBar.hidden=true;const saved=persist();render();if(saved)tell('便签已恢复。');
  });
  document.querySelector('[data-export-notes]').addEventListener('click',()=>{
    const date=new Date().toISOString().slice(0,10);downloadFile(JSON.stringify({version:1,exportedAt:new Date().toISOString(),notes},null,2),`灵感便签-${date}.json`,'application/json');tell(`已准备导出 ${notes.length} 条便签的备份。`);
  });
  document.querySelector('[data-import-notes]').addEventListener('change',async event=>{
    const input=event.target,file=input.files?.[0];if(!file)return;
    try{
      if(file.size>2*1024*1024)throw new Error('备份文件超过 2MB，请选择灵感便签导出的 JSON 文件。');
      const imported=validateNotes(JSON.parse(await file.text()));
      const before=notes.length;
      notes=mergeNotes(notes,imported,makeId);
      const saved=persist();render();if(saved)tell(`导入完成，新增 ${notes.length-before} 条便签。已有内容已保留。`);
    }catch(error){tell(error instanceof SyntaxError?'文件不是有效的 JSON 备份，现有便签未改变。':error.message,true);}
    finally{input.value='';}
  });
  render();
}
