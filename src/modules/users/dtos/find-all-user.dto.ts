import { RequestPaginationDto } from '../../../common/pagination/dtos/request-pagination.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';

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
