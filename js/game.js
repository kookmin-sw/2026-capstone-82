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
const textEl = document.getElementById('text');
const choicesEl = document.getElementById('choices');
const hintEl = document.getElementById('hint');
const missionCompleteEl = document.getElementById('missionComplete');

// ===================================================================
// Typewriter effect — types text letter by letter
// ===================================================================
function typeText(text, callback) {
  textEl.innerText = '';
  let i = 0;
  isTyping = true;

  function step() {
    if (i < text.length) {
      textEl.innerText += text[i++];
      setTimeout(step, 30);
    } else {
      isTyping = false;
      if (callback) callback();
    }
  }

  step();

  // Click text to skip typing animation
  textEl.onclick = () => {
    if (isTyping) {
      textEl.innerText = text;
      isTyping = false;
      if (callback) callback();
    }
  };
}

// ===================================================================
// Render the current step
// ===================================================================
function renderStep() {
  // Clear old choices
  choicesEl.innerHTML = '';
  hintEl.style.display = 'none';
  waitingForEnter = false;

  const step = currentMission.steps[currentStepKey];
  if (!step) {
    console.error('Step not found:', currentStepKey);
    return;
  }

  // Update background if this step has one
  if (step.background) {
    bgEl.style.backgroundImage = `url('${step.background}')`;
  }

  // Type out the text
  typeText(step.text, () => {
    // If step has choices, show them as buttons
    if (step.choices && step.choices.length > 0) {
      step.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.innerText = choice.label;
        btn.onclick = () => {
          if (isTyping) return;
          handleChoice(choice);
        };
        choicesEl.appendChild(btn);
      });
    } else {
      // No choices — wait for Enter
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
// Keyboard: Enter to advance / return to menu
// ===================================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (missionDone) {
      window.location.href = 'index.html';
    } else if (!isTyping && waitingForEnter) {
      // Advance to next step if no choices
      // (Not used in current missions, but supported)
    }
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
