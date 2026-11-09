/* Optional basketball practice. Scores stay in this game session. */
(function () {
  'use strict';
  const R = window.FirstVoloRewardRegistry;
  const el = (tag, text) => { const n = document.createElement(tag); if (text) n.textContent = text; return n; };
  const Q = window.FirstVoloGameQuestions;
  function open(reward, source, options = {}) {
    const toss=options.mode === "toss";
    const deck = Q.deck(reward);
    if (!deck.length) return;
    const overlay = el('div'); overlay.className = 'hoops-overlay';
    overlay.innerHTML = `<section class="hoops" role="dialog" aria-modal="true" aria-labelledby="hoopsTitle"><header><div><small>WORD-PART ARCADE</small><h2 id="hoopsTitle">Word-Part Hoops</h2></div><button class="hoops-close">Close</button></header><div class="hoops-hud"><span class="hoops-round"></span><span class="hoops-score">0 points</span><label><input type="checkbox" class="hoops-hard"> Harder shots</label></div><p class="hoops-prompt"></p><div class="hoops-court"><svg viewBox="0 0 1000 540" role="img" aria-label="Basketball court with a hoop on the right"><defs><linearGradient id="hoopsWall" x2="0" y2="1"><stop stop-color="#10263e"/><stop offset="1" stop-color="#315b72"/></linearGradient><pattern id="hoopsWood" width="180" height="44" patternUnits="userSpaceOnUse"><rect width="180" height="44" fill="#d6a568"/><path d="M0 0H180 M0 22H180 M45 0V22 M135 22V44" stroke="#a77b48" opacity=".55" fill="none"/></pattern></defs><rect class="hoops-backdrop" width="1000" height="540" fill="url(#hoopsWall)"/><path class="hoops-floor" d="M0 340H1000V540H0Z" fill="url(#hoopsWood)"/><g class="hoops-floor-lines" transform="matrix(1 0 -.10 .31 25 348)" fill="none" stroke="#fff4dc" opacity=".72"><path d="M55 0H935V550H55Z" stroke-width="3" vector-effect="non-scaling-stroke"/><path d="M935 180H680V370H935 M680 180C570 180 570 370 680 370" stroke-width="2" vector-effect="non-scaling-stroke"/></g><text x="70" y="95" fill="#9bd9e0" font-size="35" font-weight="bold">FIRST VOLO</text><text x="70" y="135" fill="white" font-size="18">FIND THE MEANING. TAKE YOUR SHOT.</text><g class="hoops-basket"><path d="M900 125V395" stroke="#b4c4cd" stroke-width="14"/><rect x="768" y="100" width="146" height="105" rx="5" fill="#e9f5fa" stroke="#8ca6b5" stroke-width="7"/><rect x="801" y="142" width="62" height="47" fill="none" stroke="#d45032" stroke-width="5"/><path d="M775 225L790 285H850L865 225 M785 230L840 283 M805 230L850 270 M855 230L800 283 M835 230L790 270" stroke="white" stroke-width="3" fill="none"/><ellipse cx="820" cy="225" rx="45" ry="9" fill="none" stroke="#ff713d" stroke-width="10"/></g><path class="hoops-guide" fill="none" stroke="#fff" stroke-dasharray="8 12" opacity=".45" stroke-width="3"/><g class="hoops-ball" transform="translate(160 425)"><circle r="30" fill="#ed842d" stroke="#442911" stroke-width="3"/><path d="M-30 0H30M0-30V30M-22-21Q12 0-22 21M22-21Q-12 0 22 21" stroke="#623716" fill="none" stroke-width="2"/></g></svg></div><div class="hoops-choices" aria-label="Choose a word-part ball"></div><p class="hoops-feedback" role="status" aria-live="polite"></p><div class="hoops-controls"><label>Aim: left \u2194 right <input class="hoops-aim" type="range" min="550" max="950" value="820" step="5"></label><button class="hoops-assist">Line up shot</button><button class="hoops-shoot" disabled>Shoot!</button><button class="hoops-next" hidden>Next word part</button></div><p class="hoops-help">Choose a ball by its meaning. Adjust aim with touch or arrow keys, then shoot. No timer. Points are just for this game.</p></section>`;
    if(toss){overlay.classList.add('is-target-toss');overlay.querySelector('#hoopsTitle').textContent='Water Balloon Pop';}
    document.body.append(overlay);
    const $ = s => overlay.querySelector(s);
    let round=0, score=0, selected=null, busy=false, frame=null, closed=false;
    let velocity={x:560,y:-700}, drag=null, targets=[], dragShot=false;
    let startSide=Math.random()<.5?-1:1;
    const gravity = 900;
    const startPoint = toss ? { x: 500, y: 440 } : { x: 160, y: 425 };
    const balloonY = 185;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let balloonTime = 0;
    let balloonFrame;
    let launchPoint={...startPoint};
    function crossing(v) {
      const height = toss ? balloonY : 225;
      const disc = v.y * v.y - 2 * gravity * (launchPoint.y - height);
      if (disc < 0) return null;
      const root = Math.sqrt(disc);
      return (-v.y + (toss ? -root : root)) / gravity;
    }

    function flightAt(time) {
      return {
        x: launchPoint.x + velocity.x * time,
        y: launchPoint.y + velocity.y * time + .5 * gravity * time * time
      };
    }

    function hitX() {
      const time = crossing(velocity);
      return time === null ? null : flightAt(time).x;
    }

    function setAim() {
      launchPoint = { ...startPoint };
      dragShot = false;
      velocity.y = toss ? -1000 : -700;
      velocity.x = (Number(aim.value) - launchPoint.x) / crossing(velocity);
      guide();
    }

    function balloonAt(target, time) {
      const phase = time * 1.8 + target.phase;
      return {
        x: target.x + (reducedMotion ? 0 : 36 * Math.sin(phase)),
        y: balloonY + (reducedMotion ? 0 : 10 * Math.sin(phase + 1))
      };
    }

    function positionBalloons(time) {
      balloonTime = time;
      for (const target of targets) {
        const point = balloonAt(target, time);
        target.element.setAttribute('transform', `translate(${point.x} ${point.y})`);
      }
    }

    function driftBalloons() {
      if (!toss || reducedMotion) return;
      const start = performance.now();
      const offset = balloonTime;
      function drift(now) {
        if (closed || busy) return;
        positionBalloons(offset + (now - start) / 1000);
        balloonFrame = requestAnimationFrame(drift);
      }
      balloonFrame = requestAnimationFrame(drift);
    }

    function firstBalloonContact(landing, startTime) {
      // Check the moving balloon positions in the same time frame as the ball.
      for (let time = 0; time <= landing; time += .008) {
        const point = flightAt(time);
        const target = targets.find(item => {
          const center = balloonAt(item, startTime + time);
          return Math.hypot((point.x - center.x) / 90, (point.y - center.y) / 83) <= 1;
        });
        if (target) return { target, time };
      }
      return null;
    }

    const court=$(".hoops-court"), svg=court.querySelector("svg");
    court.setAttribute("tabindex","0");court.setAttribute("aria-label","Drag back from the ball and release to shoot. Keyboard users can use the aim slider and Shoot button.");
    const labels=document.createElementNS("http://www.w3.org/2000/svg","g");labels.setAttribute("class","toss-targets");svg.append(labels);
    if (toss) {
      svg.setAttribute('aria-label', 'Water balloon range with labeled targets');
      const [name, instruction] = svg.querySelectorAll(':scope > text');
      name.setAttribute('y', '58');
      instruction.setAttribute('y', '90');
      instruction.textContent = 'AIM UP. POP THE MATCH.';
    }
    const aim=$('.hoops-aim'), ball=$('.hoops-ball'), feedback=$('.hoops-feedback');
    if (toss) {
      ball.querySelector('path').setAttribute('d', 'M-18 -8Q-16 -18 -6 -20');
      aim.min = '100';
      aim.max = '900';
      $('.hoops-hard').closest('label').hidden = true;
    }
    const manualOptions = el('details');
    manualOptions.className = 'hoops-manual-options';
    const manualControls = el('div');
    manualControls.className = 'hoops-manual-controls';
    $('.hoops-controls').prepend(manualOptions);
    manualControls.append(aim.closest('label'), $('.hoops-assist'), $('.hoops-shoot'));
    manualOptions.append(el('summary', 'Keyboard and assisted shooting'), manualControls);
    $('.hoops-assist').hidden = toss;

    const stretch=document.createElementNS('http://www.w3.org/2000/svg','line');
    stretch.setAttribute('stroke','#ffe599');stretch.setAttribute('stroke-width','9');stretch.setAttribute('stroke-linecap','round');stretch.setAttribute('opacity','.8');stretch.style.display='none';svg.insertBefore(stretch,ball);
    function resetPull() {
      stretch.style.display = 'none';
      ball.setAttribute('transform', `translate(${startPoint.x} ${startPoint.y})`);
    }
    const close=()=>{closed=true;cancelAnimationFrame(frame);cancelAnimationFrame(balloonFrame);overlay.remove();source?.focus();};
    $('.hoops-close').onclick=close;
    overlay.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); if(e.key==='Tab'){const nodes=[...overlay.querySelectorAll('button:not([disabled]),input:not([disabled]),summary,[tabindex="0"]')].filter(node => !node.closest('[hidden]') && (!node.closest('details:not([open])') || node.matches('summary'))); const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}} });
    function guide(){
      // Show the early curve without previewing the impact.
      const time = .32;
      const points = [];
      for(let i=0;i<=30;i++){const t=i/30*time;points.push(`${launchPoint.x+velocity.x*t},${launchPoint.y+velocity.y*t+.5*gravity*t*t}`);}
      $('.hoops-guide').setAttribute('d','M'+points.join(' L'));
    }
    aim.oninput=setAim;
    $('.hoops-assist').onclick=()=>{aim.value=820;setAim();feedback.textContent=toss?'Shot aimed at the middle target. Check its meaning before throwing.':'Shot lined up. Choose the matching ball, then shoot.';};
    function pointOnCourt(event){const rect=svg.getBoundingClientRect();return{x:(event.clientX-rect.left)/rect.width*1000,y:(event.clientY-rect.top)/rect.height*540};}
    court.addEventListener('pointerdown',event=>{
      if(busy)return;
      if(!selected){feedback.textContent='Choose your word-part ball first.';return;}
      const p=pointOnCourt(event);if(Math.hypot(p.x-startPoint.x,p.y-startPoint.y)>105){feedback.textContent='Start on the ball, pull back and down, then release.';return;}
      launchPoint={...startPoint};court.style.setProperty('--pull-power', '0%');drag={x:p.x,y:p.y};court.setPointerCapture?.(event.pointerId);court.classList.add('is-aiming');event.preventDefault();
    });
    court.addEventListener('pointermove', event => {
      if (!drag) return;
      const point = pointOnCourt(event);
      const pullX = drag.x - point.x;
      const pullY = point.y - drag.y;
      dragShot = true;
      launchPoint = {
        x: startPoint.x - Math.max(toss ? -125 : 0, Math.min(125, pullX)),
        y: startPoint.y + Math.max(0, Math.min(75, pullY))
      };
      ball.setAttribute('transform', `translate(${launchPoint.x} ${launchPoint.y})`);
      stretch.style.display = '';
      stretch.setAttribute('x1', startPoint.x);
      stretch.setAttribute('y1', startPoint.y);
      stretch.setAttribute('x2', launchPoint.x);
      stretch.setAttribute('y2', launchPoint.y);
      velocity = {
        x: toss ? Math.max(-1300, Math.min(1300, pullX * 10)) : Math.max(50, Math.min(1000, pullX * 5)),
        y: -Math.max(250, Math.min(1050, pullY * (toss ? 14 : 8)))
      };
      const x = hitX();
      if (x !== null) aim.value = Math.max(Number(aim.min), Math.min(Number(aim.max), x));
      guide();
      const power = Math.round(Math.min(1, Math.hypot(pullX, pullY) / (toss ? 105 : 170)) * 100);
      court.style.setProperty('--pull-power', `${power}%`);
      feedback.textContent = `Pull power: ${power}%. Release to launch! Pull farther down for a higher shot.`;
    });
    court.addEventListener('pointerup',event=>{if(!drag)return;drag=null;stretch.style.display='none';court.classList.remove('is-aiming');court.releasePointerCapture?.(event.pointerId);$('.hoops-shoot').click();});
    court.addEventListener('pointercancel',()=>{drag=null;resetPull();setAim();court.classList.remove('is-aiming');feedback.textContent='Shot cancelled. Aim and try again.';});
    function render(){
      cancelAnimationFrame(balloonFrame);
      selected=toss?'toss':null;busy=false;aim.disabled=false;court.classList.remove('is-basket');$('.hoops-assist').disabled=false;
      $('.hoops-next').hidden=true;$('.hoops-shoot').disabled=!toss;
      resetPull();
      $('.hoops-round').textContent=`Round ${round+1} of ${deck.length}`;
      const question = deck[round];
      $('.hoops-prompt').textContent = question.prompt;
      feedback.textContent=toss?'Pull the ball down, then release to launch up at the matching balloon.':'Choose the ball that answers the prompt, then aim a fresh shot. Each round starts off target.';
      // Each basketball round needs a fresh aim; assistance is an explicit choice.
      startSide *= -1;
      aim.value=toss ? (question.choices.length === 2 ? 500 : 360) : startSide<0 ? 620+Math.floor(Math.random()*21)*5 : 900+Math.floor(Math.random()*11)*5;
      setAim();
      const balloonPositions = question.choices.length === 2 ? [300, 700] : [220, 500, 780];
      targets = toss ? Q.shuffled(question.choices).map((id, index) => ({ id, x: balloonPositions[index], phase: index * 2.1 })) : [];
      labels.replaceChildren();
      if (toss) targets.forEach((target, index) => {
        const svgNode = tag => document.createElementNS(svg.namespaceURI, tag);
        const group = svgNode('g');
        group.setAttribute('class', 'toss-target');
        group.setAttribute('transform', `translate(${target.x} ${balloonY})`);
        const balloon = svgNode('path');
        balloon.setAttribute('class', 'toss-balloon');
        balloon.setAttribute('d', 'M0 -60 C-70 -61 -74 20 -25 46 L-8 55 L-13 65 L13 65 L8 55 L25 46 C74 20 70 -61 0 -60Z');
        balloon.setAttribute('fill', ['#b48bf2', '#65dce7', '#ffc479'][index]);
        const splash = svgNode('path');
        splash.setAttribute('class', 'toss-splash');
        splash.setAttribute('d', 'M0 -20L-19 -61L-25 -31L-63 -44L-43 -10L-77 4L-34 18L-43 51L-13 38L0 67L17 34L51 52L37 18L77 4L40 -12L56 -48L22 -31L17 -61Z');
        const drops = svgNode('g');
        drops.setAttribute('class', 'toss-drops');
        for (const [x, y, radius] of [[-75,-54,7],[-44,-82,9],[1,-92,6],[51,-76,8],[80,-39,6],[-85,28,6],[77,43,7],[18,83,8]]) {
          const drop = svgNode('circle');
          drop.setAttribute('cx', x);
          drop.setAttribute('cy', y);
          drop.setAttribute('r', radius);
          drops.append(drop);
        }
        const label = svgNode('text');
        const labelText = Q.label(question, target.id);
        const lines = labelText.split(/,\s*|\/\s*/);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', String(Math.min(30, 165 / Math.max(...lines.map(line => line.length)))));
        label.setAttribute('y', String(9 - (lines.length - 1) * 13));
        lines.forEach((line, lineIndex) => {
          const span = svgNode('tspan');
          span.setAttribute('x', '0');
          span.setAttribute('dy', lineIndex ? '26' : '0');
          span.textContent = line;
          label.append(span);
        });
        group.append(balloon, splash, drops, label);
        labels.append(group);
        target.element = group;
      });
      if (toss) {
        positionBalloons(0);
        driftBalloons();
      }
      const choices=$('.hoops-choices');choices.setAttribute('aria-label',toss?'Choose a target to aim at':'Choose a ball');choices.replaceChildren();
      Q.shuffled(question.choices).forEach(id=>{const b=el('button',Q.label(question,id));b.className='hoops-choice';b.setAttribute('aria-pressed','false');b.onclick=()=>{if(busy)return;if(toss){aim.value=targets.find(t=>t.id===id).x;setAim();feedback.textContent=`Aimed at ${Q.label(question, id)}. Throw when ready.`;return;}selected=id;choices.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));$('.hoops-shoot').disabled=false;feedback.textContent=`${Q.label(question,id)} selected. Take your shot!`;};choices.append(b);});
    }
    $('.hoops-shoot').onclick=()=>{
      if(busy||!selected)return;
      const question = deck[round];
      if (!toss && selected !== question.answer) {
        feedback.textContent = question.explanations
          ? `${Q.explain(question, selected)} Try the other word.`
          : `${Q.explain(question, selected)} Find the ball meaning “${R.displayMeaning(question.id)}”, then try again.`;
        return;
      }
      if(!dragShot)setAim();
      busy=true;aim.disabled=true;$('.hoops-assist').disabled=true;$('.hoops-shoot').disabled=true;
      court.classList.add('is-in-flight');
      labels.querySelector('.is-bumped')?.classList.remove('is-bumped');
      const landing = (-velocity.y + Math.sqrt(Math.max(0, velocity.y ** 2 -
        2 * gravity * (launchPoint.y - startPoint.y)))) / gravity;
      const shotBalloonTime = balloonTime;
      cancelAnimationFrame(balloonFrame);
      const contact = toss ? firstBalloonContact(landing, shotBalloonTime) : null;
      const hit = contact?.target;
      const rimX = toss ? null : hitX();
      const hard = $('.hoops-hard').checked;
      const nearRimAssist = !toss && dragShot && !hard;
      const tolerance = hard ? 22 : nearRimAssist ? 95 : 42;
      const made = toss ? hit?.id === question.answer : rimX !== null && Math.abs(rimX - 820) <= tolerance;
      if (made && nearRimAssist) {
        velocity.x += (820 - rimX) / crossing(velocity);
      }
      const wrongTarget = hit && !made;
      const stop = contact?.time ?? (made ? crossing(velocity) + .09 : landing + .25);
      const start = performance.now();
      const duration = reducedMotion ? 100 : Math.max(toss ? 270 : 850, stop * 850);

      function animate(now) {
        if (closed) return;
        const progress = Math.min(1, (now - start) / duration);
        const elapsed = progress * stop;
        if (toss) positionBalloons(shotBalloonTime + elapsed);
        const point = flightAt(Math.min(elapsed, landing));
        if (elapsed > landing) point.y = startPoint.y - Math.sin((elapsed - landing) / .25 * Math.PI) * 42;
        ball.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${progress * 650})`);
        if (progress < 1) {
          frame = requestAnimationFrame(animate);
          return;
        }
        court.classList.remove('is-in-flight');
        if(made){hit?.element.classList.add('is-popped');court.classList.add('is-basket');score+=2;$('.hoops-score').textContent=`${score} points`;feedback.textContent=`${toss?'Splash!':'Basket!'} ${Q.explain(question, question.answer)} Two points!`;$('.hoops-next').hidden=false;$('.hoops-next').textContent=round===deck.length-1?'See results':'Next word part';$('.hoops-next').focus();}
        else {
          if (wrongTarget) {
            hit.element.classList.add('is-bumped');
            const retry = question.explanations ? 'Aim for the other balloon.' : `Aim for the target meaning “${R.displayMeaning(question.id)}”.`;
            feedback.textContent = `${Q.explain(question, hit.id)} ${retry}`;
          } else {
            feedback.textContent = toss
              ? 'Missed the balloons. Adjust your aim and try again.'
              : rimX === null
                ? 'Right answer. Pull farther down for a higher shot.'
                : 'Right answer. Adjust left or right and try the shot again.';
          }
          busy=false;aim.disabled=false;$('.hoops-assist').disabled=false;$('.hoops-shoot').disabled=false;resetPull();driftBalloons();}
      }frame=requestAnimationFrame(animate);
    };
    $('.hoops-next').onclick=()=>{round++;if(round<deck.length){render();$('.hoops-choice').focus();}else{$('.hoops-prompt').textContent=`Final score: ${score} points!`;
      $('.hoops-choices').replaceChildren();$('.hoops-controls').hidden=true;feedback.textContent='You matched word parts with their meanings. Your learning progress has not changed.';const replay=el('button','Play again');replay.onclick=()=>{close();open(reward,source,options);};$('.hoops-choices').append(replay);replay.focus();}};
    $('.hoops-help').textContent=toss?'Pull down and to the side to aim upward, then release to pop the matching balloon. For keyboard play, select a balloon and open Keyboard and assisted shooting. No timer.':'Choose the ball that answers the prompt. Pull the court ball back and down with a mouse or touch, then release! Open Keyboard and assisted shooting for the aim slider, alignment help, and Shoot. No timer.';
    render();$('.hoops-close').focus();
  }
  window.FirstVoloHoops={open,questions: Q.morphemeQuestions};
})();
