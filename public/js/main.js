'use strict';

let currentUser = null;

const initialize = () => {
    fetch('/init').then(res => {
        return res.json();
    }).then(res => {
        console.log(res);

        const html = `
            <img id="botImg">
            <p>Name: ${res.user.username}</p>
            <p>Deployed on ${res.servers.length} servers</p>
            
        `;

        $('#content').append(html);
        $('#botImg').attr('src', res.avatar);

    });

    $.getJSON('/user', data => {
        console.log(data);
        currentUser = {username: data.user.username};
        // Hide the delete user div if logged in as admin
        if (currentUser.username == 'admin'){
            $('#deleteUser').hide();
        }
        document.querySelector('#currentUser').innerHTML = 'Logged in as: ' + data.user.username;

    });
};

const createPopUp = (url) => {
    const newwindow = window.open(url,'name','height=600,width=600');

    if (window.focus) {
        newwindow.focus()
    }
    return false;

};

document.querySelector('#logOutBtn').addEventListener('click', (e) => {
    window.location.href = '/logout';
});

document.querySelector('#updateForm').addEventListener('submit', (e) => {
    e.preventDefault();

    $.getJSON('/user', data => {
        console.log(data);

        const obj = {
            oldPass: document.querySelector('#oldPassword').value,
            newPass: document.querySelector('#newPassword').value,
            username: data.user.username
        };

        if (data.status){
            fetch('/user', {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            }).then(res => {
                return res.json();
            }).then(res => {
                console.log(res.userUpdated);

                if(res.userUpdated){
                    // Feedback for the user that user has been updated
                    window.alert("Your password has been updated!");
                } else {
                    // feedback for user not updated
                    window.alert("Old password did not match, please try again.");
                }
            });
        }
    });

});

document.querySelector('#deleteBtn').addEventListener('click', (e) => {
    e.preventDefault();

    fetch('/user', {
        method: 'delete',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentUser)
    }).then(res => {
        return res.json();
    }).then(res => {
        window.location.href = '/logout';
    });
});

initialize();