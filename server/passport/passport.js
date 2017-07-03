const LocalStrategy = require('passport-local').Strategy;
const User = require('./../models/User.js');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        console.log("USER", user);
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        console.log("ID", id);
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
            console.log('passport strategy local-signup: req.body.signup:', req.body.signup );
            User.findOne({$or: [
                { 'email': email },
                { 'name': req.body.signup.name }
                ]}, function(err, user) {
                console.log("FORTY TWO SV");
                if (err) return done(err);
                if (user && (user.name === req.body.signup.name)) {
                    return done(null, false, { message: 'User name already taken.' });
                } else if (user && (user.email === email)) {
                    return done(null, false, { message: 'An account with the email address already exists' });
                } else if (req.body.signup.password !== req.body.signup.verify) {
                    return (done(null, false, { message: "The passwords don't match!"}));
                } else {
                    var newUser = new User();
                    newUser.email    = email;
                    newUser.name     = req.body.signup.name;
                    newUser.password = newUser.generateHash(password);
                    console.log("new user being created!", newUser);
                    return done(null, newUser);
                    // newUser.save(function(err) {
                    //     if (err) throw err;
                    //     console.log('Created new user', newUser);
                    //     return done(null, newUser);
                    // });
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
                        return done(null, user, { message: 'Welcom back, ' + user.name + '!' });
                    } else if (user) {
                        return done(null, false, { message: 'Invalid password.' });
                    } else {
                        return done(null, false, { message: 'Email not found!' });
                    }
                });
          });
    }));
};