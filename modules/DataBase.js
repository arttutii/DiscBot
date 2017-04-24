'use strict';

class Database {
    constructor() {
        this.mongoose = require('mongoose');
        this.mongoose.Promise = global.Promise;
    };

    connect(url, app, callback) {
        this.url = url;
        this.app = app;
        this.mongoose.connect(this.url).then(() => {
            console.log('Mongo connected');
            this.app.use ((req, res, next) => {
                if (req.secure) {
                    // request was via https, so do no special handling
                    next();
                } else {
                    // request was via http, so redirect to https
                    res.redirect('https://' + req.headers.host + req.url);
                }
            });
            this.app.listen(3000);
            callback('Success');
        }, (err) => {
            console.log(err.message);
            console.error('Connecting to Mongo failed');
            process.exit(1);
        });
    };

    getSchema(schema, name) {
        const s = new this.mongoose.Schema(schema);
        return this.mongoose.model(name, s);
    }
}
module.exports = new Database();