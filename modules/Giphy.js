'use strict';

const fetch = require('node-fetch');

class GiphyModule {

    searchGif(query, callback) {
        // substract the keyword from the string and turn the term into a proper query
        const searchTerm = query.trim().replace(/\s/g, "+");

        fetch('http://api.giphy.com/v1/gifs/search?q=' + searchTerm + '&api_key=' + process.env.GIPHY_KEY)
            .then((res) => {
                return res.json();
            }).then((results) => {
            console.log(results.data.length);

            if (results.data === undefined || results.data.length === 0) {
                callback("Sorry, I couldn't find any giphys for the term: " + query);
            } else {
                let gif;
                if (results.data.length < 25){
                    gif = results.data[Math.floor(Math.random() * results.data.length)];
                } else {
                    gif = results.data[Math.floor(Math.random() * 25)];
                }

                callback(gif.url);
            }
        });

    }
}

module.exports = new GiphyModule();