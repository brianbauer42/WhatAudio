const LocalStrategy = require('passport-local').Strategy;
const User = require('./../models/User.js');

// 1-32 characters long, containing upper and lowercase letters, numbers, and underscores.
const validDisplayName = /^[a-zA-Z0-9_]{1,32}$/;

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
            if (!validDisplayName.test(req.body.signup.name)) {
                return done(null, false, { message: "Names may contain only letters, numbers, or _ and must be under 33 characters"})
            }
            User.findOne({$or: [
                { 'email': email },
                { 'displayName': req.body.signup.name }
                ]}, function(err, user) {
                if (err) {
                    console.log(err);
                    return done(err, false);
                }
                if (user && (user.displayName === req.body.signup.name)) {
                    return done(null, false, { message: "User name already taken." });
                } else if (user && (user.email === email)) {
                    return done(null, false, { message: "This email already has an account." });
                } else if (req.body.signup.password !== req.body.signup.verify) {
                    return (done(null, false, { message: "The passwords don't match!"}));
                } else {
                    var newUser = new User();
                    newUser.email       = email;
                    newUser.displayName = req.body.signup.name;
                    newUser.password    = newUser.generateHash(password);
                    newUser.save(function(err) {
                        if (err) {
                            console.log(err);
                            return done(err, false);
                        }
                        return done(null, newUser, { message: "Welcome, " + newUser.displayName + "!" });
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