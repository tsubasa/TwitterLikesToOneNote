import fs from 'fs';
import path from 'path';
import _ from 'lodash';

type AppConfig = {
  'twitter.clientId': string;
  'twitter.clientSecret': string;
  'twitter.accessToken': string;
  'twitter.refreshToken': string;
  'twitter.maxGetTweets': number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getIn = <T extends keyof AppConfig>(config: any, key: T): AppConfig[T] => {
  const keyPath = key.split('.');
  let obj = config;
  let nest = 0;
  while (obj && nest < keyPath.length) {
    obj = obj[keyPath[nest]];
    nest += 1;
  }
  return obj;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasIn = <T extends keyof AppConfig>(config: any, key: T): boolean => {
  const keyPath = key.split('.');
  let hasKey = true;
  let obj = config;
  let nest = 0;
  while (hasKey && obj && nest < keyPath.length) {
    hasKey = keyPath[nest] in obj;
    obj = obj[keyPath[nest]];
    nest += 1;
  }
  return hasKey;
};

const setIn = <T extends keyof AppConfig>(config: AppConfig, key: T, value: AppConfig[T]): AppConfig => {
  const keyPath = key.split('.');
  const newConfig = keyPath.reverse().reduce((prev, cur, idx) => ({ [cur]: idx === 0 ? value : { ...prev } }), {});
  return _.merge(config, newConfig);
};

export default class Config {
  private static config: AppConfig;

  private static configLoaded = false;

  private static configPath = path.resolve(__dirname, '../../../config/default.json');

  private static loadConfig() {
    if (!this.configLoaded) {
      try {
        this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
      } catch (e) {
        console.error(e);
        this.config = {} as AppConfig;
      } finally {
        this.configLoaded = true;
      }
    }
  }

  private static saveConfig<T extends keyof AppConfig>(key: T, value: AppConfig[T]) {
    try {
      this.config = setIn(this.config, key, value);
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (e) {
      console.error(e);
    }
  }

  public static has<T extends keyof AppConfig>(key: T) {
    this.loadConfig();
    return hasIn(this.config, key);
  }

  public static get<T extends keyof AppConfig>(key: T) {
    this.loadConfig();
    return getIn(this.config, key);
  }

  public static set<T extends keyof AppConfig>(key: T, value: AppConfig[T]) {
    this.loadConfig();
    this.saveConfig(key, value);
  }
}
