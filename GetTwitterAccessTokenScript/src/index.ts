import fs from 'fs';
import path from 'path';
import express from 'express';
import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config';

if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET || !process.env.TWITTER_SCOPES) {
  console.log(
    'Please provide environment variables TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET, TWITTER_SCOPES for Twitter Developer',
  );
  process.exit(1);
}

const DIST_DIR = path.resolve(__dirname, '../dist');

const PORT = 3000;

const CALLBACK_URL = `http://localhost:${PORT}/callback`;

const client = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

const { url, codeVerifier } = client.generateOAuth2AuthLink(CALLBACK_URL, {
  scope: process.env.TWITTER_SCOPES.split(',').map((scope) => scope.trim()),
});

const app = express();

app.get('/callback', async (req, res) => {
  const { state, code } = req.query;

  if (!codeVerifier || !state || !code) {
    return res.status(400).send('You denied the app or your session expired!');
  }

  try {
    const tokenResult = await client.loginWithOAuth2({ code: String(code), codeVerifier, redirectUri: CALLBACK_URL });

    try {
      if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR);
      }
      fs.writeFileSync(`${DIST_DIR}/Credential.json`, JSON.stringify(tokenResult, null, 2));
    } catch (error) {
      console.error(error);
    }
  } catch {
    res.status(403).send('Invalid verifier or access tokens!');
  }

  res.status(200).send('Success! Close this tab and check your dist.');

  return process.exit(0);
});

app.listen(PORT, async () => {
  console.log(`Go here and grant permission (Twitter): ${url}`);
});
