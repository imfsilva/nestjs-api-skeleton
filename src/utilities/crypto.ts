import * as cryptojs from 'crypto-js';

export class Crypto {
  private readonly secret: string = process.env.CRYPTO_SECRET_KEY;

  private decrypt(string: string): string {
    const bytes: cryptojs.lib.WordArray = cryptojs.AES.decrypt(
      string,
      this.secret,
    );
    return bytes.toString(cryptojs.enc.Utf8);
  }

  /**
   * Generate random 20 bytes hash
   *
   * @returns {string}
   */
  public randomHash(): string {
    return cryptojs.lib.WordArray.random(20).toString();
  }

  /**
   * Generate hash from password or string
   *
   * @param {string} password
   * @returns {string}
   */
  public generateHash(password: string): string {
    return cryptojs.AES.encrypt(password, this.secret).toString();
  }

  /**
   * Validate text with hash
   *
   * @param {string} hash
   * @param {string} password
   * @returns {boolean}
   */
  public validateHash(hash: string, password: string): boolean {
    const decrypted: string = this.decrypt(hash);
    return decrypted === password;
  }
}
