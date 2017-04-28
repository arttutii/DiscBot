'use strict';

const initialize = () => {
    fetch('/init').then((response) => {
        return response.json();
    }).then(response => {
        const data = response;
        console.log(data);
        document.querySelector('#content').append('botname: ' + data.user.username + ' ');
        const img = document.createElement('img');
        img.src = data.avatar;
        document.querySelector('#content').append(img);
    });
};

$('#content').load('./views/login.html');