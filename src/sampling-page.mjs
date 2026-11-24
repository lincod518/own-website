import { candidates, probabilitiesAt, sentence } from '../assets/sampling.mjs';

export const samplingArticle = {
  slug: 'what-temperature-changes',
  title: '把温度调高，AI 会换一个词吗？',
  date: '2026-11-19',
  category: 'AI 实验笔记',
  excerpt: '用四个候选词和一组可以重复的抽样，看清温度怎样改变下一个词的概率。',
  experiment: { path: 'temperature', title: '采样温度实验' },
  body: `
    <p class="article-lead">“合上笔记后，我决定去____。”如果“散步”原本最有可能出现，把温度调高，谁会成为第一名？</p>
    <h2>先把条件固定下来</h2>
    <p>我们给这个填空准备了四个候选词。温度为 1 时，“散步”占 55%，“写作”占 25%，“画画”占 15%，“看星星”占 5%。这些数值是为演示设定的，方便逐项核对。</p>
    <p>在实验里，先按一次“抽一个词”，再按“抽 100 次”。单次抽样得到一个词。抽一组之后，就能比较每个词的实际次数和理论概率。</p>
    <h2>改一个数，观察两端</h2>
    <p>把温度调到 0.5。“散步”的理论概率升到 77.6%，“看星星”降到 0.6%。重复抽几组，某一组完全没有出现“看星星”也很正常。</p>
    <p>再把温度调到 2.0。“散步”的概率降到 40.0%，“看星星”升到 12.1%。四个词的排名始终相同，可是第一名和最后一名被抽到的机会接近了许多。</p>
    <h2>为什么排名会保持相同？</h2>
    <p>计算时，把每个起始概率提高到 <code>1/T</code> 次方，再除以这四个新数值的总和。正数取同一个正指数的幂，大小关系会保留。比如把温度从 1 降到 0.5，原来的概率比会被平方，领先者的优势随之放大。</p>
    <p>在模型生成中，常见做法是将每个候选 token 的分数除以温度，再用 softmax 得到采样概率。这里从基础概率出发，两种写法给出相同的温度变换。<a href="https://huggingface.co/docs/transformers/en/internal/generation_utils#transformers.TemperatureLogitsWarper">Hugging Face Transformers 的温度采样说明</a></p>
    <h2>这个小实验能回答什么？</h2>
    <p>频率和概率的区别在重复抽样时最明显。概率由当前温度决定，每组 100 次的频率还受随机性影响。可以先猜最少见的词会出现几次，再抽一组核对。</p>
    <p>真实语言模型会根据上下文为大量 token 打分，每生成一步就重新计算。这里固定了一个位置、四个词和起始权重，只观察采样这一步。判断一段完整回答的事实准确性，还需要另外的检验。</p>`
};

export function samplingFeature(root) {
  return `<article class="sampling-feature">
    <div><p class="eyebrow">交互实验 · 语言模型</p><h3>采样温度实验</h3>
      <p>同一句开头，温度会怎样改变下一个词？设定温度，抽 100 次，把结果和理论概率放在一起看。</p>
      <div class="feature-links"><a class="button button-blue" href="${root}lab/temperature/">开始抽样</a>
        <a class="inline-link" href="${root}writing/${samplingArticle.slug}/">阅读实验笔记</a></div>
    </div>
    <figure class="sampling-mini"><figcaption>温度 1.0 时的理论分布</figcaption>
      ${candidates.map(({ word, weight }) => `<div><span>${word}</span><i aria-hidden="true" style="--chance:${weight}%"></i><b>${weight}%</b></div>`).join('')}
    </figure></article>`;
}

export function samplingControls({ id = 'temperature', compact = false } = {}) {
  const probabilities = probabilitiesAt(1);
  const rows = candidates.map(({ word }, index) => {
    const percent = (100 * probabilities[index]).toFixed(1) + '%';
    return `<tr data-candidate><th scope="row">${word}</th><td>
      <span class="chance-track" aria-hidden="true"><i data-bar style="width:${percent}"></i></span>
      <span data-percent>${percent}</span></td><td data-count>—</td></tr>`;
  }).join('');
  const heading = compact ? 'h3' : 'h2';
  const panelClass = compact ? 'sampling-preview-section' : 'tool-panel';
  return `<div class="${compact ? 'sampling-preview' : 'tool-workspace sampling-workspace'}" data-sampling>
      <section class="${panelClass}"><div class="panel-heading"><${heading}>给句子续一个词</${heading}></div>
        <p class="sampling-sentence">${sentence}<strong data-drawn-word>____</strong>。</p>
        <label class="temperature-label" for="${id}">采样温度 T <output for="${id}" data-temperature-value>1.0</output></label>
        <input id="${id}" data-temperature type="range" min="0.2" max="2" step="0.1" value="1" aria-describedby="${id}-hint" disabled>
        <div class="temperature-scale" aria-hidden="true"><span>0.2 · 更集中</span><span>2.0 · 更均匀</span></div>
        <div class="result-actions"><button class="button button-blue" type="button" data-draw-one disabled>抽一个词</button>
          <button class="button button-quiet" type="button" data-draw-batch disabled>抽 100 次</button></div>
        <p class="tool-status" data-sampling-status role="status" aria-live="polite" aria-atomic="true"></p>
        <noscript><p>启用 JavaScript 后可以调节温度并抽样，下表为温度 1.0 时的概率。</p></noscript>
      </section>
      <section class="${panelClass}"><div class="panel-heading"><${heading}>候选词分布</${heading}></div>
        <table class="chance-table"><caption class="sr-only">当前温度下的理论概率与本组抽样次数</caption><thead><tr><th scope="col">候选词</th><th scope="col">理论概率</th><th scope="col" data-batch-heading>抽取次数</th></tr></thead>
          <tbody>${rows}</tbody></table>
        <p class="privacy-note" id="${id}-hint">四个起始权重为演示设定。低温更集中，高温更均匀。每组抽样单独计数。</p>
      </section>
    </div>`;
}

export function samplingPage() {
  return `<section class="shell tool-page sampling-page">
    <header class="tool-header"><a class="breadcrumb" href="../">返回实验室</a>
      <h1>采样温度实验</h1><p>给同一个填空设定四个候选词。拖动温度，再抽 100 次，比较理论概率和实际次数。</p></header>
    ${samplingControls()}
    <a class="paired-reading" href="../../writing/${samplingArticle.slug}/">
      <span><small>配套文章</small><strong>${samplingArticle.title}</strong></span></a>
    <script type="module" src="../../assets/sampling-ui.mjs"></script></section>`;
}
