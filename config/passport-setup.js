const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = (passport) => {
    //Local Strategy
    passport.use(new LocalStrategy({
        usernameField: 'email'
    }, (email, password, done) => {
        //See if email exist
        User.findOne({ email: email }, (err, user) => {
            if(err) { return done(err); }
            if(!user) {
                return done(null, false, { message: 'Email not registered.' });
            }
            //Match Password
            bcrypt.compare(password, user.password).then((matched) => {
                if(matched){
                    return done(null, user);
                }
                return done(null, false, { message: 'Password Incorrect.' });
            }).catch((err) => {
                console.log(err);
            });
        });
    }));

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/users/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        User.findOne({ email: profile._json.email }).then((user) => {
            //Checking if User exist
            if(user) {
                return done(null, user);
            }
            //Creating new User
            new User({
                googleID: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile._json.email,
                photo: profile._json.picture
            }).save().then((user) => {
                console.log(user);
                return done(null, user);
            });
        })
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
      
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};