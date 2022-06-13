const jwt = require('jsonwebtoken');
const config = require('../config.json');
const User = new (require('../models/user'))('users');

const Card = new (require('../models/card'))('cards');
let cardsArray;

async function initCards() {
    cardsArray = await Card.getAllCards();
}
initCards();

function getRandomInt(max, min = 0) {
    return Math.floor(Math.random() * (max - min) + min);
}

const sleep = (ms) => { 
    return new Promise((resolve) => setTimeout(resolve, ms));
}

var roomno = 1;
let gameRooms = [];
let queue = [];
let userLogins = [];
let users = [];

let manaCount = 2;
let turnCount = 0;

module.exports = (io) => {
     
    io.on('connection', (socket) => {
        console.log('A user connected');
        let currentUser = {};
        socket.on("setUser", (data) => {
            jwt.verify(data, config.jwt.secret, async (err, decoded) => {
                if (err) {
                  //res.status(403).clearCookie('token').redirect('/login');
                  return;
                };
                console.log(decoded);
                currentUser = {login: decoded.login, id: decoded.id, socket: socket};
                const index = users.indexOf(currentUser);
                if (index == -1) {
                    userLogins.push(decoded.login);
                    users.push(currentUser);
                }
                let userData = await User.getByLogin(decoded.login);
                currentUser.score = userData.score;
                currentUser.profile_img = userData.profile_img;
                delete userData['id'];
                delete userData['password'];
                socket.emit('userData', userData);
            });
        });

        socket.on('disconnect', async () => {
            const index = users.indexOf(currentUser);
            if (index != -1) {
                users.splice(index, 1); 
                userLogins.splice(index, 1);
                io.emit('user-list', userLogins);
            }

            if(currentUser) {
                if(gameRooms[currentUser.roomno]) {
                    const deltaTrophies = getRandomInt(15, 5);
                    let room = gameRooms[currentUser.roomno];
                    let enemy = room.players[0] === currentUser ? room.players[1] : room.players[0];

                    if (enemy) {
                        io.to(enemy.socket.id).emit('youWin', {enemy: currentUser.login, trophies: deltaTrophies});
                        if (currentUser.score - deltaTrophies >= 0) await User.save({id: currentUser.id, score: currentUser.score - deltaTrophies});
                        else await User.save({id: currentUser.id, score: 0});
    
                        //console.log({id: room.players[0].id, score: room.players[0].score + deltaTrophies});
                        await User.save({id: enemy.id, score: enemy.score + deltaTrophies});
                        delete enemy;
                    }
                        //io.to(currentUser.socket.id).emit('youLose', {enemy: enemy.login, trophies: deltaTrophies});

                    delete gameRooms[currentUser.roomno];
                }
            }
            //users
        });

        socket.on('newGame', async () => {
            if(checkRoom(io, roomno)) {
                socket.join("room-"+roomno);
                await sleep(300);
                currentUser.roomno = roomno;
                currentUser.hp = 30;
                gameRooms[roomno].players.push(currentUser);
                console.log(currentUser);
                const players = gameRooms[roomno].players;
                const firstPlayer = {login: players[0].login, trophies: players[0].score, profile_img: players[0].profile_img};
                const secondPlayer = {login: players[1].login, trophies: players[1].score, profile_img: players[1].profile_img};
                io.sockets.in("room-"+roomno).emit('startGame', [firstPlayer, secondPlayer]);
                for (let i = 0; i < 6; i++) {
                    await sleep(300);
                    sendRandomCard(io,players[0].socket.id);
                    players[0].socket.to('room-'+currentUser.roomno).emit('newEnemyCard');
                    await sleep(300);
                    sendRandomCard(io, players[1].socket.id);
                    players[1].socket.to('room-'+currentUser.roomno).emit('newEnemyCard');
                }
                
                const firstTurn = getRandomInt(2);
    
                setTimeout(() => {
                    switch(firstTurn) {
                        case 0: {
                            io.to(players[0].socket.id).emit('firstTurn', {isMy: false});
                            io.to(players[1].socket.id).emit('firstTurn', {isMy: true});
                            break;
                        }
                        case 1: {
                            io.to(players[0].socket.id).emit('firstTurn', {isMy: true});
                            io.to(players[1].socket.id).emit('firstTurn', {isMy: false});
                            break;
                        }
                    }
                }, 500);

                roomno++;
                return;
            }

            socket.join("room-"+roomno);
            currentUser.roomno = roomno;
            currentUser.hp = 30;
            gameRooms[roomno] = {players: []};
            gameRooms[roomno].players.push(currentUser);
        });

        socket.on('moveOwn', (cardIndex) => {
            console.log('moveOwn ', cardIndex);
            
            socket.to('room-'+currentUser.roomno).emit('enemyMove', cardsArray[cardIndex - 1]);
        });

        socket.on('endTurn', () => {
            sendRandomCard(io, socket.id);
            socket.to('room-'+currentUser.roomno).emit('newEnemyCard');
            socket.to('room-'+currentUser.roomno).emit('changeTurn', {manaCount: manaCount});
            turnCount++;
            if (turnCount % 2 == 1 && turnCount > 0) manaCount++;
        });

        socket.on('attack', async (data) => {
            let room = gameRooms[currentUser.roomno];
            if (data.enemyIndex == -1) {
                for (let i = 0; i < 2; i++) {
                    if (room.players[i] !== currentUser) {
                        room.players[i].hp -= cardsArray[data.cardIndex - 1].damage;
                        console.log(room.players[i].login, room.players[i].hp);
                    }
                }
                if (room.players[0].hp <= 0) {
                    console.log('bebra vmer 1');
                    const deltaTrophies = getRandomInt(15, 5);
                    io.to(room.players[0].socket.id).emit('youLose', {enemy: room.players[1].login, trophies: deltaTrophies});
                    io.to(room.players[1].socket.id).emit('youWin', {enemy: room.players[0].login, trophies: deltaTrophies});
                    if (room.players[0].score - deltaTrophies >= 0) await User.save({id: room.players[0].id, score: room.players[0].score - deltaTrophies});
                    else await User.save({id: room.players[0].id, trophies: 0});

                    console.log({id: room.players[1].id, score: room.players[1].score + deltaTrophies});
                    await User.save({id: room.players[1].id, score: room.players[1].score + deltaTrophies});
                    delete gameRooms[currentUser.roomno];
                }
                else if (room.players[1].hp <= 0) {
                    console.log('bebra vmer 2');
                    const deltaTrophies = getRandomInt(15, 5);
                    io.to(room.players[1].socket.id).emit('youLose', {enemy: room.players[0].login, trophies: deltaTrophies});
                    io.to(room.players[0].socket.id).emit('youWin', {enemy: room.players[1].login, trophies: deltaTrophies});
                    if (room.players[1].score - deltaTrophies >= 0) await User.save({id: room.players[1].id, score: room.players[1].score - deltaTrophies});
                    else await User.save({id: room.players[1].id, score: 0});

                    console.log({id: room.players[0].id, score: room.players[0].score + deltaTrophies});
                    await User.save({id: room.players[0].id, score: room.players[0].score + deltaTrophies});
                    delete gameRooms[currentUser.roomno];
                }
            }
            //console.log({ownIndex: data.enemyIndex, enemyIndex: data.ownIndex});
            socket.to('room-'+currentUser.roomno).emit('enemyAttack', {ownIndex: data.enemyIndex, enemyIndex: data.ownIndex});
        });

        socket.on('userSleep', async () => {
            const deltaTrophies = getRandomInt(15, 5);
            let room = gameRooms[currentUser.roomno];
            let enemy = room.players[0] === currentUser ? room.players[1] : room.players[0];

            io.to(enemy.socket.id).emit('youWin', {enemy: currentUser.login, trophies: deltaTrophies});
            io.to(currentUser.socket.id).emit('youLose', {enemy: enemy.login,trophies: deltaTrophies});


            if (currentUser.score - deltaTrophies >= 0) await User.save({id: currentUser.id, score: currentUser.score - deltaTrophies});
            else await User.save({id: currentUser.id, score: 0});

            //console.log({id: room.players[0].id, score: room.players[0].score + deltaTrophies});
            await User.save({id: enemy.id, score: enemy.score + deltaTrophies});

            delete gameRooms[currentUser.roomno];
        });
    });
};

function sendRandomCard(io, socketID) {
    const index = getRandomInt(cardsArray.length);
    //console.log(cardsArray[index]);
    io.to(socketID).emit('newOwnCard', cardsArray[index]);
}

function checkRoom(io, roomno) {
    if (gameRooms[roomno]) {
        return io.sockets.adapter.rooms.get("room-"+roomno) && io.sockets.adapter.rooms.get("room-"+roomno).size > 0;
    }
    return false;
}