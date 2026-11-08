'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
for(const mode of ['student','educator','educator-selected']){
 const dom=new JSDOM('<button id="openMyGames">Open games</button>',{runScripts:'outside-only',url:'http://localhost'}),w=dom.window;
 w.FirstVoloMorphologyAccess={getContext:()=>({mode})};w.FirstVoloActivityProgress={getActiveStudent:()=>null};
 for(const f of ['word-inventory.js','token-sets.js','reward-registry.js','reward-word-choices.js','reward-hoops.js','reward-jump.js','reward-games.js'])w.eval(fs.readFileSync(f,'utf8'));
 w.document.querySelector('#openMyGames').click();const buttons=[...w.document.querySelectorAll('.reward-my-game button')];
 if(mode==='student'){assert.equal(buttons.length,9);assert(buttons.every(b=>b.disabled&&b.textContent==='Locked'));}
 else{assert.equal(buttons.filter(b=>b.textContent==='Preview hoops'&&!b.disabled).length,9);assert.equal(buttons.filter(b=>b.textContent==='Preview word jump'&&!b.disabled).length,9);assert.equal(buttons.filter(b=>b.textContent==='Preview balloon pop'&&!b.disabled).length,9);assert.equal(buttons.filter(b=>b.textContent==='Preview game'&&!b.disabled).length,9);}
 assert(w.FirstVoloRewardRegistry.definitions.every(r=>!w.FirstVoloRewards.isUnlocked(r,null)));assert.equal(w.localStorage.length,0);dom.window.close();
}
console.log('PASS: educator previews available; student locks and saved data unchanged');
