import { candidates, drawIndex, probabilitiesAt, sentence } from './sampling.mjs';

for (const panel of document.querySelectorAll('[data-sampling]')) {
  const slider = panel.querySelector('[data-temperature]');
  const value = panel.querySelector('[data-temperature-value]');
  const status = panel.querySelector('[data-sampling-status]');
  const lastDraw = panel.querySelector('[data-drawn-word]');
  const rows = Array.from(panel.querySelectorAll('[data-candidate]'));
  const batchHeading = panel.querySelector('[data-batch-heading]');
  let probabilities = probabilitiesAt(slider.valueAsNumber);

  function applyTemperature() {
    const temperature = slider.valueAsNumber;
    probabilities = probabilitiesAt(temperature);
    value.textContent = temperature.toFixed(1);
    slider.setAttribute('aria-valuetext', `温度 ${value.textContent}`);
    rows.forEach((row, index) => {
      const percent = `${(100 * probabilities[index]).toFixed(1)}%`;
      row.querySelector('[data-bar]').style.width = percent;
      row.querySelector('[data-percent]').textContent = percent;
      row.querySelector('[data-count]').textContent = '—';
    });
    lastDraw.textContent = '____';
    batchHeading.textContent = '抽取次数';
    status.textContent = '可以按当前温度抽一次，或抽一组 100 次。';
  }

  slider.addEventListener('input', applyTemperature);
  panel.querySelector('[data-draw-one]').addEventListener('click', () => {
    const word = candidates[drawIndex(probabilities)].word;
    lastDraw.textContent = word;
    status.textContent = `单次抽取结果：${sentence}${word}。`;
  });
  panel.querySelector('[data-draw-batch]').addEventListener('click', () => {
    const counts = Array(candidates.length).fill(0);
    for (let draw = 0; draw < 100; draw++) counts[drawIndex(probabilities)]++;
    rows.forEach((row, index) => { row.querySelector('[data-count]').textContent = String(counts[index]); });
    batchHeading.textContent = '本组 100 次';
    const summary = candidates.map(({ word }, index) => `${word} ${counts[index]} 次`).join('，');
    status.textContent = `本组结果：${summary}。`;
  });
  slider.disabled = false;
  for (const button of panel.querySelectorAll('button')) button.disabled = false;
  applyTemperature();
}
