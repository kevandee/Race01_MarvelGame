const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/authRouter');
const apiRoutes = require('./routes/apiRouter');
const gameRoutes = require('./routes/gameRouter');
const socketController = require('./controllers/socketController');
const config = require('./config.json');

const server = express();
const PORT = config.port || 3000;

//////////////////////////

const socket = require('socket.io');
const http = require('http');
const serverIO = http.createServer(server);

const io = new socket.Server(serverIO);

socketController(io);
////////////////////////

server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.use(cookieParser());


server.use(authRoutes);
server.use(gameRoutes);
server.use('/api', apiRoutes);

server.use(express.static(path.resolve(__dirname, 'public')));
server.use(express.static(path.resolve(__dirname, 'scripts')));
server.use(express.static(path.resolve(__dirname, 'resources')));

server.use((req, res, next)=>{
    res.status(404).sendFile(__dirname + '/views/404.html');
});

serverIO.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});
