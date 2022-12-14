import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1671008869985 implements MigrationInterface {
    name = 'Init1671008869985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "twitter_tweet" ("tweet_id" varchar(64) PRIMARY KEY NOT NULL, "user_id" varchar(64) NOT NULL, "text" text NOT NULL, "tweeted_at" datetime NOT NULL DEFAULT (datetime('now')), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE INDEX "IDX_91e27d3c01584fbe66dc5a75a7" ON "twitter_tweet" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "twitter_user" ("user_id" varchar(64) PRIMARY KEY NOT NULL, "screen_name" varchar(64) NOT NULL, "display_name" varchar(128) NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE INDEX "IDX_7de6c37c070d86cf418c6a0c38" ON "twitter_user" ("screen_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_3dc7939c687f32fd4ba16746e9" ON "twitter_user" ("display_name") `);
        await queryRunner.query(`CREATE TABLE "twitter_media" ("media_id" varchar(64) PRIMARY KEY NOT NULL, "tweet_id" varchar(64) NOT NULL, "media_url" text NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE INDEX "IDX_0728addfe619a7721770bde917" ON "twitter_media" ("tweet_id") `);
        await queryRunner.query(`CREATE TABLE "one_note" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tweet_id" varchar(64) NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE INDEX "IDX_7ed548d66346dcf4004d03d224" ON "one_note" ("tweet_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_7ed548d66346dcf4004d03d224"`);
        await queryRunner.query(`DROP TABLE "one_note"`);
        await queryRunner.query(`DROP INDEX "IDX_0728addfe619a7721770bde917"`);
        await queryRunner.query(`DROP TABLE "twitter_media"`);
        await queryRunner.query(`DROP INDEX "IDX_3dc7939c687f32fd4ba16746e9"`);
        await queryRunner.query(`DROP INDEX "IDX_7de6c37c070d86cf418c6a0c38"`);
        await queryRunner.query(`DROP TABLE "twitter_user"`);
        await queryRunner.query(`DROP INDEX "IDX_91e27d3c01584fbe66dc5a75a7"`);
        await queryRunner.query(`DROP TABLE "twitter_tweet"`);
    }

}
