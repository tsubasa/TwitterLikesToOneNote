import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

if (!process.env.TWITTER_BEARER_TOKEN) {
  console.error('TWITTER_BEARER_TOKEN is undefined.');
  process.exit(1);
}

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

const readOnlyClient = twitterClient.readOnly;

(async () => {
  let bookmarks = await readOnlyClient.v2.bookmarks({
    expansions: ['author_id', 'attachments.media_keys'],
    'tweet.fields': ['created_at'],
    'media.fields': ['url', 'preview_image_url', 'variants'],
  });

  let fileNo = 1;

  console.log(`create twitter_${fileNo}.json`);
  // eslint-disable-next-line no-plusplus
  fs.writeFileSync(path.resolve(__dirname, `twitter_${fileNo++}.json`), JSON.stringify(bookmarks.data, null, 2));

  while (!bookmarks.done) {
    // eslint-disable-next-line no-await-in-loop
    bookmarks = await bookmarks.fetchNext();
    console.log(`create twitter_${fileNo}.json`);
    // eslint-disable-next-line no-plusplus
    fs.writeFileSync(path.resolve(__dirname, `twitter_${fileNo++}.json`), JSON.stringify(bookmarks.data, null, 2));
  }
})();
