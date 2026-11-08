/* Verified grade-specific standard connections. Summaries are paraphrases. */
(function(root){
 'use strict';
 const MA='https://www.doe.mass.edu/frameworks/search/SubjectSearch.aspx?L1=ELA&L2=ELA.';
 function connections(grade,focus,system){
  grade=Number(grade);if(!Number.isInteger(grade)||grade<2||grade>8)return null;
  const prefix=`L.${grade}.4`, codes=grade<=3?[prefix+'.b',prefix+'.c']:[prefix+'.b'];
  const summary=grade===2?'Use a familiar prefix or shared base to work out a related word’s meaning.':grade===3?'Use familiar affixes and shared bases to interpret related words.':'Use grade-appropriate Greek or Latin morphemes to reason about word meaning.';
  const condition=grade===2?'L.2.4b concerns prefixes, not every suffix. L.2.4c concerns familiar root/base words; bound classical roots are an extension.':grade===3?'Use familiar, meaningful affix/base relationships. Identifying pieces alone does not establish whole-word understanding.':'The cited morphology standard specifies Greek/Latin forms. Work with other origins can build prerequisites, but is not a direct match to that wording.';
  const applied=focus==='meaning';
  const result={grade,system:system==='ma'?'Massachusetts 2017 ELA/Literacy Framework':'Common Core ELA',codes,summary,condition,connection:applied?'Task connection, when the selected words meet the standard’s conditions.':'Related skill / prerequisite; this objective is broader than or different from the cited vocabulary expectation.',url:system==='ma'?MA+grade:'https://www.thecorestandards.org/ELA-Literacy/L/'+grade+'/',verified:'2026-11-08'};
  if(['meaning','apply'].includes(focus))result.context={code:prefix+'.a',summary:'Use surrounding language to check a word’s meaning.'};
  return result;
 }
 root.FirstVoloGradeStandards={connections};
})(typeof window!=='undefined'?window:globalThis);
