// ===================================================================
// Korea RPG — Game Engine
// This handles all dialog rendering and mission flow.
// It works for ANY mission — just pass in a mission object.
// ===================================================================

// Registry of all missions (filled by mission files)
const allMissions = {
  convstore: convstoreMission,
  exchange: exchangeMission,
  lostfound: lostfoundMission,
  immigration: immigrationMission
};

// Current state
let currentMission = null;
let currentStepKey = 'start';
let isTyping = false;
let waitingForEnter = false;
let missionDone = false;

// DOM references
const bgEl = document.getElementById('background');
const speakerEl = document.getElementById('speaker');
const narrationEl = document.getElementById('narration');
const textEl = document.getElementById('text');
const choicesEl = document.getElementById('choices');
const hintEl = document.getElementById('hint');
const missionCompleteEl = document.getElementById('missionComplete');

// Active choice buttons for keyboard shortcuts
let activeChoices = [];

// ===================================================================
// Parse NPC name from dialog text
// Format: "NPC Name: dialogue text" — narration lines start with (
// ===================================================================
function parseDialog(text) {
  const lines = text.split('\n');
  const last = lines[lines.length - 1];
  const colonIdx = last.indexOf(': ');

  if (
    colonIdx > 0 &&
    colonIdx <= 15 &&
    !last.startsWith('(') &&
    !last.startsWith('"')
  ) {
    return {
      speaker: last.substring(0, colonIdx),
      dialogue: last.substring(colonIdx + 2),
      narration: lines.slice(0, -1).join('\n')
    };
  }

  return { speaker: '', dialogue: text, narration: '' };
}

// ===================================================================
// Typewriter effect — types text letter by letter
// Click or Space to skip
// Bug note: innerText normalizes whitespace on read, collapsing spaces
// between words when used with +=. textContent does not normalize, so
// we use textContent throughout. cancelled flag stops stale timeouts
// that would append characters after a skip.
// ===================================================================
function typeText(text, callback) {
  textEl.textContent = '';
  let i = 0;
  let cancelled = false;
  isTyping = true;

  function step() {
    if (cancelled) return;
    if (i < text.length) {
      textEl.textContent += text[i++];
      setTimeout(step, 30);
    } else {
      isTyping = false;
      if (callback) callback();
    }
  }

  step();

  const skip = () => {
    if (isTyping) {
      cancelled = true;
      textEl.textContent = text;
      isTyping = false;
      if (callback) callback();
    }
  };

  textEl.onclick = skip;
  textEl._skipFn = skip;
}

// ===================================================================
// Render the current step
// ===================================================================
function renderStep() {
  choicesEl.innerHTML = '';
  activeChoices = [];
  hintEl.style.display = 'none';
  waitingForEnter = false;

  const step = currentMission.steps[currentStepKey];
  if (!step) {
    console.error('Step not found:', currentStepKey);
    return;
  }

  // Update background with fade transition
  if (step.background) {
    bgEl.style.opacity = '0';
    setTimeout(() => {
      bgEl.style.backgroundImage = `url('${step.background}')`;
      bgEl.style.opacity = '1';
    }, 400);
  }

  // Parse speaker / narration / dialogue
  const parsed = parseDialog(step.text);

  speakerEl.textContent = parsed.speaker;
  speakerEl.style.display = parsed.speaker ? 'inline-block' : 'none';

  narrationEl.textContent = parsed.narration;
  narrationEl.style.display = parsed.narration ? 'block' : 'none';

  // Type only the dialogue part
  typeText(parsed.dialogue, () => {
    if (step.choices && step.choices.length > 0) {
      step.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        const num = idx + 1;
        btn.innerHTML = `<span class="choice-num">${num}</span>${choice.label}`;
        btn.onclick = () => {
          if (isTyping) return;
          handleChoice(choice);
        };
        choicesEl.appendChild(btn);
        activeChoices.push(choice);
      });
    } else {
      waitingForEnter = true;
      hintEl.style.display = 'block';
    }
  });
}

// ===================================================================
// Handle a choice click
// ===================================================================
function handleChoice(choice) {
  if (choice.next === 'END') {
    showMissionComplete();
  } else {
    currentStepKey = choice.next;
    renderStep();
  }
}

// ===================================================================
// Mission complete — show popup with confetti
// ===================================================================
function showMissionComplete() {
  missionDone = true;

  // Save progress
  localStorage.setItem('cleared_' + currentMission.id, 'true');

  // Update popup text
  document.querySelector('#missionComplete h2').innerText = currentMission.completeTitle;
  document.querySelector('#missionComplete p:first-of-type').innerText = currentMission.completeMessage;

  // Show it
  missionCompleteEl.style.display = 'flex';

  // Confetti!
  for (let i = 0; i < 30; i++) {
    setTimeout(createConfetti, i * 30);
  }
}

function createConfetti() {
  const c = document.createElement('div');
  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
  Object.assign(c.style, {
    position: 'fixed',
    width: '10px',
    height: '10px',
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    left: Math.random() * 100 + '%',
    top: '-10px',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: '1000'
  });

  const tx = (Math.random() - 0.5) * 200;
  const ty = Math.random() * 300 + 200;

  c.animate([
    { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
    { transform: `translate(${tx}px, ${ty}px) rotate(360deg)`, opacity: 0 }
  ], {
    duration: 2000 + Math.random() * 1000,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  });

  document.body.appendChild(c);
  setTimeout(() => c.remove(), 3000);
}

// ===================================================================
// Keyboard shortcuts
//   Space / Enter — skip typing animation or advance (waitingForEnter)
//   1 / 2 / 3 / 4 — select choice by number
//   Enter          — return to menu when mission complete
// ===================================================================
document.addEventListener('keydown', (e) => {
  // Ignore when chatbot input is focused
  if (document.activeElement === document.getElementById('chatbot-input')) return;

  if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    if (isTyping && textEl._skipFn) {
      textEl._skipFn();
    } else if (!isTyping && waitingForEnter) {
      waitingForEnter = false;
      hintEl.style.display = 'none';
      const step = currentMission.steps[currentStepKey];
      if (step && step.nextStep) {
        currentStepKey = step.nextStep;
        renderStep();
      }
    }
  }

  if (e.key === 'Enter') {
    if (missionDone) {
      window.location.href = 'index.html';
    }
  }

  // Number keys 1–4 select choices
  const num = parseInt(e.key);
  if (num >= 1 && num <= activeChoices.length && !isTyping) {
    handleChoice(activeChoices[num - 1]);
  }
});

// ===================================================================
// Start the mission
// ===================================================================
function startMission(missionId) {
  currentMission = allMissions[missionId];
  if (!currentMission) {
    alert('Mission not found: ' + missionId);
    window.location.href = 'index.html';
    return;
  }

  currentStepKey = 'start';
  missionDone = false;

  // Set initial background
  bgEl.style.backgroundImage = `url('${currentMission.background}')`;

  // Tell chatbot about this mission (for context)
  if (window.chatbotSetContext) {
    window.chatbotSetContext(currentMission.helperContext, currentMission.title);
  }

  renderStep();
}

// ===================================================================
// Auto-start: read mission ID from URL (?mission=convstore)
// ===================================================================
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const missionId = params.get('mission');

  if (missionId) {
    startMission(missionId);
  } else {
    alert('No mission specified!');
    window.location.href = 'index.html';
  }
});
