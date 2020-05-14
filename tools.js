const request = require('@apify/http-request');

const MOVIE_API = 'http://www.omdbapi.com/?apikey=ebf2b73c';

/**
 * Shows initial decision to the user
 * @param {Chat} chat
 * @returns {Promise<void>}
 */
async function showInitialDecision(chat) {
    await chat.say({
        text: 'Would you like to watch a movie or a TV show tonight?',
        buttons: [
            { type: 'postback', title: 'Yes! Sure', payload: 'CHOOSE_MOVIES' },
            { type: 'postback', title: 'No', payload: 'SLEEP' }
        ]
    });
}

/**
 * Returns randomly selected movie or TV show from imbdb.
 * Recursively gets a new movie until movie ID is found.
 * @returns {object} movie object information
 */
async function getRandomMovie() {
    let movie;
    const randomMovieId = pad(Math.floor((Math.random() * 5200000) + 1), 7);
    const { body } = await request({ url: `${MOVIE_API}&type=movie&i=tt${randomMovieId}`, json: true });
    body.url = `http://www.imdb.com/title/tt${randomMovieId}/`;

    if (body.hasOwnProperty('Error')){
        movie = await getRandomMovie();
    } else {
        movie = body;
    }
    return movie;
}

/**
 * Shows selected movie information to user.
 * @param {Conversation} conversation
 * @returns {Promise<void>}
 */
async function selectMovie(conversation) {
    const { Title, imdbRating, Director, Year, Actors, url } = await getRandomMovie();
    const director = Director === 'N/A' ? '' : ` by ${Director} `;
    const rating = imdbRating === 'N/A' ? '' : ` with Imdb rating ${imdbRating}`;
    await conversation.say(`Tonight selection is ${Title}${director}${rating}` , { typing: true });
    await sleep(async () => {
        await conversation.say('Here is the link:' , { typing: true });
        await conversation.say(url , { typing: true });
    }, 2000);
    await sleep(async () => {
        if (Year && Year !== 'N/A' && Actors && Actors !== 'N/A') {
            await conversation.say(`It was filmed in ${Year} and actors are: ${Actors}...`, { typing: true });
        }
    }, 2000 );
    await handleResult(conversation);
}

/**
 * Asks user about satisfaction with the movie selection.
 * @param {Conversation} conversation
 * @returns {Promise<void>}
 */
async function handleResult(conversation) {
    await conversation.ask({
        text: 'Are you satisfied with tonight movie selection?',
        quickReplies: ['Yes', 'No'],
        options: { typing: true }
    }, async (payload, conversation2) => {
        if (payload.message.text === 'No') {
            await selectMovie(conversation2);
            await conversation.end();
        } else if (payload.message.text === 'Yes') {
            await conversation.say('Ok, you are welcome! Have a nice movie night! :)', { typing: true });
            await conversation.end();
        }
    });
}

/**
 * Says good night.
 * @param {Chat} chat
 * @returns {Promise<void>}
 */
async function goToBed(chat) {
    await sleep(async () => {
        chat.conversation( async (conversation) => {
            await conversation.say('Good night! :). See you soon...', { typing: true });
        });
    }, 2000 );
}

// Helpers

/**
 * Creates string filled with zeros .
 * @param {number} number
 * @param {length} length
 * @returns {string}
 */
function pad(number, length) {
    var str = '' + number;
    while(str.length < length) {
        str = '0' + str;
    }
    return str;
}

/**
 * Sets time out to promise.
 * @param {number} ms
 * @returns {function}
 */
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Async time out function with custom funciton.
 * @param {function} fn
 * @param {function} ms
 * @returns {function}
 */
async function sleep(fn, ms) {
    await timeout(ms);
    return fn();
}

module.exports = {
    showInitialDecision,
    getRandomMovie,
    selectMovie,
    handleResult,
    goToBed,
    sleep,
};
