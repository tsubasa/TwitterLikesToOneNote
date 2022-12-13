import fs from 'fs';
import path from 'path';
import * as msal from '@azure/msal-node';
import express from 'express';
import 'dotenv/config';

if (!process.env.MS_CLIENT_ID || !process.env.MS_CLIENT_SECRET || !process.env.MS_SCOPES) {
  console.log(
    'Please provide environment variables MS_CLIENT_ID and MS_CLIENT_SECRET, MS_SCOPES for Microsoft Graph OAuth',
  );
  process.exit(1);
}

const DIST_DIR = path.resolve(__dirname, '../dist');

const client = new msal.ConfidentialClientApplication({
  auth: {
    authority: 'https://login.microsoftonline.com/common/',
    clientId: process.env.MS_CLIENT_ID,
    clientSecret: process.env.MS_CLIENT_SECRET,
  },
});

const SCOPES = process.env.MS_SCOPES.split(',').map((scope) => scope.trim());
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}`;

const app = express();

app.get('/', async (req, res) => {
  const { code } = req.query;
  if (typeof code === 'string') {
    await client.acquireTokenByCode({
      code,
      redirectUri: REDIRECT_URI,
      scopes: SCOPES,
    });

    res.status(200).send('Success! Close this tab and check your dist.');

    try {
      if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR);
      }
      fs.writeFileSync(
        `${DIST_DIR}/Credential.json`,
        JSON.stringify(JSON.parse(client.getTokenCache().serialize()), null, 2),
      );
    } catch (error) {
      console.error(error);
    }
  } else {
    res.status(400).send('OAuth failed!');
  }

  process.exit(0);
});

app.listen(PORT, async () => {
  const authUrl = await client.getAuthCodeUrl({
    redirectUri: REDIRECT_URI,
    scopes: SCOPES,
  });

  console.log(`Go here and grant permission (Microsoft): ${authUrl}`);
});
