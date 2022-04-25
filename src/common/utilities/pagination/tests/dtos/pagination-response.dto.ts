import { PaginationResponseDto } from '../../dtos/pagination-response.dto';

export const testPaginationDto = <T>(pagination: PaginationResponseDto<T>) => {
  expect(pagination.items).toBeTruthy();
  expect(pagination.currentPage).toBeGreaterThanOrEqual(1);
  expect(pagination.maxPages).toBeGreaterThanOrEqual(0);
  expect(pagination.totalItems).toBeGreaterThanOrEqual(0);
  expect(pagination.itemsCount).toBeGreaterThanOrEqual(0);
};
