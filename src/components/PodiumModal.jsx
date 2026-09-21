import React from 'react';
import { HEROES } from '../data/gameData';
import { Trophy, Crown, Zap, Target, RotateCcw, Home, Sparkles, Award } from 'lucide-react';

export default function PodiumModal({ room, playerId, onRematch, onLeave }) {
  if (!room) return null;

  // Sort players by rank / finishTime / progress
  const sortedPlayers = [...room.players].sort((a, b) => {
    if (a.finishTime && b.finishTime) return a.finishTime - b.finishTime;
    if (a.finishTime) return -1;
    if (b.finishTime) return 1;
    return b.progress - a.progress;
  });

  const winner = sortedPlayers[0];
  const winnerHero = winner ? (HEROES.find(h => h.id === winner.heroId) || HEROES[0]) : HEROES[0];
  const isWinnerYou = winner?.id === playerId || (!room.isOnline && winner?.id === 'local_player');
  const isHost = room.players.find(p => p.id === playerId || (!room.isOnline && p.id === 'local_player'))?.isHost;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-amber-300 relative text-center animate-slide-up">
        {/* Confetti particles header */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-black px-6 py-2 rounded-full shadow-lg border-2 border-white text-sm uppercase tracking-wider flex items-center gap-2">
          <Crown className="w-5 h-5 fill-current" /> Victory Ceremony
        </div>

        {/* Queen Crowning Winner Graphic */}
        <div className="mt-4 mb-6">
          <div className="inline-flex items-center justify-center relative">
            {/* Queen */}
            <div className="text-4xl md:text-5xl -mr-3 z-10 animate-bounce">👑</div>
            {/* Winner Avatar */}
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl ${winnerHero.bg} text-white flex items-center justify-center text-5xl shadow-2xl border-4 border-amber-300`}>
              {winnerHero.emoji}
            </div>
            <div className="text-4xl md:text-5xl -ml-3 z-10 animate-bounce">🎉</div>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-display mt-3">
            {isWinnerYou ? 'YOU RESCUED THE QUEEN!' : `${winner?.name || 'A Hero'} Rescued the Queen!`}
          </h2>
          <p className="text-slate-500 font-bold text-sm mt-1">
            The Enchanted Keep is safe once more thanks to quick typing mastery!
          </p>
        </div>

        {/* 3-Tier Podium Visual */}
        <div className="flex items-end justify-center gap-3 md:gap-4 mb-8 pt-4">
          {/* 2nd Place */}
          {sortedPlayers[1] && (
            <div className="flex flex-col items-center flex-1 max-w-[120px]">
              <div className="text-2xl mb-1">{HEROES.find(h => h.id === sortedPlayers[1].heroId)?.emoji || '🏹'}</div>
              <div className="text-xs font-bold text-slate-700 truncate w-full text-center">{sortedPlayers[1].name}</div>
              <div className="w-full bg-slate-200 border-t-4 border-slate-300 h-20 rounded-t-2xl flex flex-col items-center justify-center shadow-inner mt-2">
                <span className="font-black text-slate-600 text-lg">2nd</span>
                <span className="text-[10px] font-bold text-slate-500">{Math.round(sortedPlayers[1].wpm || 0)} WPM</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {sortedPlayers[0] && (
            <div className="flex flex-col items-center flex-1 max-w-[140px]">
              <div className="text-3xl mb-1">{winnerHero.emoji}</div>
              <div className="text-xs font-black text-amber-700 truncate w-full text-center">{sortedPlayers[0].name}</div>
              <div className="w-full bg-gradient-to-t from-amber-400 to-yellow-300 border-t-4 border-amber-500 h-28 rounded-t-2xl flex flex-col items-center justify-center shadow-lg mt-2">
                <Crown className="w-6 h-6 text-amber-900 fill-current mb-0.5" />
                <span className="font-black text-amber-950 text-2xl leading-none">1st</span>
                <span className="text-xs font-black text-amber-900 mt-1">{Math.round(sortedPlayers[0].wpm || 0)} WPM</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {sortedPlayers[2] && (
            <div className="flex flex-col items-center flex-1 max-w-[120px]">
              <div className="text-2xl mb-1">{HEROES.find(h => h.id === sortedPlayers[2].heroId)?.emoji || '🔮'}</div>
              <div className="text-xs font-bold text-slate-700 truncate w-full text-center">{sortedPlayers[2].name}</div>
              <div className="w-full bg-amber-100 border-t-4 border-amber-200 h-16 rounded-t-2xl flex flex-col items-center justify-center shadow-inner mt-2">
                <span className="font-black text-amber-800 text-base">3rd</span>
                <span className="text-[10px] font-bold text-amber-700">{Math.round(sortedPlayers[2].wpm || 0)} WPM</span>
              </div>
            </div>
          )}
        </div>

        {/* Race Scorecards Table */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">Final Standings</div>
          <div className="flex flex-col gap-2">
            {sortedPlayers.map((p, idx) => (
              <div
                key={p.id}
                className="bg-white rounded-xl p-3 border border-slate-100 flex items-center justify-between shadow-sm text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 font-black text-slate-400 text-center">#{idx + 1}</span>
                  <span className="text-xl">{HEROES.find(h => h.id === p.heroId)?.emoji || '🛡️'}</span>
                  <div>
                    <span className="font-bold text-slate-800">{p.name}</span>
                    {p.id === playerId && <span className="ml-2 text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">YOU</span>}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1 text-purple-700">
                    <Zap className="w-3.5 h-3.5" /> {Math.round(p.wpm || 0)} WPM
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Target className="w-3.5 h-3.5" /> {Math.round(p.accuracy || 100)}%
                  </span>
                  <span className="text-slate-500">{Math.round(p.progress || 0)}% Done</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onLeave}
            className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Exit to Menu
          </button>

          {isHost && (
            <button
              onClick={onRematch}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-base shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Race Again! 🏁
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
