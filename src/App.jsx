import React, { useState, useEffect, useRef, useCallback } from 'react';
import { socketService } from './services/socket';
import Lobby from './components/Lobby';
import RaceTrack from './components/RaceTrack';
import TypingInput from './components/TypingInput';
import CountdownOverlay from './components/CountdownOverlay';
import PodiumModal from './components/PodiumModal';
import { TOTAL_MONSTERS } from './data/gameData';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [room, setRoom] = useState(null);
  const [monsters, setMonsters] = useState([]);
  const [gameState, setGameState] = useState('lobby'); // 'lobby' | 'countdown' | 'racing' | 'finished'
  const [countdownSecs, setCountdownSecs] = useState(3);

  // Active Player Typing State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [playerInput, setPlayerInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [isWobbling, setIsWobbling] = useState(false);
  const [raceStartTime, setRaceStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);

  // Bot simulation loop ref
  const botIntervalRef = useRef(null);

  // Connect to socket service on mount
  useEffect(() => {
    socketService.connect();

    const unsubConn = socketService.on('connection_change', ({ connected, socketId }) => {
      setIsConnected(connected);
      if (socketId) setPlayerId(socketId);
    });

    const unsubRoom = socketService.on('room_updated', (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.state === 'lobby') {
        setGameState('lobby');
      }
    });

    const unsubCountdown = socketService.on('game_countdown', ({ countdownSeconds, monsters: mList, room: r }) => {
      setMonsters(mList);
      setRoom(r);
      setCountdownSecs(countdownSeconds || 3);
      setGameState('countdown');
      // Reset typing state
      setCurrentWordIndex(0);
      setPlayerInput('');
      setStreak(0);
      setTotalTyped(0);
      setTotalErrors(0);
      setWpm(0);
    });

    const unsubStarted = socketService.on('game_started', ({ startTime, monsters: mList, room: r }) => {
      setMonsters(mList);
      setRoom(r);
      setRaceStartTime(startTime);
      setGameState('racing');
    });

    const unsubOpponent = socketService.on('opponent_progress', (payload) => {
      setRoom(prev => {
        if (!prev) return prev;
        const updatedPlayers = prev.players.map(p => {
          if (p.id === payload.playerId) {
            return {
              ...p,
              currentWordIndex: payload.currentWordIndex,
              progress: payload.progress,
              wpm: payload.wpm,
              accuracy: payload.accuracy,
              rank: payload.rank
            };
          }
          return p;
        });
        return { ...prev, players: updatedPlayers };
      });
    });

    const unsubFinished = socketService.on('player_finished', ({ player, rank }) => {
      setRoom(prev => {
        if (!prev) return prev;
        const updatedPlayers = prev.players.map(p => (p.id === player.id ? { ...p, finishTime: Date.now(), rank } : p));
        return { ...prev, players: updatedPlayers };
      });
    });

    const unsubEnded = socketService.on('race_ended', ({ room: finalRoom }) => {
      setRoom(finalRoom);
      setGameState('finished');
    });

    const unsubError = socketService.on('error', (msg) => {
      alert(msg);
    });

    return () => {
      unsubConn();
      unsubRoom();
      unsubCountdown();
      unsubStarted();
      unsubOpponent();
      unsubFinished();
      unsubEnded();
      unsubError();
    };
  }, []);

  // ─── AI BOT SIMULATION RUNNER ───
  // Automatically runs realistic typing simulation for AI bots when racing
  useEffect(() => {
    if (gameState !== 'racing' || !room || monsters.length === 0) {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
      return;
    }

    const botSpeeds = {
      apprentice: { wpm: 26, errorChance: 0.08, intervalMs: 260 },
      knight: { wpm: 46, errorChance: 0.04, intervalMs: 160 },
      champion: { wpm: 72, errorChance: 0.02, intervalMs: 100 }
    };

    botIntervalRef.current = setInterval(() => {
      setRoom(prev => {
        if (!prev || prev.state !== 'racing') return prev;

        let allFinished = true;
        const updatedPlayers = prev.players.map(p => {
          if (!p.isBot || p.progress >= 100) {
            if (!p.finishTime) allFinished = false;
            return p;
          }

          allFinished = false;
          const config = botSpeeds[p.difficulty] || botSpeeds.knight;
          const currentMonster = monsters[p.currentWordIndex || 0];
          if (!currentMonster) return p;

          // Realistic occasional hesitation
          if (Math.random() < 0.15) return p;

          const newTypedChars = (p.typedChars || 0) + 1;
          const wordLength = currentMonster.word.length;

          if (newTypedChars >= wordLength) {
            // Bot cleared a monster!
            const newWordIndex = (p.currentWordIndex || 0) + 1;
            const progress = Math.min(100, Math.round((newWordIndex / monsters.length) * 100));
            const elapsedMins = Math.max(0.1, (Date.now() - (prev.startTime || Date.now())) / 60000);
            const liveWpm = Math.round((newWordIndex * 5) / elapsedMins);

            const isDone = progress >= 100;
            return {
              ...p,
              currentWordIndex: newWordIndex,
              typedChars: 0,
              progress,
              wpm: liveWpm,
              finishTime: isDone ? Date.now() : p.finishTime
            };
          }

          return {
            ...p,
            typedChars: newTypedChars
          };
        });

        // Check if all players completed
        if (allFinished && prev.state === 'racing') {
          setTimeout(() => setGameState('finished'), 1000);
        }

        return { ...prev, players: updatedPlayers };
      });
    }, 200);

    return () => {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    };
  }, [gameState, room, monsters]);

  // ─── LIVE WPM CALCULATION ───
  useEffect(() => {
    if (gameState !== 'racing' || !raceStartTime) return;
    const timer = setInterval(() => {
      const elapsedMins = (Date.now() - raceStartTime) / 60000;
      if (elapsedMins > 0.05) {
        const calculatedWpm = Math.round((totalTyped / 5) / elapsedMins);
        setWpm(calculatedWpm);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, raceStartTime, totalTyped]);

  // ─── KEYSTROKE LISTENER ───
  const handleKeyDown = useCallback((e) => {
    if (gameState !== 'racing' || monsters.length === 0) return;

    // Ignore non-alphabetic keys like Shift, Ctrl, Alt
    if (e.key.length !== 1 || !/[a-zA-Z]/.test(e.key)) return;

    const pressedKey = e.key.toUpperCase();
    const currentMonster = monsters[currentWordIndex];
    if (!currentMonster) return;

    const targetWord = currentMonster.word;
    const expectedChar = targetWord[playerInput.length];

    setTotalTyped(prev => prev + 1);

    if (pressedKey === expectedChar) {
      // Correct letter typed!
      const newInput = playerInput + pressedKey;
      setPlayerInput(newInput);
      setStreak(prev => prev + 1);

      // Check if current word is completed
      if (newInput === targetWord) {
        const nextWordIndex = currentWordIndex + 1;
        const newProgress = Math.min(100, Math.round((nextWordIndex / monsters.length) * 100));

        setCurrentWordIndex(nextWordIndex);
        setPlayerInput('');

        // Calculate live accuracy
        const totalAttempts = totalTyped + 1;
        const accuracy = Math.max(0, Math.round(((totalAttempts - totalErrors) / totalAttempts) * 100));

        // Send progress payload
        socketService.sendProgress({
          currentWordIndex: nextWordIndex,
          progress: newProgress,
          wpm,
          accuracy
        });

        // Update local state in room
        setRoom(prev => {
          if (!prev) return prev;
          const myId = playerId || 'local_player';
          const updatedPlayers = prev.players.map(p =>
            p.id === myId || (!prev.isOnline && p.id === 'local_player')
              ? { ...p, currentWordIndex: nextWordIndex, progress: newProgress, wpm, accuracy }
              : p
          );
          return { ...prev, players: updatedPlayers };
        });

        // If this was the last monster, race is done for this player!
        if (nextWordIndex >= monsters.length) {
          setTimeout(() => {
            setGameState('finished');
          }, 1500);
        }
      }
    } else {
      // Typo: gentle wobble feedback
      setTotalErrors(prev => prev + 1);
      setStreak(0);
      setIsWobbling(true);
      setTimeout(() => setIsWobbling(false), 300);
    }
  }, [gameState, monsters, currentWordIndex, playerInput, totalTyped, totalErrors, wpm, playerId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Accuracy calculation
  const accuracy = totalTyped > 0 ? Math.max(0, Math.round(((totalTyped - totalErrors) / totalTyped) * 100)) : 100;
  const currentMonster = monsters[currentWordIndex] || null;
  const isFinished = currentWordIndex >= monsters.length && monsters.length > 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col justify-between items-center select-none relative font-display text-slate-100 p-4 md:p-6 overflow-x-hidden">
      {/* Background Ambience & Glowing Spotlights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-2/3 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />
      </div>

      {/* Main Content Arena */}
      <main className={`relative z-10 flex-1 flex flex-col items-center justify-center w-full ${gameState === 'lobby' ? 'max-w-4xl' : 'max-w-7xl'} mx-auto my-auto transition-all duration-300`}>
        {gameState === 'lobby' && (
          <Lobby
            room={room}
            playerId={playerId}
            isConnected={isConnected}
            onCreateRoom={(name, hero) => socketService.createRoom(name, hero, false)}
            onJoinRoom={(code, name, hero) => socketService.joinRoom(code, name, hero)}
            onStartSolo={(name, hero, count) => socketService.createRoom(name, hero, true, count)}
            onToggleReady={() => socketService.toggleReady()}
            onAddBot={(diff) => socketService.addBot(diff)}
            onRemoveBot={(bId) => socketService.removeBot(bId)}
            onStartRace={(count) => socketService.startRace(count)}
            onLeaveRoom={() => {
              socketService.leaveRoom();
              setRoom(null);
              setGameState('lobby');
            }}
          />
        )}

        {(gameState === 'countdown' || gameState === 'racing' || gameState === 'finished') && (
          <div className="w-full flex flex-col gap-6 animate-fade-in my-auto">
            {/* Multi-lane Race Track */}
            <RaceTrack
              room={room}
              playerId={playerId}
              monsters={monsters}
              playerInput={playerInput}
              activeTargetIndex={currentWordIndex}
              isWobbling={isWobbling}
            />

            {/* Active Player's Typing Console */}
            <TypingInput
              targetWord={currentMonster?.word || ''}
              currentInput={playerInput}
              isWobbling={isWobbling}
              streak={streak}
              wpm={wpm}
              accuracy={accuracy}
              isFinished={isFinished}
            />
          </div>
        )}
      </main>

      {/* Synchronized 3-2-1 Countdown Overlay */}
      {gameState === 'countdown' && (
        <CountdownOverlay
          seconds={countdownSecs}
          onComplete={() => setGameState('racing')}
        />
      )}

      {/* Victory Ceremony / Podium Modal */}
      {gameState === 'finished' && (
        <PodiumModal
          room={room}
          playerId={playerId}
          onRematch={() => {
            socketService.rematch();
            setGameState('lobby');
          }}
          onLeave={() => {
            socketService.leaveRoom();
            setRoom(null);
            setGameState('lobby');
          }}
        />
      )}

      {/* Footer credits */}
      <footer className="relative z-10 pt-4 pb-2 text-center text-xs font-bold text-slate-500">
        Spell & Dash: The Queen's Rescue • Real-Time Multiplayer Typing Adventure
      </footer>
    </div>
  );
}
