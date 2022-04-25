import { Test } from '@nestjs/testing';

import { CommonUtilities } from './common';
import { ExpressMock } from '../../../mocks';

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
    const result = CommonUtilities.appUrl(ExpressMock);
    expect(result).toBeTruthy();
  });

  it('should return a capitalized string', () => {
    const result = CommonUtilities.capitalize('random string');
    expect(result).toBe('Random string');
  });
});
