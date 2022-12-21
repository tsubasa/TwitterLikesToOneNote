import readline from 'readline';
import getTweetMediaFromTweets from './GetTweetMediaFromTweets';
import getTweetsFromBookmark from './GetTweetsFromBookmark';
import uploadOneNoteFromTweets from './UploadOneNoteFromTweets';

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
  console.log(msg);
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
            console.log('Bye bye 👋');
            process.exit(0);
            break;
          default:
            break;
        }
      } catch (e) {
        console.error(e);
      }
    }
    console.log(''); // 改行
  }
};

(async () => {
  await main();
})();
