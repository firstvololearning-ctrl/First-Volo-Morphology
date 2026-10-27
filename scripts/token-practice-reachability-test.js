'use strict';
// Actual browser activity pools and production scoring IDs; no assessment items or forged target IDs.
const {JSDOM}=require('jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{runScripts:'outside-only',url:'https://example.test/'});
const w=dom.window;w.HTMLElement.prototype.scrollIntoView=()=>{};
for(const f of ['word-inventory.js','instructional-protection-registry.js','token-sets.js','volo-tokens.js'])w.eval(fs.readFileSync(f,'utf8'));
w.eval(['script.js','use-it.js','change-it.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+`\nwindow.addedPractice=inferQuestions.filter(q=>q.practiceRevision);
window.renderPracticeAudit=function(item){
 quizState={mode:'infer',items:[item],index:0,score:0,answered:false};
 renderInferQuestion(item);
};
window.practiceAudit=function(flight){
 gradeBand=flight;vocabLevel='all';
 const direct=(skill,q,id)=>({skill,correct:true,word:q.word,primaryTargetId:id});
 const mapped=(skill,q,ids)=>({skill,correct:true,word:q.word,supportingTargetIds:ids});
 const study=[...prefixes,...roots,...suffixes].filter(isMorphemeEligibleForSelectedGrade);
 studyMode='prefix-root-suffix';
 const pools={meaning:study.map(q=>direct('meaning',q,q.id)),morpheme:study.map(q=>direct('morpheme',q,q.id)),
 find:filterWordsBySelectedFilters([...prefixFindQuestions,...rootFindQuestions,...suffixFindQuestions]).map(q=>direct('find',q,q.itemId)),
 hunt:wordHuntQuestions.filter(q=>isWordHuntEligibleForSelectedGrade(q)&&isWordHuntEligibleForSelectedVocabulary(q)).map(q=>direct('hunt',q,q.itemId)),
 infer:filterWordsBySelectedFilters(inferQuestions).map(q=>direct('infer',q,getInferProgressTargetId(q))),
 break:filterWordsBySelectedFilters(breakApartQuestions).map(q=>mapped('break',q,getCanonicalProgressMorphemeIdsFromSegmentation(q.segmentation))),
 build:filterWordsBySelectedFilters([...buildWords,...rootSuffixBuildWords,...prefixRootSuffixBuildWords]).map(q=>mapped('build',q,getCanonicalProgressMorphemeIdsFromBuildItem(q))),
 use:['prefix-root','root-suffix','prefix-root-suffix'].flatMap(mode=>{studyMode=mode;return getUseItEligibleWords().map(q=>mapped('use',q,getCanonicalProgressMorphemeIdsFromBuildItem(q)));}),
 change:getChangeItEligibleQuestions().map(q=>direct('change',{word:q.answer},getCanonicalProgressMorphemeId(q.suffix,{type:'suffix',meaning:q.explanation})))};
 return pools;
};`);
let checks=0;
for(const flight of ['all','2-3','4-5','6-8']){
 const pools=w.practiceAudit(flight),sessions=[];
 for(let round=0;round<2;round++) for(const [skill,responses]of Object.entries(pools)){
  for(const r of responses)if(r.word)assert.ok(!w.FirstVoloInstructionalProtection.isProtected(r.word),r.word);
  sessions.push({id:`${flight}-${round}-${skill}`,activity:skill,responses});
 }
 const student={id:'isolated-reachability',sessions,voloTokens:{}};
 const statuses=w.FirstVoloTokens.evaluateStudent(student).filter(s=>flight==='all'||s.introBand===flight);
 const gaps=statuses.filter(s=>!s.ready).map(s=>({set:s.setId,applicationTypes:s.applicationTypes,morphemes:s.morphemes.filter(m=>!m.knowledgeReady||!m.applicationReady).map(m=>({id:m.id,k:m.knowledgeReady,a:m.applicationReady}))}));
 assert.equal(gaps.length,0,`${flight}: reward unreachable from eligible runtime pools: ${JSON.stringify(gaps)}`);
 const progress={students:[student]};w.FirstVoloTokens.updateEarnedTokens(progress);assert.equal(w.FirstVoloTokens.updateEarnedTokens(progress).newlyEarned.length,0);
 const restored=JSON.parse(JSON.stringify(progress));assert.equal(w.FirstVoloTokens.updateEarnedTokens(restored).newlyEarned.length,0);
 checks+=statuses.length;console.log(`PASS ${flight}: ${statuses.length} token sets reachable; repeat/save/reopen do not duplicate awards.`);
}
assert.equal(w.addedPractice.length,33);
for (const word of ['absent','absentee','clarify','simplify','retrofit']) {
 const item=w.addedPractice.find(q=>q.word===word);
 assert.match(item.context,/support:/i,`${word}: retain the master audit's base/word-family support condition`);
}
assert.match(w.addedPractice.find(q=>q.word==='absentee').context,/one absentee/,'absentee must be used as a noun');
for(const item of w.addedPractice){
 assert.equal(new Set(item.choices).size,4,item.word);
 assert.ok(item.choices.includes(item.correct),item.word);
 assert.ok(item.context.toLowerCase().includes(item.word),item.word);
 assert.ok(!w.FirstVoloInstructionalProtection.isProtected(item.word),item.word);
 const recorded=[];
 w.FirstVoloActivityProgress={recordResponse:r=>recorded.push(r)};
 w.renderPracticeAudit(item);
 assert.ok(w.document.getElementById('inferPrompt').textContent.includes(item.context));
 const button=[...w.document.querySelectorAll('#inferChoices button')].find(b=>b.textContent===item.correct);
 assert.ok(button,item.word);button.click();button.click();
 assert.equal(recorded.length,1,`${item.word}: one scored attempt`);
 assert.equal(recorded[0].primaryTargetId,item.itemId,item.word);
 assert.equal(recorded[0].correct,true,item.word);
 const metadata=w.FIRST_VOLO_WORD_INVENTORY.find(q=>q.word===item.word);
 assert.ok(metadata?.practiceBand,item.word);
 const response=w.practiceAudit(metadata.practiceBand).infer.find(q=>q.word===item.word&&q.primaryTargetId===item.itemId);
 assert.ok(response,`${item.word}: exact semantic target must receive scored evidence in its practice Flight`);
}
console.log(`PASS ${checks} token-set/flight checks; all eligible practice pools checked.`);
dom.window.close();
