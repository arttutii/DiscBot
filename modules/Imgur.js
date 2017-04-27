'use strict';

const Imgur = require("imgur-search");

class ImgurModule {

    constructor() {
        this.imgSearch = new Imgur(process.env.IMGUR_KEY);
    }

    searchImage(query, callback) {
        // substract the keyword from the string and turn the term into a proper query
        const searchTerm = query.trim().replace(/\s/g, "+");

        this.imgSearch.search(searchTerm).then((results) => {
            if (results === undefined || results.length === 0) {
                callback("Sorry, I couldn't find any imgurs for the term: " + query);
            } else {
                const img = results[Math.floor(Math.random() * results.length)];
                callback(img.link);
            }
        });
    };
}

module.exports = new ImgurModule();