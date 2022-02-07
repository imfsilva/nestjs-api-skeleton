import { Transform, TransformFnParams } from 'class-transformer';

/**
 * @description trim spaces from start and end, replace multiple spaces with one.
 * @example
 * @ApiProperty()
 * @IsString()
 * @Trim()
 * name: string;
 * @returns PropertyDecorator
 * @constructor
 */
export function Trim(): PropertyDecorator {
  return Transform((params: TransformFnParams) => {
    const value: string | string[] = params.value as string[] | string;

    if (Array.isArray(value)) {
      return value.map((v: string) => v.trim().replace(/\s\s+/g, ' '));
    }

    return value.trim().replace(/\s\s+/g, ' ');
  });
}
