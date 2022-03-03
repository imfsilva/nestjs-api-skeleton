import { Test } from '@nestjs/testing';
import { Request } from 'express';

import { CommonUtilities } from '../common';

describe('Common', () => {
  let commonUtilities: CommonUtilities;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CommonUtilities],
    }).compile();

    commonUtilities = moduleRef.get(CommonUtilities);
  });

  it('should be defined', () => {
    expect(commonUtilities).toBeDefined();
  });

  it('should return app url', () => {
    const result = commonUtilities.appUrl({
      // mocked method
      get(name: 'set-cookie'): string[] | undefined {
        return [''];
      },
    } as Request);
    expect(result).toBeTruthy();
  });
});
