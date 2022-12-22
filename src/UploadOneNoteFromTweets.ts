import 'isomorphic-fetch';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client, AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import Config from './core/Config';

type TokenCache = {
  RefreshToken?: Record<
    string,
    {
      secret: string;
    }
  >;
};

class MyAuthenticationProvider implements AuthenticationProvider {
  // eslint-disable-next-line class-methods-use-this
  public async getAccessToken(): Promise<string> {
    return Config.get('azure.accessToken');
  }
}

const getClient = () => {
  return Client.initWithMiddleware({
    authProvider: new MyAuthenticationProvider(),
  });
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
    console.log('New Access Token:', result.accessToken);
  }

  const tokenCache: TokenCache = JSON.parse(client.getTokenCache().serialize());
  const refreshToken = Object.values(tokenCache?.RefreshToken ?? {})[0];

  if (refreshToken && refreshToken.secret) {
    Config.set('azure.refreshToken', refreshToken.secret);
    console.log('New Refresh Token:', refreshToken.secret);
  }
};

const UploadOneNoteFromTweets = async () => {
  let client: Client;

  try {
    client = getClient();
    console.log(await client.api('/me').get());
  } catch (e) {
    console.error(e);

    await refreshAccessToken();
    client = getClient();
  }
};

export default UploadOneNoteFromTweets;
