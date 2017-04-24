'use strict';

const Giphy = require('giphy');

class GiphyModule {

    constructor(){
        this.giphy = new Giphy(process.env.GIPHY_KEY);
    }

    searchGif(keyword, query, callback) {
        const keyWordIndex = query.indexOf(keyword);
        // substract the keyword from the string and turn the term into a proper query
        const searchTerm = query.substring(keyWordIndex + keyword.length).replace(/\s/g, "+");

        this.giphy.random( {tags: searchTerm}, callback());
    }
}

module.exports = new GiphyModule();