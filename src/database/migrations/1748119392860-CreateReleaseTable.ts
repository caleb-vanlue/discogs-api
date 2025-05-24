import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReleaseTable1748119392860 implements MigrationInterface {
    name = 'CreateReleaseTable1748119392860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "releases" ("id" SERIAL NOT NULL, "discogs_id" integer NOT NULL, "title" character varying NOT NULL, "year" integer, "thumb_url" character varying, "cover_image_url" character varying, "artists" json NOT NULL, "labels" json, "formats" json, "genres" json, "styles" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c0b05a1fcbfcc0b5310dec3e400" UNIQUE ("discogs_id"), CONSTRAINT "PK_6b6fc2599a5a281dd44a7d64016" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c0b05a1fcbfcc0b5310dec3e40" ON "releases" ("discogs_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c0b05a1fcbfcc0b5310dec3e40"`);
        await queryRunner.query(`DROP TABLE "releases"`);
    }

}
