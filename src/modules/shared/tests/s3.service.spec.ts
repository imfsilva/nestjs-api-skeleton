import { Test } from '@nestjs/testing';
import { InstanceToken } from '@nestjs/core/injector/module';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { NestMinioModule } from 'nestjs-minio';

import { S3Service } from '../services/s3.service';
import { ConfigService } from '../services/config.service';
import { Readable } from 'stream';

const moduleMocker = new ModuleMocker(global);

const MulterFileMock: Express.Multer.File = {
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

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [S3Service],
      imports: [
        NestMinioModule.register({
          endPoint: 'localhost',
          port: 9000,
          useSSL: false,
          accessKey: 'minio',
          secretKey: 'minio123',
        }),
      ],
    })
      .useMocker((token: InstanceToken | undefined) => {
        if (token === ConfigService)
          return {
            S3Config: {
              url: 'url',
              publicUrl: 'publicUrl',
              bucketName: 'test-bucket',
              accessKey: 'accessKey',
              secretKey: 'secretKey',
              region: 'region',
            },
          };

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = moduleRef.get(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBucketIfNotExist', () => {
    it('should create bucket if not exist', async () => {
      await expect(service.createBucketIfNotExist()).resolves.not.toThrow();
    });
  });

  describe('getUrlPath', () => {
    it('should get file url path (not production)', async () => {
      process.env.NODE_ENV = 'not-production';
      const result = S3Service.getUrlPath({
        fileId: 'fileId',
        fileExtension: '.jpg',
        proprietaryId: 'proprietaryId',
        module: 'module',
      });
      await expect(result).toBeTruthy();
      await expect(result).toBe(
        `http://localhost:9000/${process.env.S3_BUCKET_NAME}/module/proprietaryId/fileId.jpg`,
      );
    });

    it('should get file url path (production)', async () => {
      process.env.NODE_ENV = 'production';
      const result = S3Service.getUrlPath({
        fileId: 'fileId',
        fileExtension: '.jpg',
        proprietaryId: 'proprietaryId',
        module: 'module',
      });
      await expect(result).toBeTruthy();
      await expect(result).toBe(`http://localhost:9000/module/proprietaryId/fileId.jpg`);
      process.env.NODE_ENV = 'test';
    });
  });

  describe('getFileExtension', () => {
    it('should get file extension', async () => {
      const result = service.getFileExtension('originalFileName.jpg');
      await expect(result).toBeTruthy();
      await expect(result).toBe('.jpg');
    });
  });

  describe('uploadSingleFile', () => {
    it('should upload single file', async () => {
      await expect(
        service.uploadSingleFile({
          fileId: 'fileId',
          file: MulterFileMock,
          proprietaryId: 'proprietaryId',
          moduleName: 'moduleName',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('uploadMultipleFiles', () => {
    it('should upload multiples files', async () => {
      await expect(
        service.uploadMultipleFiles([
          {
            fileId: 'fileId',
            file: MulterFileMock,
            proprietaryId: 'proprietaryId',
            moduleName: 'moduleName',
          },
        ]),
      ).resolves.not.toThrow();
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      await expect(
        service.deleteFile({
          fileId: 'fileId',
          fileExtension: 'fileExtension',
          proprietaryId: 'proprietaryId',
          moduleName: 'users',
        }),
      ).resolves.not.toThrow();
    });
  });
});
