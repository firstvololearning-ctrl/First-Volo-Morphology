'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};vm.runInNewContext(fs.readFileSync('learn-content.js','utf8'),c);const x=c.window.FirstVoloLearnContent;
assert.ok(x.worked.val.sentence.includes('storm'));
assert.equal(x.worked.val.choices[x.worked.val.answer],'A reason that makes sense');
assert.ok(x.practice.valid.sentence.includes('plants without water died'));
assert.equal(x.practice.valid.choices[x.practice.valid.answer],'Makes sense because it fits what we saw');
for(const [word,lesson] of Object.entries(x.practice)){assert.equal(lesson.choices.length,2,word);assert.ok(Number.isInteger(lesson.answer)&&lesson.answer>=0&&lesson.answer<2,word);assert.equal(lesson.feedback.length,2,word);}
const text=JSON.stringify([x.worked,x.additionalWorked,x.practice]);for(const phrase of ['A sound reason','reason is sound','think or reckon','use excessively','Send it for consideration','is a vessel'])assert.ok(!text.includes(phrase),phrase);
console.log('PASS: plain valid contexts, answer indices and feedback retained, identified vocabulary barriers removed');
