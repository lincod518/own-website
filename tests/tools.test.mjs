import test from 'node:test';
import assert from 'node:assert/strict';
import { composePrompt, validateNotes, mergeNotes } from '../assets/tools-model.mjs';
import { probabilitiesAt, drawIndex } from '../assets/sampling.mjs';

test('temperature values reproduce the article and preserve probability mass', () => {
  for (const [temperature, expected] of [
    [0.5, ['77.6', '16.0', '5.8', '0.6']],
    [1, ['55.0', '25.0', '15.0', '5.0']],
    [2, ['40.0', '27.0', '20.9', '12.1']]
  ]) {
    const probabilities = probabilitiesAt(temperature);
    assert.deepEqual(probabilities.map(value => (100 * value).toFixed(1)), expected);
    assert.ok(Math.abs(probabilities.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
  }
});

test('each sampled interval maps to its displayed candidate including boundary draws', () => {
  const probabilities = [0.5, 0.25, 0.125, 0.125];
  assert.deepEqual([0, 0.49, 0.5, 0.75, 0.875, 0.999999].map(number => drawIndex(probabilities, number)), [0, 0, 1, 2, 3, 3]);
});
const note={id:'one',title:'想法',body:'第一段\n第二段',createdAt:'2026-11-18T12:00:00.000Z',updatedAt:'2026-11-18T12:00:00.000Z'};
test('prompt keeps Chinese user input and omits empty sections',()=>{
  const result=composePrompt({role:' 学习伙伴 ',goal:'理解一个概念',context:'',constraints:'不要编造',format:''});
  assert.ok(result.includes('学习伙伴'));assert.ok(result.includes('理解一个概念'));assert.ok(result.includes('不要编造'));assert.ok(!result.includes('背景信息'));
});
test('backups round-trip without losing line breaks or literal markup',()=>{
  const original={...note,body:'<script>alert(1)</script>\n一个原样保存的想法'};
  assert.deepEqual(validateNotes(JSON.parse(JSON.stringify({version:1,notes:[original]}))),[original]);
});
test('malformed backups, duplicate IDs and oversized notes are rejected',()=>{
  for(const data of [{notes:[note]},{version:1,notes:[note,note]},{version:1,notes:[{...note,body:''}]},{version:1,notes:[{...note,body:'字'.repeat(6001)}]},{version:1,notes:[{...note,updatedAt:'bad'}]}])assert.throws(()=>validateNotes(data));
});
test('re-importing identical backups does not duplicate notes',()=>{
  assert.deepEqual(mergeNotes([note],[{...note}],()=> 'two'),[note]);
});
test('conflicting backups preserve both versions and leave current notes untouched',()=>{
  const incoming={...note,body:'另一台浏览器修改的内容'};
  const merged=mergeNotes([note],[incoming],()=> 'two');
  assert.equal(merged.length,2);assert.equal(merged[0].body,note.body);assert.equal(merged[1].body,incoming.body);assert.equal(merged[1].id,'two');assert.equal(note.id,'one');
});
test('import failures do not mutate existing note collections',()=>{
  const current=[{...note}];
  assert.throws(()=>mergeNotes(current,[{...note,id:'other',body:'字'.repeat(6001)}],()=> 'new'));
  assert.deepEqual(current,[note]);
});
