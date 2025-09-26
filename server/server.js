const dotenv = require("dotenv");
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000",process.env.FRONTEND_URL],
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static('../dist'));


// Store rooms and users
const rooms = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        rooms: rooms.size,
        timestamp: new Date().toISOString()
    });
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room
    socket.on('join-room', ({ roomId, user }) => {
        socket.join(roomId);
        socket.userId = user.id;
        socket.roomId = roomId;

        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                id: roomId,
                users: new Map(),
                code: '',
                language: 'javascript'
            });
        }

        const room = rooms.get(roomId);
        room.users.set(user.id, user);

        // 👇 only to the joining user
        socket.emit('room-joined', {
            room: {
                id: roomId,
                users: Array.from(room.users.values()),
                code: room.code,
                language: room.language
            }
        });

        // 👇 broadcast to everyone in room
        io.in(roomId).emit('room-update', {
            users: Array.from(room.users.values()),
            code: room.code,
            language: room.language
        });
    });


    // Leave room
    socket.on('leave-room', () => {
        handleUserLeave(socket);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        handleUserLeave(socket);
    });

    function handleUserLeave(socket) {
        const roomId = socket.roomId;
        const userId = socket.userId;

        if (!roomId || !userId) return;

        const room = rooms.get(roomId);
        if (!room) return;

        room.users.delete(userId);

        io.in(roomId).emit('room-update', {
            users: Array.from(room.users.values()),
            code: room.code,
            language: room.language
        });

        if (room.users.size === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted (empty)`);
        }
    }

    socket.on('leave-room', () => handleUserLeave(socket));
    socket.on('disconnect', () => handleUserLeave(socket));

    // Code change
    socket.on('code-change', ({ roomId, change }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.code = change.content;
            socket.to(roomId).emit('code-changed', {
                code: change.content,
                userId: change.userId,
                change
            });
        }
    });

    // Cursor move
    socket.on('cursor-move', ({ roomId, userId, position }) => {
        const room = rooms.get(roomId);
        if (room && room.users.has(userId)) {
            const user = room.users.get(userId);
            user.cursor = position;
            socket.to(roomId).emit('cursor-moved', { userId, position });
        }
    });

    // Language change
    socket.on('language-change', ({ roomId, language }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.language = language;
            io.in(roomId).emit('language-changed', { language });

            // Also include language in full room update
            io.in(roomId).emit('room-update', {
                users: Array.from(room.users.values()),
                code: room.code,
                language: room.language
            });
        }
    });
});


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
});