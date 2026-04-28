# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

No build step required. Open `korea-rpg/index.html` directly in a browser (double-click or `open korea-rpg/index.html`).

For the AI chatbot to work, copy `js/config.example.js` → `js/config.js` and paste a Claude API key. `config.js` is gitignored and must never be committed.

## Architecture

This is a pure HTML/CSS/Vanilla-JS game — no framework, no bundler, no npm.

### Page flow
- `index.html` — main menu; reads mission completion from `localStorage` and shows progress. Navigates to `game.html?mission=<id>` on card click.
- `game.html` — universal game screen used for all missions. Reads the `?mission=` URL param and calls `startMission(id)`.

### Script loading order in game.html
All four mission files load first (they define globals like `convstoreMission`), then `game.js` (which reads those globals into `allMissions`), then `config.js`, then `chatbot.js`. Order matters — do not reorder these `<script>` tags.

### Game engine (`js/game.js`)
- `allMissions` — registry mapping mission ID strings to mission objects (defined in each `missions/*.js` file).
- `startMission(id)` — entry point; sets `currentMission`, calls `chatbotSetContext`, kicks off `renderStep()`.
- `renderStep()` — reads `currentMission.steps[currentStepKey]`, runs the typewriter animation, then renders choice buttons or waits for Enter.
- `handleChoice(choice)` — advances `currentStepKey` or triggers `showMissionComplete()` when `next === 'END'`.
- Mission completion is saved as `localStorage.setItem('cleared_<id>', 'true')`.

### Mission data format (`missions/*.js`)
Each file exports one `const <name>Mission = { id, title, background, helperContext, steps, completeTitle, completeMessage }`. Steps are a flat object keyed by step name; each step has `{ text, choices[], background? }`. A choice with `next: 'END'` ends the mission.

### AI chatbot (`js/chatbot.js`)
Calls the Claude API directly from the browser using `anthropic-dangerous-direct-browser-access: true`. Uses `claude-haiku-4-5-20251001`. The system prompt is rebuilt per-message from `missionContext` (set by `chatbotSetContext`). Chat history is maintained per mission session in `chatHistory[]`.

## Adding a new mission

1. Create `missions/<id>.js` following the pattern in `missions/convstore.js`.
2. Add the background image to `images/`.
3. Register the mission in `js/game.js` → `allMissions` object.
4. Add a `<script src="missions/<id>.js">` tag in `game.html` **before** the `game.js` script tag.
5. Add a mission card in `index.html` with `onclick="goMission('<id>')"` and a matching `id="status-<id>"` span.

## Known issues and pitfalls

- **Enter key hint is a dead stub** — `#hint` shows "[Enter] 계속" but the `keydown` handler in `game.js:171` is empty. The hint is never actually functional in any current mission; do not add missions that rely on `waitingForEnter`.
- **`chatHistory` is unbounded** — `chatbot.js` accumulates every message in `chatHistory[]` with no trim. Long sessions will eventually exceed the API's context window. Cap at ~20 messages if extending the chatbot.
- **`background-image` CSS transition does not animate** — `style.css` declares `transition: background-image 0.5s ease` on `#background`, but browsers do not interpolate between two `background-image` values. Background changes are instant despite the transition rule.
- **Nested `.git` in `korea-rpg/`** — `korea-rpg/` contains its own `.git` directory (it was originally a standalone repo). The outer repo treats it as a plain directory. Do not run git commands from inside `korea-rpg/` expecting them to affect the outer repo.
- **`sendToClaud` typo** — the API call function in `chatbot.js` is named `sendToClaud` (missing final 'e'). Do not rename without updating all call sites.
- **Global `button` selector** — `style.css` sets `width: 100%` on all `button` elements. Any new button added outside `#choices` needs an explicit `width: auto` override.
