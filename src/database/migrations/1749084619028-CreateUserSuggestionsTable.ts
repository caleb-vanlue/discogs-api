import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSuggestionsTable1749084619028
  implements MigrationInterface
{
  name = 'CreateUserSuggestionsTable1749084619028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_suggestions" ("id" SERIAL NOT NULL, "user_id" character varying NOT NULL, "release_id" integer NOT NULL, "notes" text, "date_added" TIMESTAMP, "title" character varying, "primary_artist" character varying, "all_artists" character varying, "year" integer, "primary_genre" character varying, "primary_format" character varying, "vinyl_color" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9b553b6d240963985346c3f26a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_25575275213053724d1a220a3e" ON "user_suggestions" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0a872dd1c50a05163727a7c6a8" ON "user_suggestions" ("user_id", "year") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ecdb93f5719dbd13cbd803e88f" ON "user_suggestions" ("user_id", "title") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9ab4ef438be398c6323cd337e3" ON "user_suggestions" ("user_id", "primary_artist") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7630c4abb7d0d683d04ca10b77" ON "user_suggestions" ("user_id", "date_added") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_799dd332e5b1bbef4e6ac0ab62" ON "user_suggestions" ("user_id", "release_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_suggestions" ADD CONSTRAINT "FK_5ef16de00f44d587c71abeb795c" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_suggestions" DROP CONSTRAINT "FK_5ef16de00f44d587c71abeb795c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_799dd332e5b1bbef4e6ac0ab62"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7630c4abb7d0d683d04ca10b77"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9ab4ef438be398c6323cd337e3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ecdb93f5719dbd13cbd803e88f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0a872dd1c50a05163727a7c6a8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_25575275213053724d1a220a3e"`,
    );
    await queryRunner.query(`DROP TABLE "user_suggestions"`);
  }
}
