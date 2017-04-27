'use strict';

const fetch = require('node-fetch');

class YouTubeModule {

    ytSearch(query, callback) {
        // substract the keyword from the string and turn the term into a proper query
        const searchTerm = query.trim().replace(/\s/g, "+");

        fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + searchTerm + '&key=' + process.env.GOOGLE_KEY)
            .then((res) => {
                return res.json();
            }).then((results) => {

            if (results.items.length == 0) {
                callback('Search with term "' + searchTerm + '" did not find any videos.');
            } else {
                // Go through the entries and take the first video in the list
                let vid = '';
                for (let item of results.items) {
                    if (item.id.kind === 'youtube#video') {
                        vid = item.id.videoId;
                        break;
                    }
                }
                callback(vid);
            }

        });
    }
}

module.exports = new YouTubeModule();