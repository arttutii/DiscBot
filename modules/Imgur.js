'use strict';

const dotenv = require('dotenv').config(),
    Imgur = require("imgur-search");

const ImgurModule = function () {
    this.imgSearch = new Imgur(process.env.imgur_key);
};

ImgurModule.prototype.search = ((query, callback) => {
    const img = new Imgur(process.env.imgur_key);
    img.search(query).then((results) => {
        if (results === undefined || results.length === 0) {
            return "Sorry, I couldn't find any imgurs for the term: " + query;
        } else {
            const image = results[Math.floor(Math.random() * results.length)];
            callback(image.link);
        }
    });
});

module.exports = ImgurModule;