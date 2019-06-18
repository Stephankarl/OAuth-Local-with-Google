module.exports = {
    checkAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash('error', 'Please Log in first.');
        res.redirect('/users/login');
    }
};