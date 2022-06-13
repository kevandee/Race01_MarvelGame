const table = document.querySelector('#own-table')
const cardList = document.querySelector(`.down`);
const gameArea = document.querySelector('div#own-table .game_area');

const enemyHero = document.querySelector('.enemy_img');

var selectedCard = undefined;
var attackCard = undefined;
var state = { distX: 0, distY: 0 };

function cardMouseDown(e) { 
    e.preventDefault();
    selectedCard = e.target;
    while (!selectedCard.classList.contains('cards_item')) {
        selectedCard = selectedCard.parentNode;
    }


    const index = Number(selectedCard.getAttribute('value'));
    if (!game.myTurn || game.tempManaCount - game.ownCards[index].mana < 0) {
        selectedCard = undefined;
        return; 
    } 

    state.distX = Math.abs(selectedCard.offsetLeft - e.pageX);
    state.distY = Math.abs(selectedCard.offsetTop - e.pageY);
}

function cardMouseMove(e) {
    e.preventDefault();
    if (!game.myTurn || !selectedCard) return; 

    var touchLocation = e;
    selectedCard.style.position = 'absolute';
    selectedCard.style.left = touchLocation.pageX - state.distX + 'px';
    selectedCard.style.top = touchLocation.pageY - state.distY + 'px';
}

function cardMouseUp(e) {
    e.preventDefault();
    if (!game.myTurn || !selectedCard) return; 

    selectedCard.style.position = 'unset';
    var touchLocation = e;
    const cardsOnTable = Array.from(gameArea.querySelectorAll('.own'));
    const dragOverElement = document.elementFromPoint(touchLocation.clientX, touchLocation.clientY);
    if (dragOverElement === gameArea || (cardsOnTable && cardsOnTable.includes(dragOverElement))) {
        selectedCard.style.opacity = 1;
        selectedCard.draggable = false;
        selectedCard.parentNode.removeChild(selectedCard);
        gameArea.append(selectedCard); // аппенд для своей карты
        removeCardEvents(selectedCard);
        addAttackEvents(selectedCard);

        const index = Number(selectedCard.getAttribute('value'));
        game.tempManaCount -= game.ownCards[index].mana;
        updateMana(game.tempManaCount, game.manaCount);

        emitEvent('moveOwn', game.ownCards[index].id);
    
        selectedCard.setAttribute('value', game.ownUnitId);
        game.ownUnits[game.ownUnitId] = game.ownCards[index];
        game.ownUnitId++;
        game.ownCards[index] = undefined;
        
        
        selectedCard.style['filter'] = 'brightness(0.4)';
    }
    selectedCard = undefined;
}

function cardTouchMove(e) {
    e.preventDefault();
    selectedCard = e.target;
    while (!selectedCard.classList.contains('cards_item')) {
        selectedCard = selectedCard.parentNode;
    }
    const index = Number(selectedCard.getAttribute('value'));
    if (!game.myTurn || game.tempManaCount - game.ownCards[index].mana < 0) {
        selectedCard = undefined;
        return; 
    }
    const offsetX = 0.5*selectedCard.offsetWidth;
    const offsetY = 0.5*selectedCard.offsetHeight;
    var touchLocation = e.touches[0];
    selectedCard.style.position = 'absolute';
    selectedCard.style.left = touchLocation.clientX - offsetX + 'px';
    selectedCard.style.top = touchLocation.clientY - offsetY + 'px';
}

function cardTouchEnd() {
    if (!game.myTurn || !selectedCard) return;
    const offsetX = 0.5*selectedCard.offsetWidth;
    const offsetY = 0.5*selectedCard.offsetHeight;

    selectedCard.style.position = 'unset';
    var x = parseInt(selectedCard.style.left);
    var y = parseInt(selectedCard.style.top);
    if (document.elementFromPoint(x + offsetX, y + offsetY) === gameArea) {
        selectedCard.style.opacity = 1;
        selectedCard.draggable = false;
        selectedCard.parentNode.removeChild(selectedCard);
        gameArea.append(selectedCard);   // аппенд для своей карты
        removeCardEvents(selectedCard);
        addAttackEvents(selectedCard);

        const index = Number(selectedCard.getAttribute('value'));
        game.tempManaCount -= game.ownCards[index].mana;
        updateMana(game.tempManaCount, game.manaCount);

        selectedCard.setAttribute('value', game.ownUnitId);
        game.ownUnits[game.ownUnitId] = game.ownCards[index];
        game.ownUnitId++;

        emitEvent('moveOwn', game.ownCards[index].id);
        selectedCard.style['filter'] = 'brightness(0.4)';
        selectedCard = undefined;
        game.ownCards[index] = undefined;
    }
}

let arrow = document.getElementById("arrow");
var xOrigin = 0;
var yOrigin = 0;

function attackMouseDown(e) {
    e.preventDefault();
    let card = e.target;
    if (selectedCard) return;
    while (!card.classList.contains('cards_item')) {
        card = card.parentNode;
    }
    const ownIndex = card.getAttribute('value');
    if (!game.ownUnits[ownIndex].active) {
        return;
    }
    xOrigin = card.offsetLeft + card.offsetWidth/2;
    yOrigin = table.offsetTop + card.offsetTop + card.offsetHeight/2;

    attackCard = card;
    attackCard.x = e.pageX
    attackCard.y = e.pageY
}

function attackMove(e) {
    e.preventDefault();
    let xDest;
    let yDest;
    if (e.type == 'touchmove') {
        let card = e.target;
        if (selectedCard) return;
        if (!attackCard) {
            while (!card.classList.contains('cards_item')) {
                card = card.parentNode;
            }
            const ownIndex = card.getAttribute('value');
            if (!game.ownUnits[ownIndex].active) {
                return;
            }
            attackCard = card;
            xOrigin = card.offsetLeft + card.offsetWidth/2;
            yOrigin = table.offsetTop + card.offsetTop + card.offsetHeight/2;
            if(!attackCard.x || !attackCard.y) { 
                attackCard.x = xOrigin;
                attackCard.y = yOrigin;
            }
        }
        let touchLocation = e.touches[0];
        xDest = touchLocation.pageX;
        yDest = touchLocation.pageY;
    }
    if (!attackCard) return;
    if (e.type != 'touchmove') {
        xDest = e.pageX;
        yDest = e.pageY;
    }
    
    let angleDeg = Math.atan2(yDest - yOrigin, xDest - xOrigin) * 180 / Math.PI;
    let deg = angleDeg;
    let length = Math.sqrt((xDest - xOrigin)*(xDest - xOrigin) + (yDest - yOrigin)*(yDest - yOrigin));
    length -= 20;
    var cx = ((xDest + xOrigin) / 2) - (length / 2);
    var cy = ((yDest + yOrigin) / 2) - (10 / 2);
    
    arrow.style.width = length+'px';
    arrow.style.left = cx + 'px';
    arrow.style.top = cy + 'px';

    arrow.style.transform = 'rotate('+deg+'deg)';
    arrow.style.visibility = "visible";
}

function attackUp(e) {

    if(!attackCard) return;
    let toX = undefined, toY = undefined
    let enemyUnitDiv;
    if (e.type == 'touchend') {
        var changedTouch = e.changedTouches[0];
        toX = changedTouch.pageX
        toY = changedTouch.pageY
        enemyUnitDiv = document.elementFromPoint(changedTouch.pageX, changedTouch.pageY);
        console.log(enemyUnitDiv)
    }
    else {
        enemyUnitDiv = e.target
        toX = e.pageX
        toY = e.pageY
    }

    if (enemyUnitDiv.parentNode.classList.contains('enemy_img')) {
        enemyUnitDiv = enemyHero;
    }

    if (enemyUnitDiv != enemyHero && !enemyUnitDiv.classList.contains('enemy')) {
        attackCard = undefined;
        arrow.style.visibility = "hidden";
        return;
    }
    
    const enemyIndex = enemyUnitDiv == enemyHero ? -1 : enemyUnitDiv.getAttribute('value');
    const ownIndex = attackCard.getAttribute('value');
    animateAttack(attackCard, enemyUnitDiv, (animationCard, defenceCard) => {
            if (enemyIndex > -1) {
                game.ownUnits[ownIndex].defence -= game.enemyUnits[enemyIndex].damage;
                updateUnit(animationCard, game.ownUnits[ownIndex]);
                game.enemyUnits[enemyIndex].defence -= game.ownUnits[ownIndex].damage;
                updateUnit(defenceCard, game.enemyUnits[enemyIndex]);
                if (game.ownUnits[ownIndex].defence <= 0) {
                    animationCard.remove();
                    game.ownUnits[ownIndex] = undefined;
                }
                if (game.enemyUnits[enemyIndex].defence <= 0) {
                    defenceCard.remove();
                    game.enemyUnits[enemyIndex] = undefined;
                }
            }
            else {
                game.enemyHP -= game.ownUnits[ownIndex].damage;
                updateEnemyHP(game.enemyHP);
            }
            
            if (game.ownUnits[ownIndex]) game.ownUnits[ownIndex].active = false;
    });
    attackCard = undefined;
    arrow.style.visibility = "hidden";

    const id = game.ownUnits[ownIndex].id;
    emitEvent('attack', {ownIndex: ownIndex, enemyIndex: enemyIndex, cardIndex: id});
}


document.body.addEventListener('mousemove', cardMouseMove);
document.body.addEventListener('mouseup', cardMouseUp);

document.body.addEventListener('mousemove', attackMove);
document.body.addEventListener('mouseup', attackUp);

function addCardEvents(card) {
    card.addEventListener('touchmove', cardTouchMove);
    card.addEventListener('touchend', cardTouchEnd);
    card.addEventListener('mousedown', cardMouseDown);
}

function removeCardEvents(card) {
    card.removeEventListener('touchmove', cardTouchMove);
    card.removeEventListener('touchend', cardTouchEnd);
    card.removeEventListener('mousedown', cardMouseDown);
}

function addAttackEvents(card) {
    card.addEventListener('touchmove', attackMove);
    card.addEventListener('touchend', attackUp);
    card.addEventListener('mousedown', attackMouseDown);
}
