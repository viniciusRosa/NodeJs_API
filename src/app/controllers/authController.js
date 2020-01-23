const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/auth')
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, config.secret, {
        expiresIn: 86400
    })
}


router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: 'User already exists' });
        }

        const user = await User.create(req.body);

        return res.send({ 
            user,
            token: generateToken({id: user._id}) 
         });
         
    } catch (err) {
        return res.status(400).send({ error: 'registration failed' });
    }
})

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(400).send({ error: 'User not found' });
    }

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Invalid password' });
    }


        res.send({ 
            user, 
            token: generateToken({id: user._id}) 
        });

})


router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {

        const user = await User.findOne({ email });

        if(!user) {
            return res.status(400).send({ error: 'User not found' });
        }

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user._id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        })

      
      mailer.sendMail({
          to: email,
          from: 'vinicius.rosa00@gmail.com',
          template: '/forgot_password', 
          context: { token },
      }, (err) => {
          if(err) {
              console.log(err)
              return res.status(400).send({ error: 'cannot send forgot password email' });
          }

          return res.send()
      })  

    }catch(err) {
        console.log(err);
        res.status(400).send({ error: 'Error on forgot password, try again' })
    }
})

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email })
        .select('+passwordResetToken passwordResetExpire');

        if(!user) {
            return res.status(400).send({ error: 'User not found' });
        }

        if(token !== user.passwordResetToken) {
            return res.status(400).send({ error: "token invalid" })
        }

        const now = new Date();

        if(now > user.passwordResetExpires) {
            return res.status(400).send({ error: "token expired, generate a new one" })
        }

        user.password = password;

        await user.save();

        res.send();


    }catch(err){
        res.status(400).send({ error: "cannot reset yoru password, try again" })
    }

})


module.exports = app => app.use('/auth', router); 