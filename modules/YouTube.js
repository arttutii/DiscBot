'use strict';

const fetch = require('node-fetch'),
        ypi = require('youtube-playlist-info'),
        shelp = require('./ServerHelper.js');

class YouTubeModule {

    ytSearch(query, callback) {

        if (query.startsWith('http')){
            let watchUrl = shelp.parseYoutubeUrl(query);
            callback({status: 'OK', message: watchUrl});
        } else {
            // substract the keyword from the string and turn the term into a proper query
            const searchTerm = query.trim().replace(/\s/g, "+");

            fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + searchTerm + '&key=' + process.env.GOOGLE_KEY)
            .then((res) => {
                return res.json();
            }).then((results) => {
                if (results.items.length === 0) {
                    callback({status: 'error', message: 'Search with term "' + searchTerm + '" did not find any videos.'});
                } else {
                    // Go through the entries and take the first video in the list
                    let vid = '';
                    for (let item of results.items) {
                        if (item.id.kind === 'youtube#video') {
                            vid = item.id.videoId;
                            break;
                        }
                    }
                    callback({status: 'OK', message: vid});
                }
            });
        }
    }

    ytPlaylist(query, callback) {
        try {
            ypi.playlistInfo(process.env.GOOGLE_KEY, query, (playlistItems) => {
                console.log(playlistItems.length);
                console.log(playlistItems[0]);

                callback({status: 'OK', message: playlistItems});
                
            });
        } catch (e) {
            console.log(e);
            callback({status: 'error', message: `Could not find any videos with the playlist URL: ${query}`});
        }
        
    }
}

module.exports = new YouTubeModule();