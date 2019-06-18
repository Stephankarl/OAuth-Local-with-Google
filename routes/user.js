const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { checkAuthenticated } = require('../config/auth');
const User = require('../models/user');

//Register Routes
router.get('/register', (req, res) => {
    res.render('users/register');
});

//Register Handle
router.post('/register', (req, res) => {
    const { firstName, email, password } = req.body;
    let errors = [];

    if(!firstName || !email || !password) {
        errors.push( { msg: 'Please fill in all fields' });
    }

    if(password.length < 6){
        errors.push({ msg: 'Password must be more than 6 caracters' });
    }

    if(errors.length > 0) {
        res.render('users/register', { errors, firstName, email, password });
    } else {
        User.findOne({ email: email }).then(user => {
            if(user) {
                errors.push({ msg: 'Email already exist.' });
                res.render('users/register', { errors, fistName, password });
            } else {
                const newUser = new User({
                    firstName, email, password
                });
                //Hash Password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save().then(user => {
                            passport.authenticate('local')(req, res, () => {
                                req.flash('success', `Welcome ${user.username}`);
                                res.redirect(`/users/${user.id}`);
                            });
                        });
                    });
                });
            }
        });
    }
});

//Login Route
router.get('/login', (req, res) => {
    res.render('users/login');
});

//Login Handel
router.post('/login', passport.authenticate('local', { 
    failureRedirect: '/users/login',
    failureFlash: true
 }), 
(req, res) => {
    req.flash('success', `${req.user.username} is now logged in.`);
    res.redirect(`/users/${req.user.id}`);
});

//Google Auth Routes
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/redirect', passport.authenticate('google', {
    failureRedirect: '/users/login',
    failureFlash: true
 }),(req, res) => {
    res.redirect(`/users/${req.user.id}`);
});

//User Profile
router.get('/:id', checkAuthenticated, (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err) throw err;
        res.render('users/profile', { user });
    })
});

module.exports = router;