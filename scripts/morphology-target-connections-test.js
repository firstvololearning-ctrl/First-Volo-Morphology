'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync('morphology-target-builder.html','utf8'),{runScripts:'outside-only',url:'http://localhost/morphology-target-builder.html'}),w=dom.window;w.console.table=()=>{};
w.eval(fs.readFileSync('morphology-reviewed-evidence.js','utf8'));w.eval(fs.readFileSync('target-standards.js','utf8'));assert.equal(w.FirstVoloReviewedEvidence.length,21);assert(w.FirstVoloReviewedEvidence.find(x=>x.id==='vaknin2024').limitation.includes('Hebrew'));assert(w.FirstVoloReviewedEvidence.find(x=>x.id==='apel2022').type.includes('Assessment'));w.eval(fs.readFileSync('morphology-target-builder.js','utf8'));
const d=w.document,change=(id,value)=>{d.getElementById(id).value=value;d.getElementById(id).dispatchEvent(new w.Event('change'));};
assert(d.getElementById('evidencePanel').textContent.includes('actual grade'));
for(let grade=2;grade<=8;grade++)for(const system of ['ccss','ma'])for(const focus of ['know','analyze','meaning','build','apply']){
 d.querySelector(`[data-focus="${focus}"]`).click();change('standardsGrade',String(grade));change('standardsSystem',system);const text=d.getElementById('evidencePanel').textContent;assert(text.includes(`Grade ${grade}`));assert(text.includes(`L.${grade}.4.b`));assert(text.includes(system==='ma'?'Massachusetts':'Common Core'));if(grade>=4)assert(text.includes('Greek/Latin'));
}
change('criterionSelect','80% accuracy');assert(d.getElementById('copyIepButton').disabled);change('sessionsSelect','three probes on separate days');assert(!d.getElementById('copyIepButton').disabled);assert(d.getElementById('iepPreview').textContent.includes('[review date]'));
d.querySelector('[data-grade="expansion"]').click();change('builderStudy','prefix-root-suffix');d.querySelector('[data-focus="build"]').click();const links=[...d.querySelectorAll('#planResult a')];assert(links.some(a=>a.href.includes('activity=use')));assert(links.every(a=>a.href.includes('flight=4-5')));assert.equal(w.localStorage.length,0);assert.equal(w.FirstVoloTargetEvidenceAudit.length,15);
console.log('PASS: 70 grade/source/focus connections, explicit grade selection, original objective structure, schedule required, activity links, existing research audit, no storage writes');dom.window.close();
