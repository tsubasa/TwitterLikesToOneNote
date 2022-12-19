import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1671241534296 implements MigrationInterface {
    name = 'Init1671241534296'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "twitter_tweet" ("id" varchar(64) PRIMARY KEY NOT NULL, "user_id" varchar(64) NOT NULL, "text" text NOT NULL, "tweeted_at" datetime NOT NULL DEFAULT (datetime('now')), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE INDEX "IDX_91e27d3c01584fbe66dc5a75a7" ON "twitter_tweet" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "twitter_user" ("id" varchar(64) PRIMARY KEY NOT NULL, "user_name" varchar(64) NOT NULL, "name" varchar(128) NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE INDEX "IDX_4e022e7cd5240a74d4c0f25fdc" ON "twitter_user" ("user_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_e573c1244c0ebb0a46d33f8bb5" ON "twitter_user" ("name") `);
        await queryRunner.query(`CREATE TABLE "twitter_media" ("id" varchar(64) PRIMARY KEY NOT NULL, "tweet_id" varchar(64) NOT NULL, "type" varchar(16) NOT NULL, "url" text NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE INDEX "IDX_0728addfe619a7721770bde917" ON "twitter_media" ("tweet_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_210c90e8f64972ef761a82b137" ON "twitter_media" ("type") `);
        await queryRunner.query(`CREATE TABLE "one_note" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tweet_id" varchar(64) NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE INDEX "IDX_7ed548d66346dcf4004d03d224" ON "one_note" ("tweet_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_7ed548d66346dcf4004d03d224"`);
        await queryRunner.query(`DROP TABLE "one_note"`);
        await queryRunner.query(`DROP INDEX "IDX_210c90e8f64972ef761a82b137"`);
        await queryRunner.query(`DROP INDEX "IDX_0728addfe619a7721770bde917"`);
        await queryRunner.query(`DROP TABLE "twitter_media"`);
        await queryRunner.query(`DROP INDEX "IDX_e573c1244c0ebb0a46d33f8bb5"`);
        await queryRunner.query(`DROP INDEX "IDX_4e022e7cd5240a74d4c0f25fdc"`);
        await queryRunner.query(`DROP TABLE "twitter_user"`);
        await queryRunner.query(`DROP INDEX "IDX_91e27d3c01584fbe66dc5a75a7"`);
        await queryRunner.query(`DROP TABLE "twitter_tweet"`);
    }

}
