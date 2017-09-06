
        /**TODO: 
            RM BOT_TOKEN, GOOGLE_KEY
            !ytpl
        */

        /* 
            added:
                TTS file location --> audio/ 
                yt playlist info library added (w/o --save)
                06.09.2017 -- YT play with URL
        */

'use strict';
const dotenv = require('dotenv').config(),
    ytdl = require('ytdl-core'),
    DiscBot = require('./modules/DiscBot'),
    shelp = require('./modules/ServerHelper.js'),
    Imgur = require('./modules/Imgur.js'),
    YT = require('./modules/YouTube.js'),
    TTS = require('./modules/TextToSpeech.js');

// assign a logger which logs console output to a file
const log = shelp.logger();

// Login with the bot's token
try {
    log.info('connecting..');
    DiscBot.client.login(process.env.BOT_TOKEN);
} catch (e) {
    log.log('error', 'error with bot login: ', e);
}

// This code will run once the bot has started up.
DiscBot.client.on('ready', () => {
    log.info('Ready to serve!');
});

// This code will run once the bot has disconnected from Discord.
DiscBot.client.on('disconnected', () => {
    log.info('Disconnected!');

    // exit node.js with an error
    process.exit(1);
});

// This code will run once the bot receives any message.
DiscBot.client.on('message', message => {
    let msg = message.content.split(" ");
    // parse the message's first word to recognize the keyword
    let keyword = shelp.parseKeyword(message.content).toLowerCase().trim();
    // assign message's parameters, if there are any
    let params = null;
    let ttsString = null;
    if (msg.length > 1) {
        params = shelp.parseParams(message.content);
        ttsString = shelp.parseParams(message.content);
        // replace accented characters
        params = encodeURI(params).replace(/%20/g,' ');
    }

    if (keyword === '!help'){
        message.reply('Following commands are available: \n'
            + '\n !setavatar [image web URL]'
            + '\n !imgur [search word/s]'
            + '\n !yt [search word/s]'
            + '\n !tts [/languageCode (eg. sv)] [/speakSpeed (0.01-1)] [word/s] --Maximum 200 characters'
            + '\n\t ^ Language codes are listed here: https://cloud.google.com/speech/docs/languages'
            + '\n !hello'
            + '\n !stop'
        );
    }

    if (keyword === '!hello'){
        DiscBot.playAudio(message,null,'./audio/hey.mp3');
    }

    if (keyword === '!stop'){
        DiscBot.leaveVoiceChannel(message);
    }

    if (keyword === '!setavatar' && params){
        DiscBot.setAvatar(params, (result) => {
            message.reply(result);
        });
    }

    if (keyword === '!imgur' && params ) {
        Imgur.searchImage(params, (result) => {
            log.info('imgur result: ' + result );
            message.reply(result);
        });
    }

    if (keyword === '!tts' && ttsString) {
        TTS.talk(ttsString, (result) => {
            if (result.status === 'OK'){
                DiscBot.pauseAudio(message, pauseTime => {
                    log.info('pauseTime:', pauseTime);
                });
                DiscBot.playAudio(message, null, './audio/' + result.message);
            } else {
                message.reply(result.message);
            }
        });
    }

    if (keyword === '!yt' && params) {
        YT.ytSearch(params, (result) => {
            if (result.status === 'OK'){
                log.info('youtube result: ' + result.message);
                DiscBot.playAudio(message, result.message);
            } else {
                message.reply(result.message);
            }
        });
    }

    if (keyword === '!ytpl' && params) {
        // e.g.
        // !ytpl RDQMgEzdN5RuCXE
        // TODO: parsee urlista list=CODE
        // call discbot.queueaudio() w/ listitems array
        YT.ytPlaylist(params, (result) => {
            if (result.status === 'OK'){
                log.info(`ytpl result: ${result.message[0].channelTitle} | ${result.message.length} items`);
                // playaudio
            } else {
                message.reply(result.message);
            }
        });
    }

    // print out whatever was received to the console
    // filter out the messages sent out by the bot
    if (message.author.id !== DiscBot.client.user.id){
        if (message.channel.isPrivate) {
            log.info(`(Private) ${message.author.username}: ${message.content}`);
        } else {
            log.info(`(${message.guild} / ${message.channel.name}) ${message.author.username}: ${message.content}`);
        }
    }
});
