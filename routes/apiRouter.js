const express = require('express');
const {authenticateToken} = require('../utils/token');
const controller = require('../controllers/apiController');

const router = express.Router();

router.get('/getUserData', authenticateToken, controller.getUserData);
router.post('/newUser', controller.newUser);
router.post('/remind', controller.remind);

module.exports = router;