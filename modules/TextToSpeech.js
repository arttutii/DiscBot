'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const urlParse  = require('url').parse;
const googleTTS = require('google-tts-api');
const shelp = require('./ServerHelper.js');

class TTSModule {

    downloadFile (url, dest, callback) {
        const info = urlParse(url);
        const httpClient = info.protocol === 'https:' ? https : http;
        const options = {
            host: info.host,
            path: info.path,
            headers: {
                'user-agent': 'WHAT_EVER'
            }
        };

        httpClient.get(options, function(res) {
            // check status code
            if (res.statusCode !== 200) {
                callback(new Error('request to ' + url + ' failed, status code = ' + res.statusCode + ' (' + res.statusMessage + ')'));
                return;
            }

            const file = fs.createWriteStream(dest);
            file.on('finish', function() {
                // close() is async, call resolve after close completes.
                file.close(callback);
            });
            file.on('error', function (err) {
                // Delete the file async. (But we don't check the result)
                fs.unlink(dest);
                callback(err);
            });

            res.pipe(file);
        })
            .on('error', function(err) {
                callback(err);
            })
            .end();
    }

    talk(query, callback){
        // temporary array of the query to check for TTS parameters
        let params = query.split(" ");
        // variable for the words to speak through tts
        let msg = query;
        // language for tts
        let lg = 'fi';
        // speaking speed
        let speed = 1;

        if (params.length >= 2){
            if (params[0].startsWith("/")){
                // set the language from the query parameter and convert the string
                lg = params[0].replace(/\//g, "");
                msg = shelp.parseParams(query);
            }
            if(params[1].startsWith("/")){
                // set speed and parse param from the string
                speed = params[1].replace(/\//g, "");
                speed = parseFloat(speed);
                msg = shelp.parseParams(msg);
            }
        }
        // tts seems to only play queries under 200 characters
        if (msg.length <= 200){
            googleTTS(msg, lg, speed)   // speed normal = 1 (default), slow = 0.24
                .then((url) => {
                    const dest = path.resolve(__dirname, '../audio/temp.mp3'); // file destination
                    const dl = (url, callback) => this.downloadFile(url, dest, cb =>{
                        callback(cb);
                    });

                    /*if (fs.existsSync(dest)) {
                     console.log(fs.existsSync(dest))
                     }
                     console.log('params length: ', msg.length);*/
                    fs.unlink(dest,(err) => {
                        if(err) {
                            console.log(err);
                        }
                        dl(url, cb => {
                            callback({status: 'OK', message: './temp.mp3'});
                        });
                    });
                });
        } else {
            callback({
                status: 'error',
                message: 'Message length must be under 200 characters. Your message is ' + msg.length + ' characters.'
            });
        }
    }

}

module.exports = new TTSModule();