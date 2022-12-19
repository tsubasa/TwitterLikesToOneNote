import https from 'https';
import fs from 'fs';
import path from 'path';

import DataSource from './infrastructure/db/DataSource';
import TwitterMedia from './infrastructure/db/entities/TwitterMedia';

const saveDir = path.resolve(__dirname, `../medias`);

if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir);
}

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const download = (url: string, filePath: string) => {
  return new Promise<void>((resolve, reject) =>
    // eslint-disable-next-line no-promise-executor-return
    https
      .request(url, (res) => {
        res.pipe(fs.createWriteStream(filePath)).on('close', resolve).on('error', reject);
      })
      .end(),
  );
};

const getTweetMediaFromTweets = async () => {
  try {
    const mediaRepository = DataSource.getRepository(TwitterMedia);

    await DataSource.initialize();

    const records = await mediaRepository.find();

    // eslint-disable-next-line no-restricted-syntax
    for (const record of records) {
      const filePath = `${saveDir}/${record.id}${path.extname(record.url)}`;
      if (!fs.existsSync(filePath)) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await download(record.url, filePath);
          console.log('downloaded:', record.url);
          // eslint-disable-next-line no-await-in-loop
          await sleep();
        } catch (e) {
          console.error('download error:', record.url);
          console.error(e);
        }
      } else {
        console.log('skip:', record.url);
      }
    }

    console.log('Downloaded media.');
  } finally {
    if (DataSource.isInitialized) await DataSource.destroy();
  }
};

export default getTweetMediaFromTweets;
