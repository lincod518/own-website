import { composePrompt } from './tools-model.mjs';

export function initExhibition() {
  if (!document.body.classList.contains('home-page')) return;
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('[data-motion-toggle]');
  const canMove = () => !reducedMotion.matches && !root.hasAttribute('data-motion-paused');

  if (motionButton) {
    root.setAttribute('data-motion-ready', '');
    motionButton.hidden = reducedMotion.matches;
    const updateMotion = () => {
      motionButton.hidden = reducedMotion.matches;
      const paused = root.hasAttribute('data-motion-paused');
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.textContent = paused ? '开启动效 ▷' : '暂停动效 Ⅱ';
      if (paused) {
        document.querySelector('[data-parallax]')?.style.setProperty('--mx', 0);
        document.querySelector('[data-parallax]')?.style.setProperty('--my', 0);
      }
      document.dispatchEvent(new Event('visual-motion-change'));
      updateScroll();
    };
    motionButton.addEventListener('click', () => { root.toggleAttribute('data-motion-paused'); updateMotion(); });
    reducedMotion.addEventListener('change', updateMotion);
  }

  const progress = document.querySelector('[data-scroll-progress]');
  const scenes = [...document.querySelectorAll('[data-scroll-scene]')];
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const chapterLinks = [...document.querySelectorAll('[data-chapter-link]')];
  let queued = false;
  function updateScroll() {
    queued = false;
    const max = Math.max(1, document.documentElement.scrollHeight-innerHeight);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY/max))})`;
    for (const scene of scenes) {
      const rect = scene.getBoundingClientRect();
      const amount = canMove() ? Math.max(-1, Math.min(1, (innerHeight*.52-(rect.top+rect.height*.5))/innerHeight)) : 0;
      scene.style.setProperty('--scene-progress', amount.toFixed(3));
    }
    const current = chapters.filter(chapter => chapter.getBoundingClientRect().top < innerHeight*.55).at(-1);
    chapterLinks.forEach(link => {
      const active = link.dataset.chapterLink === current?.id;
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  const queueScroll = () => { if (!queued) { queued=true;requestAnimationFrame(updateScroll); } };
  addEventListener('scroll', queueScroll, {passive:true});addEventListener('resize', queueScroll);updateScroll();

  const tabs = [...document.querySelectorAll('[data-demo-tab]')];
  const selectTab = tab => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
  };
  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key==='ArrowRight') next=tabs[(index+1)%tabs.length];
      if (event.key==='ArrowLeft') next=tabs[(index-1+tabs.length)%tabs.length];
      if (event.key==='Home') next=tabs[0];if(event.key==='End')next=tabs.at(-1);
      if(next){event.preventDefault();selectTab(next);next.focus();}
    });
  });
  const input=document.querySelector('[data-home-prompt-input]');
  const output=document.querySelector('[data-home-prompt-output]');
  const status=document.querySelector('[data-home-prompt-status]');
  if(input&&output){
    const update=()=>{output.textContent=composePrompt({role:'务实的思考与开发搭档',goal:input.value,context:'',constraints:'先提出需要澄清的问题，再拆出最小的第一步。信息不足时不要编造。',format:'一个核心目标，一份可以开始的行动清单。'});status.textContent='在当前页面组合提示词，不调用 AI 模型。';};
    input.addEventListener('input',update);update();
    document.querySelector('[data-home-prompt-copy]').addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText(output.textContent);status.textContent='已复制，可以带到你常用的 AI 工具里继续。';}
      catch{const range=document.createRange();range.selectNodeContents(output);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent='已选中任务卡，请按 Ctrl+C（Mac 为 ⌘C）复制。';}
    });
  }
}
