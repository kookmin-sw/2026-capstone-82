// User behavior analytics — writes events to Firestore `events` collection
// Works on both index.html and game.html
// var (not const) so window.Analytics is defined for cross-script checks
var Analytics = (() => {
  let _missionId  = null;
  let _missionStart = null;
  let _stepStart  = null;
  const _sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function getProfile() {
    if (typeof getUserProfile === 'function') return getUserProfile();
    try { return JSON.parse(localStorage.getItem('user_profile')); } catch { return null; }
  }

  function userId(p) {
    if (!p || !p.email) return 'anon';
    return btoa(p.email.toLowerCase().trim())
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  function track(eventType, extra) {
    if (typeof DB === 'undefined' || typeof DB.logEvent !== 'function') return;
    const p = getProfile();
    DB.logEvent(Object.assign({
      sessionId:   _sessionId,
      userId:      userId(p),      // URL-safe base64 hash of email — not reversible in UI
      nationality: p ? p.nationality : null,
      purpose:     p ? p.purpose     : null,
      gender:      p ? p.gender      : null,
      missionId:   _missionId,
      eventType,
      timestamp:   new Date().toISOString(),
    }, extra || {}));
  }

  return {
    // ── Page events ─────────────────────────────────────────
    sessionStart() {
      track('session_start', {
        screenWidth:  window.screen ? window.screen.width  : null,
        screenHeight: window.screen ? window.screen.height : null,
        isMobile:     /Mobi|Android/i.test(navigator.userAgent),
        language:     navigator.language || null,
        referrer:     document.referrer  || null,
      });
    },
    modeChange(newMode) {
      track('mode_change', { newMode });
    },

    // ── User account events ──────────────────────────────────
    userRegistered() {
      track('user_registered');
    },
    userLoggedIn() {
      track('user_logged_in');
    },

    // ── Mission lifecycle ────────────────────────────────────
    missionStart(id) {
      _missionId    = id;
      _missionStart = Date.now();
      _stepStart    = Date.now();
      track('mission_start');
    },
    missionComplete() {
      track('mission_complete', {
        durationMs: _missionStart ? Date.now() - _missionStart : null,
      });
      _missionId = null; _missionStart = null; _stepStart = null;
    },
    // Called when back button is clicked before mission finishes
    missionAbandon() {
      if (!_missionId) return;
      track('mission_abandon', {
        durationMs: _missionStart ? Date.now() - _missionStart : null,
      });
      _missionId = null; _missionStart = null; _stepStart = null;
    },

    // ── In-mission events ────────────────────────────────────
    // label = button text, val = choice value/next key, stepKey = current step id
    choiceMade(label, val, stepKey) {
      const durationMs = _stepStart ? Date.now() - _stepStart : null;
      _stepStart = Date.now();
      track('choice_made', {
        choiceLabel: label,
        choiceVal:   String(val),
        stepKey:     stepKey || null,
        durationMs,
      });
    },
    // Enter key / hint click to advance a scene (no choice buttons)
    sceneAdvance() {
      const durationMs = _stepStart ? Date.now() - _stepStart : null;
      _stepStart = Date.now();
      track('scene_advance', { durationMs });
    },
    // User clicked text area to skip the typewriter animation
    typewriterSkip() {
      track('typewriter_skip');
    },

    // ── Vocabulary events ────────────────────────────────────
    // Tooltip tap during mission dialogue
    vocabTap(word, translation) {
      track('vocab_tap', { word, translation });
    },
    // Card flip in the pre-mission vocab screen
    vocabCardReveal(word, translation) {
      track('vocab_card_reveal', { word, translation });
    },

    // ── Chatbot events ───────────────────────────────────────
    chatbotOpen() {
      track('chatbot_open');
    },
    chatbotQuery(question) {
      track('chatbot_query', { question });
    },
    chatbotError(errorMsg) {
      track('chatbot_error', { error: errorMsg });
    },
  };
})();
