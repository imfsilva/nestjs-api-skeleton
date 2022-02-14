import { IsEmail, IsOptional, IsString } from 'class-validator';

import { RequestPaginationDto } from '../../../../common/utilities/pagination/dtos/request-pagination.dto';

export class FindAllUserDto extends RequestPaginationDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
