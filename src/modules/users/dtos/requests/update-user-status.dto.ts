import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty()
  @IsBoolean()
  readonly softDelete: boolean;
}
