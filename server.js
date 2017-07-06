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
    DB = require('./modules/DataBase.js'),
    bodyParser = require('body-parser'),
    TTS = require('./modules/TextToSpeech.js');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.enable('trust proxy');

// set up database
const user = process.env.DB_USER;
const pw = process.env.DB_PASS;
const host = process.env.DB_HOST;
/*
DB.connect('mongodb://' + user + ":" + pw + "@" + host, app, () => {
    // Login with the bot's token
    try {
        DiscBot.client.login(process.env.BOT_TOKEN);
    } catch (e) {
        console.log('error with bot login: ', e);
    }

});
*/
// Login with the bot's token
try {
    console.log('connecting..');
    DiscBot.client.login(process.env.BOT_TOKEN);
} catch (e) {
    console.log('error with bot login: ', e);
}

const UserSchema = {
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true}
};

const User = DB.getUserSchema(UserSchema);

// Hash the password of the user and get the model
const newSchema = DB.hashPassword(User);
const userModel = DB.mongoose.model('User',newSchema);

// Passport start
passport.use(new LocalStrategy(
    (username, password, done)   => {
        userModel.findOne({ username: username }, (err, user) => {
            if (err) {
                console.log('incorrect cred');
                done(null, false, {message: 'Incorrect credentials.'});
            } else {
                if (user){
                    user.comparePassword(password, (err, isMatch) => {
                        if (!isMatch) {
                            done(null, false, {message: 'Incorrect credentials.'});
                        } else {
                            return done(null, { username: username });
                        }
                    });
                } else {
                    done(null, false, {message: 'Incorrect credentials.'});
                }
            }
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(session({
    secret: 'dejavu',
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
        servers: DiscBot.client.guilds.array(),
    };
    res.send(data);
});

app.get('/', shelp.loginStatus, (req, res) => {
    res.redirect('/frontpage');
});

app.get('/frontpage', shelp.loginStatus, (req,res) => {
    res.sendFile('frontpage.html', { root: 'public' });
});

app.get('/login', (req,res) => {
    if(req.user){
        res.redirect('/frontpage');
    } else{
        res.sendFile('login.html', { root: 'public' });
    }
});

app.post('/login',
    passport.authenticate('local', { successRedirect: '/frontpage', failureRedirect: '/login' })
);

app.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        if (err) console.log(err);

        res.redirect('/');
    });
});

app.get('/user', (req, res) => {
    if (req.user === undefined) {
        res.send({status: false});
    } else {
        res.json({
            status: true,
            user: req.user
        });
    }
});

app.post('/user', (req, res) => {
    DB.createUser(userModel, req.body.username,req.body.password, callback => {
        if(callback === 'OK'){
            res.send({userCreated: true})
        } else {
            res.send({userCreated: false})
        }
    });
});

app.put('/user', (req, res) => {
    userModel.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            throw err;
        } else {
            user.comparePassword(req.body.oldPass, (err, isMatch) => {
                if(isMatch){
                    DB.updateUser(userModel, req.body.username, req.body.newPass, callback => {
                        console.log(callback);
                        res.send(JSON.stringify({userUpdated: true}))
                    });
                } else {
                    res.send({userUpdated: false})
                }
            });
        }
    });

});

app.delete('/user', (req, res) => {
    userModel.findOne({username: req.body.username}, (err, user) => {
        user.remove();

    }).then(response => {
        console.log('User removed');
        res.send({status: 'OK', post: response});
    });
});

app.use((req, res, next) => {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.send(`<img src="https://http.cat/${res.statusCode}">`);
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
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
    let ttsString = null;
    if (msg.length > 1) {
        params = shelp.parseParams(message.content);
        ttsString = shelp.parseParams(message.content);
        // replace accented characters
        params = encodeURI(params).replace(/%20/g,' ');
    }

    if (keyword === '!help'){
        message.reply('Following commands are available: \n'
            + '\n !setavatar [image web URL]'
            + '\n !imgur [search word/s]'
            + '\n !giphy [search word/s]'
            + '\n !yt [search word/s]'
            + '\n !tts [/languageCode (eg. sv)] [/speakSpeed (0.01-1)] [word/s] --Maximum 200 characters'
            + '\n !hello'
            + '\n !stop'
        );
    }

    if (keyword === '!hello'){
        DiscBot.playAudio(message,null,'./public/audio/hey.mp3');
    }

    if (keyword === '!stop'){
        DiscBot.leaveVoiceChannel(message);
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

    if (keyword === '!tts' && ttsString) {
        TTS.talk(ttsString, (result) => {
            if (result.status === 'OK'){
                DiscBot.pauseAudio(message, pauseTime => {
                    console.log('pauseTime:', pauseTime);
                });
                DiscBot.playAudio(message, null, './modules/' + result.message);
            } else {
                message.reply(result.message);
            }
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
