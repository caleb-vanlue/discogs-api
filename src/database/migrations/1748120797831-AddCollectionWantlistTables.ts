import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCollectionWantlistTables1748120797831
  implements MigrationInterface
{
  name = 'AddCollectionWantlistTables1748120797831';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_collections" ("id" SERIAL NOT NULL, "user_id" character varying NOT NULL, "release_id" integer NOT NULL, "discogs_instance_id" integer, "folder_id" integer NOT NULL DEFAULT '0', "rating" smallint NOT NULL DEFAULT '0', "notes" text, "customFields" json, "date_added" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0f50c79662214ef4d0f14956980" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64c12326d36a9ead157b3757d4" ON "user_collections" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a62fffd30546ee94fb9cf557da" ON "user_collections" ("user_id", "release_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_wantlists" ("id" SERIAL NOT NULL, "user_id" character varying NOT NULL, "release_id" integer NOT NULL, "notes" text, "date_added" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ed19af2fe54473eec7a9bbb48b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f1f891440bf3768ac812ed92ab" ON "user_wantlists" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e5bbdf79a43fa87f67849ce292" ON "user_wantlists" ("user_id", "release_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" ADD CONSTRAINT "FK_8b43f7ada150082e862a3a0e1a4" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" ADD CONSTRAINT "FK_ff0cb82493c8a0bf603d446c05f" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" DROP CONSTRAINT "FK_ff0cb82493c8a0bf603d446c05f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" DROP CONSTRAINT "FK_8b43f7ada150082e862a3a0e1a4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e5bbdf79a43fa87f67849ce292"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f1f891440bf3768ac812ed92ab"`,
    );
    await queryRunner.query(`DROP TABLE "user_wantlists"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a62fffd30546ee94fb9cf557da"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_64c12326d36a9ead157b3757d4"`,
    );
    await queryRunner.query(`DROP TABLE "user_collections"`);
  }
}
