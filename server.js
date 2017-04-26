'use strict';
const dotenv = require('dotenv').config(),
    express = require('express'),
    app = express(),
    Discord = require('discord.js'),
    ytdl = require('ytdl-core'),
    shelp = require('./modules/ServerHelper.js'),
    Imgur = require('./modules/Imgur.js'),
    Giphy = require('./modules/Giphy.js'),
    YT = require('./modules/YouTube.js'),
    DB = require('./modules/DataBase.js');

// Initialize client
const bot = new Discord.Client();
// bot's current voice channel
let voiceChannel = null;

app.use(express.static('public'));

// set up database
const user = process.env.DB_USER;
const pw = process.env.DB_PASS;
const host = process.env.DB_HOST;
DB.connect('mongodb://' + user + ":" + pw + "@" + host, app, callback => {
    // Login with the bot's token
    bot.login(process.env.BOT_TOKEN);
});

app.get('/init', (req, res) => {
    const data = {
        user: bot.user,
        avatar: bot.user.displayAvatarURL,
    };
    res.send(data);
});

// This code will run once the bot has started up.
bot.on('ready', () => {
    console.log('Ready to serve!');
});

// This code will run once the bot has disconnected from Discord.
bot.on('disconnected', () => {
    console.log('Disconnected!');

    // exit node.js with an error
    process.exit(1);
});

// This code will run once the bot receives any message.
bot.on('message', message => {
    // turn the search query to lowercase letters and trim all unnecessary whitespace
    const messageString = message.content.toLowerCase().trim().replace(/ +/g, " ");
    let msg = messageString.split(" ");

    if (msg[0] === '!help'){
        message.reply('Following commands are available: \n'
            + '\n !setavatar [image web URL]'
            + '\n !imgur [search word/s]'
            + '\n !giphy [search word/s]'
            + '\n !yt [search word/s]'
            + '\n !hello'
            + '\n !stop'
        );
    }

    if (msg[0] === '!hello'){
        try {
            // if an audio was playing, stop it before starting a new one
            if (voiceChannel){
                voiceChannel.leave();
            }

            // Get the first voice channel on the server of the sender
            const firstVC = message.guild.channels.find(res => res.type === 'voice');
            // Get the message sender's current voice channel
            const userVC = message.guild.members.find(member => member.id === message.author.id).voiceChannelID;

            // Find the channel from the bot's perspective and join it
            if (userVC){
                voiceChannel = bot.channels.find(channel => channel.id === userVC);
            } else {
                voiceChannel = bot.channels.find(channel => channel === firstVC);
            }
            voiceChannel.join().then(connection => {
                // play the sound file
                const dispatcher = connection.playFile('./public/audio/hey.mp3');

            });
        } catch (e) {
            console.log(e);
        }
    }

    if (msg[0] === '!stop'){
        if (voiceChannel){
            voiceChannel.leave();
        }
    }

    // Command for setting the avatar image for the bot
    if (msg[0] === '!setavatar' && msg.length > 1){
        // check if the URL is valid
        if(msg[1].startsWith("http://") || msg[1].startsWith("https://")){
            bot.user.setAvatar(msg[1])
                .then((user) =>{
                    console.log(`New avatar set: ` + msg);
                    message.reply('Avatar set successfully!');
                }).catch((err) => {
                console.log(err);
                if (err.status == 400){
                    message.reply('Sorry, you are changing the avatar too frequently. Please wait and try again later.');
                } else {
                    message.reply('Sorry could not set the avatar image. The URL for the avatar you requested did not result an image.');
                }
            });
        } else {
            console.log('Requested avatar url not valid.');
            message.reply('Sorry could not set the avatar image. The URL for the avatar you requested is not valid.');
        }
    }

    if (msg[0] === '!imgur' && msg.length > 1) {
        Imgur.searchImage(msg[0],(messageString), (result) => {
            console.log('imgur result: ' + result );
            message.reply(result);
        });
    }

    if (msg[0] === '!giphy' && msg.length > 1) {
        Giphy.searchGif(msg[0],(messageString), (result) => {
            console.log('giphy result: ' + result );
            message.reply(result);
        });
    }

    if (msg[0] === '!yt' && msg.length > 1) {
        YT.ytSearch(msg[0],(messageString), (result) => {
            console.log('youtube result: ' + result );

            // if an audio was playing, stop it before starting a new one
            if (voiceChannel){
                voiceChannel.leave();
            }

            const stream = ytdl('https://www.youtube.com/watch?v=' + result, {filter: 'audioonly'});
            const streamOptions = {seek: 0, volume: 1};

            // Get the first voice channel on the server of the sender
            const firstVC = message.guild.channels.find(res => res.type === 'voice');
            // Get the message sender's current voice channel
            const userVC = message.guild.members.find(member => member.id === message.author.id).voiceChannelID;

            // Find the channel from the bot's perspective and join it
            if (userVC){
                voiceChannel = bot.channels.find(channel => channel.id === userVC);
            } else {
                voiceChannel = bot.channels.find(channel => channel === firstVC);
            }
            voiceChannel.join().then(connection => {
                // play the sound file
                const dispatcher = connection.playStream(stream, streamOptions);

            });

        });
    }

    // print out whatever was received to the console
    // filter out the messages sent out by the bot
    if (message.author.id !== bot.user.id){
        if (message.channel.isPrivate) {
            console.log(`(Private) ${message.author.username}: ${message.content}`);
        } else {
            console.log(`(${message.guild} / ${message.channel.name}) ${message.author.username}: ${message.content}`);
        }
    }
});
