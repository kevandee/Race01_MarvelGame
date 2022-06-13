const express = require('express');
const {authenticateToken} = require('../utils/token');
const path = require('path');
const User = new (require('../models/user'))('users');

const router = express.Router();

router.get('/onGame', authenticateToken, (req, res) => {
    res.sendFile(path.resolve('views', 'game.html'));
});

router.get('/change', authenticateToken, (req, res) => {
    res.sendFile(path.resolve('views', 'change.html'));
});

router.post('/changeAvatar', authenticateToken, (req, res) => {
    const save_img = 'profile_imgs/' + req.body.profile_img + '.jpg';
    User.save({id: req.user.id, profile_img: save_img});
    res.redirect('/');
});

module.exports = router;