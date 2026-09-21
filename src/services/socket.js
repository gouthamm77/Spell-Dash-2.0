import { io } from 'socket.io-client';
import { generateMonsterSequence, generateRoomCode, TOTAL_MONSTERS } from '../data/gameData.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isOfflineMode = false;
    this.offlineRoom = null;
    this.listeners = new Map();
    this.serverUrl = 'http://localhost:3001';
  }

  connect() {
    if (this.socket) return;

    try {
      this.socket = io(this.serverUrl, {
        reconnectionAttempts: 3,
        timeout: 3000,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.isOfflineMode = false;
        console.log('[Socket] Connected to backend server:', this.socket.id);
        this.emit('connection_change', { connected: true, socketId: this.socket.id });
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('[Socket] Disconnected from backend server');
        this.emit('connection_change', { connected: false });
      });

      this.socket.on('connect_error', (err) => {
        this.isConnected = false;
        console.warn('[Socket] Backend connection error (Local/Offline simulation ready):', err.message);
        this.emit('connection_change', { connected: false, error: err.message });
      });

      // Pass-through server events
      const events = ['room_updated', 'game_countdown', 'game_started', 'opponent_progress', 'player_finished', 'race_ended', 'chat_message'];
      events.forEach(evt => {
        this.socket.on(evt, (data) => this.emit(evt, data));
      });
    } catch (e) {
      console.warn('[Socket] Initialization error, falling back to local mode:', e);
      this.isOfflineMode = true;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in listener for ${event}:`, err);
        }
      });
    }
  }

  // ─── Room Actions ───

  createRoom(playerName, heroId, isSoloWithBots = false, monsterCount = 14) {
    this.selectedMonsterCount = monsterCount;
    if (this.isConnected && !isSoloWithBots) {
      this.socket.emit('create_room', { playerName, heroId, monsterCount }, (res) => {
        if (!res.success) {
          this.emit('error', res.message);
        }
      });
    } else {
      // Local / Offline Simulation
      this.isOfflineMode = true;
      const code = generateRoomCode();
      const player = {
        id: 'local_player',
        name: playerName || 'Hero 1',
        heroId: heroId || 'knight',
        isHost: true,
        isReady: true,
        isBot: false,
        progress: 0,
        currentWordIndex: 0,
        typedChars: 0,
        wpm: 0,
        accuracy: 100,
        finishTime: null,
        rank: null
      };

      this.offlineRoom = {
        code,
        hostId: 'local_player',
        state: 'lobby',
        players: [player],
        monsters: [],
        monsterCount: monsterCount || 14,
        startTime: null
      };

      if (isSoloWithBots) {
        // Automatically add 2 AI bots for immediate solo quest
        this.addBot('knight', 'archer');
        this.addBot('champion', 'mage');
      }

      this.emit('room_updated', this.offlineRoom);
    }
  }

  joinRoom(code, playerName, heroId) {
    if (this.isConnected) {
      this.socket.emit('join_room', { code, playerName, heroId }, (res) => {
        if (!res.success) {
          this.emit('error', res.message);
        }
      });
    } else {
      this.emit('error', 'Cannot join online room: Server is offline. You can start a Solo / Bot Race right now!');
    }
  }

  toggleReady() {
    if (this.isConnected && !this.isOfflineMode) {
      this.socket.emit('toggle_ready');
    } else if (this.offlineRoom) {
      const p = this.offlineRoom.players.find(x => x.id === 'local_player');
      if (p) p.isReady = !p.isReady;
      this.emit('room_updated', { ...this.offlineRoom });
    }
  }

  addBot(difficulty = 'knight', heroId = 'paladin') {
    if (this.isConnected && !this.isOfflineMode) {
      this.socket.emit('add_bot', { difficulty, heroId });
    } else if (this.offlineRoom && this.offlineRoom.players.length < 4) {
      const botNum = this.offlineRoom.players.filter(p => p.isBot).length + 1;
      const botTitles = { apprentice: 'Apprentice AI', knight: 'Knight AI', champion: 'Champion AI' };
      const bot = {
        id: `bot_${Date.now()}_${botNum}`,
        name: `${botTitles[difficulty] || 'Bot'} ${botNum}`,
        heroId: heroId || 'paladin',
        isHost: false,
        isReady: true,
        isBot: true,
        difficulty,
        progress: 0,
        currentWordIndex: 0,
        typedChars: 0,
        wpm: 0,
        accuracy: 96,
        finishTime: null,
        rank: null
      };
      this.offlineRoom.players.push(bot);
      this.emit('room_updated', { ...this.offlineRoom });
    }
  }

  removeBot(botId) {
    if (this.isConnected && !this.isOfflineMode) {
      this.socket.emit('remove_bot', { botId });
    } else if (this.offlineRoom) {
      this.offlineRoom.players = this.offlineRoom.players.filter(p => p.id !== botId);
      this.emit('room_updated', { ...this.offlineRoom });
    }
  }

  startRace(monsterCount) {
    const count = monsterCount || TOTAL_MONSTERS || 14;
    if (this.isConnected && !this.isOfflineMode) {
      this.socket.emit('start_race', { monsterCount: count });
    } else if (this.offlineRoom) {
      this.offlineRoom.monsters = generateMonsterSequence(count, 2);
      this.offlineRoom.state = 'countdown';
      this.offlineRoom.winner = null;
      this.offlineRoom.players.forEach(p => {
        p.progress = 0;
        p.currentWordIndex = 0;
        p.finishTime = null;
        p.rank = null;
      });

      this.emit('game_countdown', {
        countdownSeconds: 3,
        monsters: this.offlineRoom.monsters,
        room: this.offlineRoom
      });

      setTimeout(() => {
        if (this.offlineRoom) {
          this.offlineRoom.state = 'racing';
          this.offlineRoom.startTime = Date.now();
          this.emit('game_started', {
            startTime: this.offlineRoom.startTime,
            monsters: this.offlineRoom.monsters,
            room: this.offlineRoom
          });
        }
      }, 3200);
    }
  }

  sendProgress(payload) {
    if (this.isConnected && !this.isOfflineMode) {
      this.socket.emit('player_progress', payload);
    } else if (this.offlineRoom) {
      const p = this.offlineRoom.players.find(x => x.id === 'local_player');
      if (p) {
        p.currentWordIndex = payload.currentWordIndex;
        p.progress = payload.progress;
        p.wpm = payload.wpm;
        p.accuracy = payload.accuracy;

        if (p.progress >= 100 && !p.finishTime) {
          p.finishTime = Date.now();
          const finishedCount = this.offlineRoom.players.filter(x => x.finishTime !== null).length;
          p.rank = finishedCount;
          if (!this.offlineRoom.winner) {
            this.offlineRoom.winner = p;
          }
          this.emit('player_finished', {
            player: p,
            rank: p.rank,
            isWinner: this.offlineRoom.winner.id === p.id
          });
        }
      }
    }
  }

  rematch() {
    if (this.isConnected && !this.isOfflineMode) {
      this.socket.emit('rematch');
    } else if (this.offlineRoom) {
      this.offlineRoom.state = 'lobby';
      this.offlineRoom.winner = null;
      this.offlineRoom.players.forEach(p => {
        p.progress = 0;
        p.currentWordIndex = 0;
        p.finishTime = null;
        p.rank = null;
        p.isReady = p.isHost;
      });
      this.emit('room_updated', { ...this.offlineRoom });
    }
  }

  sendChatMessage(text) {
    if (!text || !text.trim()) return;
    if (this.isConnected && !this.isOfflineMode) {
      this.socket.emit('send_chat_message', { text: text.trim() });
    } else if (this.offlineRoom) {
      const p = this.offlineRoom.players.find(x => x.id === 'local_player');
      const msg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        senderId: 'local_player',
        senderName: p?.name || 'You',
        senderHeroId: p?.heroId || 'knight',
        text: text.trim().substring(0, 120),
        timestamp: Date.now()
      };
      this.emit('chat_message', msg);

      // Bot occasional banter in solo mode!
      const bots = this.offlineRoom.players.filter(x => x.isBot);
      if (bots.length > 0 && Math.random() < 0.8) {
        const bot = bots[Math.floor(Math.random() * bots.length)];
        const botQuotes = [
          'Good luck! May the swiftest hero win! ⚔️',
          'I\'ve been practicing my typing speed! ⚡',
          'Let\'s rescue the Queen! 👑',
          'Race to the finish line! 🏁',
          'Watch out for those dragons! 🐉'
        ];
        setTimeout(() => {
          this.emit('chat_message', {
            id: `msg_${Date.now()}_bot`,
            senderId: bot.id,
            senderName: bot.name,
            senderHeroId: bot.heroId,
            text: botQuotes[Math.floor(Math.random() * botQuotes.length)],
            timestamp: Date.now()
          });
        }, 1000 + Math.random() * 1000);
      }
    }
  }

  leaveRoom() {
    this.offlineRoom = null;
    this.isOfflineMode = false;
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
      this.socket = null;
      this.connect();
    }
  }
}

export const socketService = new SocketService();
