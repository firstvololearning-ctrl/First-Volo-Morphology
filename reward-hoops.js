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
  function open(reward, source) {
    const deck = questions(reward).sort(() => Math.random() - .5).slice(0,5);
    if (!deck.length) return;
    const overlay = el('div'); overlay.className = 'hoops-overlay';
    overlay.innerHTML = `<section class="hoops" role="dialog" aria-modal="true" aria-labelledby="hoopsTitle"><header><div><small>WORD-PART ARCADE</small><h2 id="hoopsTitle">Word-Part Hoops</h2></div><button class="hoops-close">Close</button></header><div class="hoops-hud"><span class="hoops-round"></span><span class="hoops-score">0 points</span><label><input type="checkbox" class="hoops-hard"> Harder shots</label></div><p class="hoops-prompt"></p><div class="hoops-court"><svg viewBox="0 0 1000 540" role="img" aria-label="Basketball court with a hoop on the right"><defs><linearGradient id="hoopsWall" x2="0" y2="1"><stop stop-color="#10263e"/><stop offset="1" stop-color="#315b72"/></linearGradient><pattern id="hoopsWood" width="125" height="38" patternUnits="userSpaceOnUse"><rect width="125" height="38" fill="#d6a568"/><path d="M0 0H125V38H0Z M12 12H100" stroke="#a77b48" fill="none"/></pattern></defs><rect width="1000" height="540" fill="url(#hoopsWall)"/><path d="M0 340H1000V540H0Z" fill="url(#hoopsWood)"/><path d="M0 490H1000 M500 340V540 M660 340L610 530H990L940 340" fill="none" stroke="#fff4dc" stroke-width="5" opacity=".7"/><ellipse cx="500" cy="440" rx="125" ry="65" fill="none" stroke="#fff4dc" stroke-width="5" opacity=".6"/><text x="70" y="95" fill="#9bd9e0" font-size="35" font-weight="bold">FIRST VOLO</text><text x="70" y="135" fill="white" font-size="18">FIND THE MEANING. TAKE YOUR SHOT.</text><path d="M900 125V395" stroke="#b4c4cd" stroke-width="14"/><rect x="768" y="100" width="146" height="105" rx="5" fill="#e9f5fa" stroke="#8ca6b5" stroke-width="7"/><rect x="801" y="142" width="62" height="47" fill="none" stroke="#d45032" stroke-width="5"/><path d="M775 225L790 285H850L865 225 M785 230L840 283 M805 230L850 270 M855 230L800 283 M835 230L790 270" stroke="white" stroke-width="3" fill="none"/><ellipse cx="820" cy="225" rx="45" ry="9" fill="none" stroke="#ff713d" stroke-width="10"/><path class="hoops-guide" fill="none" stroke="#fff" stroke-dasharray="8 12" opacity=".45" stroke-width="3"/><g class="hoops-ball" transform="translate(160 425)"><circle r="30" fill="#ed842d" stroke="#442911" stroke-width="3"/><path d="M-30 0H30M0-30V30M-22-21Q12 0-22 21M22-21Q-12 0 22 21" stroke="#623716" fill="none" stroke-width="2"/></g></svg></div><div class="hoops-choices" aria-label="Choose a word-part ball"></div><p class="hoops-feedback" role="status" aria-live="polite"></p><div class="hoops-controls"><label>Aim: left \u2194 right <input class="hoops-aim" type="range" min="650" max="950" value="820" step="5"></label><button class="hoops-assist">Line up shot</button><button class="hoops-shoot" disabled>Shoot!</button><button class="hoops-next" hidden>Next word part</button></div><p class="hoops-help">Choose a ball by its meaning. Adjust aim with touch or arrow keys, then shoot. No timer. Points are just for this game.</p></section>`;
    document.body.append(overlay);
    const $ = s => overlay.querySelector(s);
    let round=0, score=0, selected=null, busy=false, frame=null, closed=false;
    const aim=$('.hoops-aim'), ball=$('.hoops-ball'), feedback=$('.hoops-feedback');
    const close=()=>{closed=true;cancelAnimationFrame(frame);overlay.remove();source?.focus();};
    $('.hoops-close').onclick=close;
    overlay.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); if(e.key==='Tab'){const nodes=[...overlay.querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled])')]; const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}} });
    function guide(){ $('.hoops-guide').setAttribute('d',`M160 425 Q490 -115 ${aim.value} 225`); }
    aim.oninput=guide;
    $('.hoops-assist').onclick=()=>{aim.value=820;guide();feedback.textContent='Shot lined up. Choose the matching ball, then shoot.';};
    function render(){
      selected=null;busy=false;aim.disabled=false;$('.hoops-assist').disabled=false;
      $('.hoops-next').hidden=true;$('.hoops-shoot').disabled=true;
      ball.setAttribute('transform','translate(160 425)');
      $('.hoops-round').textContent=`Round ${round+1} of ${deck.length}`;
      $('.hoops-prompt').textContent=`Which word part means \u201c${R.displayMeaning(deck[round].id)}\u201d?`;
      feedback.textContent='Choose your word-part ball.';
      aim.value=$('.hoops-hard').checked ? 700+Math.floor(Math.random()*40)*5 : 820;guide();
      const choices=$('.hoops-choices');choices.replaceChildren();
      deck[round].choices.slice().sort(()=>Math.random()-.5).forEach(id=>{const b=el('button',R.promptLabel(id));b.className='hoops-choice';b.setAttribute('aria-pressed','false');b.onclick=()=>{if(busy)return;selected=id;choices.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));$('.hoops-shoot').disabled=false;feedback.textContent=`${R.promptLabel(id)} selected. Take your shot!`;};choices.append(b);});
    }
    $('.hoops-shoot').onclick=()=>{
      if(busy||!selected)return;
      if(selected!==deck[round].id){feedback.textContent=`${R.promptLabel(selected)} means \u201c${R.displayMeaning(selected)}\u201d. Find the ball meaning \u201c${R.displayMeaning(deck[round].id)}\u201d, then try again.`;return;}
      busy=true;aim.disabled=true;$('.hoops-assist').disabled=true;$('.hoops-shoot').disabled=true;
      const end=Number(aim.value), made=Math.abs(end-820)<=($('.hoops-hard').checked?17:35), start=performance.now(), duration=matchMedia('(prefers-reduced-motion: reduce)').matches?100:1000;
      function animate(now){if(closed)return;const t=Math.min(1,(now-start)/duration), x=(1-t)*(1-t)*160+2*(1-t)*t*490+t*t*end,y=(1-t)*(1-t)*425+2*(1-t)*t*(-115)+t*t*225;ball.setAttribute('transform',`translate(${x} ${y}) rotate(${t*540})`);if(t<1){frame=requestAnimationFrame(animate);return;}
        if(made){score+=2;$('.hoops-score').textContent=`${score} points`;feedback.textContent=`Basket! ${R.promptLabel(selected)} means \u201c${R.displayMeaning(selected)}\u201d. Two points!`;$('.hoops-next').hidden=false;$('.hoops-next').textContent=round===deck.length-1?'See results':'Next word part';$('.hoops-next').focus();}
        else{feedback.textContent='Right word part\u2014try your shot again! Adjust aim or choose Line up shot.';busy=false;aim.disabled=false;$('.hoops-assist').disabled=false;$('.hoops-shoot').disabled=false;ball.setAttribute('transform','translate(160 425)');}
      }frame=requestAnimationFrame(animate);
    };
    $('.hoops-next').onclick=()=>{round++;if(round<deck.length){render();$('.hoops-choice').focus();}else{$('.hoops-prompt').textContent=`Final score: ${score} points!`;
      $('.hoops-choices').replaceChildren();$('.hoops-controls').hidden=true;feedback.textContent='You matched word parts with their meanings. Your learning progress has not changed.';const replay=el('button','Play again');replay.onclick=()=>{close();open(reward,source);};$('.hoops-choices').append(replay);replay.focus();}};
    render();$('.hoops-close').focus();
  }
  window.FirstVoloHoops={open,questions};
})();
