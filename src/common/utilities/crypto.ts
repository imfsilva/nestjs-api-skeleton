import * as cryptojs from 'crypto-js';

export class Crypto {
  private static decrypt(string: string): string {
    const bytes: cryptojs.lib.WordArray = cryptojs.AES.decrypt(
      string,
      process.env.CRYPTO_SECRET_KEY,
    );
    return bytes.toString(cryptojs.enc.Utf8);
  }

  /**
   * Generate random 30 bytes hash
   *
   * @returns {string}
   */
  public static randomHash(): string {
    return cryptojs.lib.WordArray.random(30).toString();
  }

  /**
   * Generate hash
   *
   * @param {string} string
   * @returns {string}
   */
  public static generateHash(string: string): string {
    return cryptojs.AES.encrypt(
      string,
      process.env.CRYPTO_SECRET_KEY,
    ).toString();
  }

  /**
   * Validate string with hash
   *
   * @param {string} hash
   * @param {string} string
   * @returns {boolean}
   */
  public static validateHash(hash: string, string: string): boolean {
    const decrypted: string = Crypto.decrypt(hash);
    return decrypted === string;
  }
}
