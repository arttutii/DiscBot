'use strict';

const fetch = require('node-fetch');

class YouTubeModule {

    ytSearch(keyword, query, callback) {
        const keyWordIndex = query.indexOf(keyword);
        // substract the keyword from the string and turn the term into a proper query
        const searchTerm = query.substring(keyWordIndex + keyword.length).trim().replace(/\s/g, "+");

        fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + searchTerm + '&key=' + process.env.GOOGLE_KEY)
            .then((res) => {
                return res.json();
            }).then((results) => {

            if (results.items.length == 0) {
                console.log("Your search gave 0 results");
                return videoId;
            }

            let vid = '';
            for (let item of results.items) {
                if (item.id.kind === 'youtube#video') {
                    vid = item.id.videoId;
                    break;
                }
            }
            callback(vid);

        });
    }
}

module.exports = new YouTubeModule();