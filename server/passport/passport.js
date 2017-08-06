const LocalStrategy = require('passport-local').Strategy;
const User = require('./../models/User.js');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField : 'signup[email]',
            passwordField : 'signup[password]',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            process.nextTick(function() {
            User.findOne({$or: [
                { 'email': email },
                { 'name': req.body.signup.name }
                ]}, function(err, user) {
                if (err) return done(err);
                if (user && (user.displayName === req.body.signup.name)) {
                    return done(null, false, { message: 'User name already taken.' });
                } else if (user && (user.email === email)) {
                    return done(null, false, { message: 'An account with the email address already exists' });
                } else if (req.body.signup.password !== req.body.signup.verify) {
                    return (done(null, false, { message: "The passwords don't match!"}));
                } else {
                    var newUser = new User();
                    newUser.email       = email;
                    newUser.displayName = req.body.signup.name;
                    newUser.password    = newUser.generateHash(password);
                    newUser.save(function(err) {
                        if (err) console.log(err);
                        return done(null, newUser, { message: "Welcome, " + user.displayName + "!" });
                    });
                }
            });
        });
    }));

    passport.use('local-login', new LocalStrategy({
            usernameField : 'login[email]',
            passwordField : 'login[password]',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            process.nextTick(function() {
                User.findOne({'email': email}, function(err, user) {
                    if (err) return done(err);
                    if (user && user.validPassword(password)) {
                        return done(null, user, { message: 'Welcome back, ' + user.displayName + '!' });
                    } else if (user) {
                        return done(null, false, { message: 'Invalid password.' });
                    } else {
                        return done(null, false, { message: 'Email not found!' });
                    }
                });
          });
    }));
};