export const icon = (name, cls = '') => {
  const paths = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    diagonal: '<path d="M6 18 18 6M6 6h12v12"/>',
    pen: '<path d="m14 4 6 6M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14l-1 7Z"/>',
    spark: '<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    github: '<path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.5c0-1 .1-1.5-.5-2 3.6-.4 7.5-1.8 7.5-8a6.3 6.3 0 0 0-1.8-4.4c.2-.5.8-2.2-.2-4.1 0 0-1.5-.4-4.7 1.7a16 16 0 0 0-8.6 0C3.5-.4 2-.0 2-.0c-1 1.9-.4 3.6-.2 4.1A6.3 6.3 0 0 0 0 8.5c0 6.2 3.9 7.6 7.5 8-.5.4-.5 1-.5 2V22" transform="translate(2 1) scale(.85)"/>',
    chevron: '<path d="m7 10 5 5 5-5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
};
export const mark = '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 1c2 12 7 17 19 19-12 2-17 7-19 19C18 27 13 22 1 20 13 18 18 13 20 1Z" fill="currentColor"/><circle cx="20" cy="20" r="4" fill="var(--logo-dot,#fff)"/></svg>';
export const heroArt = `
  <div class="idea-universe explorer-stage" data-parallax>
    <div class="explorer-orbit explorer-orbit-a" aria-hidden="true"></div><div class="explorer-orbit explorer-orbit-b" aria-hidden="true"></div>
    <span class="explorer-coordinate" aria-hidden="true">好奇心 / 始终在线</span>
    <button class="explorer-button" type="button" aria-label="点亮灵感探索者" data-orbit>
      <img class="explorer-image" src="./assets/visuals/hero-explorer-v2.webp" width="1254" height="1254" alt="" fetchpriority="high" decoding="async">
    </button>
    <span class="explorer-sticker" aria-hidden="true">想到了，<br>就去试试！</span>
    <div class="idea-caption"><span class="tiny-star">✦</span><span id="orbit-caption" aria-live="polite">想法，在这里发生。</span><span class="caption-hint">点一下，打个招呼 ↗</span></div>
  </div>`;
export function layout({ route = '', title, description, content, active = 'home', bodyClass = '' }) {
  const depth = route.split('/').filter(Boolean).length;
  const r = depth ? '../'.repeat(depth) : './';
  const nav = (key, href, label) => `<a href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="${description}"><meta name="theme-color" content="#245de8">
  <meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:type" content="website">
  <title>${title}</title><link rel="icon" href="${r}assets/favicon.svg" type="image/svg+xml">
  <link rel="canonical" href="https://lincod518.github.io/own-website/${route}">
  <link rel="stylesheet" href="${r}assets/site.css?v=2">${bodyClass.includes('home-page') ? `<link rel="stylesheet" href="${r}assets/exhibit.css?v=2"><link rel="preload" as="image" href="${r}assets/visuals/hero-explorer-v2.webp" fetchpriority="high">` : ''}<script type="module" src="${r}assets/site.js?v=2"></script>
</head>
<body class="${bodyClass}">
  <a href="#main" class="skip-link">跳到主要内容</a>
  <header class="site-header"><div class="nav-shell">
    <a class="brand" href="${r}" aria-label="lincod518 首页"><span class="brand-mark">${mark}</span><span>lincod518<span class="brand-divider">/</span><small>思考与实验</small></span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" hidden>菜单 ${icon('chevron')}</button>
    <nav class="site-nav" id="site-nav" aria-label="主导航">${nav('home', r, '首页')}${nav('writing', `${r}writing/`, '写作')}${nav('lab', `${r}lab/`, '实验室')}${nav('about', `${r}#about`, '关于这里')}<a class="nav-github" href="https://github.com/lincod518" target="_blank" rel="noopener noreferrer" aria-label="GitHub（在新标签页打开）">${icon('github')}<span>GitHub</span>${icon('diagonal')}</a></nav>
  </div></header>
  <main id="main">${content}</main>
  <footer class="site-footer"><div class="shell footer-top"><a class="footer-brand" href="${r}">${mark}<span>lincod518<small>思考有迹，探索有光。</small></span></a><div class="footer-links"><a href="${r}writing/">去读一读 ${icon('diagonal')}</a><a href="${r}lab/">去试一试 ${icon('diagonal')}</a><a href="#main">回到顶部 ↑</a></div></div><div class="shell footer-bottom"><span>© 2026 lincod518 · 一个持续生长的个人空间</span><span>保持好奇，慢慢发生 <span class="orange">✳</span></span></div></footer>
</body></html>`;
}
export const noteRow = (post, r = './') => `<a class="post-row" href="${r}writing/${post.slug}/" data-post data-category="${post.category}" data-search="${post.title} ${post.excerpt} ${post.category}"><div class="post-date"><time datetime="${post.date}">${post.date.replaceAll('-', '.')}</time><span>${post.category}</span></div><div class="post-copy"><h3>${post.title}</h3><p>${post.excerpt}</p></div><span class="post-arrow">${icon('diagonal')}</span></a>`;
export function toolCard(type, r = './') {
  const prompt = type === 'prompt';
  return `<a class="experiment-card ${prompt ? 'experiment-orange' : 'experiment-blue'}" href="${r}lab/${type}/"><div class="experiment-art" aria-hidden="true">${prompt ? '<div class="prompt-preview"><span>给谁用？</span><span>做什么？</span><span>什么样？</span><b>一个清晰的提示词 <i>↗</i></b></div>' : '<div class="sticky-preview sticky-back">突然想到……</div><div class="sticky-preview sticky-front"><span>✳ 灵感片段</span><b>先留下来，<br>再慢慢想。</b><i>记录 / 连接 / 生长</i></div>'}</div><div class="experiment-info"><div class="experiment-label"><span>${prompt ? '01 / 写给 AI 的任务卡' : '02 / 给想法一个落点'}</span><span class="available"><i></i>可体验</span></div><h3>${prompt ? '提示词拼装台' : '灵感便签'} ${icon('diagonal')}</h3><p>${prompt ? '把目标、背景和要求理清楚，组合成一段可直接复制的提示词。' : '随手记下闪过的想法，在自己的浏览器里保存、整理和导出。'}</p><div class="tool-tags"><span>${prompt ? '提示词整理' : '本地保存'}</span><span>${prompt ? '一键复制' : '可导出备份'}</span><span>浏览器小工具</span></div></div></a>`;
}
