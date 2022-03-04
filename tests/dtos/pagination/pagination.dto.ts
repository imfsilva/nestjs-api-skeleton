import { PaginationResponseDto } from '../../../src/common/utilities/pagination/dtos/pagination-response.dto';

export const testPaginationDto = (pagination: PaginationResponseDto<any>) => {
  expect(pagination.items).toBeTruthy();
  expect(pagination.currentPage).toBeGreaterThanOrEqual(1);
  expect(pagination.maxPages).toBeGreaterThanOrEqual(0);
  expect(pagination.totalItems).toBeGreaterThanOrEqual(0);
  expect(pagination.itemsCount).toBeGreaterThanOrEqual(0);
};
