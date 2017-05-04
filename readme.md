# DiscBot

## Setup.
To use the bot `git clone https://github.com/arttutii/DiscBot.git` and create file `.env` to the root folder.
For the contents of .env use this:

    `BOT_TOKEN= 'your discord bot token'

     IMGUR_KEY= 'your imgur account client key'

     GIPHY_KEY= 'your giphy account key'

     GOOGLE_KEY= 'your developers.google YouTube API key'

     DB_USER= 'mongoDB user'

     DB_PASS= 'mongoDB pass'

     DB_HOST= 'mongoDB URL'`

## Bot commands

!setavatar (imageURL)

***
!imgur (search params)

Search with the specified keywords, returns a random image URL from the keywords

Example use: `!imgur rainbow cat`
***
!giphy (search params)

Search with keywords, returns random image url from the keywords

Example use: `!giphy rainbow dog`
***
!yt (search params)

Search with keywords, bot chooses the first video from the list found with the query.
Next the DiscBot joins a voice channel and play the audio. If you are not on a voice channel, bot will join the first channel of the server.
If you are on a voice channel, bot joins your channel.

Example use: `!yt pokemon theme`
***
!hello

Starts playing a the hello anthem on the voice channel
***
!stop

Commands the bot to immediately leave the voice channel, stopping all playing audio.