"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const preview = process.argv[2] || "http://127.0.0.1:8766/index.html";
const port = 9226;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "first-volo-reward-qa-"));
const chrome = childProcess.spawn(chromePath, ["--headless=new", `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, "--no-first-run", "--disable-gpu", `${preview}?rewardTest=unlocked`],
{ stdio: "ignore" });

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function getJson(endpoint) {
  return new Promise((resolve, reject) => http.get(`http://127.0.0.1:${port}${endpoint}`, (response) => {
    let body = "";
    response.on("data", (chunk) => { body += chunk; });
    response.on("end", () => { try { resolve(JSON.parse(body)); } catch (error) { reject(error); } });
  }).on("error", reject));
}
async function target() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const tabs = await getJson("/json/list");
      const page = tabs.find((item) => item.type === "page" && item.url.startsWith("http://127.0.0.1"));
      if (page) return page;
    } catch (_) { /* Chrome is starting. */ }
    await pause(100);
  }
  throw new Error("Chrome DevTools target unavailable");
}

(async () => {
  const tab = await target();
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let sequence = 0;
  const pending = new Map();
  const browserExceptions = [];
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") browserExceptions.push(message.params.exceptionDetails);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id); pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await command("Runtime.enable");
  await command("Page.reload", { ignoreCache: true });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await evaluate("document.readyState === 'complete' && Boolean(window.FirstVoloRewards?.registry?.length)")) break;
    await pause(100);
  }
  if (!await evaluate("Boolean(window.FirstVoloRewards)")) {
    const pageState = await evaluate("({url:location.href,title:document.title,ready:document.readyState,scripts:[...document.scripts].map(s=>s.src).slice(-8)})");
    throw new Error(`Reward scripts did not load: ${JSON.stringify({ pageState, browserExceptions })}`);
  }
  const baselineStorage = await evaluate("JSON.stringify(localStorage)");
  assert.equal(await evaluate("window.FirstVoloRewards.registry.length"), 9);

  for (const flight of ["2-3", "4-5", "6-8"]) {
    const markerState = await evaluate(`(() => { const select=document.querySelector('#gradeBandSelect'); select.value='${flight}'; select.dispatchEvent(new Event('change',{bubbles:true})); const launch=document.querySelector('.migration-map-launch-button'); if(document.querySelector('.migration-modal-overlay').hidden) launch.click(); return [...document.querySelectorAll('.reward-route-stop')].map(x=>({token:x.dataset.unlockToken,position:Number(x.dataset.routePosition),unlocked:x.classList.contains('is-unlocked')})); })()`);
    assert.equal(markerState.length, 3, `${flight}: three route markers`);
    assert.ok(markerState.every((marker) => marker.unlocked && Number.isFinite(marker.position)), `${flight}: unlocked derived markers`);
  }

  const games = await evaluate(`(() => { document.querySelector('.migration-my-games-button').click(); return [...document.querySelectorAll('.reward-my-game')].map(x=>({title:x.querySelector('strong').textContent,disabled:x.querySelector('button').disabled})); })()`);
  assert.equal(games.length, 9); assert.ok(games.every((game) => !game.disabled));
  assert.equal(await evaluate("document.querySelectorAll('.reward-my-games-group').length"), 3);
  assert.equal(await evaluate("window.FirstVoloInstructionalAudio.prepareSpeechText('Catch a meaning of inter-.')"), "Catch a meaning of inter.");
  await evaluate(`(() => { const audio=window.FirstVoloInstructionalAudio, original=audio.speak.bind(audio); window.__rewardSpeechCount=0; audio.speak=(...args)=>{window.__rewardSpeechCount+=1; return original(...args);}; })()`);
  assert.equal(await evaluate(`(() => { const reward=window.FirstVoloRewards.registry.find(x=>x.gameType==='build-word'); window.FirstVoloRewards.launch(reward); document.querySelector('.reward-config-start').click(); return document.querySelectorAll('.reward-config-choice').length; })()`), 4);
  assert.equal(await evaluate("window.__rewardSpeechCount"), 1);
  await evaluate("document.querySelector('.reward-config-speak').click()");
  assert.equal(await evaluate("window.__rewardSpeechCount"), 2);
  assert.equal(await evaluate(`(() => { const field=document.querySelector('.reward-config-field'); const before=document.querySelector('.reward-config-volo').style.left; field.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); return before !== document.querySelector('.reward-config-volo').style.left; })()`), true);
  assert.equal(await evaluate(`(() => { const field=document.querySelector('.reward-config-field'), bird=document.querySelector('.reward-config-volo'), r=field.getBoundingClientRect(), before=bird.style.top; field.dispatchEvent(new PointerEvent('pointerdown',{clientX:r.left+r.width*.55,clientY:r.top+r.height*.28,pointerType:'touch',bubbles:true})); return before !== bird.style.top; })()`), true);
  await evaluate("window.FirstVoloConfigGames.close()");
  assert.equal(await evaluate(`(() => { const reward=window.FirstVoloRewards.registry.find(x=>x.gameType==='meaning-flight'); window.FirstVoloRewards.launch(reward); document.querySelector('.reward-config-start').click(); return document.querySelectorAll('.reward-config-choice').length; })()`), 4);
  assert.equal(await evaluate("window.__rewardSpeechCount"), 3);
  assert.equal(await evaluate("document.querySelector('.reward-config-hud small').textContent.startsWith('Wind')"), true);
  await evaluate("window.FirstVoloConfigGames.close()");
  assert.equal(await evaluate(`(() => { window.FirstVoloRewards.launch(window.FirstVoloRewards.registry[0]); document.querySelector('.reward-start-button').click(); const count=document.querySelectorAll('.reward-floater').length; window.FirstVoloRewards.close(); return count; })()`), 4);
  assert.equal(await evaluate("window.__rewardSpeechCount"), 4);
  assert.equal(await evaluate("JSON.stringify(localStorage)"), baselineStorage, "reward play must not change storage");

  await command("Page.navigate", { url: `${preview}?rewardTest=locked` });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await evaluate("document.readyState === 'complete' && Boolean(window.FirstVoloRewards)")) break;
    await pause(100);
  }
  assert.equal(await evaluate(`(() => { const select=document.querySelector('#gradeBandSelect'); select.value='2-3'; select.dispatchEvent(new Event('change',{bubbles:true})); document.querySelector('.migration-map-launch-button').click(); return document.querySelectorAll('.reward-route-stop.is-locked').length; })()`), 3);
  assert.equal(await evaluate("document.querySelectorAll('.reward-route-popover .reward-play-button').length"), 0);
  assert.equal(await evaluate(`(() => { document.querySelector('.migration-my-games-button').click(); return [...document.querySelectorAll('.reward-my-game button')].every(button=>button.disabled); })()`), true);

  console.log(JSON.stringify({ registry: 9, markersPerFlight: 3, unlockedLibrary: 9,
    lockedLaunchers: 0, choicesPerEngine: 4, gameGroups: 3, speechOnceAndReplay: "pass", resolver: "pass", windTerminology: "pass",
    keyboard: "pass", pointer: "pass", storageIsolation: "pass" }, null, 2));
  socket.close(); chrome.kill();
})().catch((error) => { chrome.kill(); console.error(error); process.exitCode = 1; });
