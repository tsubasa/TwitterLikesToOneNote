import https from 'https';
import fs from 'fs';
import path from 'path';

import DataSource from './infrastructure/db/DataSource';
import TwitterMedia from './infrastructure/db/entities/TwitterMedia';
import Logger from './core/Logger';

const logger = new Logger(__filename);

const saveDir = path.resolve(__dirname, `../medias`);

if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir);
}

const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const download = (url: string, filePath: string) => {
  return new Promise<void>((resolve, reject) =>
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

    for (const record of records) {
      const url = record.type === 'photo' ? new URL('?format=png&name=large', record.url).href : record.url;
      const filePath = `${saveDir}/${record.id}${record.type === 'photo' ? '.png' : path.extname(record.url)}`;
      if (!fs.existsSync(filePath)) {
        try {
          await download(url, filePath);
          logger.info('downloaded:', url);

          await sleep();
        } catch (e) {
          logger.error('download error:', url);
          logger.error(e);
        }
      } else {
        logger.info('skip:', url);
      }
    }

    logger.debug('Downloaded media.');
  } catch (e) {
    logger.error(e);
  } finally {
    if (DataSource.isInitialized) await DataSource.destroy();
  }
};

export default getTweetMediaFromTweets;
