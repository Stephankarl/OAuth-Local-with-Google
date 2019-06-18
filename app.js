require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const layout = require('express-ejs-layouts');

const app = express();

//Mongoose Config
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log('Connected to DB');
}).catch((err) => {
    console.log(err);
});

//Express Session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));

//Passport Strategy
require('./config/passport-setup')(passport);

//Passport Config
app.use(passport.initialize());
app.use(passport.session());

//App setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());
app.use(layout);

//Global Variables
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//Including routes
app.use('/users', require('./routes/user'));

// Home Page Route
app.get('/', (req, res) => {
    res.render('home');
});

//Logout Route
app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out successfully.');
    res.redirect('/');
});

const PORT = process.env.PORT || 3000

app.listen(PORT , () => console.log(`Listening on port ${PORT}`));