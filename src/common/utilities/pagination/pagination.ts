import { PaginationResponseDto } from './dtos/pagination-response.dto';

export type PaginationResponse<T> = PaginationResponseDto<T>;

export class Pagination {
  private readonly skip: number;
  private readonly take: number;

  constructor(skip: number, take: number) {
    this.skip = skip;
    this.take = take;
  }

  public paginationResult<T>(
    items: T[],
    totalItems: number,
  ): PaginationResponse<T> {
    const size: number = this.take !== 0 ? this.take : totalItems;

    return {
      items,
      itemsCount: items.length,
      totalItems,
      maxPages: size === 0 ? totalItems : Math.ceil(totalItems / size),
      currentPage: this.skip,
    };
  }

  public getSkip(): number {
    return this.skip > 1 ? (this.skip - 1) * this.take : 0;
  }

  public getTake(): number {
    return this.take;
  }
}
