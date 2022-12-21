import * as msal from '@azure/msal-node';
import Config from './core/Config';

type TokenCache = {
  RefreshToken?: Record<
    string,
    {
      secret: string;
    }
  >;
};

const client = new msal.ConfidentialClientApplication({
  auth: {
    authority: Config.get('azure.authority'),
    clientId: Config.get('azure.clientId'),
    clientSecret: Config.get('azure.clientSecret'),
  },
});

const getNewAccessToken = async () => {
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
  await getNewAccessToken();
};

export default UploadOneNoteFromTweets;
