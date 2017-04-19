const dotenv = require('dotenv').config(),
    express = require('express'),
    app = express(),
    Discord = require('discord.js'),
    shelp = require('./modules/ServerHelper.js'),
    Imgur = require('./modules/Imgur.js');

// Initialize client
const bot = new Discord.Client();
// Initialize imgur module
const imgur = new Imgur();

app.use(express.static('public'));

// Login with the bot's token
bot.login(process.env.BOT_TOKEN);

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
    app.listen(3000);
});

// This code will run once the bot has disconnected from Discord.
bot.on('disconnected', () => {
    console.log('Disconnected!');

    // exit node.js with an error
    process.exit(1);
});

// This code will run once the bot receives any message.
bot.on('message', message => {
    const msg = message.content.split(" ", 2);
    if (msg[0] === 'ping') {
        message.reply('pong');
    }
    // Command for setting the avatar image for the bot
    if (msg[0] === '!setavatar' && msg.length > 1){
        bot.user.setAvatar(msg[1])
            .then(user =>
                console.log(`New avatar set! user: ` + user)
            ).catch((err) => {
            console.log(err);
            message.reply('Sorry could not set the avatar image. The URL for the avatar you requested is not valid.');
        });
    }
    if (msg[0] === '!imgur' && msg.length > 1) {
        const search = imgur.search(msg[1], (result) => {
            console.log('search result: ' + result );
            message.reply(result);
        });
    }

    // print out whatever was received to the console
    // filter out the messages sent out by the bot
    if (message.author.id !== bot.user.id){
        if (message.channel.isPrivate) {
            console.log(`(Private) ${message.author.username}: ${message.content}`);
        } else {
            console.log(`(${message.server} / ${message.channel.name}) ${message.author.username}: ${message.content}`);
        }
    }
});
