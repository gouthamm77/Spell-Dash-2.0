import React, { useState } from 'react';
import { HEROES } from '../data/gameData';
import { Shield, Users, Bot, Play, Copy, Check, Sparkles, Trophy, ArrowRight, Crown } from 'lucide-react';

export default function Lobby({
  room,
  playerId,
  isConnected,
  onCreateRoom,
  onJoinRoom,
  onStartSolo,
  onToggleReady,
  onAddBot,
  onRemoveBot,
  onStartRace,
  onLeaveRoom
}) {
  const [playerName, setPlayerName] = useState('Valiant Hero');
  const [selectedHero, setSelectedHero] = useState('knight');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState('knight');
  const [courseLength, setCourseLength] = useState(14);
  const [modeTab, setModeTab] = useState('online'); // 'online' | 'solo'

  const currentPlayer = room?.players.find(p => p.id === playerId || (!room.isOnline && p.id === 'local_player'));
  const isHost = currentPlayer?.isHost;

  const copyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const heroThemes = {
    knight: {
      activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/80 shadow-lg shadow-emerald-500/30 bg-emerald-950/40',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dot: 'bg-emerald-400'
    },
    archer: {
      activeBorder: 'border-rose-400 ring-2 ring-rose-400/80 shadow-lg shadow-rose-500/30 bg-rose-950/40',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      dot: 'bg-rose-400'
    },
    mage: {
      activeBorder: 'border-blue-400 ring-2 ring-blue-400/80 shadow-lg shadow-blue-500/30 bg-blue-950/40',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      dot: 'bg-blue-400'
    },
    paladin: {
      activeBorder: 'border-amber-400 ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/30 bg-amber-950/40',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400'
    }
  };

  // ─── WAITING ROOM (IN-LOBBY) VIEW ───
  if (room) {
    const readyCount = room.players.filter(p => p.isReady).length;
    const canStart = isHost && room.players.length >= 2 && readyCount >= 2;

    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        {/* Room Header Banner */}
        <div className="bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-slate-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-purple-500/30 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold tracking-widest uppercase mb-1">
                <Crown className="w-4 h-4 text-amber-400" /> Royal Expedition Lobby
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white">
                Assemble the Champions
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-md">
                All heroes face the identical monster sequence. Slay monsters, dash forward, and crown the winner!
              </p>
            </div>

            {/* Room Code Badge */}
            <div className="bg-slate-950/80 backdrop-blur-md px-6 py-4 rounded-2xl flex items-center gap-4 border border-purple-500/40 shadow-xl">
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-amber-300">Room Code</div>
                <div className="text-3xl md:text-4xl font-black tracking-widest text-white font-mono">{room.code}</div>
              </div>
              <button
                onClick={copyCode}
                className="bg-purple-600/40 hover:bg-purple-600/70 p-3 rounded-xl transition-all active:scale-95 text-white border border-purple-400/40 cursor-pointer"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Players Grid (Up to 4 Lanes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {room.players.map((p, idx) => {
            const hero = HEROES.find(h => h.id === p.heroId) || HEROES[0];
            const isYou = p.id === playerId || (!room.isOnline && p.id === 'local_player');

            return (
              <div
                key={p.id}
                className={`relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border-2 shadow-xl flex items-center justify-between transition-all ${
                  p.isReady
                    ? 'border-emerald-500/60 shadow-emerald-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${hero.bg} text-white flex items-center justify-center text-3xl shadow-lg border border-white/20`}>
                    {hero.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-white text-base">{p.name}</span>
                      {isYou && (
                        <span className="bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          YOU
                        </span>
                      )}
                      {p.isHost && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          👑 Host
                        </span>
                      )}
                      {p.isBot && (
                        <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Bot className="w-3 h-3" /> {p.difficulty || 'AI'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      Lane {idx + 1}: {hero.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.isReady ? (
                    <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> READY
                    </span>
                  ) : (
                    <span className="bg-slate-800/80 border border-slate-700 text-slate-400 font-semibold px-3 py-1.5 rounded-xl text-xs">
                      WAITING
                    </span>
                  )}

                  {isHost && p.isBot && (
                    <button
                      onClick={() => onRemoveBot(p.id)}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 p-1.5 rounded-lg text-xs font-bold transition"
                      title="Remove Bot"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty Lane Slots */}
          {Array.from({ length: Math.max(0, 4 - room.players.length) }).map((_, i) => (
            <div
              key={`empty_${i}`}
              className="border-2 border-dashed border-slate-800/80 bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 flex items-center justify-between text-slate-500"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center text-2xl font-bold text-slate-600">
                  +
                </div>
                <div>
                  <div className="font-bold text-slate-400 text-sm">Open Hero Lane</div>
                  <div className="text-xs text-slate-500">Invite a player or add an AI Bot</div>
                </div>
              </div>

              {isHost && (
                <button
                  onClick={() => onAddBot(botDifficulty)}
                  className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Bot className="w-4 h-4" /> Add AI Bot
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Lobby Controls Bar */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isHost && room.players.length < 4 && (
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
                <span className="text-xs font-bold text-slate-400">Bot Difficulty:</span>
                <select
                  value={botDifficulty}
                  onChange={(e) => setBotDifficulty(e.target.value)}
                  className="bg-transparent text-xs font-black text-purple-400 outline-none cursor-pointer"
                >
                  <option value="apprentice" className="bg-slate-900 text-white">Apprentice (25 WPM)</option>
                  <option value="knight" className="bg-slate-900 text-white">Knight (45 WPM)</option>
                  <option value="champion" className="bg-slate-900 text-white">Champion (70 WPM)</option>
                </select>
              </div>
            )}
            {isHost && (
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
                <span className="text-xs font-bold text-slate-400">Course:</span>
                <select
                  value={courseLength}
                  onChange={(e) => setCourseLength(Number(e.target.value))}
                  className="bg-transparent text-xs font-black text-amber-400 outline-none cursor-pointer"
                >
                  <option value={8} className="bg-slate-900 text-white">Sprint (8 Monsters • 800m)</option>
                  <option value={14} className="bg-slate-900 text-white">Grand Rescue (14 Monsters • 1,400m)</option>
                  <option value={20} className="bg-slate-900 text-white">Royal Marathon (20 Monsters • 2,000m)</option>
                </select>
              </div>
            )}
            <button
              onClick={onLeaveRoom}
              className="text-slate-400 hover:text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              Leave Room
            </button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {!isHost && (
              <button
                onClick={onToggleReady}
                className={`px-6 py-3 rounded-xl font-black text-sm tracking-wide transition shadow-lg flex items-center gap-2 cursor-pointer ${
                  currentPlayer?.isReady
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                }`}
              >
                {currentPlayer?.isReady ? 'Not Ready' : 'Ready Up! ⚔️'}
              </button>
            )}

            {isHost && (
              <button
                onClick={() => onStartRace(courseLength)}
                disabled={!canStart}
                className={`px-8 py-3.5 rounded-xl font-black text-base tracking-wide transition shadow-xl flex items-center gap-2 ${
                  canStart
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black cursor-pointer active:scale-95 shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Play className="w-5 h-5 fill-current" />
                {room.players.length < 2
                  ? 'Need at least 2 Racers'
                  : readyCount < room.players.length
                  ? `Waiting on Players (${readyCount}/${room.players.length} Ready)`
                  : 'START RACE! 🏁'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── LANDING SCREEN VIEW ───
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in flex flex-col items-center justify-center">
      {/* Title & Hero Branding */}
      <div className="text-center mb-8 w-full">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider mb-4 shadow-sm backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-amber-400" /> Multi-Player Typing Adventure
        </div>

        {/* High-Contrast Luminous Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display mb-3">
          <span className="text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.25)]">Spell & Dash:</span>{' '}
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(217,70,239,0.4)]">
            The Queen's Rescue
          </span>
        </h1>

        <p className="text-slate-300 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Race your hero across enchanted lanes, slay monsters with typing precision, and rescue the Queen first!
        </p>

        {/* Server Status Glowing Pill Tag */}
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`} />
            <span>
              {isConnected
                ? 'Multiplayer Server Connected (Live Room Codes Ready)'
                : 'Offline/Local Simulation Ready (Instant Bot Races)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Game Card Container */}
      <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-2xl shadow-purple-950/50 p-6 md:p-8 relative">
        {/* Subtle interior glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Profile / Character Setup */}
        <div className="mb-8 relative z-10">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
            1. Enter Your Hero Nickname
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter Hero Name..."
            maxLength={16}
            className="w-full bg-slate-950/90 border border-slate-700 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-2xl px-5 py-3.5 font-bold text-white outline-none text-lg transition placeholder:text-slate-500 shadow-inner"
          />

          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mt-6 mb-3">
            2. Choose Your Hero Avatar
          </label>

          {/* Hero Selection Interactive Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {HEROES.map((h) => {
              const isSelected = selectedHero === h.id;
              const theme = heroThemes[h.id] || heroThemes.knight;

              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedHero(h.id)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200 cursor-pointer relative ${
                    isSelected
                      ? `${theme.activeBorder} scale-102`
                      : `bg-slate-800/60 border-slate-700/70 hover:border-slate-500 hover:bg-slate-800/90 hover:scale-103`
                  }`}
                >
                  {/* Selected Indicator Dot */}
                  {isSelected && (
                    <span className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${theme.dot} animate-ping`} />
                  )}

                  <div className={`w-14 h-14 rounded-2xl ${h.bg} text-white flex items-center justify-center text-3xl shadow-md border border-white/20`}>
                    {h.emoji}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black text-white">{h.name}</div>
                    <div className="text-[11px] text-slate-400 font-medium capitalize mt-0.5">{h.color} Element</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="border-t border-slate-800/80 pt-6 relative z-10">
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-6">
            <button
              onClick={() => setModeTab('online')}
              className={`flex-1 py-3 rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                modeTab === 'online'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-purple-400" /> Online Multiplayer (Room Code)
            </button>
            <button
              onClick={() => setModeTab('solo')}
              className={`flex-1 py-3 rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                modeTab === 'solo'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-400" /> Solo Quest (vs. AI Bots)
            </button>
          </div>

          {modeTab === 'online' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Host a New Room Box */}
              <div className="bg-slate-950/70 rounded-2xl p-6 border border-purple-500/30 flex flex-col justify-between shadow-lg">
                <div>
                  <h3 className="font-black text-white text-lg mb-1.5 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" /> Host a New Room
                  </h3>
                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                    Create a private 4-player lobby and invite friends using an auto-generated 4-letter room code.
                  </p>
                </div>
                <button
                  onClick={() => onCreateRoom(playerName, selectedHero)}
                  className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3.5 px-5 rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Create Room <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Join Existing Room Box */}
              <div className="bg-slate-950/70 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between shadow-lg">
                <div>
                  <h3 className="font-black text-white text-lg mb-1.5 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" /> Join Existing Room
                  </h3>
                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                    Enter the 4-letter room code shared by your race host to jump right in.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="CODE (e.g. HERO)"
                    maxLength={4}
                    className="w-full uppercase font-mono font-black tracking-widest text-center bg-slate-900 border border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 outline-none text-white text-lg placeholder:text-slate-500 transition"
                  />
                  <button
                    onClick={() => onJoinRoom(joinCode, playerName, selectedHero)}
                    disabled={joinCode.length < 4}
                    className={`px-6 font-black rounded-xl transition ${
                      joinCode.length === 4
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Solo vs AI Bots Quick Launch Box */
            <div className="bg-slate-950/70 rounded-2xl p-6 md:p-8 border border-amber-500/30 text-center shadow-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-2xl mb-3">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-black text-white text-2xl mb-2 font-display">
                Solo Quest: Battle Against 2 AI Bots
              </h3>
              <p className="text-sm text-slate-300 mb-5 max-w-lg mx-auto leading-relaxed">
                Race against Apprentice and Knight AI rivals. Perfect for warming up your fingers, practicing typing speed, and mastering the tracks!
              </p>

              {/* Course Length Selector for Solo Quest */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <span className="text-xs font-bold text-slate-400 mr-1">Track Distance:</span>
                {[
                  { count: 8, label: 'Sprint (800m • 8 Monsters)' },
                  { count: 14, label: 'Grand Rescue (1,400m • 14 Monsters)' },
                  { count: 20, label: 'Royal Marathon (2,000m • 20 Monsters)' }
                ].map((c) => (
                  <button
                    key={c.count}
                    type="button"
                    onClick={() => setCourseLength(c.count)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      courseLength === c.count
                        ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20'
                        : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onStartSolo(playerName, selectedHero, courseLength)}
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-lg py-4 px-10 rounded-2xl shadow-xl shadow-amber-500/25 transition-all hover:scale-103 active:scale-98 inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" /> Start Solo Race Now!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
