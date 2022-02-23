import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { MAX_TAKE, MIN_SKIP, MIN_TAKE } from '../../../constants';

export class RequestPaginationDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Min(MIN_SKIP)
  readonly skip: number = MIN_SKIP;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Min(MIN_TAKE)
  @Max(MAX_TAKE)
  readonly take: number = MAX_TAKE;
}
