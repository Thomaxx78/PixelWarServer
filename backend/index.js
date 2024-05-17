import express from 'express';
import http from 'http';
import ip from 'ip';
import { Server } from 'socket.io';
import cors from 'cors';
import { log } from 'console';

const app = express();
const server = http.createServer(app);
const PORT = 3000;
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

app.use(cors());

app.get('/', (req, res) => {
    res.json('ip address: http://' + ip.address() + ':' + PORT);
});

const rooms = [];

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.broadcast.emit('user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.broadcast.emit('user disconnected');
    });

    socket.on('join', (room) => {
        console.log('join room: ' + room);
        socket.join(room);
        let roomData = rooms[room];
        io.to(room).emit('join', room, roomData);
    });

    socket.on('leave', (room) => {
        console.log('leave room: ' + room);
        socket.leave(room);
        io.to(room).emit('leave', room);
    });

    socket.on('updateColor', (data) => {
        io.to(data.currentRoom).emit('changeColor', data);

        if (!rooms[data.currentRoom]) {
            rooms[data.currentRoom] = [];
        }
        rooms[data.currentRoom].push({ cellId: data.cellId, color: data.newColor });

        log(rooms);
    });

});

server.listen(PORT, () => {
    console.log('Server ip : http://' + ip.address() + ":" + PORT);
});
