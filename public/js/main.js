'use strict';

const initialize = () => {
    fetch('/init').then((response) => {
        return response.json();
    }).then(response => {
        const data = response;
        console.log(data);
        document.querySelector('#content').append('botname: ' + data.user.username);
    });
};

initialize();