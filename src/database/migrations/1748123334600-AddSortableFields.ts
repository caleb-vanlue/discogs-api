import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSortableFields1748123334600 implements MigrationInterface {
  name = 'AddSortableFields1748123334600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "releases" ADD "primary_artist" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "releases" ADD "all_artists" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "releases" ADD "primary_genre" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "releases" ADD "primary_style" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "releases" ADD "primary_format" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "releases" ADD "vinyl_color" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "releases" ADD "catalog_number" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "releases" ADD "record_label" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" ADD "title" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" ADD "primary_artist" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" ADD "all_artists" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" ADD "year" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" ADD "primary_genre" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" ADD "primary_format" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" ADD "vinyl_color" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" ADD "title" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" ADD "primary_artist" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" ADD "all_artists" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "user_wantlists" ADD "year" integer`);
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" ADD "primary_genre" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" ADD "primary_format" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" ADD "vinyl_color" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87dd10b9eb5b63b60a14ed17a4" ON "releases" ("title") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eda1661a006a8303c050552085" ON "releases" ("year") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ec278e8abcbf006515a277f1ff" ON "releases" ("primary_artist") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_73d8426a1c155f7fc969148c6b" ON "user_collections" ("user_id", "year") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6783bb510bad97bf415eff392a" ON "user_collections" ("user_id", "title") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e1086300ea6f5981cbae2814fd" ON "user_collections" ("user_id", "primary_artist") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f497fb00f03e11ec8052ddee27" ON "user_collections" ("user_id", "rating") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_add9afabf4ee1595400208b46f" ON "user_collections" ("user_id", "date_added") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8215b482f7ae75c712f1e2ac19" ON "user_wantlists" ("user_id", "year") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_568cf08059102d1e38543df9a9" ON "user_wantlists" ("user_id", "title") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1dddcfb81ad42bae8e6d10f473" ON "user_wantlists" ("user_id", "primary_artist") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_991c59c010ecbd15562a70229f" ON "user_wantlists" ("user_id", "date_added") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_991c59c010ecbd15562a70229f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1dddcfb81ad42bae8e6d10f473"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_568cf08059102d1e38543df9a9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8215b482f7ae75c712f1e2ac19"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_add9afabf4ee1595400208b46f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f497fb00f03e11ec8052ddee27"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e1086300ea6f5981cbae2814fd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6783bb510bad97bf415eff392a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_73d8426a1c155f7fc969148c6b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ec278e8abcbf006515a277f1ff"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eda1661a006a8303c050552085"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_87dd10b9eb5b63b60a14ed17a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" DROP COLUMN "vinyl_color"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" DROP COLUMN "primary_format"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" DROP COLUMN "primary_genre"`,
    );
    await queryRunner.query(`ALTER TABLE "user_wantlists" DROP COLUMN "year"`);
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" DROP COLUMN "all_artists"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_wantlists" DROP COLUMN "primary_artist"`,
    );
    await queryRunner.query(`ALTER TABLE "user_wantlists" DROP COLUMN "title"`);
    await queryRunner.query(
      `ALTER TABLE "user_collections" DROP COLUMN "vinyl_color"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" DROP COLUMN "primary_format"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" DROP COLUMN "primary_genre"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" DROP COLUMN "year"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" DROP COLUMN "all_artists"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" DROP COLUMN "primary_artist"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_collections" DROP COLUMN "title"`,
    );
    await queryRunner.query(
      `ALTER TABLE "releases" DROP COLUMN "record_label"`,
    );
    await queryRunner.query(
      `ALTER TABLE "releases" DROP COLUMN "catalog_number"`,
    );
    await queryRunner.query(`ALTER TABLE "releases" DROP COLUMN "vinyl_color"`);
    await queryRunner.query(
      `ALTER TABLE "releases" DROP COLUMN "primary_format"`,
    );
    await queryRunner.query(
      `ALTER TABLE "releases" DROP COLUMN "primary_style"`,
    );
    await queryRunner.query(
      `ALTER TABLE "releases" DROP COLUMN "primary_genre"`,
    );
    await queryRunner.query(`ALTER TABLE "releases" DROP COLUMN "all_artists"`);
    await queryRunner.query(
      `ALTER TABLE "releases" DROP COLUMN "primary_artist"`,
    );
  }
}
