'use strict';
const dotenv = require('dotenv').config(),
    express = require('express'),
    app = express(),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    ytdl = require('ytdl-core'),
    bcrypt = require('bcrypt'),
    DiscBot = require('./modules/DiscBot'),
    shelp = require('./modules/ServerHelper.js'),
    Imgur = require('./modules/Imgur.js'),
    Giphy = require('./modules/Giphy.js'),
    YT = require('./modules/YouTube.js'),
    DB = require('./modules/DataBase.js');

app.use(express.static('public'));

app.enable('trust proxy');

// set up database
const user = process.env.DB_USER;
const pw = process.env.DB_PASS;
const host = process.env.DB_HOST;
DB.connect('mongodb://' + user + ":" + pw + "@" + host, app, () => {
    // Login with the bot's token
    DiscBot.client.login(process.env.BOT_TOKEN);

});

const UserSchema = {
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true}
};

const User = DB.getUserSchema(UserSchema);

// Hash the password of the user and get the model
const newSchema = DB.hashPassword(User);
const userModel = DB.mongoose.model('User',newSchema);

/*DB.createUser(userModel, 'admin','password', (callback) => {
     console.log(callback);
});*/

// Passport start
/*passport.use(new LocalStrategy(
    (username, password, done)   => {
        userModel.findOne({ username: username }, (err, user) => {
            if (err) {
                console.log('incorrect cred');
                done(null, false, {message: 'Incorrect credentials.'});
            } else {
                user.comparePassword(password, (err, isMatch) => {
                    console.log('password is match: ', isMatch);
                    if (err) {
                        done(null, false, {message: 'Incorrect credentials.'});
                    } else {
                        return done(null, { username: username });
                    }
                });
            }
        });
    }
));*/
passport.use(new LocalStrategy(
    (username, password, done) => {
        if (username !== process.env.username || password !== process.env.password) {
            console.log('nay');
            done(null, false, {message: 'Incorrect credentials.'});
            return;
        }
        console.log('yay');
        return done(null, { username: username });
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(session({
    secret: 'some s3cr3t value',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
// Passport end

// Express routings
app.get('/init', (req, res) => {
    const data = {
        user: DiscBot.client.user,
        avatar: DiscBot.client.user.displayAvatarURL,
    };
    res.send(data);
});

app.get('/*', shelp.loginStatus);

app.get('/test', (req,res) => {
    // fetch user and test password verification
    userModel.findOne({ username: 'admin' }, (err, user) => {
        if (err) {
            throw err;
        } else {
            user.comparePassword('password', (err, isMatch) => {
                console.log('test:', isMatch);
            });

            user.comparePassword('123Password', (err, isMatch) => {
                console.log('123Password:', isMatch);
            });
        }
    });
});

app.post('/login',
    passport.authenticate('local', { successRedirect: 'frontpage.html', failureRedirect: 'login.html' })
);


app.get('/logout', (req, res) => {
    console.log('loggin out');
    req.session.destroy(function (err) {
        if (err) console.log(err);

        res.redirect('/');
    });
});

// Express routings end

// This code will run once the bot has started up.
DiscBot.client.on('ready', () => {
    console.log('Ready to serve!');
});

// This code will run once the bot has disconnected from Discord.
DiscBot.client.on('disconnected', () => {
    console.log('Disconnected!');

    // exit node.js with an error
    process.exit(1);
});

// This code will run once the bot receives any message.
DiscBot.client.on('message', message => {
    let msg = message.content.split(" ");
    // parse the message's first word to recognize the keyword
    let keyword = shelp.parseKeyword(message.content).toLowerCase().trim();
    // assign message's parameters, if there are any
    let params = null;
    if (msg.length > 1) {
        params = shelp.parseParams(message.content);
        // replace accented characters
        params = params.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    }

    if (keyword === '!help'){
        message.reply('Following commands are available: \n'
            + '\n !setavatar [image web URL]'
            + '\n !imgur [search word/s]'
            + '\n !giphy [search word/s]'
            + '\n !yt [search word/s]'
            + '\n !hello'
            + '\n !stop'
        );
    }

    if (keyword === '!hello'){
        DiscBot.playAudio(message,null,'./public/audio/hey.mp3');
    }

    if (keyword === '!stop'){
        DiscBot.leaveVoiceChannel();
    }

    if (keyword === '!setavatar' && params){
        DiscBot.setAvatar(params, (result) => {
            message.reply(result);
        });
    }

    if (keyword === '!imgur' && params ) {
        Imgur.searchImage(params, (result) => {
            console.log('imgur result: ' + result );
            message.reply(result);
        });
    }

    if (keyword === '!giphy' && params) {
        Giphy.searchGif(params, (result) => {
            console.log('giphy result: ' + result );
            message.reply(result);
        });
    }

    if (keyword === '!yt' && params) {
        YT.ytSearch(params, (result) => {
            if (result.status === 'OK'){
                console.log('youtube result: ' + result.message);
                DiscBot.playAudio(message, result.message);
            } else {
                message.reply(result.message);
            }
        });
    }

    if (keyword === '!tts' && params) {
        // TBA
    }

    // print out whatever was received to the console
    // filter out the messages sent out by the bot
    if (message.author.id !== DiscBot.client.user.id){
        if (message.channel.isPrivate) {
            console.log(`(Private) ${message.author.username}: ${message.content}`);
        } else {
            console.log(`(${message.guild} / ${message.channel.name}) ${message.author.username}: ${message.content}`);
        }
    }
});
