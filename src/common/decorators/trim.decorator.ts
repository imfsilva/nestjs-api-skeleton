import { Transform, TransformFnParams } from 'class-transformer';

// Trim spaces from start and end, replace multiple spaces with one
export function Trim(): PropertyDecorator {
  return Transform((params: TransformFnParams) => {
    const value: string | string[] = params.value as string[] | string;

    if (Array.isArray(value)) {
      return value.map((v: string) => v.trim().replace(/\s\s+/g, ' '));
    }

    return value.trim().replace(/\s\s+/g, ' ');
  });
}
