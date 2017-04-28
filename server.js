'use strict';
const dotenv = require('dotenv').config(),
    express = require('express'),
    app = express(),
    ytdl = require('ytdl-core'),
    DiscBot = require('./modules/DiscBot'),
    shelp = require('./modules/ServerHelper.js'),
    Imgur = require('./modules/Imgur.js'),
    Giphy = require('./modules/Giphy.js'),
    YT = require('./modules/YouTube.js'),
    DB = require('./modules/DataBase.js');

app.use(express.static('public'));

// set up database
const user = process.env.DB_USER;
const pw = process.env.DB_PASS;
const host = process.env.DB_HOST;
DB.connect('mongodb://' + user + ":" + pw + "@" + host, app, () => {
    // Login with the bot's token
    DiscBot.client.login(process.env.BOT_TOKEN);
});

app.get('/init', (req, res) => {
    const data = {
        user: DiscBot.client.user,
        avatar: DiscBot.client.user.displayAvatarURL,
    };
    res.send(data);
});

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
    if (msg.length > 1) {
        params = shelp.parseParams(message.content);
        // replace accented characters
        params = params.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    }

    if (keyword === '!help'){
        message.reply('Following commands are available: \n'
            + '\n !setavatar [image web URL]'
            + '\n !imgur [search word/s]'
            + '\n !giphy [search word/s]'
            + '\n !yt [search word/s]'
            + '\n !hello'
            + '\n !stop'
        );
    }

    if (keyword === '!hello'){
        DiscBot.playAudio(message,null,'./public/audio/hey.mp3');
    }

    if (keyword === '!stop'){
        DiscBot.leaveVoiceChannel();
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

    if (keyword === '!giphy' && params) {
        Giphy.searchGif(params, (result) => {
            console.log('giphy result: ' + result );
            message.reply(result);
        });
    }

    if (keyword === '!yt' && params) {
        YT.ytSearch(params, (result) => {
            console.log('youtube result: ' + result );
            DiscBot.playAudio(message, result);
        });
    }

    if (keyword === '!tts' && params) {
        // TBA
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
