import React, { useRef, useEffect } from 'react';
import { Zap, Target, Flame, Sparkles } from 'lucide-react';

export default function TypingInput({
  targetWord,
  currentInput,
  onKeyDown,
  isWobbling,
  streak,
  wpm,
  accuracy,
  isFinished
}) {
  const inputRef = useRef(null);

  // Auto-focus and maintain focus so player never has to click to type
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current && !isFinished) {
        inputRef.current.focus();
      }
    };
    focusInput();
    window.addEventListener('click', focusInput);
    window.addEventListener('keydown', focusInput);
    return () => {
      window.removeEventListener('click', focusInput);
      window.removeEventListener('keydown', focusInput);
    };
  }, [isFinished]);

  if (isFinished) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl p-6 text-center text-white shadow-2xl animate-bounce-in">
        <h3 className="text-3xl font-black font-display mb-1">🏁 YOU CROSSED THE FINISH LINE!</h3>
        <p className="text-amber-100 font-semibold">The Queen has been rescued! Waiting for all heroes to finish...</p>
      </div>
    );
  }

  if (!targetWord) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Hidden input to capture keystrokes smoothly on any device */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute pointer-events-none"
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck="false"
        aria-label="Typing input"
      />

      {/* Main Interactive Typing Card */}
      <div
        className={`bg-white rounded-3xl p-6 shadow-2xl border-4 transition-all duration-200 ${
          isWobbling ? 'border-rose-400 bg-rose-50/50 animate-wobble' : 'border-purple-200'
        }`}
      >
        {/* Status Bar: Streak & WPM */}
        <div className="flex items-center justify-between mb-3 text-xs font-black uppercase tracking-wider text-slate-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2.5 py-1 rounded-xl">
              <Zap className="w-4 h-4 fill-current" /> {Math.round(wpm || 0)} WPM
            </span>
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
              <Target className="w-4 h-4" /> {Math.round(accuracy || 100)}% Acc
            </span>
          </div>

          {streak >= 3 && (
            <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-3 py-1 rounded-xl animate-bounce">
              <Flame className="w-4 h-4 fill-current text-orange-500" />
              <span>{streak} Streak Combo! 🔥</span>
            </div>
          )}
        </div>

        {/* Big Chunky Target Word Display */}
        <div className="bg-slate-900 rounded-2xl py-6 px-4 flex items-center justify-center gap-2 md:gap-3 shadow-inner overflow-x-auto">
          {targetWord.split('').map((char, index) => {
            const isTyped = index < currentInput.length;
            const isCurrent = index === currentInput.length;

            return (
              <div
                key={index}
                className={`relative flex flex-col items-center justify-center w-12 h-16 md:w-14 md:h-20 rounded-2xl font-black text-3xl md:text-5xl font-display transition-all duration-150 ${
                  isTyped
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105'
                    : isCurrent
                    ? 'bg-purple-600 text-white border-2 border-amber-300 shadow-xl scale-110 ring-4 ring-purple-400/50'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {char}

                {/* Subtle indicator under current active character */}
                {isCurrent && (
                  <span className="absolute -bottom-2 w-3 h-1.5 bg-amber-400 rounded-full animate-ping" />
                )}
              </div>
            );
          })}
        </div>

        {/* Helpful Prompt */}
        <div className="mt-3 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Type the highlighted letter on your keyboard to strike!</span>
        </div>
      </div>
    </div>
  );
}
