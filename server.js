'use strict';
const dotenv = require('dotenv').config(),
    ytdl = require('ytdl-core'),
    DiscBot = require('./modules/DiscBot'),
    shelp = require('./modules/ServerHelper.js'),
    Imgur = require('./modules/Imgur.js'),
    YT = require('./modules/YouTube.js'),
    TTS = require('./modules/TextToSpeech.js');

// Login with the bot's token
try {
    console.log('connecting..');
    DiscBot.client.login(process.env.BOT_TOKEN);
} catch (e) {
    console.log('error with bot login: ', e);
}

// This code will run once the bot has started up.
DiscBot.client.on('ready', () => {
    console.log('Ready to serve!');
});

// This code will run once the bot has disconnected from Discord.
DiscBot.client.on('disconnected', () => {
    console.log('Disconnected!');

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
            console.log('imgur result: ' + result );
            message.reply(result);
        });
    }

    if (keyword === '!tts' && ttsString) {
        TTS.talk(ttsString, (result) => {
            if (result.status === 'OK'){
                DiscBot.pauseAudio(message, pauseTime => {
                    console.log('pauseTime:', pauseTime);
                });
                DiscBot.playAudio(message, null, './modules/' + result.message);
            } else {
                message.reply(result.message);
            }
        });
    }

    if (keyword === '!yt' && params) {
        YT.ytSearch(params, (result) => {
            if (result.status === 'OK'){
                console.log('youtube result: ' + result.message);
                DiscBot.playAudio(message, result.message);
            } else {
                message.reply(result.message);
            }
        });
    }

    // print out whatever was received to the console
    // filter out the messages sent out by the bot
    if (message.author.id !== DiscBot.client.user.id){
        if (message.channel.isPrivate) {
            console.log(`(Private) ${message.author.username}: ${message.content}`);
        } else {
            console.log(`(${message.guild} / ${message.channel.name}) ${message.author.username}: ${message.content}`);
        }
    }
});
