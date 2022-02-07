import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginationResponseDto<T> {
  @Type()
  readonly items: T[];

  @ApiProperty()
  readonly itemsCount: number;

  @ApiProperty()
  readonly totalItems: number;

  @ApiProperty()
  readonly currentPage: number;

  @ApiProperty()
  readonly maxPages: number;
}
