# 한국 생활 RPG — Korea Life RPG

A 2D cultural guide game for foreigners in Korea, built with HTML/CSS/JS.

## 🚀 How to run

1. Open `index.html` in a web browser — that's it!
2. For chatbot to work, you need to add your Claude API key (see below)

## 🔑 Chatbot setup (one-time)

1. Get a Claude API key from https://console.anthropic.com
2. Copy `js/config.example.js` and rename the copy to `js/config.js`
3. Open `js/config.js` and paste your API key
4. Done! The chatbot will work.

⚠️ **Important:** `js/config.js` is in `.gitignore` — never commit your API key to GitHub. Each team member should create their own `config.js`.

## 📁 Project structure

```
korea-rpg/
├── index.html              ← Main menu (start here)
├── game.html               ← Universal game screen (used for all missions)
├── style.css               ← All styling
├── .gitignore              ← Excludes config.js (API keys)
│
├── js/
│   ├── game.js             ← Core game engine
│   ├── chatbot.js          ← AI helper (Claude API)
│   ├── config.example.js   ← Template for API key (safe to commit)
│   └── config.js           ← YOUR API key (NOT committed to GitHub)
│
├── missions/               ← One file per mission
│   ├── convstore.js
│   ├── exchange.js
│   ├── immigration.js
│   └── lostfound.js
│
└── images/                 ← Scene backgrounds
```

## ✨ Features

- 4 interactive missions teaching Korean daily life
- Branching dialog system with multiple-choice responses
- AI chatbot powered by Claude (context-aware per mission)
- Progress tracking (localStorage)
- Mobile responsive design
- Minimalist Apple/Airbnb-style UI

## ➕ How to add a new mission

1. Create `missions/newmission.js` copying the format of `convstore.js`
2. Add the background image to `images/`
3. Register the mission in `js/game.js` (in `allMissions` object)
4. Add a mission card in `index.html`

## 🎮 Tech stack

- HTML5 / CSS3 / Vanilla JavaScript
- Claude API (Anthropic) for the chatbot
- Google Fonts (Inter, Noto Sans KR)
- No build step, no dependencies — just open and run
