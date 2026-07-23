# 🐍 Snake, Water, Gun — Epic Elemental Showdown

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

An immersive, high-fidelity, full-stack implementation of the classic **Snake, Water, Gun** game. Built with a modern **React (Vite)** frontend and a high-performance **Python FastAPI** backend, this application transforms the traditional console game into a premium web arcade experience.

---

## 🎮 Game Rules
Snake, Water, Gun is an elemental battle similar to Rock-Paper-Scissors:
*   🐍 **Snake** drinks **Water** (Snake wins)
*   💧 **Water** douses and rusts the **Gun** (Water wins)
*   🔫 **Gun** shoots the **Snake** (Gun wins)

The match consists of **5 intense rounds** against the computer. The player with the highest score at the end claims victory!

---

## ✨ Features

### 🎨 Visual & UX Design
*   **Premium Dark Theme:** Built with custom neon accents, smooth gradients, and elegant glassmorphic surfaces (`backdrop-filter`).
*   **Micro-Animations:** Interactive cards featuring elevation translation, responsive shadow glows, pulse indicators, and custom slide-ins.
*   **Fighter Resolution Stage:** A suspenseful head-to-head "VS" arena showing choice cards with active shaking animations during rounds.
*   **Victory Confetti:** Custom lightweight, canvas-free CSS-based particle systems celebrate when you win the match.

### 🎵 In-Browser Audio Synthesis
*   Uses the native **HTML5 Web Audio API** to generate retro arcade sound effects directly in the browser—no external asset downloads required!
*   Custom synthesized sounds for **Match Start**, **UI Clicks**, **Round Wins**, **Round Losses**, and **Round Draws**.
*   Built-in volume toggler in the header.

### ⚙️ Full-Stack Integration
*   **FastAPI Backend:** Handles game session state, random computer choice generation, and win/loss evaluations using clean string-based comparison.
*   **State Persistence:** In-memory tracking synchronizes state seamlessly on reload.
*   **Interactive API Docs:** Auto-generated interactive Swagger UI documents the API out of the box.

---

## 📂 Project Structure
```text
├── run.py                    # Root orchestrator launcher (install & start)
├── main.py                   # Legacy Python console version (preserved)
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # API routes, CORS configs, & game state evaluator
│   └── requirements.txt      # Python dependencies
└── frontend/                 # React Frontend (Vite)
    ├── index.html            # App entry page with custom typography imports
    ├── src/
    │   ├── App.jsx           # App UI layout, state machine, & audio synthesizers
    │   ├── App.css           # Grid layouts, glassmorphism, & keyframe animations
    │   ├── index.css         # Reset rules & design system color tokens
    │   └── main.jsx          # React DOM renderer
    └── vite.config.js        # Vite bundler configurations
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
*   [Python 3.8+](https://www.python.org/)
*   [Node.js (v18+) & npm](https://nodejs.org/)

### ⚡ Quick Start (Automatic)
The root directory includes a launcher script (`run.py`) that handles dependency installations and starts both servers concurrently.

1.  Clone this repository and open the directory:
    ```bash
    git clone https://github.com/your-username/snake-water-gun.git
    cd snake-water-gun
    ```
2.  Launch the servers:
    ```bash
    python run.py
    ```
3.  Open **[http://localhost:5173](http://localhost:5173)** in your browser!

*To stop both servers, simply press `Ctrl + C` in your terminal.*

---

### 🔧 Manual Setup (Separate Terminals)

If you prefer to run or debug the frontend and backend separately:

#### 1. Setup Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*   **API Base URL:** `http://127.0.0.1:8000/api`
*   **Swagger Documentation:** `http://127.0.0.1:8000/docs`

#### 2. Setup Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*   **Frontend URL:** `http://localhost:5173`

---

## 🛠️ Built With
*   **Frontend:** [React](https://react.dev/), [Vite](https://vite.dev/), Vanilla CSS.
*   **Backend:** [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/).
*   **Utilities:** HTML5 Web Audio API, SVG icons.

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
