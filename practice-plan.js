(function () {
  "use strict";
  const access = window.FirstVoloMorphologyAccess;
  if (!access?.client) return;
  const flights = {"2-3":"Flight A", "4-5":"Flight B", "6-8":"Flight C"};
  const studies = {prefixes:"Prefixes",roots:"Roots",suffixes:"Suffixes","prefix-root":"Prefixes + Roots","root-suffix":"Roots + Suffixes","prefix-root-suffix":"Prefixes + Roots + Suffixes"};
  const activities = {learn:"Learn — explore word parts",find:"Find — identify a word part",hunt:"Word Hunt — find matching words",meaning:"Meaning — recall word-part meanings",morpheme:"Word Part — match meaning to a part",break:"Break It Apart — analyze parts",infer:"Figure It Out — infer a word’s meaning",build:"Build Words — combine parts",use:"Use It — fit a word to a sentence",change:"Change It — choose a word form"};
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const first = data => Array.isArray(data) ? data[0] : data;
  const identity = c => [c?.status,c?.mode,c?.userId,c?.studentId].join(":");
  let report = {}, editor, request = 0, revision = null, saving = false;
  function options(values,placeholder) { return '<option value="">'+placeholder+'</option>'+Object.entries(values).map(([value,label])=>`<option value="${value}">${label}</option>`).join(''); }
  function makeEditor() {
    if (editor) return editor;
    editor=document.createElement('section');editor.className='practice-plan-panel no-print';editor.hidden=true;
    editor.setAttribute('data-morphology-educator-only','');
    editor.innerHTML='<h2>Choose practice from what you observed</h2><p>Review the responses and any help given, then confirm a practice focus. This is your instructional choice, not an automatic placement or mastery decision. The plan stores these choices only, not the assessment responses or Student Code.</p><form class="practice-plan-form"><label>Learner<select id="planLearner" required></select></label><label>Practice Flight<select id="planFlight" required>'+options(flights,'Choose a Flight')+'</select></label><label>Word parts<select id="planStudy" required>'+options(studies,'Choose word parts')+'</select></label><label>Practice focus<select id="planActivity" required>'+options(activities,'Choose a focus')+'</select></label><label>Word challenge<select id="planChallenge"><option value="standard">Standard Words</option><option value="all">Standard + Stretch Words</option></select></label><div class="practice-plan-actions"><button class="plan-primary" id="savePracticePlan" type="submit" disabled>Save learner’s practice plan</button><button id="clearPracticePlan" type="button" disabled>Clear plan</button></div></form><p role="status" id="planStatus"></p><a id="openPlannedPractice" hidden>Open practice with this learner</a>';
    const host=document.getElementById('reportScreen') || document.querySelector('.educator-entry');host?.append(editor);
    editor.querySelector('form').addEventListener('submit',e=>{e.preventDefault();write(false);});
    editor.querySelector('#clearPracticePlan').addEventListener('click',()=>write(true));
    editor.querySelector('#planLearner').addEventListener('change',loadSelected);
    ['planFlight','planStudy'].forEach(id=>editor.querySelector('#'+id).addEventListener('change',availability));
    return editor;
  }
  const field = id => editor.querySelector('#'+id);
  function availability() {
    for (const o of field('planStudy').options) o.disabled=field('planFlight').value==='2-3' && o.value && !['prefixes','suffixes'].includes(o.value);
    if (field('planStudy').selectedOptions[0]?.disabled) field('planStudy').value='';
    for (const o of field('planActivity').options) o.disabled=(['build','use','change'].includes(o.value) && !['prefix-root','root-suffix','prefix-root-suffix'].includes(field('planStudy').value)) || (o.value==='change' && field('planStudy').value==='prefix-root');
    if (field('planActivity').selectedOptions[0]?.disabled) field('planActivity').value='';
  }
  async function showEditor() {
    const c=access.getContext();if(c.status!=='authorized'||c.mode==='student')return;
    makeEditor();editor.hidden=false;editor.querySelectorAll('select').forEach(n=>{n.disabled=false;});editor.scrollIntoView({behavior:'smooth',block:'start'});
    const ticket=++request,expected=identity(c);revision=null;field('savePracticePlan').disabled=true;field('clearPracticePlan').disabled=true;field('planStatus').textContent='Loading learners with current Morphology access…';
    let result;try{result=await access.client.rpc('list_morphology_practice_plan_learners');}catch{result={error:true};}
    if(ticket!==request||identity(access.getContext())!==expected)return;
    field('planLearner').replaceChildren(new Option('Choose a learner',''));
    if(result.error){field('planStatus').textContent='Learners could not be checked. Try opening the plan again. Nothing was saved.';return;}
    (result.data||[]).forEach(s=>{if(uuid.test(s.student_id))field('planLearner').add(new Option(s.display_name,s.student_id));});
    const linked=c.studentId || report.studentId;if(uuid.test(linked||'') && [...field('planLearner').options].some(o=>o.value===linked))field('planLearner').value=linked;
    field('planStatus').textContent=(result.data||[]).length?'Choose the learner, Flight, word parts and focus before saving.':'No learners currently have enabled Morphology permission and class access. Review access in My First Volo. Nothing was saved.';
    if(field('planLearner').value)await loadSelected();
  }
  async function loadSelected() {
    const selected=field('planLearner').value,c=access.getContext(),expected=identity(c),ticket=++request;
    revision=null;field('savePracticePlan').disabled=true;field('clearPracticePlan').disabled=true;field('openPlannedPractice').hidden=true;
    field('planFlight').value=report.flight||'';field('planStudy').value='';field('planActivity').value='';field('planChallenge').value='standard';availability();
    if(!uuid.test(selected))return;
    field('planStatus').textContent='Checking the current plan…';
    let r;try{r=await access.client.rpc('get_morphology_practice_plan',{p_student_id:selected});}catch{r={error:true};}
    if(ticket!==request||identity(access.getContext())!==expected||field('planLearner').value!==selected)return;
    const row=first(r.data);if(r.error||!row){field('planStatus').textContent='The plan could not be checked. Reopen it before saving.';return;}
    revision=row.revision;
    if(row.plan){field('planFlight').value=row.plan.flight;field('planStudy').value=row.plan.study;field('planActivity').value=row.plan.activity;field('planChallenge').value=row.plan.challenge?'all':'standard';}
    availability();field('savePracticePlan').disabled=false;field('clearPracticePlan').disabled=!row.plan;field('planStatus').textContent=row.plan?'Current plan loaded. Review and adjust it.':'No plan saved. Choose the focus using what you observed.';
  }
  async function write(clear) {
    if(saving||revision===null)return;
    const c=access.getContext(),expected=identity(c),selected=field('planLearner').value;
    if(c.status!=='authorized'||c.mode==='student'||!uuid.test(selected))return;
    const plan=clear?null:{flight:field('planFlight').value,study:field('planStudy').value,activity:field('planActivity').value,challenge:field('planChallenge').value==='all'};
    if(!clear && (!flights[plan.flight]||!studies[plan.study]||!activities[plan.activity]))return;
    saving=true;editor.querySelectorAll('select,button').forEach(n=>{n.disabled=true;});field('planStatus').textContent='Saving…';
    let r;try{r=await access.client.rpc('save_morphology_practice_plan',{p_student_id:selected,p_plan:plan,p_expected_revision:revision});}catch{r={error:true};}
    saving=false;
    if(identity(access.getContext())!==expected)return;
    editor.querySelectorAll('select').forEach(n=>{n.disabled=false;});availability();
    const row=first(r.data);
    if(r.error||!row){revision=null;field('planStatus').textContent='The save was not confirmed. Reopen the plan to check access and the latest version before trying again.';return;}
    revision=row.revision;field('savePracticePlan').disabled=false;field('clearPracticePlan').disabled=!row.plan;field('planStatus').textContent=row.plan?'Practice plan saved for this learner. It will appear when they next open or return to Morphology.':'Plan cleared. The learner can choose practice with your guidance.';
    const link=field('openPlannedPractice');link.href='index.html?studentId='+encodeURIComponent(selected)+'&practicePlan=1';link.hidden=!row.plan;
    if(document.getElementById('studentEntryTitle'))window.dispatchEvent(new CustomEvent('firstvolopracticeplanupdated'));
  }
  window.addEventListener('firstvoloassessmentreport',e=>{
    report={studentId:e.detail?.studentId,flight:e.detail?.flight};
    const toolbar=document.querySelector('#reportScreen .toolbar-actions');
    if(toolbar&&!document.getElementById('openAssessmentPracticePlan')){const b=document.createElement('button');b.id='openAssessmentPracticePlan';b.type='button';b.className='primary-button';b.textContent='Choose practice from these results';b.addEventListener('click',showEditor);toolbar.append(b);}
    if(editor)editor.hidden=true;
  });
  document.getElementById('openPracticePlan')?.addEventListener('click',showEditor);
  let studentRequest=0,studentPanel,studentPlanKey=null;
  const choices = () => [document.getElementById('practiceSetup'),document.querySelector('.activity-selector-section')].filter(Boolean);
  function revealChoices() { choices().forEach(n=>n.removeAttribute('data-plan-choices-hidden'));document.querySelector('.workspace')?.removeAttribute('data-plan-workspace-hidden');document.getElementById('currentPracticeSummary')?.removeAttribute('data-plan-workspace-hidden'); }
  async function loadStudentPlan(c) {
    const ticket=++studentRequest;
    if(c?.status!=='authorized'||c.mode!=='student'){studentPanel?.remove();studentPanel=null;studentPlanKey=null;revealChoices();return;}
    const host=document.querySelector('.student-entry');if(!host)return;
    const expected=identity(c);
    let r;try{r=await access.client.rpc('get_morphology_practice_plan',{p_student_id:null});}catch{r={error:true};}
    if(ticket!==studentRequest||identity(access.getContext())!==expected)return;
    const responseKey=expected+':'+String(first(r.data)?.revision)+':'+Boolean(first(r.data)?.plan);
    if(!r.error&&studentPanel&&studentPlanKey===responseKey)return;
    studentPlanKey=r.error?null:responseKey;
    studentPanel?.remove();studentPanel=null;
    const original=document.getElementById('studentPracticeStart'),note=document.getElementById('studentPracticeResume');
    original.hidden=false;note.hidden=false;revealChoices();
    const plan=first(r.data)?.plan;
    if(r.error){note.textContent='Your teacher’s plan could not be checked. Ask your teacher or reload to try again.';return;}
    if(!plan)return;
    original.hidden=true;note.hidden=true;
    studentPanel=document.createElement('div');studentPanel.className='practice-plan-panel';
    const summary=document.createElement('p');summary.textContent='Your teacher chose: '+flights[plan.flight]+' · '+studies[plan.study]+' · '+(activities[plan.activity]||'Practice')+' · '+(plan.challenge?'Standard + Stretch Words':'Standard Words');
    const start=document.createElement('button');start.type='button';start.className='plan-primary';start.textContent='Start today’s practice';
    const change=document.createElement('button');change.type='button';change.textContent='Change practice';
    const status=document.createElement('p');status.setAttribute('role','status');
    const actions=document.createElement('div');actions.className='practice-plan-actions';actions.append(start,change);studentPanel.append(summary,actions,status);host.append(studentPanel);
    choices().forEach(n=>n.setAttribute('data-plan-choices-hidden',''));document.querySelector('.workspace')?.setAttribute('data-plan-workspace-hidden','');document.getElementById('currentPracticeSummary')?.setAttribute('data-plan-workspace-hidden','');
    start.addEventListener('click',()=>{
      if(!window.FirstVoloPracticeChoices?.apply(plan)){status.textContent='These practice choices are not available. Ask your teacher to choose another activity.';return;}
      document.querySelector('.workspace')?.removeAttribute('data-plan-workspace-hidden');document.getElementById('currentPracticeSummary')?.removeAttribute('data-plan-workspace-hidden');
      const title=document.getElementById('workspaceTitle');title?.scrollIntoView({behavior:'smooth',block:'start'});title?.setAttribute('tabindex','-1');title?.focus({preventScroll:true});
    });
    change.addEventListener('click',()=>{revealChoices();document.getElementById('practiceSetup')?.scrollIntoView({behavior:'smooth',block:'start'});document.getElementById('gradeBandSelect')?.focus({preventScroll:true});});
  }
  let educatorPlanContext=null;
  async function loadEducatorPlan(c) {
    if(c.status!=='authorized'||c.mode!=='educator-selected'||new URLSearchParams(location.search).get('practicePlan')!=='1')return;
    const expected=identity(c);if(educatorPlanContext===expected)return;educatorPlanContext=expected;
    let r;try{r=await access.client.rpc('get_morphology_practice_plan',{p_student_id:c.studentId});}catch{r={error:true};}
    if(identity(access.getContext())!==expected)return;
    const box=document.createElement('p');box.className='practice-plan-panel';box.setAttribute('role','status');
    box.textContent=!r.error&&first(r.data)?.plan&&window.FirstVoloPracticeChoices?.apply(first(r.data).plan)?'The learner’s saved practice plan is open. You can adjust the practice choices for this session without changing the saved plan.':'The saved plan could not be opened. Choose practice below or reopen the plan to check it.';
    document.querySelector('.educator-entry')?.append(box);
  }
  access.subscribe(c=>{loadEducatorPlan(c);++request;if(c.status!=='authorized'||c.mode==='student'){if(editor)editor.hidden=true;}loadStudentPlan(c);});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadStudentPlan(access.getContext());});
  window.addEventListener('firstvolopracticeplanupdated',()=>loadStudentPlan(access.getContext()));
}());
