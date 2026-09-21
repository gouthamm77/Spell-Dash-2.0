import React from 'react';
import { HEROES, MONSTER_VISUALS } from '../data/gameData';
import { Crown, Sparkles, Zap, Trophy, Shield, Flag, Compass } from 'lucide-react';

export default function RaceTrack({
  room,
  playerId,
  monsters,
  playerInput,
  activeTargetIndex,
  isWobbling
}) {
  if (!room || !monsters || monsters.length === 0) return null;

  // Calculate live rankings based on progress and finish time
  const sortedPlayers = [...room.players].sort((a, b) => {
    if (a.finishTime && b.finishTime) return a.finishTime - b.finishTime;
    if (a.finishTime) return -1;
    if (b.finishTime) return 1;
    return b.progress - a.progress;
  });

  const getPlayerRank = (pId) => {
    const idx = sortedPlayers.findIndex(p => p.id === pId);
    return idx !== -1 ? idx + 1 : 1;
  };

  const rankBadges = {
    1: { label: '1st 🥇', color: 'bg-amber-400 text-amber-950 border-amber-500' },
    2: { label: '2nd 🥈', color: 'bg-slate-300 text-slate-900 border-slate-400' },
    3: { label: '3rd 🥉', color: 'bg-amber-600 text-white border-amber-700' },
    4: { label: '4th', color: 'bg-slate-200 text-slate-700 border-slate-300' }
  };

  // Environmental zone checkpoints along the long course
  const checkpoints = [
    { percent: 0, label: '0m Start', icon: '🚩' },
    { percent: 25, label: '350m Whispering Woods', icon: '🌲' },
    { percent: 50, label: '700m Dragon Ridge', icon: '🌋' },
    { percent: 75, label: '1050m Castle Drawbridge', icon: '⚔️' },
    { percent: 100, label: '1400m Queen\'s Keep', icon: '👑' },
  ];

  return (
    <div className="w-full bg-slate-900/90 rounded-3xl p-4 md:p-6 shadow-2xl border-4 border-slate-800 relative overflow-hidden backdrop-blur-md">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-slate-900/80 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/20 text-amber-300 p-2.5 rounded-2xl border border-amber-500/30">
            <Crown className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-white font-black text-xl tracking-wide flex items-center gap-2 font-display">
              Grand Royal Course
              <span className="text-xs text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                {monsters.length} Monsters Expedition
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Battle through 4 perilous realms to reach the Queen's enchanted fortress!
            </p>
          </div>
        </div>

        {/* Course Distance Milestones */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
          <Compass className="w-4 h-4 text-purple-400 animate-spin" />
          <span>Total Distance: <strong className="text-amber-400 font-mono">1,400 Meters</strong></span>
        </div>
      </div>

      {/* Course Overview Mini-Map Bar */}
      <div className="relative z-10 bg-slate-950/90 rounded-2xl p-3.5 border border-slate-800 mb-6">
        <div className="flex justify-between text-[11px] font-black uppercase text-slate-400 mb-2 px-1">
          {checkpoints.map((cp, idx) => (
            <span key={idx} className="flex items-center gap-1">
              <span>{cp.icon}</span>
              <span className="hidden sm:inline">{cp.label}</span>
            </span>
          ))}
        </div>

        {/* Global Progress Track Line */}
        <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-visible">
          {/* Checkpoint notches */}
          <div className="absolute left-[25%] top-0 bottom-0 w-0.5 bg-slate-600" />
          <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-slate-600" />
          <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-slate-600" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-400 rounded-r-full" />

          {/* Mini-map racer icons */}
          {room.players.map((p) => {
            const hero = HEROES.find(h => h.id === p.heroId) || HEROES[0];
            const isYou = p.id === playerId || (!room.isOnline && p.id === 'local_player');

            return (
              <div
                key={`mini_${p.id}`}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 z-10"
                style={{ left: `${Math.min(98, Math.max(2, p.progress || 0))}%` }}
                title={`${p.name} (${Math.round(p.progress || 0)}%)`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md border-2 transition-transform hover:scale-125 ${
                    isYou ? 'border-amber-300 ring-2 ring-purple-500 scale-110' : 'border-white/80'
                  } ${hero.bg}`}
                >
                  {hero.emoji}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Multi-Lane Tracks */}
      <div className="relative z-10 flex flex-col gap-4">
        {room.players.map((player, laneIdx) => {
          const hero = HEROES.find(h => h.id === player.heroId) || HEROES[0];
          const isYou = player.id === playerId || (!room.isOnline && player.id === 'local_player');
          const rank = getPlayerRank(player.id);
          const currentMonster = monsters[player.currentWordIndex] || null;
          const isFinished = player.progress >= 100;
          const monsterVisual = currentMonster ? (MONSTER_VISUALS[currentMonster.type] || MONSTER_VISUALS.slime) : null;

          return (
            <div
              key={player.id}
              className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                isYou
                  ? 'bg-slate-800/90 border-purple-500 shadow-xl shadow-purple-500/10'
                  : 'bg-slate-800/50 border-slate-700/80'
              }`}
            >
              {/* Lane Info Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-700/50 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md font-black border text-[11px] ${rankBadges[rank]?.color}`}>
                    {rankBadges[rank]?.label}
                  </span>
                  <span className="font-extrabold text-white text-sm">{player.name}</span>
                  {isYou && (
                    <span className="bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      YOU
                    </span>
                  )}
                  {player.isBot && (
                    <span className="bg-slate-700 text-slate-300 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                      AI BOT
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-slate-300 font-bold">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Zap className="w-3.5 h-3.5 fill-current" /> {Math.round(player.wpm || 0)} WPM
                  </span>
                  <span className="text-slate-400">
                    Monster {Math.min(monsters.length, (player.currentWordIndex || 0) + 1)} of {monsters.length}
                  </span>
                  <span className="text-emerald-400 font-black text-sm">{Math.round(player.progress || 0)}%</span>
                </div>
              </div>

              {/* Extended Long Race Track Runway */}
              <div className="relative h-28 md:h-32 w-full bg-gradient-to-r from-emerald-950/40 via-slate-800/90 to-indigo-950/60 overflow-hidden flex items-center">
                {/* Track lines & cobblestone texture */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Roadway lane dividers */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t border-dashed border-white/10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-purple-600 opacity-70" />

                {/* Intermediate Checkpoint Lines */}
                <div className="absolute left-[25%] top-0 bottom-0 w-px bg-white/10 flex flex-col justify-end pb-3 items-center">
                  <span className="text-[9px] text-slate-500 font-mono">350m</span>
                </div>
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-white/10 flex flex-col justify-end pb-3 items-center">
                  <span className="text-[9px] text-slate-500 font-mono">700m</span>
                </div>
                <div className="absolute left-[75%] top-0 bottom-0 w-px bg-white/10 flex flex-col justify-end pb-3 items-center">
                  <span className="text-[9px] text-slate-500 font-mono">1050m</span>
                </div>

                {/* Finish Line Ribbon (at 88%) */}
                <div className="absolute right-[11%] top-0 bottom-0 w-2.5 flex flex-col justify-between py-1 items-center z-10">
                  <div className="w-full h-full bg-red-500/80 border-r-2 border-dashed border-white animate-pulse shadow-md" />
                  <span className="absolute -top-1 font-black text-[9px] text-amber-300 bg-red-700 px-1.5 py-0.5 rounded shadow">
                    GOAL
                  </span>
                </div>

                {/* Grand Royal Castle on the far right (at 92%) */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none">
                  <div className="text-2xl md:text-3xl animate-bounce drop-shadow">👑</div>
                  <div className="text-3xl md:text-4xl filter drop-shadow">🏰</div>
                  <span className="text-[10px] font-black text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-500/50 mt-0.5">
                    Queen's Keep
                  </span>
                </div>

                {/* Player Hero Avatar Positioned along track */}
                <div
                  className="absolute z-20 transition-all duration-300 ease-out flex flex-col items-center"
                  style={{
                    left: `${Math.min(84, Math.max(3, (player.progress || 0) * 0.82))}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {/* Hero Floating Status */}
                  {isFinished ? (
                    <div className="bg-amber-400 text-amber-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-xl border border-amber-200 animate-bounce">
                      RESCUED! 🎉
                    </div>
                  ) : (
                    <div className="text-xs font-black text-white drop-shadow flex items-center gap-1">
                      {isYou && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                    </div>
                  )}

                  {/* Character Sprite Box */}
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${hero.bg} text-white flex items-center justify-center text-3xl shadow-2xl border-2 border-white/80 animate-monster-walk transition-transform ${
                      isWobbling && isYou ? 'animate-wobble ring-4 ring-rose-500' : ''
                    }`}
                  >
                    {hero.emoji}
                  </div>
                </div>

                {/* Next Monster Obstacle & Word Banner */}
                {!isFinished && currentMonster && (
                  <div
                    className="absolute z-20 flex flex-col items-center transition-all duration-300 pointer-events-none"
                    style={{
                      left: `${Math.min(84, Math.max(16, (player.progress || 0) * 0.82 + 9))}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {/* Word Banner Overhead */}
                    <div className="bg-slate-950/95 border-2 border-amber-400/80 rounded-xl px-3 py-1 shadow-2xl flex items-center gap-0.5 mb-1.5 backdrop-blur-md">
                      {currentMonster.word.split('').map((char, charIdx) => {
                        let isTyped = false;
                        let isCurrent = false;

                        if (isYou) {
                          isTyped = charIdx < (playerInput?.length || 0);
                          isCurrent = charIdx === (playerInput?.length || 0);
                        }

                        return (
                          <span
                            key={charIdx}
                            className={`font-black text-sm md:text-base tracking-wider font-display transition-colors ${
                              isTyped
                                ? 'text-emerald-400 font-extrabold drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                : isCurrent && isYou
                                ? 'text-amber-300 underline decoration-2 underline-offset-2 animate-pulse'
                                : 'text-slate-300'
                            }`}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>

                    {/* Monster Visual */}
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-900/90 border-2 border-slate-600 flex items-center justify-center text-2xl md:text-3xl shadow-lg animate-float">
                      {monsterVisual?.emoji || '👾'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
