import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const HttpCodesResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad Request',
    }),

    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized',
    }),

    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden',
    }),

    ApiResponse({
      status: HttpStatus.REQUEST_TIMEOUT,
      description: 'Request timeout',
    }),

    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'Too many requests',
    }),

    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
    }),
  );
};
