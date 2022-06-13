const express = require('express');
const {authenticateToken} = require('../utils/token');
const controller = require('../controllers/authController');

const router = express.Router();

/*
async function setAdmin() {
  if ((await User.getByLogin('administrator')) === -1) {
    User.save({
      login: 'administrator', 
      password: 'administrator', 
      full_name: 'Pavel Sapronov',
      email: 'chitai.pdf@gmail.com',
      role: 'admin'
    });
  }
}

setAdmin();
*/

router.get('/login', controller.login);
router.get('/logout', authenticateToken, controller.logout);
//router.get('/', authenticateToken, controller.home);
router.get('/', authenticateToken, controller.menu);
router.get('/signup', controller.registrationPage);
router.post('/registration', controller.registration);
router.get('/remind', controller.passwordRemind);
router.get('/password-sent', controller.passwordSent);

module.exports = router;