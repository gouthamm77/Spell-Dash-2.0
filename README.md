# 👑 Spell & Dash: The Queen's Rescue

> A modern, real-time multiplayer typing race adventure built with React, Tailwind CSS, Vite, Lucide Icons, and Node.js + Socket.io.

---

## 🎮 About The Game

**Spell & Dash** is an engaging, kid-friendly typing race adventure where heroes race across enchanted parallel lanes to battle monsters, shatter obstacles with rapid typing precision, and rescue the Queen trapped at the Royal Keep!

### 🌟 Key Features

- 🏎️ **Dynamic Multi-Lane Track:** Vertically stacked horizontal lanes that adapt to 1 to 4+ players or AI bots.
- 🧙‍♂️ **4 Elemental Hero Avatars:**
  - 🛡️ **Emerald Knight** (Nature / Shield)
  - 🏹 **Ruby Valkyrie** (Fire / Bow)
  - 🔮 **Sapphire Wizard** (Arcane / Orb)
  - ⚔️ **Golden Paladin** (Light / Blade)
- 🌐 **Real-Time Multiplayer Lobby:**
  - Create or join rooms via shareable 4-letter Room Codes (e.g., `HERO`, `CAST`).
  - Synchronized `3... 2... 1... GO!` countdown.
  - Zero-lag keystroke and progress broadcasting.
- 🤖 **Solo Quest Mode & AI Bots:**
  - Play offline or solo against realistic AI rivals with difficulty levels:
    - Apprentice (25 WPM)
    - Knight (45 WPM)
    - Champion (70 WPM)
- 🗺️ **Long Course & Panoramic Mini-Map:**
  - Course lengths: **Sprint (800m)**, **Grand Rescue (1,400m)**, or **Royal Marathon (2,000m)**.
  - Real-time global course mini-map plotting all racers across environmental checkpoints.
- ⌨️ **Responsive Combat & Typing Engine:**
  - Auto-focused keyboard input — no manual clicking needed.
  - Letter-by-letter neon emerald glow and gentle wobble feedback on typos.
  - Live WPM gauge, accuracy tracking, and streak combo multipliers.
- 🏆 **Grand Victory Ceremony:**
  - 1st, 2nd, and 3rd place podium standings.
  - Queen crowning animation and comprehensive scorecards.
  - Instant rematch support.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gouthamm77/Spell-Dash-2.0.git
   cd Spell-Dash-2.0
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Socket.io multiplayer server:**
   ```bash
   npm run server
   ```
   *(Runs on port 3001)*

4. **Start the Vite development client:**
   ```bash
   npm run dev
   ```
   *(Runs on port 5173)*

5. Open [http://localhost:5173/](http://localhost:5173/) in your browser and start racing!

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React
- **Backend:** Node.js, Socket.io
- **Styling:** Custom cartoon keyframe animations, dark fantasy glassmorphism, pure CSS/SVG visuals (zero external image dependencies)

---

## 📜 License
MIT License
