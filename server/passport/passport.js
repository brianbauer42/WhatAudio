const LocalStrategy = require('passport-local').Strategy;
const User = require('./../models/User.js');

module.exports = function(passport) {
    // serializeUser prepares session data for transmission by stripping unnecessary user data.
    // Some data such as passwords do not need to be (and shouldn't be) sent with every transmission.
    // Only the mongo _id field is kept so that the rest of the data can be recovered later by deserialize user.
    passport.serializeUser(function(user, done) {
        console.log("USER", user);
        done(null, user.id);
    });

    // Makes user data available to us in the form of req.user by finding the rest of the
    // data attached to the mongo _id on the incoming request.
    passport.deserializeUser(function(id, done) {
        console.log("ID", id);
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            // asynchronous
            // User.findOne wont fire unless data is sent back
            console.log('passport strategy local-signup: ', req.body);
            process.nextTick(function() { // Waits until all previous code has completed then runs callback function.
            User.findOne({$or: [
                { 'email': email },
                { 'name': req.fields.name }
                ]}, function(err, user) {
                if (err) return done(err);
                if (user.name === req.fields.name) {
                    console.log('User name already taken.');
                    return done(null, false, { message: 'User name already taken.' });
                } else if (user.email === email) {
                    console.log('An account with the email address already exists');
                    return done(null, false, { message: 'An account with the email address already exists' });
                } else if (req.fields.password !== req.fields.verify) {
                    console.log("Passwords don't match!");
                    return (done(null, false, { message: "The passwords don't match!"}));
                } else {
                    var newUser = new User();
                    newUser.email    = email;
                    newUser.name     = req.fields.name;
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
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            process.nextTick(function() {
                User.findOne({'email': email}, function(err, user) {
                    if (err) return done(err);
                    if (user && user.validPassword(password)) {
                        console.log('Successful login');
                        return done(null, user, { message: 'Welcom back, ' + user.name + '!' });
                    } else if (user) {
                        console.log('Invalid password');
                        return done(null, false, { message: 'Invalid password.' });
                    } else {
                        console.log("User not found in the database");
                        return done(null, false, { message: 'Email not found!' });
                    }
                });
          });
    }));
};