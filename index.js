'use strict';
const BootBot = require('bootbot');
const config = require('config');

const tools = require('./tools.js');
const port = process.env.PORT || config.get('PORT');


const greetingText = 'Hey there, I am a movie night bot. ' +
    'You do not know what movie or TV show you are watching tonight?' +
    ' I am going to help you!';

const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET')
});


// Says hi at the beginning of the conversation
bot.setGreetingText(greetingText);

// Shows starting button --> should show initial question
bot.setGetStartedButton(async (payload, chat) => {
    await tools.showInitialDecision(chat);
});

// If user choose to watch a movie
bot.on('postback:CHOOSE_MOVIES', async (payload, chat) => {
    await chat.conversation( async (conversation) => {
        await tools.selectMovie(conversation);
    });
});

// If do not choose to watch a movie
bot.on('postback:SLEEP', async (payload, chat) => {
    await tools.goToBed(chat);
});

// Response on greetings as "hello, hi, hey, good morning, good evening" --> say hi greeting back
bot.hear(['hello', 'hi', 'hey', 'good morning', 'good evening',], async (payload, chat) => {
    await chat.say(greetingText, { typing: true });
    await tools.showInitialDecision(chat);
});

// Response on greetings as "goodbye, bye, see you or thank you, thanks..."--> say goodbye back
bot.hear(['goodbye', 'bye', 'see you', 'thank you', 'thanks', 'cheers'], async (payload, chat) => {
    await tools.goToBed(chat);
});

// If user types something with movie word --> select movie for him
bot.hear(/[M|m]ovie/gm, async (payload, chat) => {
    await chat.conversation( async (conversation) => {
        await tools.selectMovie(conversation);
    });
});


bot.start(port);