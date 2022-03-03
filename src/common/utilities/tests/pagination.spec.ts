import { Pagination } from '../pagination/pagination';
import { PaginationResponseDto } from '../pagination/dtos/pagination-response.dto';

describe('Pagination', () => {
  describe('First case', () => {
    const pagination = new Pagination(1, 15);

    it('should return 0', () => {
      const skip = pagination.getSkip();
      expect(skip).toBe(0);
    });

    it('should return 15', () => {
      const skip = pagination.getTake();
      expect(skip).toBe(15);
    });

    it('should return pagination response', () => {
      const result = pagination.paginationResult([], 45);

      expect(result.items).toBeTruthy();
      expect(result.itemsCount).toBe(0);
      expect(result.totalItems).toBe(45);
      expect(result.maxPages).toBe(3);
      expect(result.currentPage).toBe(1);
      expect(result).toBeInstanceOf(PaginationResponseDto);
    });
  });

  describe('Second case', () => {
    const pagination = new Pagination(3, 20);

    it('should return 40', () => {
      const skip = pagination.getSkip();
      expect(skip).toBe(40);
    });

    it('should return 20', () => {
      const skip = pagination.getTake();
      expect(skip).toBe(20);
    });

    it('should return pagination response', () => {
      const result = pagination.paginationResult([], 45);

      expect(result.items).toBeTruthy();
      expect(result.itemsCount).toBe(0);
      expect(result.totalItems).toBe(45);
      expect(result.maxPages).toBe(3);
      expect(result.currentPage).toBe(3);
      expect(result).toBeInstanceOf(PaginationResponseDto);
    });
  });
});
