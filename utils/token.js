const jwt = require('jsonwebtoken');
const config = require('../config.json');

function generateAccessToken(obj) {
  return jwt.sign(obj, config.jwt.secret, { expiresIn: config.jwt.tokenLife });
}

function authenticateToken(req, res, next) {
  let token = req.cookies.token;
  if (!token) 
    return res.redirect('/login');
  
  jwt.verify(token, config.jwt.secret, (err, decoded) => {
    if (err) {
      res.status(403).clearCookie('token').redirect('/login');
      return;
    };
    req.user = decoded;
    next();
  })
}

module.exports = {generateAccessToken, authenticateToken};