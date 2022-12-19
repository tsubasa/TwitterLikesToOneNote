import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import DataSource from './infrastructure/db/DataSource';
import TwitterTweet from './infrastructure/db/entities/TwitterTweet';
import TwitterMedia from './infrastructure/db/entities/TwitterMedia';
import TwitterUser from './infrastructure/db/entities/TwitterUser';

type TweetMedia =
  | {
      media_key: string;
      type: 'photo';
      url: string;
    }
  | {
      media_key: string;
      type: 'video';
      preview_image_url: string;
      variants: { bit_rate: number; url: string }[];
    }
  | {
      media_key: string;
      type: 'animated_gif';
      preview_image_url: string;
      variants: { bit_rate: number; url: string }[];
    };

type TwitterData = {
  data: {
    author_id: string;
    attachments: {
      media_keys: string[];
    };
    id: string;
    created_at: string;
    text: string;
  }[];
  includes: {
    media: TweetMedia[];
    users: { id: string; username: string; name: string }[];
  };
};

(async () => {
  const tweetRepository = DataSource.getRepository(TwitterTweet);
  const mediaRepository = DataSource.getRepository(TwitterMedia);
  const userRepository = DataSource.getRepository(TwitterUser);

  await DataSource.initialize();

  const data: TwitterData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../sample/twitter_1.json'), 'utf-8'));

  // eslint-disable-next-line no-restricted-syntax
  for (const tweet of data.data) {
    // eslint-disable-next-line no-await-in-loop
    await tweetRepository.save({
      id: tweet.id,
      userId: tweet.author_id,
      text: tweet.text,
      tweetedAt: tweet.created_at,
    });

    if (tweet.attachments?.media_keys?.length) {
      // eslint-disable-next-line no-restricted-syntax
      for (const mediaId of tweet.attachments.media_keys) {
        const media = data.includes.media.find((v) => v.media_key === mediaId);
        if (media) {
          // eslint-disable-next-line no-await-in-loop
          await mediaRepository.save({
            id: media.media_key,
            tweetId: tweet.id,
            type: media.type,
            url: media.type === 'photo' ? media.url : _.maxBy(media.variants, 'bit_rate')?.url?.split('?').shift(),
          });
        }
      }
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const user of data.includes.users) {
    // eslint-disable-next-line no-await-in-loop
    await userRepository.save({
      id: user.id,
      username: user.username,
      name: user.name,
    });
  }

  console.log('done');
})();
