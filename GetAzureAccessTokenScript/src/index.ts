import fs from 'fs';
import path from 'path';
import * as msal from '@azure/msal-node';
import express from 'express';
import 'dotenv/config';

if (!process.env.MS_CLIENT_ID || !process.env.MS_CLIENT_SECRET) {
  console.log('Please provide environment variables MS_CLIENT_ID and MS_CLIENT_SECRET for Microsoft Graph OAuth');
  process.exit(1);
}

const DIST_DIR = path.resolve(__dirname, '../dist');

// Create MSAL application object
const msalClient = new msal.ConfidentialClientApplication({
  auth: {
    authority: 'https://login.microsoftonline.com/common/',
    clientId: process.env.MS_CLIENT_ID,
    clientSecret: process.env.MS_CLIENT_SECRET,
  },
});

const SCOPES = ['User.Read', 'Notes.Create', 'Notes.Read', 'Notes.Read.All', 'Notes.ReadWrite', 'Notes.ReadWrite.All'];
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}`;

const app = express();

// Handle OAuth redirect
app.get('/', async (req, res) => {
  const { code } = req.query;
  if (typeof code === 'string') {
    // MSAL client returns access token(valid for 1 hour)
    await msalClient.acquireTokenByCode({
      code,
      redirectUri: REDIRECT_URI,
      scopes: SCOPES,
    });

    // But we will prefer the refresh token that is stored in cache
    // (valid for 90 days)
    const tokenCache = JSON.parse(msalClient.getTokenCache().serialize());
    const refreshTokenKey = Object.keys(tokenCache.RefreshToken)[0];
    const refreshToken = tokenCache.RefreshToken[refreshTokenKey].secret;

    // We can use the refresh token to get new access tokens during the
    // initialization of the engine(s) that use Microsoft Graph API OAuth
    console.log('\nRefresh token: ', refreshToken);
    res.status(200).send('Success! Close this tab and check your terminal.');

    try {
      if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR);
      }
      fs.writeFileSync(`${DIST_DIR}/Credential.json`, JSON.stringify(tokenCache, null, 2));
    } catch (error) {
      console.error(error);
    }
  } else {
    res.status(400).send('OAuth failed!');
  }

  process.exit(0);
});

app.listen(PORT, async () => {
  // Generate URL for authorization page.
  const authUrl = await msalClient.getAuthCodeUrl({
    redirectUri: REDIRECT_URI,
    scopes: SCOPES,
  });

  console.log(`Go here and grant permission (Microsoft): ${authUrl}`);
});
