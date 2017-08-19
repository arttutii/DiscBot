'use strict';
const winston = require('winston'),
    moment = require('moment');

// set correct locale for logging
moment.locale('fi');

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

        /**TODO: 
            RM BOT_TOKEN, GOOGLE_KEY
            temp.mp3 -> audio/ 
        */
    logger() {
        return new (winston.Logger)({
            transports: [
                new (winston.transports.File)({ filename: `./logs/${moment().format('YYYY-MM-DD')}.log`}),
                new (winston.transports.Console)({
                  timestamp: function() {
                    return moment().format('L-LTS');
                  },
                  formatter: function(options) {
                    // Return string will be passed to logger. 
                    return options.timestamp()+' '+ (options.message ? options.message : '') +
                      (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
                  }
                })
            ]
        });  

    }
}

module.exports = new ServerHelper;