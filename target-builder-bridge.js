/* Apply an explicit educator activity-link request; never write a saved plan. */
(function(){'use strict';
 const q=new URLSearchParams(location.search);if(q.get('from')!=='target-builder')return;
 const plan={flight:q.get('flight'),study:q.get('study'),activity:q.get('activity'),challenge:false};
 if(!['2-3','4-5','6-8'].includes(plan.flight)||!['prefixes','roots','suffixes','prefix-root','root-suffix','prefix-root-suffix'].includes(plan.study)||!['learn','find','hunt','meaning','morpheme','break','infer','build','use','change'].includes(plan.activity))return;
 window.FirstVoloMorphologyAccess?.whenReady().then(context=>{
  if(context.status!=='authorized'||!['educator','educator-selected'].includes(context.mode))return;
  document.documentElement.dataset.educatorPath='practice';
  const entry=document.querySelector('.learner-practice-entry');if(entry)entry.open=true;
  const ok=window.FirstVoloPracticeChoices?.apply(plan);
  const box=document.createElement('p');box.className='builder-session-note';box.setAttribute('role','status');box.textContent=ok?'Activity opened from the objective builder. These are session choices, not a saved independent-learning plan. Choose a learner if you want responses attached to their record.':'These choices could not be opened. Choose an available word-part set and activity below.';
  document.getElementById('practiceSetup')?.prepend(box);
 });
})();
