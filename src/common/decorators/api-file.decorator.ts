import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export const ApiFile =
  (fieldName = 'file'): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    applyDecorators(
      ApiConsumes('multipart/form-data'),
      ApiBody({
        type: 'multipart/form-data',
        required: true,
        schema: {
          type: 'object',
          properties: {
            [fieldName]: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      }),
    )(target, propertyKey, descriptor);
  };
