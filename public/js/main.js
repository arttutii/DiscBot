'use strict';

const initialize = () => {
    /*fetch('/init').then((response) => {
        return response.json();
    }).then(response => {
        const data = response;
        console.log(data);
        document.querySelector('#content').append('botname: ' + data.user.username + ' ');
        const img = document.createElement('img');
        img.src = data.avatar;
        document.querySelector('#content').append(img);
    });*/

    fetch('/user').then(response => {
        return response.json();
    }).then(response => {
        document.querySelector('#currentUser').innerHTML = 'Logged in as: ' + response.username;
    })
};

document.querySelector('#logOutBtn').addEventListener('click', (e) => {
    window.location.href = '/logout';
});

document.querySelector('#updateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fdata = new FormData(e.target);

    console.log('event: ', e);

    console.log('fdata entries: ', fdata.entries());
    for (const i in fdata.entries()) {
        console.log('entry:', i);
    }

    $.getJSON('/user', (data) => {
        console.log(data);
        fdata.append('username', data.user);
        
        if (data.status){
            fetch('/user', {
                method: 'PATCH',
                body: fdata
            }).then((resp)=> {
                //console.log(resp);
            });
        }
    });

});

initialize();