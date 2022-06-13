const jwt = require('jsonwebtoken');
const path = require('path');
const UserModel = require('../models/user.js');
const config = require('../config.json');

const User = new UserModel('users');

exports.login = (req,res) => {
    if(req.cookies.token) {
      jwt.verify(req.cookies.token, config.jwt.secret, (err, user) => {
        if (err) {
          res.clearCookie('token');
          res.sendFile(path.resolve('views', 'login.html'));
        }
        else {
          res.redirect('/');
          return;
        }
      })
    }
    else {
      res.sendFile(path.resolve('views', 'login.html'));
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};

exports.menu = (req, res) => {
  res.sendFile(path.resolve('views', 'menu.html'));
};;

exports.home = (req, res) => {
    res.sendFile(path.resolve('views', 'index.html'));
};

exports.registrationPage = (req,res) => {
    res.sendFile(path.resolve('views', 'signup.html'));
};

exports.registration = async (req, res) => {
  console.log(req.body);
    if (await User.exists({name: 'login', value: req.body.login})){
        res.send('login');
        return;    
    }
    if (await User.exists({name: 'email', value: req.body.email})){
        res.send('email');
        return;    
    }    
    await User.save(req.body);
    res.clearCookie('token');
    res.redirect('/login');
};

exports.passwordRemind = (req, res) => {
    res.sendFile(path.resolve('views', 'remind.html'));
};

exports.passwordSent = (req, res) => {
    res.sendFile(path.resolve('views', 'sended.html'));
};