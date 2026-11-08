/* Optional basketball practice. Scores stay in this game session. */
(function () {
  'use strict';
  const R = window.FirstVoloRewardRegistry;
  const el = (tag, text) => { const n = document.createElement(tag); if (text) n.textContent = text; return n; };
  function questions(reward) {
    const pool = reward.eligibleContent.morphemeIds.filter(id => R.morpheme(id));
    const tokens = id => new Set(R.displayMeaning(id).toLowerCase().match(/[a-z]+/g).filter(x => !['a','an','the','of','to','or','and','in','is','that','with','being'].includes(x)));
    return pool.map(id => {
      const seen = new Set([R.promptLabel(id)]), used = tokens(id), choices = [id];
      for (const other of pool) {
        const label = R.promptLabel(other), words = tokens(other);
        if (seen.has(label) || [...words].some(x => used.has(x))) continue;
        choices.push(other); seen.add(label); words.forEach(x => used.add(x));
        if (choices.length === 3) break;
      }
      return {id, choices};
    }).filter(q => q.choices.length >= 2);
  }
  function open(reward, source, options = {}) {
    const toss=options.mode === "toss";
    const deck = questions(reward).sort(() => Math.random() - .5).slice(0,5);
    if (!deck.length) return;
    const overlay = el('div'); overlay.className = 'hoops-overlay';
    overlay.innerHTML = `<section class="hoops" role="dialog" aria-modal="true" aria-labelledby="hoopsTitle"><header><div><small>WORD-PART ARCADE</small><h2 id="hoopsTitle">Word-Part Hoops</h2></div><button class="hoops-close">Close</button></header><div class="hoops-hud"><span class="hoops-round"></span><span class="hoops-score">0 points</span><label><input type="checkbox" class="hoops-hard"> Harder shots</label></div><p class="hoops-prompt"></p><div class="hoops-court"><svg viewBox="0 0 1000 540" role="img" aria-label="Basketball court with a hoop on the right"><defs><linearGradient id="hoopsWall" x2="0" y2="1"><stop stop-color="#10263e"/><stop offset="1" stop-color="#315b72"/></linearGradient><pattern id="hoopsWood" width="125" height="38" patternUnits="userSpaceOnUse"><rect width="125" height="38" fill="#d6a568"/><path d="M0 0H125V38H0Z M12 12H100" stroke="#a77b48" fill="none"/></pattern></defs><rect width="1000" height="540" fill="url(#hoopsWall)"/><path d="M0 340H1000V540H0Z" fill="url(#hoopsWood)"/><path d="M0 490H1000 M500 340V540 M660 340L610 530H990L940 340" fill="none" stroke="#fff4dc" stroke-width="5" opacity=".7"/><ellipse cx="500" cy="440" rx="125" ry="65" fill="none" stroke="#fff4dc" stroke-width="5" opacity=".6"/><text x="70" y="95" fill="#9bd9e0" font-size="35" font-weight="bold">FIRST VOLO</text><text x="70" y="135" fill="white" font-size="18">FIND THE MEANING. TAKE YOUR SHOT.</text><g class="hoops-basket"><path d="M900 125V395" stroke="#b4c4cd" stroke-width="14"/><rect x="768" y="100" width="146" height="105" rx="5" fill="#e9f5fa" stroke="#8ca6b5" stroke-width="7"/><rect x="801" y="142" width="62" height="47" fill="none" stroke="#d45032" stroke-width="5"/><path d="M775 225L790 285H850L865 225 M785 230L840 283 M805 230L850 270 M855 230L800 283 M835 230L790 270" stroke="white" stroke-width="3" fill="none"/><ellipse cx="820" cy="225" rx="45" ry="9" fill="none" stroke="#ff713d" stroke-width="10"/></g><path class="hoops-guide" fill="none" stroke="#fff" stroke-dasharray="8 12" opacity=".45" stroke-width="3"/><g class="hoops-ball" transform="translate(160 425)"><circle r="30" fill="#ed842d" stroke="#442911" stroke-width="3"/><path d="M-30 0H30M0-30V30M-22-21Q12 0-22 21M22-21Q-12 0 22 21" stroke="#623716" fill="none" stroke-width="2"/></g></svg></div><div class="hoops-choices" aria-label="Choose a word-part ball"></div><p class="hoops-feedback" role="status" aria-live="polite"></p><div class="hoops-controls"><label>Aim: left \u2194 right <input class="hoops-aim" type="range" min="550" max="950" value="820" step="5"></label><button class="hoops-assist">Line up shot</button><button class="hoops-shoot" disabled>Shoot!</button><button class="hoops-next" hidden>Next word part</button></div><p class="hoops-help">Choose a ball by its meaning. Adjust aim with touch or arrow keys, then shoot. No timer. Points are just for this game.</p></section>`;
    if(toss){overlay.classList.add('is-target-toss');overlay.querySelector('#hoopsTitle').textContent='Meaning Target Toss';}
    document.body.append(overlay);
    const $ = s => overlay.querySelector(s);
    let round=0, score=0, selected=null, busy=false, frame=null, closed=false;
    let velocity={x:560,y:-700}, drag=null, targets=[], dragShot=false;
    let startSide=Math.random()<.5?-1:1;
    const gravity=900, startPoint={x:160,y:425};
    let launchPoint={...startPoint};
    function crossing(v){const disc=v.y*v.y-2*gravity*(launchPoint.y-225);return disc<0?null:(-v.y+Math.sqrt(disc))/gravity;}
    function hitX(v){const t=crossing(v);return t===null?null:launchPoint.x+v.x*t;}
    function setAim(){launchPoint={...startPoint};dragShot=false;velocity.y=-700;velocity.x=(Number(aim.value)-launchPoint.x)/crossing(velocity);guide();}
    const court=$(".hoops-court"), svg=court.querySelector("svg");
    court.setAttribute("tabindex","0");court.setAttribute("aria-label","Drag back from the ball and release to shoot. Keyboard users can use the aim slider and Shoot button.");
    const labels=document.createElementNS("http://www.w3.org/2000/svg","g");labels.setAttribute("class","toss-targets");svg.append(labels);
    if(toss) svg.setAttribute("aria-label","Arcade target range with three word-part targets");
    const aim=$('.hoops-aim'), ball=$('.hoops-ball'), feedback=$('.hoops-feedback');
    const stretch=document.createElementNS('http://www.w3.org/2000/svg','line');
    stretch.setAttribute('stroke','#ffe599');stretch.setAttribute('stroke-width','9');stretch.setAttribute('stroke-linecap','round');stretch.setAttribute('opacity','.8');stretch.style.display='none';svg.insertBefore(stretch,ball);
    function resetPull(){stretch.style.display='none';ball.setAttribute('transform','translate(160 425)');}
    const close=()=>{closed=true;cancelAnimationFrame(frame);overlay.remove();source?.focus();};
    $('.hoops-close').onclick=close;
    overlay.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); if(e.key==='Tab'){const nodes=[...overlay.querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled])')]; const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}} });
    function guide(){
      const time=Math.max(.8,-2*velocity.y/gravity), points=[];
      for(let i=0;i<=30;i++){const t=i/30*time;points.push(`${launchPoint.x+velocity.x*t},${launchPoint.y+velocity.y*t+.5*gravity*t*t}`);}
      $('.hoops-guide').setAttribute('d','M'+points.join(' L'));
    }
    aim.oninput=setAim;
    $('.hoops-assist').onclick=()=>{aim.value=820;setAim();feedback.textContent=toss?'Shot aimed at the middle target. Check its meaning before throwing.':'Shot lined up. Choose the matching ball, then shoot.';};
    function point(event){const rect=svg.getBoundingClientRect();return{x:(event.clientX-rect.left)/rect.width*1000,y:(event.clientY-rect.top)/rect.height*540};}
    court.addEventListener('pointerdown',event=>{
      if(busy)return;
      if(!selected){feedback.textContent='Choose your word-part ball first.';return;}
      const p=point(event);if(Math.hypot(p.x-160,p.y-425)>105){feedback.textContent='Start on the ball, pull back and down, then release.';return;}
      launchPoint={...startPoint};drag={x:p.x,y:p.y};court.setPointerCapture?.(event.pointerId);court.classList.add('is-aiming');event.preventDefault();
    });
    court.addEventListener('pointermove',event=>{if(!drag)return;const p=point(event);dragShot=true;launchPoint={x:160+Math.max(-125,Math.min(0,p.x-drag.x)),y:425+Math.max(0,Math.min(75,p.y-drag.y))};ball.setAttribute('transform',`translate(${launchPoint.x} ${launchPoint.y})`);stretch.style.display='';stretch.setAttribute('x1','160');stretch.setAttribute('y1','425');stretch.setAttribute('x2',launchPoint.x);stretch.setAttribute('y2',launchPoint.y);velocity={x:Math.max(50,Math.min(1000,(drag.x-p.x)*5)),y:-Math.max(250,Math.min(1050,(p.y-drag.y)*8))};const x=hitX(velocity);if(x!==null)aim.value=Math.max(550,Math.min(950,x));guide();feedback.textContent=`Pull power: ${Math.round(Math.min(1,Math.hypot(drag.x-p.x,p.y-drag.y)/170)*100)}%. Release to launch! Pull farther down for a higher shot.`;});
    court.addEventListener('pointerup',event=>{if(!drag)return;drag=null;stretch.style.display='none';court.classList.remove('is-aiming');court.releasePointerCapture?.(event.pointerId);$('.hoops-shoot').click();});
    court.addEventListener('pointercancel',()=>{drag=null;resetPull();setAim();court.classList.remove('is-aiming');feedback.textContent='Shot cancelled. Aim and try again.';});
    function render(){
      selected=toss?'toss':null;busy=false;aim.disabled=false;court.classList.remove('is-basket');$('.hoops-assist').disabled=false;
      $('.hoops-next').hidden=true;$('.hoops-shoot').disabled=!toss;
      resetPull();
      $('.hoops-round').textContent=`Round ${round+1} of ${deck.length}`;
      $('.hoops-prompt').textContent=`Which word part means \u201c${R.displayMeaning(deck[round].id)}\u201d?`;
      feedback.textContent=toss?'Aim at the matching word-part target, then pull back and release the ball.':'Choose your word-part ball, then aim a fresh shot. Each round starts off target.';
      // Each basketball round needs a fresh aim; assistance is an explicit choice.
      startSide *= -1;
      aim.value=toss ? 820 : startSide<0 ? 620+Math.floor(Math.random()*21)*5 : 900+Math.floor(Math.random()*11)*5;
      setAim();
      targets=deck[round].choices.slice().sort(()=>Math.random()-.5).map((id,i)=>({id,x:deck[round].choices.length===2?700+i*200:610+i*160}));
      labels.replaceChildren();
      if(toss) targets.forEach((target,i)=>{const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','toss-target');const c=document.createElementNS(g.namespaceURI,'circle');c.setAttribute('cx',target.x);c.setAttribute('cy',225);c.setAttribute('r',64);c.setAttribute('fill',['#9c63ed','#13b9c0','#f7ad3d'][i]);const t=document.createElementNS(g.namespaceURI,'text');t.setAttribute('x',target.x);t.setAttribute('y',233);t.setAttribute('text-anchor','middle');t.setAttribute('font-size','34');t.setAttribute('font-weight','bold');const pieces=R.promptLabel(target.id).split(/,\s*|\/\s*/);const lines=pieces.length>2?[pieces.slice(0,2).join(', '),pieces.slice(2).join(', ')]:pieces;t.setAttribute('font-size',String(Math.min(34,230/Math.max(...lines.map(v=>v.length)))));t.setAttribute('y',String(233-(lines.length-1)*16));lines.forEach((line,n)=>{const span=document.createElementNS(g.namespaceURI,'tspan');span.setAttribute('x',target.x);span.setAttribute('dy',n?'32':'0');span.textContent=line;t.append(span);});g.append(c,t);labels.append(g);});
      const choices=$('.hoops-choices');choices.setAttribute('aria-label',toss?'Choose a target to aim at':'Choose a word-part ball');choices.replaceChildren();
      deck[round].choices.slice().sort(()=>Math.random()-.5).forEach(id=>{const b=el('button',R.promptLabel(id));b.className='hoops-choice';b.setAttribute('aria-pressed','false');b.onclick=()=>{if(busy)return;if(toss){aim.value=targets.find(t=>t.id===id).x;setAim();feedback.textContent=`Aimed at ${R.promptLabel(id)}. Throw when ready.`;return;}selected=id;choices.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));$('.hoops-shoot').disabled=false;feedback.textContent=`${R.promptLabel(id)} selected. Take your shot!`;};choices.append(b);});
    }
    $('.hoops-shoot').onclick=()=>{
      if(busy||!selected)return;
      if(!toss && selected!==deck[round].id){feedback.textContent=`${R.promptLabel(selected)} means \u201c${R.displayMeaning(selected)}\u201d. Find the ball meaning \u201c${R.displayMeaning(deck[round].id)}\u201d, then try again.`;return;}
      if(!dragShot)setAim();
      busy=true;aim.disabled=true;$('.hoops-assist').disabled=true;$('.hoops-shoot').disabled=true;
      const x=hitX(velocity), tolerance=$('.hoops-hard').checked?22:42;
      const hit=toss&&x!==null?targets.find(t=>Math.abs(t.x-x)<=tolerance):null;
      const made=toss?Boolean(hit&&hit.id===deck[round].id):x!==null&&Math.abs(x-820)<=tolerance;
      const wrongTarget=Boolean(hit&&!made), landing=(-velocity.y+Math.sqrt(Math.max(0,velocity.y*velocity.y-2*gravity*(launchPoint.y-425))))/gravity;
      const stop=made?crossing(velocity)+.09:landing+.25, start=performance.now(), duration=matchMedia('(prefers-reduced-motion: reduce)').matches?100:Math.max(850,stop*850);
      function animate(now){if(closed)return;const t=Math.min(1,(now-start)/duration), elapsed=t*stop, flight=Math.min(elapsed,landing), bx=launchPoint.x+velocity.x*flight, by=elapsed<=landing?launchPoint.y+velocity.y*elapsed+.5*gravity*elapsed*elapsed:425-Math.sin((elapsed-landing)/.25*Math.PI)*42;ball.setAttribute('transform',`translate(${bx} ${by}) rotate(${t*650})`);if(t<1){frame=requestAnimationFrame(animate);return;}
        if(made){court.classList.add('is-basket');score+=2;$('.hoops-score').textContent=`${score} points`;feedback.textContent=`${toss?'Target hit!':'Basket!'} ${R.promptLabel(deck[round].id)} means \u201c${R.displayMeaning(deck[round].id)}\u201d. Two points!`;$('.hoops-next').hidden=false;$('.hoops-next').textContent=round===deck.length-1?'See results':'Next word part';$('.hoops-next').focus();}
        else{feedback.textContent=wrongTarget?`${R.promptLabel(hit.id)} means “${R.displayMeaning(hit.id)}”. Aim for the target meaning “${R.displayMeaning(deck[round].id)}”.`:toss?'Missed the targets. Adjust the flight and try again.': 'Right word part—try your shot again! Adjust aim or choose Line up shot.';busy=false;aim.disabled=false;$('.hoops-assist').disabled=false;$('.hoops-shoot').disabled=false;ball.setAttribute('transform','translate(160 425)');}
      }frame=requestAnimationFrame(animate);
    };
    $('.hoops-next').onclick=()=>{round++;if(round<deck.length){render();$('.hoops-choice').focus();}else{$('.hoops-prompt').textContent=`Final score: ${score} points!`;
      $('.hoops-choices').replaceChildren();$('.hoops-controls').hidden=true;feedback.textContent='You matched word parts with their meanings. Your learning progress has not changed.';const replay=el('button','Play again');replay.onclick=()=>{close();open(reward,source,options);};$('.hoops-choices').append(replay);replay.focus();}};
    $('.hoops-help').textContent=toss?'Read the meaning. Pull the ball back and down with a mouse or touch, then release toward the matching target. Keyboard: choose an aiming target and use Shoot. No timer.':'Choose a meaning-matching ball. Pull the court ball back and down with a mouse or touch, then release! Or use the aim slider and Shoot. No timer.';
    render();$('.hoops-close').focus();
  }
  window.FirstVoloHoops={open,questions};
})();
