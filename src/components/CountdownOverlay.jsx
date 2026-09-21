import React, { useState, useEffect } from 'react';
import { Flag, Sparkles } from 'lucide-react';

export default function CountdownOverlay({ seconds = 3, onComplete }) {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (count <= 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center pointer-events-none">
        <div className="text-center animate-bounce-in">
          <div className="text-8xl md:text-9xl font-black font-display text-emerald-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.8)]">
            GO! 🚀
          </div>
          <div className="text-white font-extrabold text-xl mt-4">Rescue the Queen!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center pointer-events-none">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider mb-6 border border-amber-400/30">
          <Flag className="w-4 h-4 text-amber-400" /> Prepare to Race
        </div>
        <div
          key={count}
          className="text-9xl md:text-[12rem] font-black font-display text-amber-400 drop-shadow-[0_0_40px_rgba(251,191,36,0.8)] animate-bounce-in"
        >
          {count}
        </div>
        <p className="text-purple-200 font-bold text-lg mt-4 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" /> Hands on the keyboard!
        </p>
      </div>
    </div>
  );
}
