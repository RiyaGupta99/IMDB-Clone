const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require("../models/user");

module.exports = function (passport) {
    passport.use("user-local",
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            User.findOne({ email })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'Email not registered' });
                    }
                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Incorrect Password' });
                        }
                    });
                });
        })
    );

    
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user); 
        });
    });
};
