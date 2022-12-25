import _ from 'lodash';
import { TwitterApi, TweetV2PaginableTimelineResult, ApiResponseError } from 'twitter-api-v2';
import DataSource from './infrastructure/db/DataSource';
import TwitterTweet from './infrastructure/db/entities/TwitterTweet';
import TwitterMedia from './infrastructure/db/entities/TwitterMedia';
import TwitterUser from './infrastructure/db/entities/TwitterUser';
import Config from './core/Config';
import Logger from './core/Logger';

const logger = new Logger(__filename);

// type TweetMedia =
//   | {
//       media_key: string;
//       type: 'photo';
//       url: string;
//     }
//   | {
//       media_key: string;
//       type: 'video';
//       preview_image_url: string;
//       variants: { bit_rate: number; url: string }[];
//     }
//   | {
//       media_key: string;
//       type: 'animated_gif';
//       preview_image_url: string;
//       variants: { bit_rate: number; url: string }[];
//     };

// type TwitterData = {
//   data: {
//     author_id: string;
//     attachments: {
//       media_keys: string[];
//     };
//     id: string;
//     created_at: string;
//     text: string;
//   }[];
//   includes: {
//     media: TweetMedia[];
//     users: { id: string; username: string; name: string }[];
//   };
// };

const TWITTER_MAX_GET_BOOKMARK_TWEETS = Config.get('twitter.maxGetTweets') ?? 495;

const isAllowMedia = (type: string): type is 'photo' | 'video' | 'animated_gif' => {
  if (type === 'photo') return true;
  if (type === 'video') return true;
  if (type === 'animated_gif') return true;
  throw new TypeError(`Unsupported media type: ${type}`);
};

const getNewTwitterClient = async () => {
  const twitterAPI = new TwitterApi({
    clientId: Config.get('twitter.clientId'),
    clientSecret: Config.get('twitter.clientSecret'),
  });

  const {
    client: twitterClient,
    accessToken,
    refreshToken,
  } = await twitterAPI.refreshOAuth2Token(Config.get('twitter.refreshToken'));

  Config.set('twitter.accessToken', accessToken);
  logger.debug('New Access Token:', accessToken);

  if (refreshToken) {
    Config.set('twitter.refreshToken', refreshToken);
    logger.debug('New Refresh Token:', refreshToken);
  }

  return twitterClient;
};

const getTweetsFromBookmark = async () => {
  try {
    let twitterClient: TwitterApi;
    try {
      twitterClient = new TwitterApi(Config.get('twitter.accessToken'));
      await twitterClient.v2.me();
    } catch (e) {
      if (e instanceof ApiResponseError) {
        if (e.code === 401) {
          logger.debug('getNewAccessToken');
          twitterClient = await getNewTwitterClient();
        } else {
          throw e;
        }
      } else {
        throw e;
      }
    }

    const readOnlyClient = twitterClient.readOnly;

    const tweetRepository = DataSource.getRepository(TwitterTweet);
    const mediaRepository = DataSource.getRepository(TwitterMedia);
    const userRepository = DataSource.getRepository(TwitterUser);

    await DataSource.initialize();

    const saveTweets = async (data: TweetV2PaginableTimelineResult) => {
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
            const media = data?.includes?.media?.find((v) => v.media_key === mediaId);

            try {
              if (media && isAllowMedia(media.type)) {
                // eslint-disable-next-line no-await-in-loop
                await mediaRepository.save({
                  id: media.media_key,
                  tweetId: tweet.id,
                  type: media.type,
                  url:
                    media.type === 'photo' ? media.url : _.maxBy(media.variants, 'bit_rate')?.url?.split('?').shift(),
                });
              }
            } catch (e) {
              logger.error(e);
            }
          }
        }
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const user of data?.includes?.users ?? []) {
        // eslint-disable-next-line no-await-in-loop
        await userRepository.save({
          id: user.id,
          username: user.username,
          name: user.name,
        });
      }
    };

    let bookmarks = await readOnlyClient.v2.bookmarks({
      expansions: ['author_id', 'attachments.media_keys'],
      'tweet.fields': ['created_at'],
      'media.fields': ['url', 'preview_image_url', 'variants'],
    });

    let isDone = false;

    while (!bookmarks.done || isDone) {
      // eslint-disable-next-line no-await-in-loop
      bookmarks = await bookmarks.fetchNext();

      if (bookmarks.data.data.length >= TWITTER_MAX_GET_BOOKMARK_TWEETS) {
        isDone = true;
      }
    }

    // eslint-disable-next-line no-await-in-loop
    await saveTweets(bookmarks.data);

    logger.debug(`Saved ${bookmarks.data.data.length} tweets.`);
  } finally {
    if (DataSource.isInitialized) await DataSource.destroy();
  }
};

export default getTweetsFromBookmark;
