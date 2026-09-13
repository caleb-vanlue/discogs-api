import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInstanceId1789303629527 implements MigrationInterface {
    name = 'UpdateInstanceId1789303629527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_collections" DROP COLUMN "discogs_instance_id"`);
        await queryRunner.query(`ALTER TABLE "user_collections" ADD "discogs_instance_id" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_collections" DROP COLUMN "discogs_instance_id"`);
        await queryRunner.query(`ALTER TABLE "user_collections" ADD "discogs_instance_id" integer`);
    }

}
