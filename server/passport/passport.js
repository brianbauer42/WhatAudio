const LocalStrategy = require('passport-local').Strategy; //Call in passport-local's Strategy method, which is where all of the reserved methods for local auth are held
const User = require('./../models/User.js'); // Require our user model

module.exports = function(passport) { // Call in passport as a parameter

    // serializeUser prepares session data for transmission by stripping unnecessary user data. Some data such as passwords do not need to be (and shouldn't be) sent with every transmission. Only the mongo _id field is kept so that the rest of the data can be recovered later by deserialize user.
    passport.serializeUser(function(user, done) {
        console.log("USER", user);
        done(null, user.id);                     // Save only the id
    });


    // Makes user data available to us in the form of req.user by finding the rest of the data attached to the mongo _id on the incoming request.
    passport.deserializeUser(function(id, done) {
        console.log("ID", id);
        User.findById(id, function(err, user) {  // Uses the saved mongo _id to find the rest of the user data.
            done(err, user);                     // This gets saved to req.user
        });
    });

    // Create strategy for registration.
    passport.use('local-signup', new LocalStrategy({ // Name this new strategy 'local-signup'
            usernameField : 'email',  //this can be username, email, anything as long as you update all other instances of email on this file.
            passwordField : 'password',
            passReqToCallback : true  //this makes it so we only need one callback function below
        },
        function(req, email, password, done) {
            // asynchronous
            // User.findOne wont fire unless data is sent back
            console.log('passport strategy local-signup: ', req.body);
            process.nextTick(function() { // Waits until all previous code has completed then runs callback function. This is a node function.
            User.findOne({'email': email}, function(err, user) { // Find-by-email mongoose function returns an error or a user object
                console.log('alpha');
                if (err) return done(err);
                console.log('beta');                       // If there is an error return the error
                if (user) {                                      // If there is a valid user, verify password is correct
                    console.log('User already exists')             // Username or email has already been taken
                    return done(null, false);
                } else {                                               // No user found, make a new user
                    console.log('charlie');
                    var newUser = new User(req.body);                  // Create our new user object to insert into the database
                    newUser.email    = email;                          // User's email
                    newUser.password = newUser.generateHash(password); // Save password in hashed form (plaintext isn't secure, obviously!)
                    newUser.save(function(err) {                       // Save the new user to the database
                        if (err) throw err;
                        console.log('Created new user', newUser);
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

    // This strategy will handle login for returning users.
    passport.use('local-login', new LocalStrategy({   // Name our new strategy 'local-login'
            usernameField : 'email',   // This can be username, email, anything as long as you update all other instances of email on this file.
            passwordField : 'password',
            passReqToCallback : true   // This makes its so we only need one callback function below
        },
        function(req, email, password, done) {
            process.nextTick(function() { // Waits until all previous code has completed then runs callback function. This is a node function.
                User.findOne({'email': email}, function(err, user) {  // Find-by-email mongoose function returns an error or a user object
                    if (err) return done(err);                        // If there is an error return the error
                    if (user) {                                       // If there is a valid user, verify password is correct
                    if (user.validPassword(password)) {  // Pass password to method we defined in userModel file to check if password matches
                        console.log('Successful login');
                        return done(null, user);                    // Success! Return user.
                    } else {
                        console.log('Invalid email or password');
                        return done(null, false);                   // Bad password!
                    }
                    } else {                               // If we get this far, it means the user was not found in our database
                    console.log("User not found in the database");
                    return done(null, false);
                    }
                });
          });
    }));
};