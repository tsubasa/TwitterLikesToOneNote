import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config';

if (!process.env.TWITTER_BEARER_TOKEN) {
  console.error('TWITTER_BEARER_TOKEN is undefined.');
  process.exit(1);
}

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

const readOnlyClient = twitterClient.readOnly;

(async () => {
  const bookmarks = await readOnlyClient.v2.bookmarks({
    expansions: ['author_id', 'attachments.media_keys'],
    'tweet.fields': ['created_at'],
    'media.fields': ['url', 'preview_image_url'],
  });

  console.log(JSON.stringify(bookmarks.data, null, 2));

  // while (!bookmarks.done) {
  //   // eslint-disable-next-line no-await-in-loop
  //   bookmarks = await bookmarks.fetchNext();
  // }
})();
