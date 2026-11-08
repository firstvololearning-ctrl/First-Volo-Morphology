'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM('<button id="source">Games</button>',{runScripts:'outside-only',pretendToBeVisual:true,url:'http://localhost'}),w=dom.window,d=w.document;w.matchMedia=()=>({matches:true});
for(const f of ['word-inventory.js','token-sets.js','reward-registry.js','reward-hoops.js'])w.eval(fs.readFileSync(f,'utf8'));const R=w.FirstVoloRewardRegistry,$=s=>d.querySelector(s);
const target=()=>R.definitions[0].eligibleContent.morphemeIds.find(id=>$('.hoops-prompt').textContent===`Which word part means “${R.displayMeaning(id)}”?`);
const button=id=>[...d.querySelectorAll('.hoops-choice')].find(b=>b.textContent===R.promptLabel(id));
const wait=()=>new Promise(r=>setTimeout(r,190));
(async()=>{w.FirstVoloHoops.open(R.definitions[0],$('#source'));button(target()).click();$('.hoops-court svg').getBoundingClientRect=()=>({left:0,top:0,width:1000,height:540});
function pointer(type,x,y){const e=new w.Event(type,{bubbles:true,cancelable:true});Object.defineProperties(e,{clientX:{value:x},clientY:{value:y},pointerId:{value:1}});$('.hoops-court').dispatchEvent(e);}
pointer('pointerdown',160,425);pointer('pointermove',48,525);pointer('pointerup',48,525);await wait();assert.equal($('.hoops-score').textContent,'2 points');$('.hoops-close').click();
w.FirstVoloHoops.open(R.definitions[0],$('#source'),{mode:'toss'});assert.equal($('.toss-targets').children.length,3);const correct=target();const wrong=[...d.querySelectorAll('.hoops-choice')].find(b=>b.textContent!==R.promptLabel(correct));wrong.click();$('.hoops-shoot').click();await wait();assert($('.hoops-feedback').textContent.includes('Aim for the target meaning'));button(correct).click();$('.hoops-shoot').click();await wait();assert.equal($('.hoops-score').textContent,'2 points');assert($('.hoops-feedback').textContent.includes(R.displayMeaning(correct)));assert.equal(w.localStorage.length,0);$('.hoops-close').click();dom.window.close();console.log('PASS: mouse-style pull/release basket, toss targets, wrong-meaning target feedback, correct toss, no saved writes');})();
