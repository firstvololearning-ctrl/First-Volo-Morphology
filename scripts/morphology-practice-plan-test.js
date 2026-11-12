const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
const id='82222222-2222-4222-8222-222222222222';
const plan={flight:'4-5',study:'root-suffix',activity:'use',challenge:false};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(mode='educator',saved=null,failSave=false,mapRoute=''){
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
 if (mapRoute) {
  const select = w.document.createElement('select');
  select.id = 'studentMapRoute';
  for (const route of ['2-3', '4-5', '6-8']) select.add(new w.Option(route, route));
  select.value = mapRoute;
  w.document.getElementById('studentMapContent').append(select);
 }
 for (const file of ['word-inventory.js','token-sets.js','lesson-choices.js','earlier-word-parts.js','practice-plan.js']) w.eval(fs.readFileSync(file,'utf8'));
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


test('the set picker follows the viewed route and the warm-up follows the assigned lesson', async () => {
  const assigned = { flight:'6-8', study:'roots', activity:'learn', challenge:false, lesson:'tract' };
  const {w, calls, close} = setup('student', assigned, false, '6-8');
  await tick();
  const d = w.document;
  const map = d.getElementById('studentMapRoute');
  const review = d.getElementById('earlierWordParts');
  const chooser = d.getElementById('earlierSetChoice');
  assert.equal(chooser.options.length - 1, 11);
  map.value = '4-5';
  map.dispatchEvent(new w.Event('change'));
  assert.equal(chooser.options.length - 1, 4);
  chooser.value = 'foundation-core-word-parts';
  chooser.dispatchEvent(new w.Event('change'));
  assert.match(d.getElementById('earlierSetParts').textContent, /^7 parts to check/);
  d.getElementById('checkEarlierSet').click();
  for (let i = 1; i <= 7; i++) {
    assert.match(d.getElementById('earlierCheckPrompt').textContent, new RegExp(`^${i} of 7`));
    d.querySelector('#earlierCheckOptions button').click();
    assert.ok(d.getElementById('earlierCheckFeedback').textContent);
    d.getElementById('earlierCheckNext').click();
  }
  assert.match(d.getElementById('earlierCheckTitle').textContent, /parts right|parts you missed/);
  assert.equal(w.applied, undefined);
  map.value = '2-3';
  map.dispatchEvent(new w.Event('change'));
  assert.equal(d.getElementById('earlierPartsCheck').hidden, true);
  assert.equal(review.hidden, true);
  d.querySelector('.student-entry .plan-primary').click();
  assert.equal(map.value, '6-8');
  assert.match(d.getElementById('earlierCheckPrompt').textContent, /^1 of 2.*re-/);
  assert.equal(w.applied, undefined);
  d.getElementById('earlierCheckClose').click();
  assert.deepEqual(w.applied, assigned);
  assert.ok(!calls.some(call => call.name === 'save_morphology_practice_plan'));
  close();
});


test('saved knowledge or application evidence can take a student directly to the assigned lesson', async () => {
  const assigned = { flight:'6-8', study:'roots', activity:'learn', challenge:false, lesson:'tract' };
  const {w, close} = setup('student', assigned, false, '6-8');
  await tick();
  w.FirstVoloActivityProgress = { getActiveStudent: () => ({}) };
  w.FirstVoloTokens = {
    evaluateStudent: () => [{ morphemes: w.FIRST_VOLO_MORPHEME_INVENTORY.map((part, index) => ({
      id: part.id, profile: 'standard', knowledgeReady: index % 2 === 0, applicationReady: index % 2 === 1
    })) }]
  };
  w.document.querySelector('.student-entry .plan-primary').click();
  assert.deepEqual(w.applied, assigned);
  assert.equal(w.document.getElementById('earlierPartsCheck').hidden, true);
  close();
});


test('educator can save a set review by itself or alongside a lesson', async () => {
  for (const withLesson of [false, true]) {
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
    if (withLesson) {
      const lesson = d.getElementById('planLesson');
      lesson.value = 'tract';
      lesson.dispatchEvent(new w.Event('change'));
    }
    d.getElementById('planReviewSet').value = 'foundation-core-word-parts';
    d.querySelector('form.practice-plan-form').dispatchEvent(new w.Event('submit', {cancelable: true}));
    await tick();
    const plan = calls.find(call => call.name === 'save_morphology_practice_plan').args.p_plan;
    assert.deepEqual(JSON.parse(JSON.stringify(plan)), withLesson
      ? { flight:'6-8', study:'roots', activity:'learn', challenge:false, lesson:'tract', reviewSet:'foundation-core-word-parts' }
      : { flight:'6-8', reviewSet:'foundation-core-word-parts' });
    close();
  }
});

test('an assigned Route 1 review opens even without an earlier route or assigned lesson', async () => {
  const assigned = { flight:'2-3', reviewSet:'foundation-grade3-bridge' };
  const {w, calls, close} = setup('student', assigned, false, '2-3');
  await tick();
  const d = w.document;
  assert.equal(d.getElementById('studentAssignedPracticeStart'), null);
  assert.equal(d.getElementById('earlierWordParts').hidden, true);
  d.getElementById('studentAssignedReviewStart').click();
  assert.equal(d.getElementById('earlierWordParts').hidden, false);
  assert.match(d.getElementById('earlierCheckPrompt').textContent, /^1 of 5/);
  assert.ok(!calls.some(call => call.name === 'save_morphology_practice_plan'));
  close();
});

test('the warm-up revisits an older practiced part and saves the check separately', async () => {
  const assigned = { flight: '4-5', study: 'roots', activity: 'learn', challenge: false, lesson: 'port' };
  const { w, close } = setup('student', assigned, false, '4-5');
  try {
    await tick();
    const d = w.document;
    const oldDate = new Date(Date.now() - 10 * 86400000).toISOString();
    const recentDate = new Date().toISOString();
    const sessions = [
      { completedAt: oldDate, responses: [{ primaryTargetId: 'mis' }] },
      { completedAt: recentDate, responses: [{ primaryTargetId: 'pre' }] }
    ];
    let session;
    w.FirstVoloActivityProgress = {
      getActiveStudent: () => ({ sessions }),
      getCurrentSession: () => session,
      startSession: options => (session = { ...options, id: 'review', startedAt: recentDate, responses: [] }),
      recordResponse: response => session.responses.push(response),
      cancelSession: () => { session = null; }
    };
    d.getElementById('studentAssignedPracticeStart').click();
    assert.match(d.getElementById('earlierCheckPrompt').textContent, /^1 of 2.*mis-/);
    d.querySelector('#earlierCheckOptions button').click();
    assert.equal(session.activity, 'earlier-review');
    assert.equal(session.responses[0].primaryTargetId, 'mis');
    assert.equal(session.responses[0].skill, 'earlier-review');
    d.getElementById('earlierCheckClose').click();
    assert.deepEqual(w.applied, assigned);
  } finally {
    close();
  }
});

test('Route 1 assigns base-word application practice and opens it for a learner', async () => {
  const educator = setup();
  const document = educator.w.document;
  document.getElementById('openPracticePlan').click();
  await tick();
  const select = (field, value) => {
    const input = document.getElementById(field);
    input.value = value;
    input.dispatchEvent(new educator.w.Event('change'));
    return input;
  };
  select('planLearner', id);
  await tick();
  select('planFlight', '2-3');
  select('planStudy', 'prefix-root');
  const activity = document.getElementById('planActivity');
  const enabled = () => [...activity.options].filter(option => option.value && !option.disabled).map(option => option.value);
  assert.deepEqual(enabled(), ['build', 'use']);
  select('planStudy', 'root-suffix');
  assert.deepEqual(enabled(), ['build', 'use', 'change']);
  select('planActivity', 'change');
  document.querySelector('.practice-plan-form').dispatchEvent(new educator.w.Event('submit', {cancelable: true}));
  await tick();
  const saved = educator.calls.find(call => call.name === 'save_morphology_practice_plan').args.p_plan;
  const expected = {flight: '2-3', study: 'root-suffix', activity: 'change', challenge: false};
  assert.deepEqual(JSON.parse(JSON.stringify(saved)), expected);
  educator.close();

  const learner = setup('student', saved);
  await tick();
  [...learner.w.document.querySelectorAll('button')].find(button => button.textContent === 'Start today’s practice').click();
  assert.deepEqual(learner.w.applied, expected);
  learner.close();
});
