import 'isomorphic-fetch';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client, AuthenticationProvider, GraphError } from '@microsoft/microsoft-graph-client';
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

type Section = {
  id: string;
  displayName: string;
  parentNotebook: {
    displayName: string;
  };
};

type SectionResponse = {
  value: Section[];
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

const GetOneNoteSectionId = async () => {
  try {
    const client = await getClient();
    const sections: SectionResponse = await client.api(`/me/onenote/sections`).get();

    if (sections.value) {
      sections.value.forEach((v, i) => {
        // config/default.json の onenote.sectionId が未指定であればデフォルト値をセットする
        if (i === 0 && Config.has('onenote.sectionId') && Config.get('onenote.sectionId') === '') {
          Config.set('onenote.sectionId', v.id);
        }
        console.log(`${v.id} : ${v.displayName} ( ${v.parentNotebook.displayName} )`);
      });
    }
  } catch (e) {
    logger.error(e);
  }
};

export default GetOneNoteSectionId;
