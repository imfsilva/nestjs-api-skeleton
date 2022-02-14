import { Request } from 'express';

export const appUrl = (req: Request): string =>
  `${req.protocol}://${req.get('host')}`;
