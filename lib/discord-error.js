const bent = require('bent');
const R = require('ramda');
const L = require('loggy-log')();

const post = bent('POST', 204);

const DISCORD_WEB_HOOK = process.env.DISCORD_WEB_HOOK;
const postToDiscord = R.curryN(2, post)(DISCORD_WEB_HOOK);

const sendToDiscordChannel = R.pipe(
  R.objOf('content'),
  postToDiscord
);

const formatKey = x => `__${x}__`;
const formatValue = x => `*${x}*`;

const objToString = R.pipe(
  R.dissoc('cover'),
  L.debug('%fo'),
  R.toPairs,
  R.reject(R.propSatisfies(R.anyPass([R.isNil, R.isEmpty]), 1)),
  L.debug('%fo'),
  R.map(
    R.pipe(
      R.over(R.lensIndex(0), formatKey),
      R.over(R.lensIndex(1), formatValue),
      R.join(': ')
    )
  ),
  R.join(', ')
);

const sendNoProvider = R.pipe(
  ({barcode}) =>
    `:no_entry_sign: No provider was found with barcode: **${barcode}**
    *Think to search by clicking on :* https://www.fnac.com/SearchResult/ResultList.aspx?SCat=0%211&Search=${barcode}&sft=1&sa=0\n`,
  sendToDiscordChannel
);

const sendNoMovieInProvider = R.pipe(
  objToString,
  R.concat(':warning: A provider was found but without movies\n'),
  sendToDiscordChannel
);

module.exports = {sendNoProvider, sendNoMovieInProvider};
