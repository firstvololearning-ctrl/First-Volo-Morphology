const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const source=fs.readFileSync('js/auth/morphology-access.js','utf8');
async function run(user,result){
 const gate={innerHTML:'',hidden:false};const doc={readyState:'complete',getElementById:id=>id==='morphologyAccessGate'?gate:null,documentElement:{dataset:{}},querySelectorAll:()=>[],addEventListener(){}};
 const client={rpc:async()=>result,auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null},error:null})}};
 const window={supabase:{createClient:()=>client},location:{pathname:'/index.html',search:''},dispatchEvent(){}};
 vm.runInNewContext(source,{window,document:doc,URL,URLSearchParams,console,clearTimeout,CustomEvent:class{}});
 await new Promise(r=>setImmediate(r));await window.FirstVoloMorphologyAccess.resolveForSession(user?{user}:null);
 return {gate,context:window.FirstVoloMorphologyAccess.getContext(),doc};
}
test('no-entitlement educator stays locked with account-access explanation',async()=>{const r=await run({id:'qa',is_anonymous:false},{data:[],error:null});assert.equal(r.context.status,'locked');assert.equal(r.doc.documentElement.dataset.morphologyPageAllowed,'false');assert.match(r.gate.innerHTML,/does not have active Morphology access/);assert.match(r.gate.innerHTML,/>View My First Volo</);assert.doesNotMatch(r.gate.innerHTML,/>Educator sign in</);});
test('signed-out visitor still gets sign-in options',async()=>{const r=await run(null,{data:[],error:null});assert.match(r.gate.innerHTML,/>Educator sign in</);assert.doesNotMatch(r.gate.innerHTML,/does not have active/);});
test('RPC failure is not misreported as no entitlement',async()=>{const r=await run({id:'qa',is_anonymous:false},{data:null,error:{message:'unavailable'}});assert.equal(r.context.status,'locked');assert.doesNotMatch(r.gate.innerHTML,/does not have active/);});
