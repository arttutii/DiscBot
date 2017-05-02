'use strict';

const Discord = require('discord.js'),
    ytdl = require('ytdl-core');

class DiscBot {
    constructor() {
        // Initialize client
        this.client = new Discord.Client();
        // bot's current voice channel
        this.voiceChannel = null;
        // variable for the current playing audio
        this.currentAudio = null;
    }

    leaveVoiceChannel() {
        this.voiceChannel.leave();
    }

    setAvatar(query, callback) {
        console.log(query);
        // check if the URL is valid
        if (query.startsWith("http://") || query.startsWith("https://")) {
            this.client.user.setAvatar(query)
                .then((user) => {
                    console.log(`New avatar set: ` + query);
                    callback('Avatar set successfully!');
                }).catch((err) => {
                console.log(err);
                if (err.status == 400) {
                    callback('Sorry, you are changing the avatar too frequently. Please wait and try again later.');
                } else {
                    callback('Sorry could not set the avatar image. The URL for the avatar you requested did not result an image.');
                }
            });
        } else {
            console.log('Requested avatar url not valid.');
            callback('Sorry could not set the avatar image. The URL for the avatar you requested is not valid.');
        }
    }

    startAudio(connection, vidURL, localFile) {
        // play the file
        if (localFile) {
            this.currentAudio = connection.playFile(localFile);
        } else {
            const stream = ytdl('https://www.youtube.com/watch?v=' + vidURL, {filter: 'audioonly'});
            const streamOptions = {seek: 0, volume: 1};
            this.currentAudio = connection.playStream(stream, streamOptions);
        }
    }

    playAudio(message, vidURL, localFile) {
        try {
            // if an audio was playing, stop it before starting a new one
            if (this.currentAudio) {
                this.currentAudio.end();
            }

            // Get the first voice channel on the server of the sender
            const firstVC = message.guild.channels.find(res => res.type === 'voice');
            // Get the message sender's current voice channel
            const userVC = message.guild.members.find(member => member.id === message.author.id).voiceChannelID;

            // Find the channel from the bot's perspective and join it
            if (userVC) {
                this.voiceChannel = (this.client.channels.find(channel => channel.id === userVC));
            } else {
                this.voiceChannel = (this.client.channels.find(channel => channel === firstVC));
            }

            if (this.voiceChannel === userVC){
                this.startAudio(this.voiceChannel.connection, vidURL, localFile);
            } else {
                this.voiceChannel.join().then(connection => {
                    this.startAudio(connection, vidURL, localFile);
                });
            }

        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new DiscBot();