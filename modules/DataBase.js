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

            this.generateHash(user.password, (cb) => {
                if (cb.hash){
                    user.password = cb;
                    next();
                }
                if (cb.err){
                    next(cb.err);
                }

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

    generateHash(password, callback){
        // generate a salt
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                callback({err: 'somedin gone wrong with salt factory: ' + err});
            }

            console.log('trying to hash dis: '+ password);
            // hash the password using our new salt
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    callback({err: 'problem wid da hash? ' + err});
                } else {
                    // override the cleartext password with the hashed one
                    callback({hash: hash});
                }


            });
        });
    }

    createUser(User,uname, pword, callback){
        // create a user a new user
        const newUser = new User({
            username: uname,
            password: pword
        });

        // save user to database
        newUser.save(function(err) {
            if (err) {
                callback(err);
            }
            callback('User creation successful.')

        });
    }

    updateUser(User, uName, newPw, callback) {
        let hashedPword = null;
        console.log('HALOO: ', uName, newPw);
        this.generateHash(newPw, (hashedPass) => {
            if(hashedPass.hash){
                hashedPword = hashedPass.hash;

                User.update(
                    {username: uName},
                    {$set: {password: hashedPword}}
                ).then(post => {
                    callback(post);
                }).then((err) => {
                    callback('error: ' + err);
                });
            } else {
                callback('Generated hash not found: ' + hashedPass.err);
            }


        });
    }
}

module.exports = new Database();