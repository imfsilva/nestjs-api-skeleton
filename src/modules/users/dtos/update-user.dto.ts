import { OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { UserRegisterDto } from '../../auth/dtos/user-register.dto';

export class UpdateUserDto extends PartialType(
  OmitType(UserRegisterDto, ['password'] as const),
) {
  @IsBoolean()
  @IsOptional()
  softDelete: boolean;
}
