import { Readable } from 'stream';

export const MulterFileMock: Express.Multer.File = {
  filename: '',
  fieldname: '',
  originalname: '',
  encoding: '',
  mimetype: '',
  size: 1,
  stream: new Readable(),
  destination: '',
  path: '',
  buffer: Buffer.from(''),
};
