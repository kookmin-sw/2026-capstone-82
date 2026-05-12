// ===================================================================
// Korea RPG — Game Engine
// Supports two mission formats:
//   1. steps-based  — mission has a `steps` object (convstore, exchange, etc.)
//   2. scene-based  — mission has a `sceneFn()` that calls global helpers
// ===================================================================

const allMissions = {
  convstore:   convstoreMission,
  exchange:    exchangeMission,
  lostfound:   lostfoundMission,
  immigration: immigrationMission,
  subway:      subwayMission,
  bank:        bankMission,
  telecom:     telecomMission,
  clothing:    clothingMission,
  realestate:  realestateMission,
  hospital:    hospitalMission,
  pharmacy:    pharmacyMission,
  garbage:     garbageMission,
};

// Current state
let currentMission = null;
let currentStepKey = 'start';
let isTyping = false;
let waitingForEnter = false;
let missionDone = false;

// Scene-based callbacks
let enterCallback = null;
let choiceCallback = null;

// ===================================================================
// Fixed-position vocab tooltip (escapes all overflow clipping)
// ===================================================================
let vocabTooltipEl = null;

function getVocabTooltip() {
  if (!vocabTooltipEl) {
    vocabTooltipEl = document.createElement('div');
    vocabTooltipEl.id = 'vocab-tooltip';
    document.body.appendChild(vocabTooltipEl);
  }
  return vocabTooltipEl;
}

function showVocabTooltip(tipSpan) {
  const tt = getVocabTooltip();
  tt.textContent = tipSpan.dataset.en;
  tt.style.visibility = 'hidden';
  tt.style.display = 'block';

  const rect    = tipSpan.getBoundingClientRect();
  const ttW     = tt.offsetWidth;
  const ttH     = tt.offsetHeight;
  const margin  = 8;

  let top  = rect.top - ttH - margin;
  let left = rect.left + rect.width / 2 - ttW / 2;

  if (top < margin) top = rect.bottom + margin;
  left = Math.max(margin, Math.min(left, window.innerWidth - ttW - margin));

  tt.style.top        = top  + 'px';
  tt.style.left       = left + 'px';
  tt.style.visibility = '';
  tt.classList.add('visible');
}

function hideVocabTooltip() {
  if (vocabTooltipEl) {
    vocabTooltipEl.classList.remove('visible');
    vocabTooltipEl.style.display = 'none';
  }
}

// DOM
const bgEl            = document.getElementById('background');
const textEl          = document.getElementById('text');
const choicesEl       = document.getElementById('choices');
const hintEl          = document.getElementById('hint');
const missionCompleteEl = document.getElementById('missionComplete');

hintEl.addEventListener('click', () => {
  if (isTyping) return;
  if (missionDone) { window.location.href = 'index.html'; return; }
  if (!waitingForEnter) return;
  if (window.Analytics) Analytics.sceneAdvance();
  if (enterCallback) {
    const cb = enterCallback;
    enterCallback = null;
    waitingForEnter = false;
    clearChoices();
    cb();
  } else {
    waitingForEnter = false;
  }
});

missionCompleteEl.addEventListener('click', () => {
  if (missionDone) window.location.href = 'index.html';
});

// ===================================================================
// Shared helpers (used by both step-based and scene-based missions)
// ===================================================================

function clearChoices() {
  choicesEl.innerHTML = '';
  hintEl.style.display = 'none';
  waitingForEnter = false;
  enterCallback = null;
  choiceCallback = null;
}

function addChoice(text, val) {
  const btn = document.createElement('button');
  btn.innerText = text;
  btn.onclick = () => {
    if (isTyping) return;
    if (choiceCallback) {
      if (window.Analytics) Analytics.choiceMade(text, val, null);
      const cb = choiceCallback;
      choiceCallback = null;
      cb(val);
    }
  };
  choicesEl.appendChild(btn);
}

// Desktop-only position overrides (default CSS is 'top center').
// Use when an image has too much empty space at the top on wide screens.
const desktopPos = {
  'images/LostAndFound.webp':        'center center',  // lostfound 2nd — too much ceiling
  'images/bank_informationdesk.webp':'center center',  // bank 1st — subject centered vertically
  'images/bank_counter.webp':        'center center',  // bank 3rd — subject centered vertically
};

// Per-image crop anchors for portrait mobile.
// On portrait phones, cover shows ~37% of a landscape image's width.
// These values shift the visible strip left (small %) or right (large %)
// so the scene's subject stays in frame instead of being cropped off.
const mobileCropX = {
  // exchange
  'images/MoneyExchange.webp':        '20%',  // exchange clerk — LEFT
  // convstore / garbage
  'images/ConvStoreInside.webp':      '80%',  // store clerk — RIGHT
  // subway
  'images/subway_entrance.webp':      '80%',  // entrance — RIGHT
  'images/subway_card.webp':          '80%',  // card machine — RIGHT
  'images/subway_card_friend.webp':   '80%',  // friend — RIGHT
  'images/subway_platform.webp':      '20%',  // platform — LEFT
  'images/subway_inside_00.webp':     '80%',  // train interior — RIGHT
  'images/subway_inside_01.webp':     '80%',  // train interior — RIGHT
  'images/subway_arrive.webp':        '80%',  // station arrival — RIGHT
  // telecom
  'images/telecom_shop.webp':         '20%',  // store clerk — LEFT
  'images/telecom_counter.webp':      '80%',  // counter clerk — RIGHT
  // immigration
  'images/Information_desk.webp':     '30%',  // info desk — slightly LEFT
  'images/Immigration_RegDesk.webp':  '30%',  // registration desk — slightly LEFT
  // bank
  'images/bank_informationdesk.webp': '80%',  // info desk clerk — RIGHT
  'images/bank_counter.webp':         '20%',  // counter clerk — LEFT
  // realestate
  'images/real_estate.webp':          '20%',  // exterior — LEFT
  'images/real_estate_office.webp':   '20%',  // office — LEFT
  'images/room_visit_B.webp':         '20%',  // room B — LEFT
  // hospital
  'images/hospital_lobby.webp':       '20%',  // reception desk — LEFT
  'images/hospital_doctor.webp':      '80%',  // doctor — RIGHT
  // clothing
  'images/clothing_store.webp':       '20%',  // store overview — LEFT
  'images/clothing_counter.webp':     '20%',  // counter — LEFT
};

function changeBackground(img) {
  bgEl.style.backgroundImage = `url('${img}')`;
  if (window.matchMedia('(max-width: 640px) and (orientation: portrait)').matches) {
    bgEl.style.backgroundPosition = (mobileCropX[img] || '50%') + ' center';
  } else {
    bgEl.style.backgroundPosition = desktopPos[img] || '';
  }
}

// Wait for Enter key, then run callback
function waitEnterThen(cb) {
  choicesEl.innerHTML = '';
  hintEl.style.display = 'block';
  waitingForEnter = true;
  enterCallback = cb;
}

// Next addChoice click will pass its val to cb
function waitForChoice(cb) {
  choiceCallback = cb;
}

// ===================================================================
// Vocab tooltips — applied to dialogue text after typing completes
// ===================================================================
function applyVocabTooltips(text) {
  if (!currentMission || !currentMission.vocabulary || !currentMission.vocabulary.length) return;

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  // Longest match first so '안내원' is wrapped before the shorter '원' is checked
  const vocab = [...currentMission.vocabulary].sort((a, b) => b.kr.length - a.kr.length);

  vocab.forEach(({ kr, en }) => {
    const safeEn = en.replace(/"/g, '&quot;');
    const escaped = kr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Negative lookbehind for Hangul syllable (가-힣):
    // prevents matching '원' inside '직원', '안내원', etc.
    const regex = new RegExp(`(?<![\\uAC00-\\uD7A3])${escaped}`, 'g');

    html = html.replace(regex, (match, offset, string) => {
      // Skip matches inside an HTML tag / attribute (between < and >)
      const before = string.slice(0, offset);
      if (before.lastIndexOf('<') > before.lastIndexOf('>')) return match;
      return `<span class="word-tip" data-en="${safeEn}">${match}</span>`;
    });
  });

  textEl.innerHTML = html;
}

// ===================================================================
// Typewriter effect
// ===================================================================
function typeText(text, callback) {
  textEl.textContent = '';
  let i = 0;
  isTyping = true;
  let done = false;

  function finish() {
    done = true;
    isTyping = false;
    applyVocabTooltips(text);
    if (callback) callback();
  }

  function tick() {
    if (done) return;
    if (i < text.length) {
      textEl.textContent += text[i++];
      setTimeout(tick, 30);
    } else {
      finish();
    }
  }

  tick();

  // Click/tap on a tooltip word → show fixed tooltip; click elsewhere → hide + skip animation
  textEl.onclick = (e) => {
    const tip = e.target.closest('.word-tip');
    if (tip) {
      const wasActive = tip.classList.contains('active');
      textEl.querySelectorAll('.word-tip.active').forEach(t => { if (t !== tip) t.classList.remove('active'); });
      hideVocabTooltip();
      tip.classList.toggle('active');
      if (!wasActive) showVocabTooltip(tip);
      if (window.Analytics) Analytics.vocabTap(tip.textContent, tip.dataset.en);
      return;
    }
    textEl.querySelectorAll('.word-tip.active').forEach(t => t.classList.remove('active'));
    hideVocabTooltip();
    if (isTyping) {
      if (window.Analytics) Analytics.typewriterSkip();
      textEl.textContent = text;
      finish();
    }
  };
}

// ===================================================================
// Step-based rendering (for missions that use `steps`)
// ===================================================================
function renderStep() {
  clearChoices();

  const step = currentMission.steps[currentStepKey];
  if (!step) { console.error('Step not found:', currentStepKey); return; }

  if (step.background) changeBackground(step.background);

  typeText(step.text, () => {
    if (step.choices && step.choices.length > 0) {
      step.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.innerText = choice.label;
        btn.onclick = () => { if (!isTyping) handleChoice(choice); };
        choicesEl.appendChild(btn);
      });
    } else {
      waitingForEnter = true;
      hintEl.style.display = 'block';
    }
  });
}

function handleChoice(choice) {
  if (window.Analytics) Analytics.choiceMade(choice.label, choice.next, currentStepKey);
  if (choice.next === 'END') {
    showMissionComplete();
  } else {
    currentStepKey = choice.next;
    renderStep();
  }
}

// ===================================================================
// Mission complete
// ===================================================================
function showMissionComplete() {
  if (window.Analytics) Analytics.missionComplete();
  missionDone = true;
  localStorage.setItem('cleared_' + currentMission.id, 'true');
  document.querySelector('#missionComplete h2').innerText = currentMission.completeTitle;
  document.querySelector('#missionComplete p:first-of-type').innerText = currentMission.completeMessage;
  missionCompleteEl.style.display = 'flex';
  for (let i = 0; i < 30; i++) setTimeout(createConfetti, i * 30);
}

function createConfetti() {
  const c = document.createElement('div');
  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
  Object.assign(c.style, {
    position: 'fixed', width: '10px', height: '10px',
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    left: Math.random() * 100 + '%', top: '-10px',
    borderRadius: '50%', pointerEvents: 'none', zIndex: '1000'
  });
  const tx = (Math.random() - 0.5) * 200, ty = Math.random() * 300 + 200;
  c.animate(
    [{ transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
     { transform: `translate(${tx}px,${ty}px) rotate(360deg)`, opacity: 0 }],
    { duration: 2000 + Math.random() * 1000, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)' }
  );
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 3000);
}

// ===================================================================
// Keyboard input
// ===================================================================
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (missionDone) {
    window.location.href = 'index.html';
  } else if (!isTyping && waitingForEnter) {
    if (window.Analytics) Analytics.sceneAdvance();
    if (enterCallback) {
      const cb = enterCallback;
      enterCallback = null;
      waitingForEnter = false;
      clearChoices();
      cb();
    } else {
      // step-based: advance (unused currently, kept for future steps with no choices)
      waitingForEnter = false;
    }
  }
});

// ===================================================================
// Vocabulary screen (shown before mission starts)
// ===================================================================
function showVocabScreen(onComplete) {
  const screen = document.getElementById('vocab-screen');
  const label  = document.getElementById('vocab-mission-label');
  const grid   = document.getElementById('vocab-grid');

  if (label) label.textContent = currentMission.title;
  grid.innerHTML = '';

  currentMission.vocabulary.forEach(({ kr, en, rom }) => {
    const card = document.createElement('div');
    card.className = 'vocab-card';
    card.innerHTML =
      `<span class="vocab-kr">${kr}</span>` +
      (rom ? `<span class="vocab-rom">${rom}</span>` : '') +
      `<span class="vocab-divider"></span>` +
      `<span class="vocab-en">${en}</span>`;
    card.addEventListener('click', () => {
      const wasRevealed = card.classList.contains('revealed');
      card.classList.toggle('revealed');
      if (!wasRevealed && window.Analytics) Analytics.vocabCardReveal(kr, en);
    });
    grid.appendChild(card);
  });

  document.getElementById('vocab-start-btn').onclick = () => {
    screen.style.display = 'none';
    onComplete();
  };

  screen.style.display = 'flex';
}

function beginMission() {
  if (currentMission.sceneFn) {
    currentMission.sceneFn();
  } else {
    renderStep();
  }
}

// ===================================================================
// Image preloading — kicks off before vocab screen so images are
// cached by the time the first scene renders
// ===================================================================
function preloadMissionImages(mission) {
  let urls = [];
  if (mission.images && mission.images.length) {
    urls = mission.images;
  } else if (mission.steps) {
    const seen = new Set();
    if (mission.background) seen.add(mission.background);
    Object.values(mission.steps).forEach(step => {
      if (step.background) seen.add(step.background);
    });
    urls = [...seen];
  } else if (mission.background) {
    urls = [mission.background];
  }
  urls.forEach(url => { const img = new Image(); img.src = url; });
}

// ===================================================================
// Start mission
// ===================================================================
function startMission(missionId) {
  currentMission = allMissions[missionId];
  if (!currentMission) {
    alert('Mission not found: ' + missionId);
    window.location.href = 'index.html';
    return;
  }

  preloadMissionImages(currentMission);
  if (window.Analytics) Analytics.missionStart(missionId);
  currentStepKey = 'start';
  missionDone = false;
  changeBackground(currentMission.background);

  const hudTitle = document.getElementById('hud-title');
  if (hudTitle) hudTitle.textContent = currentMission.title;

  if (window.chatbotSetContext) {
    window.chatbotSetContext(currentMission.helperContext, currentMission.title);
  }

  if (currentMission.vocabulary && currentMission.vocabulary.length > 0) {
    showVocabScreen(() => beginMission());
  } else {
    beginMission();
  }
}

window.addEventListener('load', () => {
  const missionId = new URLSearchParams(window.location.search).get('mission');
  if (missionId) {
    startMission(missionId);
  } else {
    alert('No mission specified!');
    window.location.href = 'index.html';
  }
});
