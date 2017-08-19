'use strict';

const Discord = require('discord.js'),
    ytdl = require('ytdl-core'),
    shelp = require('ServerHelper');

// assign a logger which logs console output to a file
const log = shelp.logger();

class DiscBot {
    constructor() {
        // Initialize client
        this.client = new Discord.Client();

        // Connected servers of the bot, objects contain following data:
        // Guild name, id, voiceChannel, currentAudio, audioList, currentSong
        this.servers = [];
    }

    getCurrentGuild(message){
        let currentGuild = this.servers.find(x => x.id === message.guild.id);
        // if there is no current server, create one
        if(!currentGuild){
            const newServer = {
                name: message.guild.name,
                id: message.guild.id,
                voiceChannel: null,
                currentAudio: null,
                audioList: [],
                currentSong: null

            };
            this.servers.push(newServer);
            return newServer;
        } else {
            return currentGuild;
        }
    }

    leaveVoiceChannel(message) {
        const currentGuild = this.servers.find(x => x.id === message.guild.id);
        if (currentGuild){
            currentGuild.voiceChannel.leave();
        }
    }

    setAvatar(query, callback) {
        log.ínfo(query);
        // check if the URL is valid
        if (query.startsWith("http://") || query.startsWith("https://")) {
            this.client.user.setAvatar(query)
                .then((user) => {
                    log.info(`New avatar set: ` + query);
                    callback('Avatar set successfully!');
                }).catch((err) => {
                log.log('error', err);
                if (err.status === 400) {
                    callback('Sorry, you are changing the avatar too frequently. Please wait and try again later.');
                } else {
                    callback('Sorry could not set the avatar image. The URL for the avatar you requested did not result an image.');
                }
            });
        } else {
            log.info('Requested avatar url not valid.');
            callback('Sorry could not set the avatar image. The URL for the avatar you requested is not valid.');
        }
    }

    startAudio(currentGuild, connection, vidURL, localFile) {
        // play the file
        if (localFile) {
            const streamOptions = {seek: 0, volume: 1};
            currentGuild.currentAudio = connection.playFile(localFile, streamOptions);
        } else {
            const stream = ytdl('https://www.youtube.com/watch?v=' + vidURL, {filter: 'audioonly'});
            const streamOptions = {seek: 0, volume: 0.3};
            currentGuild.currentAudio = connection.playStream(stream, streamOptions);
        }
    }

    pauseAudio(message, callback){
        const currentGuild = this.getCurrentGuild(message);
        if (currentGuild.currentAudio){
            currentGuild.currentAudio.pause();
            // time in milliseconds
            let pauseTime = currentGuild.currentAudio.time;
            callback(pauseTime);
        } else {
            callback('no currentAudio');
        }
    }

    resumeAudio(message){
        const currentGuild = this.getCurrentGuild(message);
        currentGuild.currentAudio.resume();
    }

    queueAudio(message, audio){
        const currentGuild = this.getCurrentGuild(message);
        currentGuild.audioList.push = audio;
    }

    nextAudio(){

    }

    playAudio(message, vidURL, localFile) {
        try {
            const currentGuild = this.getCurrentGuild(message);

            // if an audio was playing, stop it before starting a new one
            if (currentGuild.currentAudio) {
                currentGuild.currentAudio.end();
            }

            // Get the first voice channel on the server of the sender
            const firstVC = message.guild.channels.find(res => res.type === 'voice');
            // Get the message sender's current voice channel
            const userVC = message.guild.members.find(member => member.id === message.author.id).voiceChannelID;

            // Find the channel from the bot's perspective and join it
            if (userVC) {
                currentGuild.voiceChannel = this.client.channels.find(channel => channel.id === userVC);
            } else {
                currentGuild.voiceChannel = this.client.channels.find(channel => channel === firstVC);
            }

            if (currentGuild.voiceChannel === userVC){
                this.startAudio(currentGuild, currentGuild.voiceChannel.connection, vidURL, localFile);
            } else {
                currentGuild.voiceChannel.join().then(connection => {
                    this.startAudio(currentGuild, connection, vidURL, localFile);
                });
            }

        } catch (e) {
            log.log('error', 'playAudio error: ', e);
        }
    }
}

module.exports = new DiscBot();