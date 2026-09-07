import React, { useState, useEffect } from 'react';
import './App.css';

// SVGs as inline components for robustness and custom styling
const SnakeIcon = () => (
  <svg viewBox="0 0 100 100" className="card-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 75C30 65 35 60 45 60C55 60 60 55 60 45C60 30 45 25 50 15C55 5 70 8 75 18C80 28 70 38 65 42C60 46 55 50 55 60C55 70 45 75 35 75C25 75 20 80 20 88C20 95 30 95 50 95C70 95 80 88 80 88" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M48 10C48 10 44 7 43 10M52 10C52 10 56 7 57 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

const WaterIcon = () => (
  <svg viewBox="0 0 100 100" className="card-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10C50 10 20 48 20 65C20 81.56 33.44 95 50 95C66.56 95 80 81.56 80 65C80 48 50 10 50 10Z" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M38 65C38 58.4 43.4 53 50 53" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M28 78C33 83 41 86 50 86" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

const GunIcon = () => (
  <svg viewBox="0 0 100 100" className="card-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 48H75V22H60V32H40" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M35 48V75C35 83 25 85 20 80C15 75 18 68 25 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M45 48V58H55V48" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="53" r="2.5" fill="currentColor"/>
    <path d="M75 28H85M75 38H85" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

const VolumeIcon = ({ muted }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {muted ? (
      <>
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </>
    ) : (
      <>
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </>
    )}
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Helper for standalone / Vercel deployment fallback
const evaluateLocalRound = (userChoice, currentState) => {
  const choices = ['snake', 'water', 'gun'];
  const computerChoice = choices[Math.floor(Math.random() * choices.length)];
  let result = 'draw';
  let newUserScore = currentState.userScore;
  let newComputerScore = currentState.computerScore;

  if (userChoice === computerChoice) {
    result = 'draw';
  } else if (
    (userChoice === 'snake' && computerChoice === 'water') ||
    (userChoice === 'water' && computerChoice === 'gun') ||
    (userChoice === 'gun' && computerChoice === 'snake')
  ) {
    result = 'win';
    newUserScore += 1;
  } else {
    result = 'lose';
    newComputerScore += 1;
  }

  const roundLog = {
    round: currentState.currentRound,
    userChoice,
    computerChoice,
    result,
    userScore: newUserScore,
    computerScore: newComputerScore
  };

  const newHistory = [...currentState.history, roundLog];
  const nextRound = currentState.currentRound + 1;
  const isFinished = nextRound > currentState.maxRounds;
  let finalWinner = null;

  if (isFinished) {
    if (newUserScore > newComputerScore) finalWinner = 'user';
    else if (newComputerScore > newUserScore) finalWinner = 'computer';
    else finalWinner = 'draw';
  }

  return {
    computerChoice,
    result,
    userScore: newUserScore,
    computerScore: newComputerScore,
    currentRound: currentState.currentRound,
    isFinished,
    finalWinner,
    history: newHistory
  };
};

// Sound effects generator using Web Audio API
const playSynthSound = (type, enabled) => {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    if (type === 'start') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.5);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start();
      osc.stop(now + 0.5);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start();
      osc.stop(now + 0.08);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 -> E5 -> G5 -> C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.18);
      });
    } else if (type === 'lose') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start();
      osc.stop(now + 0.4);
    } else if (type === 'draw') {
      [0, 0.12].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now + delay);
        gain.gain.setValueAtTime(0.08, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);
        osc.start(now + delay);
        osc.stop(now + delay + 0.07);
      });
    }
  } catch (err) {
    console.error("Audio error: ", err);
  }
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState({
    userScore: 0,
    computerScore: 0,
    currentRound: 1,
    maxRounds: 5,
    history: [],
    isFinished: false,
    finalWinner: null
  });
  
  const [loading, setLoading] = useState(false);
  const [userChoice, setUserChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [showVS, setShowVS] = useState(false);
  
  const [volumeEnabled, setVolumeEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [confetti, setConfetti] = useState([]);

  // Fetch initial state on load if game has already started (in-memory backend sync)
  useEffect(() => {
    fetch(`${API_BASE_URL}/game/state`)
      .then(res => res.json())
      .then(data => {
        // If history contains items, resume the game
        if (data.history.length > 0) {
          setGameState(data);
          setGameStarted(true);
        }
      })
      .catch(err => console.log("Backend offline or not running yet."));
  }, []);

  // Generate Confetti particles when user wins the game
  useEffect(() => {
    if (gameState.isFinished && gameState.finalWinner === 'user') {
      const colors = ['#10b981', '#06b6d4', '#f97316', '#a5b4fc', '#f43f5e'];
      const particles = Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: `${Math.random() * 8 + 6}px`
      }));
      setConfetti(particles);
    } else {
      setConfetti([]);
    }
  }, [gameState.isFinished, gameState.finalWinner]);

  const handleStartGame = async () => {
    playSynthSound('start', volumeEnabled);
    setLoading(true);
    
    const resetState = {
      userScore: 0,
      computerScore: 0,
      currentRound: 1,
      maxRounds: 5,
      history: [],
      isFinished: false,
      finalWinner: null
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${API_BASE_URL}/game/start`, { 
        method: 'POST',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setGameState(data);
      } else {
        setGameState(resetState);
      }
    } catch (err) {
      // Standalone mode (ideal for Vercel deployment)
      setGameState(resetState);
    } finally {
      setGameStarted(true);
      setShowVS(false);
      setUserChoice(null);
      setComputerChoice(null);
      setRoundResult(null);
      setLoading(false);
    }
  };

  const handleMakeChoice = async (choice) => {
    if (loading || showVS) return;
    
    playSynthSound('click', volumeEnabled);
    setLoading(true);
    setUserChoice(choice);
    setComputerChoice(null);
    setRoundResult(null);
    setShowVS(true);

    let roundData = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${API_BASE_URL}/game/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        roundData = await res.json();
      } else {
        roundData = evaluateLocalRound(choice, gameState);
      }
    } catch (err) {
      // Backend unreachable or running on Vercel standalone
      roundData = evaluateLocalRound(choice, gameState);
    }

    // Artificial delay to make the VS screen build suspension
    setTimeout(() => {
      setComputerChoice(roundData.computerChoice);
      setRoundResult(roundData.result);
      setGameState({
        userScore: roundData.userScore,
        computerScore: roundData.computerScore,
        currentRound: roundData.currentRound + 1,
        maxRounds: gameState.maxRounds,
        history: roundData.history,
        isFinished: roundData.isFinished,
        finalWinner: roundData.finalWinner
      });
      
      // Play result sound
      playSynthSound(roundData.result, volumeEnabled);
      setLoading(false);
    }, 1000);
  };

  const handleNextRound = () => {
    playSynthSound('click', volumeEnabled);
    setShowVS(false);
    setUserChoice(null);
    setComputerChoice(null);
    setRoundResult(null);
  };

  const renderIcon = (choice) => {
    switch (choice) {
      case 'snake': return <SnakeIcon />;
      case 'water': return <WaterIcon />;
      case 'gun': return <GunIcon />;
      default: return null;
    }
  };

  const getVerdictText = (result) => {
    switch (result) {
      case 'win': return 'You Win! 🎉';
      case 'lose': return 'Computer Wins! 😔';
      case 'draw': return 'It\'s a Draw! 🤝';
      default: return '';
    }
  };

  const getWinnerDescription = (user, comp, res) => {
    if (res === 'draw') return `Both chose ${user}. Great minds think alike!`;
    
    if (user === 'snake' && comp === 'water') return "Snake drinks the Water! (Snake wins)";
    if (user === 'water' && comp === 'snake') return "Snake drinks the Water! (Computer wins)";
    
    if (user === 'water' && comp === 'gun') return "Water douses and rusts the Gun! (Water wins)";
    if (user === 'gun' && comp === 'water') return "Water douses and rusts the Gun! (Computer wins)";
    
    if (user === 'gun' && comp === 'snake') return "Gun shoots the Snake! (Gun wins)";
    if (user === 'snake' && comp === 'gun') return "Gun shoots the Snake! (Computer wins)";
    
    return '';
  };

  return (
    <div className="game-container">
      {/* Confetti canvas for victory */}
      {confetti.length > 0 && (
        <div className="confetti-container">
          {confetti.map(p => (
            <div
              key={p.id}
              className="confetti-particle"
              style={{
                left: p.left,
                animationDelay: p.delay,
                backgroundColor: p.color,
                width: p.size,
                height: p.size
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="game-header">
        <div className="brand">
          <h1>SNAKE WATER GUN</h1>
          <p>The elemental showdown of strategic wits</p>
        </div>
        <div className="controls">
          <button
            className="icon-btn"
            onClick={() => setVolumeEnabled(!volumeEnabled)}
            aria-label="Toggle Sound"
            title="Toggle Sound"
          >
            <VolumeIcon muted={!volumeEnabled} />
          </button>
          <button
            className="icon-btn"
            onClick={() => setShowRules(true)}
            aria-label="View Rules"
            title="View Rules"
          >
            <HelpIcon />
          </button>
          {gameStarted && !gameState.isFinished && (
            <button className="text-btn" onClick={handleStartGame}>
              Restart Match
            </button>
          )}
        </div>
      </header>

      {/* Intro Screen */}
      {!gameStarted && (
        <main className="glass-card intro-screen">
          <div className="intro-icons">
            <div className="intro-icon-wrapper snake"><SnakeIcon /></div>
            <div className="intro-icon-wrapper water"><WaterIcon /></div>
            <div className="intro-icon-wrapper gun"><GunIcon /></div>
          </div>
          <h2>Are you ready to battle?</h2>
          <p>
            An ancient game of prediction and strategy. Play 5 intense rounds against the computer.
            Choose your elements wisely to claim victory.
          </p>
          <button className="play-btn" onClick={handleStartGame}>
            START MATCH
          </button>
        </main>
      )}

      {/* Game Over Screen */}
      {gameStarted && gameState.isFinished && (
        <div className="overlay">
          <div className="glass-card game-over-screen">
            <div className={`game-over-banner ${gameState.finalWinner}`}>
              {gameState.finalWinner === 'user' ? 'VICTORY!' : gameState.finalWinner === 'computer' ? 'DEFEAT!' : 'DRAW!'}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
              {gameState.finalWinner === 'user'
                ? '🎉 Incredible! You outsmarted the machine!'
                : gameState.finalWinner === 'computer'
                ? '😔 The computer proved to be superior this time.'
                : '🤝 A perfectly balanced duel. Play again to break the tie!'}
            </p>

            <div className="game-over-scores">
              <div className="over-score user">
                <span className="score-label">YOU</span>
                <span className="val">{gameState.userScore}</span>
              </div>
              <div className="over-divider">VS</div>
              <div className="over-score comp">
                <span className="score-label">CPU</span>
                <span className="val">{gameState.computerScore}</span>
              </div>
            </div>

            <button className="play-btn" onClick={handleStartGame}>
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Active Game Screen */}
      {gameStarted && !gameState.isFinished && (
        <main className="game-grid">
          {/* Main Battle Arena */}
          <div className="arena">
            {/* Scorecard */}
            <section className="glass-card score-board">
              <div className="score-card">
                <span className="score-label">YOU</span>
                <span className="score-val" style={{ color: roundResult === 'win' && showVS && computerChoice ? 'var(--color-win)' : 'inherit' }}>
                  {gameState.userScore}
                </span>
              </div>
              <div className="round-indicator">
                <span className="round-badge">
                  ROUND {Math.min(gameState.currentRound, gameState.maxRounds)} / {gameState.maxRounds}
                </span>
              </div>
              <div className="score-card">
                <span className="score-label">CPU</span>
                <span className="score-val" style={{ color: roundResult === 'lose' && showVS && computerChoice ? 'var(--color-lose)' : 'inherit' }}>
                  {gameState.computerScore}
                </span>
              </div>
            </section>

            {/* Play Screen */}
            <section className="glass-card play-zone">
              {!showVS ? (
                <>
                  <h3>Choose your weapon</h3>
                  <div className="choice-row">
                    <button className="choice-card snake" onClick={() => handleMakeChoice('snake')}>
                      <SnakeIcon />
                      <span className="card-name">Snake</span>
                    </button>
                    <button className="choice-card water" onClick={() => handleMakeChoice('water')}>
                      <WaterIcon />
                      <span className="card-name">Water</span>
                    </button>
                    <button className="choice-card gun" onClick={() => handleMakeChoice('gun')}>
                      <GunIcon />
                      <span className="card-name">Gun</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="battle-arena">
                  <div className="battle-stage">
                    <div className="battle-fighter">
                      <span className="fighter-badge">You</span>
                      <div className={`fighter-card ${userChoice}`}>
                        {renderIcon(userChoice)}
                      </div>
                      <span className="card-name">{userChoice}</span>
                    </div>

                    <div className="battle-vs">VS</div>

                    <div className="battle-fighter">
                      <span className="fighter-badge">CPU</span>
                      <div className={`fighter-card ${computerChoice ? computerChoice : 'pending'}`}>
                        {computerChoice ? renderIcon(computerChoice) : '?'}
                      </div>
                      <span className="card-name">{computerChoice ? computerChoice : 'thinking...'}</span>
                    </div>
                  </div>

                  {computerChoice && (
                    <div className="battle-result-banner">
                      <h4 className={`result-verdict ${roundResult}`}>
                        {getVerdictText(roundResult)}
                      </h4>
                      <p className="result-description">
                        {getWinnerDescription(userChoice, computerChoice, roundResult)}
                      </p>
                      <button className="next-round-btn" onClick={handleNextRound}>
                        {gameState.currentRound > gameState.maxRounds ? 'Finish Match' : 'Next Round'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Match Log */}
          <aside className="sidebar">
            <section className="glass-card log-panel">
              <h3>Battle Log</h3>
              <div className="logs-scroll">
                {gameState.history.length === 0 ? (
                  <div className="empty-logs">No rounds played yet. Make your first move!</div>
                ) : (
                  [...gameState.history].reverse().map((log) => (
                    <div className="log-item" key={log.round}>
                      <span className="log-round">R{log.round}</span>
                      <div className="log-moves">
                        <span className="move-tag user">{log.userChoice}</span>
                        <span style={{color: 'var(--text-secondary)'}}>vs</span>
                        <span className="move-tag comp">{log.computerChoice}</span>
                      </div>
                      <span className={`log-result ${log.result}`}>
                        {log.result === 'win' ? 'WIN' : log.result === 'lose' ? 'LOSE' : 'DRAW'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </main>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="overlay" onClick={() => setShowRules(false)}>
          <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowRules(false)} aria-label="Close rules">
              &times;
            </button>
            <h3>Game Rules</h3>
            <div className="rules-grid">
              <div className="rule-row">
                <div className="rule-icon snake">🐉</div>
                <div className="rule-text">
                  <strong>Snake</strong> drinks <strong>Water</strong>. (Snake Wins)
                </div>
              </div>
              <div className="rule-row">
                <div className="rule-icon water">💧</div>
                <div className="rule-text">
                  <strong>Water</strong> douses and rusts the <strong>Gun</strong>. (Water Wins)
                </div>
              </div>
              <div className="rule-row">
                <div className="rule-icon gun">🔫</div>
                <div className="rule-text">
                  <strong>Gun</strong> shoots <strong>Snake</strong>. (Gun Wins)
                </div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>
              The game consists of 5 rounds. Highest score wins!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
