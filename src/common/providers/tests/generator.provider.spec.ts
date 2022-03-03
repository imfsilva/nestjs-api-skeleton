import { Test } from '@nestjs/testing';
import { validate as isValidUUID } from 'uuid';

import { GeneratorProvider } from '../generator.provider';

describe('GeneratorProvider', () => {
  let provider: GeneratorProvider;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GeneratorProvider],
    }).compile();

    provider = moduleRef.get(GeneratorProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('uuid', () => {
    it('should return a uuid', async () => {
      const result = GeneratorProvider.uuid();
      expect(isValidUUID(result)).toBeTruthy();
    });
  });
});
