const UserModel = require('../models/user.js');
const {generateAccessToken} = require('../utils/token');
const nodemailer = require('nodemailer');
const config = require('../config.json');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.password
    }
});

const User = new UserModel('users');

exports.newUser = async (req, res) => {
    let id = await User.check(req.body);
    if(id == -1) {
      res.send('Invalid login or password');
      return;
    }
    await User.find(id);
    const token = generateAccessToken({login: User.login, id: User.id});
    res.cookie("token", token);//json({token: token});
    res.redirect('/');
}

exports.getUserData =  async (req, res) => {
    await User.find(req.user.id);
    res.json({login: User.login, full_name: User.full_name, email: User.email, role: User.role});
}

exports.remind = async (req, res) => {
    const email = req.body.email;
    const data = await User.getByObj({email: email});
    if(data === -1) {
      res.json({error: 'User with this login does not exist'});
      return;
    }
    let message = {
      from: `achaika <${config.email.user}>`,
      to: data.email,
      subject: 'Remind password',
      text: 'Your password: ' + data.password
    };
    // nodemailer
    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    //
  
    res.redirect('/login');
}
