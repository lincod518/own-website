import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { posts } from '../src/posts.mjs';
import { layout, icon, mark, noteRow, toolCard } from '../src/site.mjs';
import { homeContent } from '../src/home.mjs';
import { samplingFeature, samplingPage } from '../src/sampling-page.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const pages = new Map();
const add = (route, options) => pages.set(route, layout({ route, ...options }));

add('', {
  title: 'lincod518 · 思考与实验', description: '存放所思所想，也让想法变成可以体验的东西。lincod518 的写作与 AI 实验空间。', bodyClass: 'home-page exhibition-page',
  content: homeContent(posts)
});

const categories = [...new Set(posts.map(post => post.category))];
add('writing/', {
  title: '文章与手记 · lincod518', description: '阅读 AI 实验笔记、个人思考与建站记录。', active: 'writing',
  content: `<section class="page-intro shell">
    <a class="breadcrumb" href="../">← 首页</a><h1>文章与手记</h1>
    <p>记录每个 AI 实验从提问到验证的过程，也收下做这个网站时的想法。</p></section>
    <section class="shell writing-index"><div class="writing-toolbar"><div class="filter-tabs" role="group" aria-label="按分类筛选">
      <button type="button" data-filter="all" aria-pressed="true">全部</button>
      ${categories.map(category => `<button type="button" data-filter="${category}" aria-pressed="false">${category}</button>`).join('')}
    </div><label class="search-field"><span class="sr-only">搜索文章</span><input type="search" data-search-input placeholder="搜索文章…" maxlength="100"></label></div>
    <p class="search-count" data-search-count aria-live="polite">${posts.length} 篇记录</p>
    <div class="post-list">${posts.map(post => noteRow(post, '../')).join('')}</div>
    <p class="empty-state" data-search-empty hidden>没有找到相关记录，试试别的关键词。</p></section>`
});

for (const post of posts) {
  const related = post.experiment
    ? `<a class="paired-reading" href="../../lab/${post.experiment.path}/"><span><small>配套实验</small><strong>${post.experiment.title}</strong></span>${icon('arrow')}</a>`
    : `<div class="article-end">${mark}<a class="inline-link" href="../../lab/">去实验室看看 ${icon('arrow')}</a></div>`;
  add(`writing/${post.slug}/`, {
    title: `${post.title} · lincod518`, description: post.excerpt, active: 'writing',
    content: `<article class="article shell"><a class="breadcrumb" href="../">← 返回文章</a><header class="article-header">
      <div class="article-meta"><span>${post.category}</span><time datetime="${post.date}">${post.date.replaceAll('-', '.')}</time></div>
      <h1>${post.title}</h1>${post.experiment ? `<a class="inline-link" href="../../lab/${post.experiment.path}/">边读边做实验 ${icon('diagonal')}</a>` : ''}</header>
      <div class="prose">${post.body}</div>${related}</article>`
  });
}

add('lab/', {
  title: 'AI 实验室 · lincod518', description: '亲手调节采样温度、组装提示词，或记录下一次实验的灵感。', active: 'lab',
  content: `<section class="page-intro lab-intro"><div class="shell"><a class="breadcrumb" href="../">← 首页</a>
    <h1>AI 实验室</h1><p>挑一个问题，改一个参数，看看会发生什么。</p></div></section>
    <section class="section shell lab-index" aria-label="在线实验及工具">
      ${samplingFeature('../')}
      <h2 class="lab-tools-title">随手工具</h2><div class="experiment-grid">${toolCard('prompt', '../')}${toolCard('notes', '../')}</div>
    </section>`
});

add('lab/temperature/', {
  title: '采样温度实验 · lincod518 AI 实验室', description: '动手调节温度，观察四个候选词的理论概率与 100 次抽样频数。',
  active: 'lab', content: samplingPage()
});

const toolHeader = (number, title, desc) => `<header class="tool-header"><a class="breadcrumb" href="../">← 返回实验室</a><p class="eyebrow">实验 ${number} / 浏览器小工具</p><h1>${title}<span class="orange">.</span></h1><p>${desc}</p></header>`;
add('lab/prompt/', { title: '提示词拼装台 · lincod518 实验室', description: '把目标、背景和要求组合成清晰的提示词，然后复制到你使用的 AI 工具。', active: 'lab', content: `<section class="shell tool-page">${toolHeader('01', '提示词拼装台', '先把问题想清楚，再交给 AI。填写左边的任务卡，右边会实时整理成一段提示词。')}<div class="tool-workspace" data-prompt-tool><form class="tool-panel" id="prompt-form"><div class="panel-heading"><h2>你的任务卡</h2><span>01 / 输入</span></div><label class="field">从一个场景开始<select name="preset"><option value="blank">自由填写</option><option value="thinking">梳理一个想法</option><option value="learning">理解一个新概念</option><option value="project">规划一个小项目</option></select></label><label class="field">你希望 AI 扮演谁？<input name="role" maxlength="200" placeholder="例如：善于追问的思考伙伴"></label><label class="field">你想完成什么？<textarea name="goal" rows="3" maxlength="2000" placeholder="把你最想解决的那个问题写下来…"></textarea></label><label class="field">有哪些背景信息？<textarea name="context" rows="3" maxlength="4000" placeholder="已知信息、当前进展，或者你试过的方法…"></textarea></label><label class="field">有什么要求或限制？<textarea name="constraints" rows="2" maxlength="2000" placeholder="例如：先指出不确定性，不要编造事实"></textarea></label><label class="field">希望得到什么形式的回答？<input name="format" maxlength="500" placeholder="例如：三个关键问题，加一份行动清单"></label><button type="reset" class="button button-quiet">清空任务卡</button></form><section class="tool-panel prompt-result"><div class="panel-heading"><h2>整理好的提示词</h2><span>02 / 带走</span></div><p class="tool-explanation">组合后，复制到你常用的 AI 工具中继续使用。</p><pre id="prompt-output" tabindex="0"></pre><div class="result-actions"><button type="button" class="button button-blue" data-copy-prompt>${icon('copy')}复制提示词</button><button type="button" class="button button-quiet" data-download-prompt>下载 .txt ↓</button></div><p class="tool-status" data-prompt-status role="status" aria-live="polite"></p><p class="privacy-note">这张任务卡只在当前页面处理，不上传内容，也不会调用模型。刷新页面会清空输入。</p></section></div></section>` });

add('lab/notes/', { title: '灵感便签 · lincod518 实验室', description: '随手记录零散想法，在当前浏览器本地保存，并导出备份。', active: 'lab', content: `<section class="shell tool-page" data-notes-tool>${toolHeader('02', '灵感便签', '一个闪过的念头，一句还没想完的话。先留下来，再慢慢想。')}<div class="notes-privacy">${icon('spark')}<p><strong>仅保存在当前浏览器。</strong>便签不会公开或自动同步。清理浏览器数据前，请先导出备份。</p></div><div class="notes-workspace"><form class="tool-panel note-compose" id="notes-form"><div class="panel-heading"><h2 data-note-form-title>写下一点想法</h2><span>捕捉 / 留存</span></div><label class="field">给它一个标题<input name="title" maxlength="80" placeholder="也可以先不取名字"></label><label class="field">此刻在想什么？<textarea name="body" rows="9" maxlength="6000" required placeholder="从一个念头开始…"></textarea></label><div class="result-actions"><button class="button button-blue" type="submit">保存这段灵感 ${icon('plus')}</button><button class="button button-quiet" type="button" data-cancel-edit hidden>取消编辑</button></div><p class="tool-status" data-notes-status role="status" aria-live="polite"></p></form><section class="notes-collection"><div class="notes-toolbar"><h2>收集到的灵感 <span data-notes-count>0</span></h2><div><button class="small-button" type="button" data-export-notes>导出备份 ↓</button><label class="small-button import-label">导入备份<input type="file" accept="application/json,.json" data-import-notes></label></div></div><div class="undo-bar" data-undo-bar hidden><span>已移除一条便签</span><button type="button" data-undo-note>撤销</button></div><div class="notes-list" data-notes-list></div><div class="notes-empty" data-notes-empty>${icon('pen')}<h3>第一条灵感，会是什么？</h3><p>不必等它完整。写下几个字，也是一种开始。</p></div></section></div></section>` });

for (const [route, content] of pages) {
  const directory = path.join(root, route);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), content, 'utf8');
}
await writeFile(path.join(root, '.nojekyll'), '');
await writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...pages.keys()].map(route => `<url><loc>https://lincod518.github.io/own-website/${route}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${pages.size} static pages. No runtime dependencies.`);
