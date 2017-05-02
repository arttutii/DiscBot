'use strict';

const bcrypt = require('bcrypt');

class Database {
    constructor() {
        this.mongoose = require('mongoose');
        this.mongoose.Promise = global.Promise;
    }

    connect(url, app, callback) {
        this.url = url;
        this.app = app;
        this.mongoose.connect(this.url).then(() => {
            console.log('Mongo connected');
            /*this.app.use ((req, res, next) => {
                if (req.secure) {
                    // request was via https, so do no special handling
                    next();
                } else {
                    // request was via http, so redirect to https
                    res.redirect('https://' + req.headers.host + req.url);
                }
            });*/
            this.app.listen(3000);
            callback('Success');
        }, (err) => {
            console.log(err.message);
            console.error('Connecting to Mongo failed');
            process.exit(1);
        });
    }

    getSchema(schema, name) {
        const s = new this.mongoose.Schema(schema);
        return this.mongoose.model(name, s);
    }

    getUserSchema(schema){
        return new this.mongoose.Schema(schema);
    }

    hashPassword(Schema) {
        const UserSchema = Schema;

        UserSchema.pre('save', function(next) {
            const user = this;

            // only hash the password if it has been modified (or is new)
            if (!user.isModified('password')) {
                return next();
            }

            // generate a salt
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    return next(err);
                }

                // hash the password using our new salt
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (err) {
                        return next(err);
                    }

                    // override the cleartext password with the hashed one
                    user.password = hash;
                    next();
                });
            });
        });

        // Assign a method for the schema to use on comparing password
        UserSchema.methods.comparePassword = function(candidatePassword, callback){
            bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
                if (err) {
                    return callback(err);
                }
                callback(null, isMatch);
            });
        };

        // Return the schema with the hashed password
        return UserSchema;

    };

    createUser(User,uname, pword, callback){
        // create a user a new user
        const newUser = new User({
            username: uname,
            password: pword
        });

        // save user to database
        newUser.save(function(err) {
            if (err) {
                throw err;
            }
            callback('User creation successful.')

        });
    }
}

module.exports = new Database();