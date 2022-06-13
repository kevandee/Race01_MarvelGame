CREATE DATABASE IF NOT EXISTS marvel_game;
CREATE USER IF NOT EXISTS 'achaika'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL PRIVILEGES ON marvel_game.* TO 'achaika'@'localhost';

USE marvel_game;

CREATE TABLE IF NOT EXISTS users
(
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(30) NOT NULL,
    username VARCHAR(60) NOT NULL,
    email VARCHAR(60) NOT NULL UNIQUE,
    score INT NOT NULL DEFAULT 0,
    role VARCHAR(15) NOT NULL DEFAULT 'user',
    profile_img VARCHAR(60) NOT NULL DEFAULT 'profile_imgs/man.jpg'
);

CREATE TABLE IF NOT EXISTS cards
(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    mana INT NOT NULL,
    damage INT NOT NULL,
    defence INT NOT NULL,
    picture VARCHAR(128) NOT NULL DEFAULT 'default'
);

INSERT INTO cards(name, mana, damage, defence, picture) VALUES 
('Ant-Man', 1, 1, 1, 'cards/antman.png'),
('Baby Groot', 2, 3, 2, 'cards/groot.png'),
('Hulk', 5, 4, 6, 'cards/hulk.png'),
('Altron', 8, 5, 7, 'cards/altron.png'),
('Black Panther', 3, 2, 3, 'cards/blackpanther.png'),
('Black Widow', 2, 1, 2, 'cards/blackwidow.png'),
('Captain America', 3, 4, 3, 'cards/captainamerica.png'),
('Captain Marvel', 8, 7, 7, 'cards/captainmarvel.png'),
('Doctor Strange', 4, 3, 5, 'cards/doctorstrange.png'),
('Goblin', 2, 2, 2, 'cards/goblin.png'),
('Iron Man', 3, 4, 5, 'cards/ironman.png'),
('Spider-Man', 2, 3, 2, 'cards/spiderman.png'),
('Thanos', 9, 8, 8, 'cards/thanos.png'),
('Thor', 6, 7, 7, 'cards/thor.png'),
('Venom', 5, 5, 4, 'cards/venom.png');
