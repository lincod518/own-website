const MAX_NOTES = 1000;
const MAX_TITLE = 80;
const MAX_BODY = 6000;
export const presets = {
  thinking: { role: '善于追问、能指出盲点的思考伙伴', goal: '帮我梳理下面这个想法，找出值得继续探索的问题。', context: '', constraints: '区分已知事实、假设和个人判断。信息不足时先提问，不编造事实。', format: '核心观点、三个关键问题、可以尝试的下一步。' },
  learning: { role: '用具体例子解释问题的老师', goal: '帮助我理解一个新概念，并检验我是否真正理解了。', context: '', constraints: '先用通俗语言解释，再逐步增加细节。明确不确定的地方。', format: '一个生活例子、一份要点清单、三个自测问题。' },
  project: { role: '务实的产品与开发搭档', goal: '把我的一个想法拆成能够完成的第一个小版本。', context: '', constraints: '优先解决一个明确问题。标出依赖与未知条件，不预设已有能力。', format: '目标用户、核心场景、最小功能、实施步骤、验证方法。' }
};
export function composePrompt(fields) {
  const sections = [['你的角色',fields.role],['我想完成的事',fields.goal],['背景信息',fields.context],['要求与限制',fields.constraints],['回答形式',fields.format]];
  const parts = sections.filter(([,value]) => typeof value === 'string' && value.trim()).map(([label,value]) => `【${label}】\n${value.trim()}`);
  return parts.join('\n\n') || '先在任务卡里写下一点内容。\n\n你想做什么？有哪些背景？希望得到怎样的回答？';
}
export function validateNotes(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.notes) || data.notes.length > MAX_NOTES) throw new Error('这不是有效的灵感便签备份，或便签数量超过 1000 条。');
  const ids = new Set();
  return data.notes.map(note => {
    if (!note || typeof note.id !== 'string' || !note.id || note.id.length > 100 || ids.has(note.id) || typeof note.title !== 'string' || note.title.length > MAX_TITLE || typeof note.body !== 'string' || !note.body.trim() || note.body.length > MAX_BODY || typeof note.createdAt !== 'string' || !Number.isFinite(Date.parse(note.createdAt)) || typeof note.updatedAt !== 'string' || !Number.isFinite(Date.parse(note.updatedAt))) throw new Error('备份中的便签格式不完整，请保留原始备份后再检查。');
    ids.add(note.id);
    return { id: note.id, title: note.title, body: note.body, createdAt: note.createdAt, updatedAt: note.updatedAt };
  });
}
export function mergeNotes(current, incoming, makeId) {
  const merged = current.map(note => ({...note}));
  for (const note of incoming) {
    const existing = merged.find(item => item.id === note.id);
    if (existing && existing.title === note.title && existing.body === note.body) continue;
    merged.push({ ...note, id: existing ? makeId() : note.id });
  }
  return validateNotes({version:1,notes:merged});
}
