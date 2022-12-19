import fs from 'fs';
import path from 'path';

type AppConfig = {
  'twitter.clientId': string;
  'twitter.clientSecret': string;
  'twitter.accessToken': string;
  'twitter.refreshToken': string;
  'twitter.maxGetTweets': number;
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
      this.config[key] = value;
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (e) {
      console.error(e);
    }
  }

  public static has<T extends keyof AppConfig>(key: T) {
    this.loadConfig();
    return key in this.config;
  }

  public static get<T extends keyof AppConfig>(key: T) {
    this.loadConfig();
    return this.config[key];
  }

  public static set<T extends keyof AppConfig>(key: T, value: AppConfig[T]) {
    this.loadConfig();
    this.saveConfig(key, value);
  }
}
