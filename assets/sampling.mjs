export const sentence = '合上笔记后，我决定去';
export const candidates = [
  { word: '散步', weight: 55 },
  { word: '写作', weight: 25 },
  { word: '画画', weight: 15 },
  { word: '看星星', weight: 5 }
];

// The four weights define the distribution at T = 1.
// Raising positive weights to 1/T is equivalent to softmax(log(weight) / T).
export function probabilitiesAt(temperature) {
  if (!Number.isFinite(temperature) || temperature <= 0) {
    throw new RangeError('温度必须是大于零的有限数。');
  }
  const largest = Math.max(...candidates.map(candidate => candidate.weight));
  const scaled = candidates.map(({ weight }) => (weight / largest) ** (1 / temperature));
  const sum = scaled.reduce((total, weight) => total + weight, 0);
  return scaled.map(weight => weight / sum);
}

export function drawIndex(probabilities, draw = Math.random()) {
  let threshold = 0;
  for (let index = 0; index < probabilities.length - 1; index++) {
    threshold += probabilities[index];
    if (draw < threshold) return index;
  }
  return probabilities.length - 1;
}
