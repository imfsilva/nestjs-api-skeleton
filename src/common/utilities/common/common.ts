import { Request } from 'express';

export class CommonUtilities {
  public static appUrl(req: Request): string {
    return `${req.protocol}://${req.get('host')}`;
  }

  public static capitalize(string: string): string {
    return string.replace(/./, (c: string) => c.toUpperCase());
  }
}
