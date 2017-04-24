'use strict';

const Imgur = require("imgur-search");

class ImgurModule {

    constructor() {
        this.imgSearch = new Imgur(process.env.IMGUR_KEY);
    }

    searchImage(keyword, query, callback) {
        const keyWordIndex = query.indexOf(keyword);
        // substract the keyword from the string and turn the term into a proper query
        const searchTerm = query.substring(keyWordIndex + keyword.length).replace(/\s/g, "+");

        this.imgSearch.search(searchTerm).then((results) => {
            if (results === undefined || results.length === 0) {
                callback("Sorry, I couldn't find any imgurs for the term: " + query);
            } else {
                const image = results[Math.floor(Math.random() * results.length)];
                callback(image.link);
            }
        });
    };
}

module.exports = new ImgurModule();