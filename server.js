import { createServer } from 'http';
import { Server } from 'socket.io';
import { generateMonsterSequence, generateRoomCode, TOTAL_MONSTERS } from './src/data/gameData.js';

const PORT = process.env.PORT || 3001;
const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'Spell & Dash Server Online', time: Date.now() }));
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// rooms state: { [code]: { code, hostId, state: 'lobby'|'countdown'|'racing'|'finished', players: [], monsters: [], winner: null } }
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Create Room
  socket.on('create_room', ({ playerName, heroId }, callback) => {
    const code = generateRoomCode(new Set(rooms.keys()));
    const player = {
      id: socket.id,
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

    const room = {
      code,
      hostId: socket.id,
      state: 'lobby',
      players: [player],
      monsters: [],
      startTime: null
    };

    rooms.set(code, room);
    socket.join(code);
    socket.roomId = code;

    console.log(`[Room] Created ${code} by ${player.name}`);
    if (callback) callback({ success: true, room });
    socket.emit('room_updated', room);
  });

  // Join Room
  socket.on('join_room', ({ code, playerName, heroId }, callback) => {
    const cleanCode = (code || '').toUpperCase().trim();
    const room = rooms.get(cleanCode);

    if (!room) {
      if (callback) callback({ success: false, message: 'Room not found! Check the 4-letter code.' });
      return;
    }

    if (room.state !== 'lobby') {
      if (callback) callback({ success: false, message: 'Race already in progress in this room.' });
      return;
    }

    if (room.players.length >= 4) {
      if (callback) callback({ success: false, message: 'Room is full (maximum 4 heroes).' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName || `Hero ${room.players.length + 1}`,
      heroId: heroId || 'archer',
      isHost: false,
      isReady: false,
      isBot: false,
      progress: 0,
      currentWordIndex: 0,
      typedChars: 0,
      wpm: 0,
      accuracy: 100,
      finishTime: null,
      rank: null
    };

    room.players.push(player);
    socket.join(cleanCode);
    socket.roomId = cleanCode;

    console.log(`[Room] ${player.name} joined ${cleanCode}`);
    if (callback) callback({ success: true, room });
    io.to(cleanCode).emit('room_updated', room);
  });

  // Toggle Ready
  socket.on('toggle_ready', () => {
    const room = rooms.get(socket.roomId);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      io.to(room.code).emit('room_updated', room);
    }
  });

  // Add / Remove AI Bot
  socket.on('add_bot', ({ difficulty = 'knight', heroId = 'paladin' }) => {
    const room = rooms.get(socket.roomId);
    if (!room || room.hostId !== socket.id || room.players.length >= 4) return;

    const botNumber = room.players.filter(p => p.isBot).length + 1;
    const botNames = {
      apprentice: 'Novice Bot',
      knight: 'Brave Bot',
      champion: 'Master Bot'
    };

    const bot = {
      id: `bot_${Date.now()}_${botNumber}`,
      name: `${botNames[difficulty] || 'AI Bot'} ${botNumber}`,
      heroId: heroId || 'paladin',
      isHost: false,
      isReady: true,
      isBot: true,
      difficulty,
      progress: 0,
      currentWordIndex: 0,
      typedChars: 0,
      wpm: 0,
      accuracy: 95,
      finishTime: null,
      rank: null
    };

    room.players.push(bot);
    io.to(room.code).emit('room_updated', room);
  });

  socket.on('remove_bot', ({ botId }) => {
    const room = rooms.get(socket.roomId);
    if (!room || room.hostId !== socket.id) return;
    room.players = room.players.filter(p => p.id !== botId);
    io.to(room.code).emit('room_updated', room);
  });

  // Start Race (Host only)
  socket.on('start_race', ({ monsterCount } = {}) => {
    const room = rooms.get(socket.roomId);
    if (!room || room.hostId !== socket.id) return;

    const count = monsterCount || TOTAL_MONSTERS || 14;
    room.monsters = generateMonsterSequence(count, 2);
    room.state = 'countdown';
    room.winner = null;

    // Reset player race progress
    room.players.forEach(p => {
      p.progress = 0;
      p.currentWordIndex = 0;
      p.typedChars = 0;
      p.wpm = 0;
      p.finishTime = null;
      p.rank = null;
    });

    console.log(`[Race] Starting race in ${room.code} with ${room.players.length} players`);
    io.to(room.code).emit('game_countdown', {
      countdownSeconds: 3,
      monsters: room.monsters,
      room
    });

    // After 3 seconds countdown, game starts
    setTimeout(() => {
      if (rooms.get(room.code)) {
        room.state = 'racing';
        room.startTime = Date.now();
        io.to(room.code).emit('game_started', {
          startTime: room.startTime,
          monsters: room.monsters,
          room
        });
      }
    }, 3200);
  });

  // Player Keystroke / Word Progress
  socket.on('player_progress', (payload) => {
    const room = rooms.get(socket.roomId);
    if (!room || room.state !== 'racing') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.currentWordIndex = payload.currentWordIndex ?? player.currentWordIndex;
    player.progress = Math.min(100, Math.max(0, payload.progress ?? player.progress));
    player.wpm = payload.wpm ?? player.wpm;
    player.accuracy = payload.accuracy ?? player.accuracy;

    // Check if player crossed finish line
    if (player.progress >= 100 && !player.finishTime) {
      player.finishTime = Date.now();
      const finishedCount = room.players.filter(p => p.finishTime !== null).length;
      player.rank = finishedCount;

      if (!room.winner) {
        room.winner = player;
        console.log(`[Race] ${player.name} won race ${room.code}!`);
      }

      io.to(room.code).emit('player_finished', {
        player,
        rank: player.rank,
        isWinner: room.winner.id === player.id
      });

      // If all human players finished, transition to finished
      const allHumansFinished = room.players.filter(p => !p.isBot).every(p => p.finishTime !== null);
      if (allHumansFinished) {
        room.state = 'finished';
        io.to(room.code).emit('race_ended', { room });
      }
    }

    // Broadcast live update to opponents
    socket.to(room.code).emit('opponent_progress', {
      playerId: player.id,
      currentWordIndex: player.currentWordIndex,
      progress: player.progress,
      wpm: player.wpm,
      accuracy: player.accuracy,
      rank: player.rank
    });
  });

  // Rematch / Back to lobby
  socket.on('rematch', () => {
    const room = rooms.get(socket.roomId);
    if (!room || room.hostId !== socket.id) return;
    room.state = 'lobby';
    room.winner = null;
    room.players.forEach(p => {
      p.progress = 0;
      p.currentWordIndex = 0;
      p.finishTime = null;
      p.rank = null;
      p.isReady = p.isHost;
    });
    io.to(room.code).emit('room_updated', room);
  });

  // Chat message
  socket.on('send_chat_message', ({ text }) => {
    const room = rooms.get(socket.roomId);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !text || !text.trim()) return;

    const chatMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: player.id,
      senderName: player.name,
      senderHeroId: player.heroId,
      text: text.trim().substring(0, 120),
      timestamp: Date.now()
    };

    io.to(room.code).emit('chat_message', chatMsg);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0 || room.players.every(p => p.isBot)) {
          rooms.delete(socket.roomId);
          console.log(`[Room] Deleted empty room ${socket.roomId}`);
        } else {
          // Reassign host if host left
          if (room.hostId === socket.id) {
            const nextHuman = room.players.find(p => !p.isBot);
            if (nextHuman) {
              room.hostId = nextHuman.id;
              nextHuman.isHost = true;
              nextHuman.isReady = true;
            }
          }
          io.to(room.code).emit('room_updated', room);
        }
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Spell & Dash Multiplayer Socket Server running on port ${PORT}`);
});
