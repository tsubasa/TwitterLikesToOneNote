import readline from 'readline';
import GetTweetMediaFromTweets from './GetTweetMediaFromTweets';
import GetTweetsFromBookmark from './GetTweetsFromBookmark';
import GetOneNoteSectionId from './GetOneNoteSectionId';
import UploadOneNoteFromTweets from './UploadOneNoteFromTweets';
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

const prompt = async (message: string) => {
  process.stdout.write(`${message}\n`);
  const answer = await question('> ');
  return answer.trim();
};

const main = async () => {
  for (;;) {
    const answer = await prompt(
      'Please enter run script number:\n[1] GetTweetsFromBookmark\n[2] GetTweetMediaFromTweets\n[3] GetOneNoteSectionId\n[4] SaveToOneNote\n[5] Exit',
    );
    if (['1', '2', '3', '4', '5'].includes(answer)) {
      try {
        switch (answer) {
          case '1':
            await GetTweetsFromBookmark();
            break;
          case '2':
            await GetTweetMediaFromTweets();
            break;
          case '3':
            await GetOneNoteSectionId();
            break;
          case '4': {
            const users = await prompt('Please enter multiple users by separating them with a comma (,)');
            await UploadOneNoteFromTweets(users);
            break;
          }
          case '5':
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
