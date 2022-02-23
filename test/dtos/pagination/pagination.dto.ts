import { PaginationResponse } from '../../../dist/common/utilities';

export const testPaginationDto = (pagination: PaginationResponse<any>) => {
  expect(pagination.items).toBeTruthy();
  expect(pagination.currentPage).toBeGreaterThanOrEqual(1);
  expect(pagination.maxPages).toBeGreaterThanOrEqual(0);
  expect(pagination.totalItems).toBeGreaterThanOrEqual(0);
  expect(pagination.itemsCount).toBeGreaterThanOrEqual(0);
};
