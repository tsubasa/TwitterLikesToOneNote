import readline from 'readline';
import getTweetMediaFromTweets from './GetTweetMediaFromTweets';
import getTweetsFromBookmark from './GetTweetsFromBookmark';
import uploadOneNoteFromTweets from './UploadOneNoteFromTweets';
import Logger from './core/Logger';

const logger = new Logger('app');

const question = (questionText: string): Promise<string> => {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    readlineInterface.question(questionText, (answer) => {
      resolve(answer);
      readlineInterface.close();
    });
  });
};

const prompt = async (msg: string) => {
  process.stdout.write(`${msg}\n`);
  const answer = await question('> ');
  return answer.trim();
};

const main = async () => {
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    const answer = await prompt(
      'Please input run script number:\n[1] GetTweetsFromBookmark\n[2] GetTweetMediaFromTweets\n[3] SaveToOneNote\n[4] Exit',
    );
    if (['1', '2', '3', '4'].includes(answer)) {
      try {
        switch (answer) {
          case '1':
            // eslint-disable-next-line no-await-in-loop
            await getTweetsFromBookmark();
            break;
          case '2':
            // eslint-disable-next-line no-await-in-loop
            await getTweetMediaFromTweets();
            break;
          case '3':
            // eslint-disable-next-line no-await-in-loop
            await uploadOneNoteFromTweets();
            break;
          case '4':
            process.stdout.write('Bye bye 👋');
            process.exit(0);
            break;
          default:
            break;
        }
      } catch (e) {
        logger.error(e);
      }
    }
    process.stdout.write('\n'); // 改行
  }
};

(async () => {
  await main();
})();
