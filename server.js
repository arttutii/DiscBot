const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const Discord = require('discord.js');

const bot = new Discord.Client();
const botClient = new Discord.ClientUser();

app.use(express.static('public'));

// Login with the bot's token
bot.login(process.env.BOT_TOKEN);

app.get('/init', (req, res) => {
    const data = {
        user: bot.user,
        avatar: botClient.avatarURL,
        aURL: botClient.defaultAvatarURL
    };
    res.send(data);
});

// This code will run once the bot has started up.
bot.on("ready", () => {
    console.log("Ready to begin!");
    app.listen(3000);
});

// This code will run once the bot has disconnected from Discord.
bot.on("disconnected", () => {
    // alert the console
    console.log("Disconnected!");

    // exit node.js with an error
    process.exit(1);
});

// This code will run once the bot receives any message.
bot.on('message', message => {
    if (message.content === 'ping') {
        message.reply('pong');
    }
    if (message.channel.isPrivate) {
        console.log(`(Private) ${message.author.name}: ${message.content}`);
    } else {
        console.log(`(${message.server} / ${message.channel.name}) ${message.author.name}: ${message.content}`);
    }
});
