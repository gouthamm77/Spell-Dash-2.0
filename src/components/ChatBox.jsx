import React, { useState, useEffect, useRef } from 'react';
import { HEROES } from '../data/gameData';
import { MessageSquare, Send, X, Smile, Sparkles, ChevronDown, Bot } from 'lucide-react';

export default function ChatBox({
  messages = [],
  onSendMessage,
  currentUserId,
  isEmbedded = false
}) {
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const prevMessagesLength = useRef(messages.length);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    if (!isOpen && messages.length > prevMessagesLength.current) {
      setUnreadCount(prev => prev + (messages.length - prevMessagesLength.current));
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const sendQuickReaction = (text) => {
    onSendMessage(text);
  };

  const quickReactions = [
    'Good luck! ⚔️',
    'Ready to race! 🏁',
    'Save the Queen! 👑',
    'I\'m super fast! ⚡',
    'GG everyone! 🏆'
  ];

  // If collapsed floating button
  if (!isOpen && !isEmbedded) {
    return (
      <div className="fixed bottom-5 right-5 z-40 animate-fade-in">
        <button
          onClick={handleOpen}
          className="relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-3.5 rounded-full shadow-2xl shadow-purple-900/50 border border-purple-400/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Open Hero Chat"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="font-bold text-xs pr-1 hidden sm:inline">Hero Chat</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${
        isEmbedded
          ? 'w-full h-80 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col'
          : 'fixed bottom-5 right-5 z-40 w-80 sm:w-96 h-[26rem] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl shadow-purple-950/60 flex flex-col overflow-hidden animate-slide-up'
      }`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-black text-white text-sm flex items-center gap-1">
            <MessageSquare className="w-4 h-4 text-purple-400" /> Hero Chat
          </span>
          <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-full">
            {messages.length}
          </span>
        </div>

        {!isEmbedded && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-4">
            <Smile className="w-8 h-8 mb-2 opacity-40 text-purple-400" />
            <p className="font-bold text-slate-400">No cheers yet!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Send a message or quick cheer to your fellow racers.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId || msg.senderId === 'local_player';
            const hero = HEROES.find(h => h.id === msg.senderHeroId) || HEROES[0];
            const isBot = msg.senderId.startsWith('bot_');

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end`}
              >
                {/* Hero Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm shrink-0 shadow ${hero.bg} border border-white/20`}
                  title={msg.senderName}
                >
                  {hero.emoji}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-br-xs'
                      : isBot
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-xs'
                      : 'bg-slate-800 text-slate-100 rounded-bl-xs'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-extrabold text-[10px] text-slate-300">
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    {isBot && (
                      <span className="text-[9px] bg-indigo-900/60 text-indigo-300 px-1 rounded flex items-center gap-0.5">
                        <Bot className="w-2.5 h-2.5" /> AI
                      </span>
                    )}
                    <span className="text-[9px] text-slate-400 ml-auto">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-medium break-words leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Cheers Bar */}
      <div className="px-2.5 py-1.5 bg-slate-950/60 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
        {quickReactions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendQuickReaction(q)}
            className="shrink-0 bg-slate-800/80 hover:bg-purple-600/30 hover:border-purple-400/40 text-slate-300 hover:text-white border border-slate-700/60 text-[10px] font-bold px-2 py-1 rounded-lg transition cursor-pointer active:scale-95"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a chat message..."
          maxLength={100}
          className="flex-1 bg-slate-900 border border-slate-700 focus:border-purple-400 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder:text-slate-500 outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2 rounded-xl transition cursor-pointer ${
            inputText.trim()
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
