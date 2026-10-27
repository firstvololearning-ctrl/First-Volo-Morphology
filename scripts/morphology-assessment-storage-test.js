"use strict";
const { JSDOM } = require("jsdom");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const test = require("node:test");
for (const flight of ["a","b","c"]) {
  test(`Flight ${flight.toUpperCase()} links only authorized educator learners and isolates assessment records`, () => {
    const dom = new JSDOM(fs.readFileSync(`flight-${flight}-assessment.html`,"utf8"),{runScripts:"outside-only",url:"https://example.test/"});
    const w=dom.window;
    w.scrollTo=()=>{};
    let context={status:"authorized",mode:"educator",userId:"educator-a"};
    w.FirstVoloMorphologyAccess={getContext:()=>context,localProgressKey:ctx=>ctx.status==="authorized"?`firstVoloMorphologyProgressV1:educator:${ctx.userId}`:null};
    const key="firstVoloMorphologyProgressV1:educator:educator-a";
    w.localStorage.setItem(key,JSON.stringify({students:[{id:"qa",name:"MORPHOLOGY QA",sessions:[]}],activeStudentId:"qa"}));
    const legacy=flight==="a"?"firstVoloMorphologyAssessmentFlightAV1":"firstVoloMorphologyAssessmentV1";
    const preserved=JSON.stringify({sessions:[{id:"unowned-legacy"}]});
    w.localStorage.setItem(legacy,preserved);
    w.localStorage.setItem("firstVoloMorphologyProgressV1",JSON.stringify({students:[{id:"legacy",name:"Legacy"}]}));
    w.eval(fs.readFileSync(`flight-${flight}-assessment.js`,"utf8") + "\nwindow.qaSave = saveAssessmentData; window.qaProgress = getProgressData;");
    assert.equal(w.document.getElementById("studentSelect").value,"qa");
    assert.match(w.document.getElementById("studentSelect").textContent,/MORPHOLOGY QA/);
    assert.doesNotMatch(w.document.getElementById("studentSelect").textContent,/Legacy/);
    w.qaSave({sessions:[]});
    assert.equal(w.localStorage.getItem(legacy),preserved);
    assert.deepEqual(JSON.parse(w.localStorage.getItem(`${legacy}:educator:educator-a`)),{sessions:[]});
    context={status:"authorized",mode:"educator",userId:"educator-b"};
    assert.throws(()=>w.qaSave({sessions:[]}),/Educator changed/);
    assert.equal(w.qaProgress().students.length,0);
    assert.equal(w.localStorage.getItem(`${legacy}:educator:educator-b`),null);
    dom.window.close();
  });
}
