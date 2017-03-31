const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const Discord = require('discord.js');

const bot = new Discord.Client();

const token = 'Mjk3MjQ5NDI0NTc1NTYxNzI5.C7-Cvg.EUwK9G0FUVF72qbiXOopf3yDJZw';

// This code will run once the bot has started up.
bot.on("ready", function () {
    console.log("Ready to begin!");
});

// This code will run once the bot has disconnected from Discord.
bot.on("disconnected", function () {
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

// Login (replace these auth details with your bot's)
bot.login(token);

app.listen(3000);

app.get('/', function(req, res) {
    res.send("DiscBot serving on: " + bot.users);

});