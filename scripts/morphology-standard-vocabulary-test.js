const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function fixture(level='standard') {
  const words = [{word:'helpful',practiceBand:'2-3',vocabLevel:'familiar'}, {word:'active',practiceBand:'2-3',vocabLevel:'academic'}, {word:'credible',practiceBand:'2-3',vocabLevel:'challenge'}, {word:'careless',practiceBand:'2-3',vocabLevel:'familiar'}];
  const c = vm.createContext({window:{FIRST_VOLO_WORD_INVENTORY:words},gradeBand:'all',vocabLevel:level,studyMode:'root-suffix',getActiveBuildWords:()=>words, getWordMetadata:word=>words.find(w=>w.word===word), isReservedTransferWord:word=>word==='careless',shuffle:a=>a});
  const source=fs.readFileSync('script.js','utf8');
  vm.runInContext(source.slice(source.indexOf('function getWordVocabularyLevel('),source.indexOf('function getVocabularyLevelLabel(')),c);
  vm.runInContext(fs.readFileSync('use-it.js','utf8'),c);
  vm.runInContext(fs.readFileSync('change-it.js','utf8'),c);
  return c;
}
test('Standard Use It includes familiar and academic; excludes challenge and protected words',()=>{
 const c=fixture();assert.deepEqual(Array.from(vm.runInContext('getUseItEligibleWords().map(w=>w.word)',c)),['helpful','active']);
 const choices=Array.from(vm.runInContext("makeUseItChoices({word:'helpful'})",c)); assert.ok(!choices.includes('credible'));assert.ok(!choices.includes('careless'));
});
test('Stretch opt-in admits challenge content without admitting protected words',()=>{
 const c=fixture('all');const words=Array.from(vm.runInContext('getUseItEligibleWords().map(w=>w.word)',c));assert.ok(words.includes('credible'));assert.ok(!words.includes('careless'));
});
test('Standard Change It has real content across the three Flights',()=>{
 const c=fixture();for(const band of ['2-3','4-5','6-8']){c.gradeBand=band;const rows=vm.runInContext('getChangeItEligibleQuestions()',c);assert.ok(rows.length>0,band);assert.ok(rows.every(r=>['familiar','academic'].includes(r.vocabLevel)));}
});
test('Change It retains combination and protected-item restrictions',()=>{
 const c=fixture();c.studyMode='prefixes';assert.equal(vm.runInContext('getChangeItEligibleQuestions().length',c),0);c.studyMode='root-suffix';c.isReservedTransferWord=()=>true;assert.equal(vm.runInContext('getChangeItEligibleQuestions().length',c),0);
});
