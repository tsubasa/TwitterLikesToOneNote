import 'isomorphic-fetch';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client, AuthenticationProvider, GraphError } from '@microsoft/microsoft-graph-client';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import Config from './core/Config';
import Logger from './core/Logger';
import DataSource from './infrastructure/db/DataSource';
import TwitterTweet from './infrastructure/db/entities/TwitterTweet';
import TwitterMedia from './infrastructure/db/entities/TwitterMedia';
import TwitterUser from './infrastructure/db/entities/TwitterUser';
import OneNote from './infrastructure/db/entities/OneNote';

const logger = new Logger(__filename);

type TokenCache = {
  RefreshToken?: Record<
    string,
    {
      secret: string;
    }
  >;
};

const toDate = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const refreshAccessToken = async () => {
  const client = new ConfidentialClientApplication({
    auth: {
      authority: Config.get('azure.authority'),
      clientId: Config.get('azure.clientId'),
      clientSecret: Config.get('azure.clientSecret'),
    },
  });

  const result = await client.acquireTokenByRefreshToken({
    refreshToken: Config.get('azure.refreshToken'),
    scopes: Config.get('azure.scopes'),
    forceCache: true,
  });

  if (result !== null) {
    Config.set('azure.accessToken', result.accessToken);
    logger.debug('New Access Token:', result.accessToken);
  }

  const tokenCache: TokenCache = JSON.parse(client.getTokenCache().serialize());
  const refreshToken = Object.values(tokenCache?.RefreshToken ?? {})[0];

  if (refreshToken && refreshToken.secret) {
    Config.set('azure.refreshToken', refreshToken.secret);
    logger.debug('New Refresh Token:', refreshToken.secret);
  }
};

class MyAuthenticationProvider implements AuthenticationProvider {
  public async getAccessToken(): Promise<string> {
    return Config.get('azure.accessToken');
  }
}

const getClient = async () => {
  let client: Client;

  try {
    client = Client.initWithMiddleware({
      authProvider: new MyAuthenticationProvider(),
    });

    await client.api('/me').get();

    return client;
  } catch (e) {
    if (e instanceof GraphError && e.statusCode === 401) {
      await refreshAccessToken();

      client = Client.initWithMiddleware({
        authProvider: new MyAuthenticationProvider(),
      });

      await client.api('/me').get();

      return client;
    }
    throw e;
  }
};

const createOneNoteFormData = (
  {
    title,
    text,
    images,
    link,
    createdAt,
  }: {
    title: string;
    text: string;
    link: string;
    images?: string[];
    createdAt?: string;
  },
  { isMediaUploadSkip }: { isMediaUploadSkip?: boolean } = {},
) => {
  const formData = new FormData();

  let imageContent = '';
  if (Array.isArray(images) && images.length > 0) {
    imageContent += '<h2>images:</h2>';
    images.forEach((v, i) => {
      if (isMediaUploadSkip) {
        imageContent += `## PLEASE UPLOAD MANUALLY: [ ${path.basename(v)} ] ##<br />`;
      } else {
        imageContent += `<img src="name:fileBlock${i}" alt="test" />\n`;
      }
    });
  }

  const content = `
    <!DOCTYPE html>
    <html lang="ja-JP">
      <head>
        <title>${isMediaUploadSkip ? `🚨 ${title}` : title}</title>
        ${createdAt ? `<meta name="created" content="${toDate.format(new Date(createdAt))}" />` : ''}
      </head>
      <body style="font-family:メイリオ;font-size:10pt;">
        <h2>permalink:</h2>
        <p style="font-family:メイリオ;font-size:10pt;">${link}<br/></p>
        <h2>text:</h2>
        <pre style="font-family:メイリオ;font-size:10pt;">${text}\n</pre>
        ${imageContent}
      </body>
    </html>
  `;

  formData.append('Presentation', content, { contentType: 'text/html' });
  if (Array.isArray(images) && images.length > 0 && !isMediaUploadSkip) {
    images.forEach((v, i) => formData.append(`fileBlock${i}`, fs.createReadStream(path.resolve(__dirname, v))));
  }

  return formData;
};

const UploadOneNoteFromTweets = async (users: string) => {
  try {
    const findUsers = users.split(',').map((v) => v.trim());
    const client = await getClient();

    const tweetRepository = DataSource.getRepository(TwitterTweet);
    const mediaRepository = DataSource.getRepository(TwitterMedia);
    const userRepository = DataSource.getRepository(TwitterUser);
    const onenoteRepository = DataSource.getRepository(OneNote);

    await DataSource.initialize();

    const userRecords = await userRepository.find({
      where: findUsers.map((v) => ({ username: v })),
    });

    if (userRecords.length === 0) {
      logger.warn('Not found users.');
      return;
    }

    const tweetRecords = await tweetRepository.find({
      where: userRecords.map((v) => ({ userId: v.id })),
    });

    if (tweetRecords.length === 0) {
      logger.warn('Not found tweets.');
      return;
    }

    for (const tweet of tweetRecords) {
      if (await onenoteRepository.findOneBy({ tweetId: tweet.id })) {
        logger.info('Skip:', tweet.id);
        // eslint-disable-next-line no-continue
        continue;
      }

      const medias = await mediaRepository.find({ where: { tweetId: tweet.id }, order: { id: 'ASC' } });
      const mediaPaths = medias.map((v) => path.resolve(__dirname, `../medias/${v.id}.png`));
      const name = userRecords.find((v) => v.id === tweet.userId)?.username ?? 'UNKNOWN';

      if (medias.some((v) => v.type !== 'photo')) {
        logger.warn('Unsupported media type:', '[tweetId]', tweet.id);
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaPaths.some((v) => !fs.existsSync(v))) {
        logger.warn('File does not exist:', mediaPaths.join(', '));
        // eslint-disable-next-line no-continue
        continue;
      }

      let totalFileSize = 0;
      let isMediaUploadSkip = false;

      if (
        mediaPaths.some((v) => {
          totalFileSize += fs.statSync(v).size;
          if (totalFileSize > 1000 * 1000 * 4) return true;
          return false;
        })
      ) {
        logger.warn(
          'Exceeded maximum upload file size.',
          `[Tweet ID]: ${tweet.id}`,
          'See to: https://learn.microsoft.com/en-us/graph/onenote-images-files#size-limitations-for-post-pages-requests',
        );
        isMediaUploadSkip = true;
      }

      const formData = createOneNoteFormData(
        {
          title: `@${name} ${tweet.text
            .replace(/(?:\s+|\n+)?https?:\/\/t.co\/\w+/, '')
            .replace(/\n/g, ' ')
            .substring(0, 20 - Math.floor(name.length / 2))}...`,
          text: tweet.text,
          link: `http://twitter.com/${name}/status/${tweet.id}`,
          images: mediaPaths,
          createdAt: new Date(tweet?.tweetedAt ?? new Date()).toISOString(),
        },
        { isMediaUploadSkip },
      );

      logger.debug('createdAt', tweet.tweetedAt);
      logger.debug('id:', tweet.id);
      logger.debug('text:', tweet.text.replace(/\n/g, ' '));
      logger.debug('medias:', medias.map((v) => v.url).join(', '));
      logger.debug('formData', formData);

      try {
        logger.debug(await client.api(`/me/onenote/sections/${Config.get('onenote.sectionId')}/pages`).post(formData));
        await onenoteRepository.save({ tweetId: tweet.id });
      } catch (e) {
        logger.error('Failed to upload:', `[tweetId]: ${tweet.id}`);
        logger.error(e);
      }
    }
  } catch (e) {
    logger.error(e);
  } finally {
    if (DataSource.isInitialized) await DataSource.destroy();
  }
};

export default UploadOneNoteFromTweets;
