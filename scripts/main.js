var game = new GameManager();

let userData;

let socket = io();
socket.emit('setUser', getCookie('token'));

socket.on('startGame', (data) =>  game.startGame(data));
socket.on('firstTurn', (data) => game.setFirstTurn(data));
socket.on('enemyMove', (data) => game.enemyMove(data));
socket.on('changeTurn', (data) => game.changeTurn(data));
socket.on('newOwnCard', (data) =>  game.newOwnCard(data));
socket.on('newEnemyCard', game.newEnemyCard);
socket.on('enemyAttack', (data) => game.enemyAttack(data));

socket.on('userData', (data) => {
    userData = data;
    document.querySelector('.down .info_container span.name').textContent=data.login;
    document.querySelector('.down .info_container span.exp').textContent=data.score + ' trophies';
    document.querySelector('.user_img img').setAttribute('src', data.profile_img);
});

socket.on('youLose', (data) => {
    const dialog = document.getElementById('res_dialog');
    document.querySelector('#res_dialog').style.display = 'flex';
    console.log('You win! +'+data.score+' trophies');
    dialog.querySelector('.dialog_header').textContent = 'You lost';
    dialog.querySelector('.dialog_description').textContent = `You are defeated by ${data.enemy} and lose ${data.trophies} trophies.`;
    dialog.showModal();
});
socket.on('youWin', (data) => {
    const dialog = document.getElementById('res_dialog');
    document.querySelector('#res_dialog').style.display = 'flex';
    console.log('You win! +'+data.score+' trophies');
    dialog.querySelector('.dialog_header').textContent = 'Congratulations. You won!';
    dialog.querySelector('.dialog_description').textContent = `You have defeated ${data.enemy} and earned ${data.trophies} trophies.`;
    dialog.showModal();
})

function onGame() {
    socket.emit('newGame', getCookie('token'));
}

function emitEvent(event, value) {
    socket.emit(event, value);
}

function endTurn() {
    if(game.myTurn) socket.emit('endTurn');
    game.myTurn = false;
    turnDiv.querySelector('a').disabled = true;
    timerMove.style['background-color'] = 'red';
    game.ownUnits.forEach((unit) => {
        if(unit) unit.active = false;
    });
    document.querySelectorAll('.game_area .own.cards_item').forEach(unit => {
        unit.style['filter'] = 'brightness(0.4)';
    });
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

onGame();