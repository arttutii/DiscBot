'use strict';

class ServerHelper {

    parseKeyword(str) {
        if (str.indexOf(' ') === -1) {
            return str;
        } else {
            return str.substr(0, str.indexOf(' '));
        }
    };

    parseParams(str){
        let newStr = str.trim();
        let start = newStr.indexOf(' ') + 1;
        let end = newStr.length-1;
        return newStr.substr(start, end);
    }


    loginStatus(req, res, next) {
        if (req.user) {
            next();
        } else {
            res.redirect('/login.html');
        }
    }

}

module.exports = new ServerHelper;