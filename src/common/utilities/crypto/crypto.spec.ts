import { Test } from '@nestjs/testing';

import { Crypto } from './crypto';

describe('Crypto', () => {
  let crypto: Crypto;

  beforeEach(async () => {
    process.env.CRYPTO_SECRET_KEY = 'secret';

    const moduleRef = await Test.createTestingModule({
      providers: [Crypto],
    }).compile();

    crypto = moduleRef.get(Crypto);
  });

  it('should be defined', () => {
    expect(crypto).toBeDefined();
  });

  it('should return a random hash', () => {
    const result = crypto.randomHash();
    expect(result).toBeTruthy();
  });

  it('should return a generated hash', () => {
    const result = crypto.generateHash('random-string');
    expect(result).toBeTruthy();
  });

  describe('validateHash', () => {
    it('should return false', () => {
      const hash = crypto.generateHash('string');
      const result = crypto.validateHash(hash, 'random-string');
      expect(result).toBe(false);
    });

    it('should return true', () => {
      const hash = crypto.generateHash('string');
      const result = crypto.validateHash(hash, 'string');
      expect(result).toBe(true);
    });
  });
});
