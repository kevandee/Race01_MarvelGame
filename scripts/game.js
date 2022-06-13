const turnDiv = document.querySelector('#turn-div');
const manaSpan = document.querySelector('#mana-count');
const ownCardsDiv = document.querySelector('.down .your_cards');
const enemyCardsDiv = document.querySelector('.up .enemy_cards');
const ownHP = document.querySelector('.your_hp');
const enemyHP = document.querySelector('.enemy_hp');
const timerMove = document.querySelector('.timer_container')

document.querySelector('#waiting_dialog').showModal();

class GameManager {
    constructor() {
        this.myTurn = false;
        this.manaCount = 0;
        this.tempManaCount = 0;
        this.ownCards = [];
        this.ownUnits = [];
        this.enemyUnits = [];
        this.cardsId = 0;
        this.ownUnitId = 0;
        this.enemyUnitId = 0;
    }

    startGame(data) {
        let enemyIndex = 0;
        if (data[0].login === getCookie('login')) {
            enemyIndex = 1;
        }
        //console.log(data[enemyIndex]);
        document.querySelector('.up .info_container span.name').textContent = data[enemyIndex].login;
        document.querySelector('.up .info_container span.exp').textContent = data[enemyIndex].trophies + ' trophies';
        document.querySelector('.enemy_img img').setAttribute('src', data[enemyIndex].profile_img)

        this.HP = 30;
        this.enemyHP = 30;
        this.manaCount = 2;
        this.tempManaCount = 2;
        manaSpan.textContent = '2/2';
        ownHP.textContent = 30;
        enemyHP.textContent = 30;

        document.querySelector('#waiting_dialog').style.display = 'none';
        document.querySelector('#res_dialog').style.display = 'none';
        document.querySelector('#waiting_dialog').close();
    }

    setFirstTurn(data) {
        if (data.isMy) {
            timerMove.style['background-color'] = 'green';

            this.myTurn = true;
            turnDiv.querySelector('a').disabled = false;
            this.timer();
            console.log('timer');
        }
        else {
            this.myTurn = false;
            turnDiv.querySelector('a').disabled = true;
        }
    }

    enemyMove(cardObj) {
        const card = document.querySelector('.up').querySelector('.enemy');//.remove();
        card.parentNode.removeChild(card);
        card.innerHTML = `
        <div class="stats_container">
            <span class="damage">${cardObj.damage}</span>
            <span class="defence">${cardObj.defence}</span>
            <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="15" fill="yellow"/>
                <circle cx="55" cy="20" r="15" fill="red"/>
            </svg>
        </div>`
        
        card.setAttribute('value', this.enemyUnitId);
        card.style.background = `url(${cardObj.picture})`;
        card.style['transform'] = 'rotate(0deg)'
        document.querySelector('#enemy-table .game_area').append(card); // аппенд для хода противника 
    
        this.enemyUnits[this.enemyUnitId] = cardObj;
        this.enemyUnitId++;
    }

    changeTurn(data) {
        timerMove.style['background-color'] = 'green';

        this.myTurn = true;
        this.timer();
        console.log('change turn');
        this.ownUnits.forEach((unit) => {
            if(unit) unit.active = true;
        });
        document.querySelectorAll('.game_area .cards_item.own').forEach((div) => {
            div.style['filter'] = 'brightness(1)';;
        })
        turnDiv.querySelector('a').disabled = false;
        this.manaCount = data.manaCount;
        this.tempManaCount = data.manaCount;
        updateMana(this.tempManaCount, this.manaCount);
    }

    newEnemyCard() {
        let unactiveCard = createCard();
        document.querySelector('#enemy-table .deckofCards').append(unactiveCard);
        unactiveCard.classList.add('enemy');
        unactiveCard.classList.add(`active-enemy`);
        unactiveCard.classList.remove(`unactive`);
        
        CardAnimation(unactiveCard, enemyCardsDiv.offsetLeft + enemyCardsDiv.offsetWidth/2, enemyCardsDiv.offsetTop);
    }

    enemyAttack(data) {
        const enemyIndex = data.enemyIndex;
        const ownIndex = data.ownIndex;
        const ownHero = document.querySelector('.down .user_img');
        let enemyUnitDiv = document.querySelector(`.table .enemy[value|=\"${enemyIndex}\"]`);
        let ownUnitDiv = ownHero;
        //console.log('Hero coords', getCardCoords(ownHero));
        if (ownIndex > -1) {
            ownUnitDiv = document.querySelector(`.table .own[value|=\"${ownIndex}\"]`);
        }
        animateAttack(enemyUnitDiv, ownUnitDiv, (animationCard, defenceCard) => {
            if (ownIndex > -1) {
                let ownUnitDiv = document.querySelector(`.table .own[value|=\"${ownIndex}\"]`);
                this.ownUnits[ownIndex].defence -= this.enemyUnits[enemyIndex].damage;
                updateUnit(ownUnitDiv, this.ownUnits[ownIndex]);
                this.enemyUnits[enemyIndex].defence -= this.ownUnits[ownIndex].damage;
                updateUnit(enemyUnitDiv, this.enemyUnits[enemyIndex]);
                if (this.ownUnits[ownIndex].defence <= 0) {
                    ownUnitDiv.remove();
                    this.ownUnits[ownIndex] = undefined;
                }
                if (this.enemyUnits[enemyIndex].defence <= 0) {
                    enemyUnitDiv.remove();
                    this.enemyUnits[enemyIndex] = undefined;
                }
            }
            else {
                this.HP -= this.enemyUnits[enemyIndex].damage;
                ownHP.textContent = this.HP;
            }
        });
    }

    newOwnCard(cardObj) {
        let unactiveCard = createCard();
        unactiveCard.innerHTML = `
        <div class="mana_container">
            <span class="mana">${cardObj.mana}</span>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="15" fill="blue"/>
            </svg>
        </div>
        <div class="stats_container">
            <span class="damage">${cardObj.damage}</span>
            <span class="defence">${cardObj.defence}</span>
            <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="15" fill="yellow"/>
                <circle cx="55" cy="20" r="15" fill="red"/>
            </svg>
        </div>`
        
        unactiveCard.style.background = `url(${cardObj.picture})`;
        document.querySelector('#own-table .deckofCards').append(unactiveCard);
        unactiveCard.classList.add('own');
        unactiveCard.setAttribute('value', this.cardsId); 
        unactiveCard.classList.add(`active`);
        unactiveCard.classList.remove(`unactive`);
        addCardEvents(unactiveCard);
        this.ownCards[this.cardsId] = cardObj;
        this.cardsId++;
    
        CardAnimation(unactiveCard, ownCardsDiv.offsetLeft + ownCardsDiv.offsetWidth/2, ownCardsDiv.offsetTop, cardObj);
    }
    
    async timer() {
        for(let seconds = 60; seconds >= 0; seconds--) {
            updateTimer(seconds);
            if(!this.myTurn) {
                break;
            }
            if(seconds <= 0) {
                emitEvent('userSleep', null);
                return false;
            }
            //console.log(seconds);
            await sleep(1000);
        }
    
        return true;
    }
}


function CardAnimation(card, destX, destY, cardObj) {
    if(cardObj) destY -= card.offsetParent.offsetTop;
    else destY += card.offsetParent.offsetTop;
    let posX = card.offsetLeft;
    let posY = card.offsetTop;
    let k = (destY)/(destX);
    let koef = 1;
    if(destY < posY) {
        koef = -1;
    }
    const compare = (posY, destY) => {
        if(koef == 1) return posY >= destY;
        else return posY <= -destY + 70; // 70 выбрано наугад)
    };
    let id = setInterval(() => {
        if (compare(posY, destY)) {
            card.style['background-size'] = '130px 180px';
            card.style.left = '0px'
            card.style.top = '10px'
            card.style['margin-right'] = '-60px'
            if (cardObj) {
                //card.style['background-image'] = `url("spider.jpeg")`
                card.style.position = 'unset'
                document.querySelector('.down .your_cards').append(card);
            }
            else {
                card.style.position = 'relative'
                card.style['background-image'] = `url("deck.png")`
                card.style['transform'] = 'rotate(180deg)'
                document.querySelector('.up .cards_place').append(card);
            }
            clearInterval(id)
        } else {
            posX += 5;
            posY = koef*k*posX;
            card.style.left = posX + 'px';
            card.style.top = posY + 'px';
        }
    }, 10)
}

function createCard() {
    let card = document.createElement('div');
    card.classList.add('unactive');
    card.classList.add('cards_item');
    
    //card.classList.add('enemy');
    return card;
}

function updateMana(tempManaCount, manaCount) {
    manaSpan.textContent = tempManaCount + '/' + manaCount;
}

function updateEnemyHP(hp) {
    enemyHP.textContent = hp;
}

const sleep = (ms) => { 
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function updateTimer(seconds) {
    document.querySelector('.timer').textContent = seconds; 
}

function updateUnit(elem, cardObj) {
    //elem.textContent = cardObj.name + ' damage: ' + cardObj.damage + ' defence: ' + cardObj.defence + ' mana: ' + cardObj.mana;
    elem.querySelector('.defence').textContent = cardObj.defence;
}


async function animateAttack(animationCard, defenceCard, callback) {
    let fromX = getElemCoords(animationCard).x, fromY = getElemCoords(animationCard).y
    toX = getElemCoords(defenceCard).x
    toY = getElemCoords(defenceCard).y
    if (animationCard.classList.contains('cards_item')
    && defenceCard.classList.contains('cards_item')) {
        fromX -= 2*animationCard.offsetWidth;
        toX -= 2*defenceCard.offsetWidth;
    }

    let vectorX = Math.round(toX - fromX), vectorY = Math.round(toY - fromY)
    let counter = 0
    let stepX = 0, stepY = 0
    //console.log('vector X ' + vectorX);
    if (Math.abs(vectorY) > Math.abs(vectorX)) {
        console.log(1)
        stepX = vectorX == 0 ? 0 : vectorX / Math.abs(vectorX)
        stepY = vectorX == 0 ? (vectorY > 0 ? 5: -5) :(vectorY / Math.abs(vectorX))
        //stepY /= 2;
        if(vectorY % stepY) vectorY += stepY - vectorY % stepY;
        
        console.log(vectorX,  vectorY, stepX, stepY);
    } else {
        console.log(2)

        stepX = (vectorX / Math.abs(vectorY))
        stepY = vectorY / Math.abs(vectorY)
    }

    function reverseSign(step){
        return -1*step
    }

    animationCard.style.position = 'relative'
    animationCard.style.left = '0px'
    animationCard.style.top = '0px'
    let inintX = 0, inintY = 0
    let isReverse = false;

    let interID = setInterval(() => {
        inintX += stepX
        inintY += stepY
        animationCard.style.top = inintY + 'px'
        animationCard.style.left = inintX + 'px'
        //console.log(animationCard.style.left + ' ' + animationCard.style.top + ' ' + counter + ' ' + vectorY);
        counter += stepY

        if(Math.round(counter) === Math.round(vectorY)) {
            stepX = reverseSign(stepX)
            stepY = reverseSign(stepY)
            isReverse = true;
            callback(animationCard, defenceCard);
        }
        if(Math.abs(counter) < 0.1 && isReverse) {
            if(animationCard.classList.contains('own'))
                animationCard.style['filter'] = 'brightness(0.4)';
            clearInterval(interID)
        }
    }, 4)
}

function getElemCoords(elem) {
    coords = {x: 0, y: 0};
    
    let tempElem = elem;
    while(tempElem !== document.body) {
        coords.x += tempElem.offsetLeft;
        coords.y += tempElem.offsetTop;
        tempElem = tempElem.offsetParent;
    }

    console.log(coords);
    return coords;
}