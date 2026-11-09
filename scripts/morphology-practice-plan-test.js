const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
const id='82222222-2222-4222-8222-222222222222';
const plan={flight:'4-5',study:'root-suffix',activity:'use',challenge:false};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(mode='educator',saved=null,failSave=false){
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://example.test/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 let context={status:'authorized',mode,userId:'fictional-owner',studentId:mode==='student'?id:null};const listeners=[],calls=[];
 w.FirstVoloMorphologyAccess={getContext:()=>context,subscribe:fn=>{listeners.push(fn);fn(context);},client:{rpc:async(name,args)=>{
  calls.push({name,args});
  if(name==='list_morphology_practice_plan_learners')return {data:[{student_id:id,display_name:'Fictional learner'}]};
  if(name==='get_morphology_practice_plan')return {data:[{student_id:id,plan:saved,revision:saved?1:0}]};
  if(name==='save_morphology_practice_plan')return failSave?{error:{message:'denied'}}:{data:[{student_id:id,plan:args.p_plan,revision:1}]};
  return {error:true};
 }}};
 w.FirstVoloPracticeChoices={apply:p=>{w.applied=JSON.parse(JSON.stringify(p));return true;}};
 for (const file of ['word-inventory.js','lesson-choices.js','practice-plan.js']) w.eval(fs.readFileSync(file,'utf8'));
 return {w,calls,publish:c=>{context=c;listeners.forEach(fn=>fn(c));},close:()=>dom.window.close()};
}
test('educator confirms enum choices; save has learner and revision but no assessment responses',async()=>{
 const {w,calls,close}=setup();w.document.getElementById('openPracticePlan').click();await tick();const d=w.document;
 d.getElementById('planLearner').value=id;d.getElementById('planLearner').dispatchEvent(new w.Event('change'));await tick();
 d.getElementById('planFlight').value='4-5';d.getElementById('planStudy').value='root-suffix';d.getElementById('planStudy').dispatchEvent(new w.Event('change'));d.getElementById('planActivity').value='use';d.querySelector('.practice-plan-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();
 const save=calls.find(c=>c.name==='save_morphology_practice_plan');assert.equal(save.args.p_student_id,id);assert.equal(save.args.p_expected_revision,0);assert.deepEqual(JSON.parse(JSON.stringify(save.args.p_plan)),plan);assert.match(d.getElementById('planStatus').textContent,/saved for this learner/);assert.match(d.getElementById('openPlannedPractice').href,/studentId=.*practicePlan=1/);close();
});
test('uncertain save never claims success and requires refreshed revision',async()=>{
 const {w,calls,close}=setup('educator',plan,true),d=w.document;d.getElementById('openPracticePlan').click();await tick();d.getElementById('planLearner').value=id;d.getElementById('planLearner').dispatchEvent(new w.Event('change'));await tick();d.querySelector('.practice-plan-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();assert.match(d.getElementById('planStatus').textContent,/not confirmed/);assert.equal(d.getElementById('savePracticePlan').disabled,true);assert.equal(calls.filter(c=>c.name==='save_morphology_practice_plan').length,1);close();
});
test('student starts the approved plan; Change practice reveals choices without writing the plan',async()=>{
 const {w,calls,close}=setup('student',plan);await tick();const d=w.document;assert.equal(d.getElementById('studentPracticeStart').hidden,true);assert.ok(d.getElementById('practiceSetup').hasAttribute('data-plan-choices-hidden'));
 const start=[...d.querySelectorAll('button')].find(b=>b.textContent==='Start today’s practice');assert.ok(start);start.click();assert.deepEqual(w.applied,plan);assert.ok(!d.querySelector('.workspace').hasAttribute('data-plan-workspace-hidden'));
 [...d.querySelectorAll('button')].find(b=>b.textContent==='Change practice').click();assert.ok(!d.getElementById('practiceSetup').hasAttribute('data-plan-choices-hidden'));assert.ok(!calls.some(c=>c.name==='save_morphology_practice_plan'));close();
});
test('returning to an unchanged plan does not interrupt an open activity',async()=>{
 const {w,close}=setup('student',plan);await tick();[...w.document.querySelectorAll('button')].find(b=>b.textContent==='Start today’s practice').click();w.document.dispatchEvent(new w.Event('visibilitychange'));await tick();assert.ok(!w.document.querySelector('.workspace').hasAttribute('data-plan-workspace-hidden'));close();
});
test('no saved plan preserves guided flexible practice',async()=>{const {w,close}=setup('student');await tick();assert.equal(w.document.getElementById('studentPracticeStart').hidden,false);assert.ok(!w.document.getElementById('practiceSetup').hasAttribute('data-plan-choices-hidden'));close();});
test('assessment report adds one handoff action without transmitting assessment data',async()=>{
 const {w,calls,close}=setup();const screen=w.document.createElement('section');screen.id='reportScreen';screen.innerHTML='<div class="toolbar-actions"></div>';w.document.body.append(screen);
 for(let i=0;i<2;i++)w.dispatchEvent(new w.CustomEvent('firstvoloassessmentreport',{detail:{studentId:id,flight:'2-3'}}));assert.equal(w.document.querySelectorAll('#openAssessmentPracticePlan').length,1);assert.equal(calls.length,0);w.document.getElementById('openAssessmentPracticePlan').click();await tick();assert.equal(w.document.getElementById('planLearner').value,id);assert.equal(w.document.getElementById('planFlight').value,'2-3');assert.equal(w.document.getElementById('planActivity').value,'');close();
});

test('an educator can save an exact Learn lesson for the selected route', async () => {
  const {w, calls, close} = setup();
  const d = w.document;
  d.getElementById('openPracticePlan').click();
  await tick();
  const learner = d.getElementById('planLearner');
  learner.value = id;
  learner.dispatchEvent(new w.Event('change'));
  await tick();
  const route = d.getElementById('planFlight');
  route.value = '6-8';
  route.dispatchEvent(new w.Event('change'));
  const lesson = d.getElementById('planLesson');
  lesson.value = 'tract';
  lesson.dispatchEvent(new w.Event('change'));
  d.querySelector('form.practice-plan-form').dispatchEvent(new w.Event('submit', {cancelable: true}));
  await tick();
  const save = calls.find(call => call.name === 'save_morphology_practice_plan');
  assert.deepEqual(JSON.parse(JSON.stringify(save.args.p_plan)), {
    flight: '6-8', study: 'roots', activity: 'learn', challenge: false, lesson: 'tract'
  });
  close();
});
test('a student starts an exact lesson and can reveal other practice choices', async () => {
  const exact = {flight: '2-3', study: 'prefixes', activity: 'learn', challenge: false, lesson: 'un-negation'};
  const {w, calls, close} = setup('student', exact);
  await tick();
  const panel = w.document.querySelector('.student-entry .practice-plan-panel');
  assert.match(panel.textContent, /Your lesson: un- · not/);
  [...panel.querySelectorAll('button')].find(button => button.textContent === 'Start today’s lesson').click();
  assert.deepEqual(w.applied, exact);
  [...panel.querySelectorAll('button')].find(button => button.textContent === 'Adjust practice').click();
  assert.ok(!w.document.getElementById('practiceSetup').hasAttribute('data-plan-choices-hidden'));
  assert.ok(!calls.some(call => call.name === 'save_morphology_practice_plan'));
  close();
});
