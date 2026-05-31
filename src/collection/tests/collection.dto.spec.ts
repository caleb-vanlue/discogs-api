import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  CollectionQueryDto,
  WantlistQueryDto,
} from '../dto/collection-query.dto';

describe('Collection DTOs', () => {
  describe('CollectionQueryDto', () => {
    it('should validate a valid DTO with all fields', async () => {
      const dto = plainToClass(CollectionQueryDto, {
        limit: 50,
        offset: 0,
        sort_by: 'dateAdded',
        sort_order: 'DESC',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate when all fields are optional', async () => {
      const dto = plainToClass(CollectionQueryDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when limit is less than 1', async () => {
      const dto = plainToClass(CollectionQueryDto, {
        limit: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when offset is negative', async () => {
      const dto = plainToClass(CollectionQueryDto, {
        offset: -1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('offset');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation with invalid sort_by field', async () => {
      const dto = plainToClass(CollectionQueryDto, {
        sort_by: 'invalidField',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('sort_by');
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('should accept valid sort_by fields', async () => {
      const validSortFields = [
        'dateAdded',
        'title',
        'primaryArtist',
        'year',
        'rating',
        'primaryGenre',
        'primaryFormat',
      ];

      for (const field of validSortFields) {
        const dto = plainToClass(CollectionQueryDto, { sort_by: field });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should accept both uppercase and lowercase sort_order', async () => {
      const validOrders = ['ASC', 'DESC', 'asc', 'desc'];

      for (const order of validOrders) {
        const dto = plainToClass(CollectionQueryDto, { sort_order: order });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should fail validation with invalid sort_order', async () => {
      const dto = plainToClass(CollectionQueryDto, { sort_order: 'invalid' });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('sort_order');
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('should transform string numbers to numbers', async () => {
      const dto = plainToClass(CollectionQueryDto, { limit: '50', offset: '10' });

      expect(dto.limit).toBe(50);
      expect(dto.offset).toBe(10);

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('WantlistQueryDto', () => {
    it('should validate a valid DTO with all fields', async () => {
      const dto = plainToClass(WantlistQueryDto, {
        limit: 25,
        offset: 0,
        sort_by: 'primaryArtist',
        sort_order: 'ASC',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should not allow rating as a sort field for wantlist', async () => {
      const dto = plainToClass(WantlistQueryDto, {
        sort_by: 'rating' as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('sort_by');
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('should accept valid wantlist sort fields', async () => {
      const validSortFields = [
        'dateAdded',
        'title',
        'primaryArtist',
        'year',
        'primaryGenre',
        'primaryFormat',
      ];

      for (const field of validSortFields) {
        const dto = plainToClass(WantlistQueryDto, { sort_by: field });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should validate pagination parameters', async () => {
      const dto = plainToClass(WantlistQueryDto, { limit: 100, offset: 50 });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
