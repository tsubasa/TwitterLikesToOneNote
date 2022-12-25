import 'isomorphic-fetch';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client, AuthenticationProvider, GraphError } from '@microsoft/microsoft-graph-client';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import Config from './core/Config';
import Logger from './core/Logger';

const logger = new Logger(__filename);

type TokenCache = {
  RefreshToken?: Record<
    string,
    {
      secret: string;
    }
  >;
};

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
  // eslint-disable-next-line class-methods-use-this
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

const UploadOneNoteFromTweets = async () => {
  const client = await getClient();
  const formData = new FormData();

  const images = ['../medias/3_1605958734970511360.jpg', '../medias/3_1606237354771255296.jpg'];

  let imageContent = '';
  images.forEach((v, i) => {
    imageContent += `<img src="name:fileBlock${i}" alt="test" />\n`;
  });

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>A page with rendered file attachment</title>
        <meta name="created" content="2015-07-22T09:00:00-08:00" />
      </head>
      <body>
        <p>Here is an attached file:</p>
        ${imageContent}
      </body>
    </html>
  `;

  formData.append('Presentation', content, { contentType: 'text/html' });
  images.forEach((v, i) => formData.append(`fileBlock${i}`, fs.createReadStream(path.resolve(__dirname, v))));

  logger.debug(await client.api(`/me/onenote/sections/${Config.get('onenote.sectionId')}/pages`).post(formData));
};

export default UploadOneNoteFromTweets;
