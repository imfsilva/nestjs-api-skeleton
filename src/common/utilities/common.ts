import { Request } from 'express';

export class CommonUtilities {
  public appUrl(req: Request): string {
    return `${req.protocol}://${req.get('host')}`;
  }
}
