import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PaginationResponseDto<T> {
  @Expose()
  readonly items: T[];

  @ApiProperty()
  @Expose()
  readonly itemsCount: number;

  @ApiProperty()
  @Expose()
  readonly totalItems: number;

  @ApiProperty()
  @Expose()
  readonly currentPage: number;

  @ApiProperty()
  @Expose()
  readonly maxPages: number;
}
