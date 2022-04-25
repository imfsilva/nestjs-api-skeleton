import { Inject, Injectable } from '@nestjs/common';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { Client, ItemBucketMetadata } from 'minio';

import { ConfigService } from './config.service';

interface FileDto {
  moduleName: string;
  proprietaryId: string;
  fileId: string;
  file: Express.Multer.File;
}

interface RemoveFileDto {
  moduleName: string;
  proprietaryId: string;
  fileId: string;
  fileExtension: string;
}

@Injectable()
export class S3Service {
  constructor(
    @Inject(MINIO_CONNECTION) private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {}

  private static bucketMetadata(mimetype: string): ItemBucketMetadata {
    return { 'Content-type': mimetype, 'x-amz-acl': '' + 'public-read' };
  }

  public async createBucketIfNotExist(): Promise<void> {
    const bucketName: string = this.configService.S3Config.bucketName;
    const region: string = this.configService.S3Config.region;

    const exists: boolean = await this.minioClient.bucketExists(bucketName);

    if (!exists) {
      await this.minioClient.makeBucket(bucketName, region);
      await this.minioClient.setBucketPolicy(
        bucketName,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicReadGetObject',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        }),
      );
    }
  }

  public static getUrlPath(dto: {
    module: string;
    proprietaryId: string;
    fileId: string;
    fileExtension: string;
  }): string {
    /**
     * This function has to be static because we need to use it in the
     * Typeorm entity classes without having to instance S3Service class
     */

    const { module, fileExtension, fileId, proprietaryId } = dto;
    const { S3_PUBLIC_URL, S3_BUCKET_NAME, NODE_ENV } = process.env;

    if (NODE_ENV === 'production') {
      return `${S3_PUBLIC_URL}/${module}/${proprietaryId}/${fileId}${fileExtension}`;
    }

    return `${S3_PUBLIC_URL}/${S3_BUCKET_NAME}/${module}/${proprietaryId}/${fileId}${fileExtension}`;
  }

  getFileExtension(originalName: string): string {
    return originalName.substring(originalName.lastIndexOf('.'), originalName.length);
  }

  async uploadSingleFile(dto: FileDto): Promise<void> {
    const { moduleName, proprietaryId, file, fileId } = dto;
    const extension: string = this.getFileExtension(file.originalname);
    const filePath = `/${moduleName}/${proprietaryId}/${fileId}${extension}`;
    const metadata: ItemBucketMetadata = S3Service.bucketMetadata(file.mimetype);

    await this.minioClient.putObject(
      this.configService.S3Config.bucketName,
      filePath,
      file.buffer,
      metadata,
    );
  }

  async uploadMultipleFiles(dtos: FileDto[]): Promise<void> {
    for (let i = 0; i < dtos.length; i++) {
      await this.uploadSingleFile(dtos[i]);
    }
  }

  async deleteFile(dto: RemoveFileDto): Promise<void> {
    const { moduleName, proprietaryId, fileId, fileExtension } = dto;
    const filePath = `/${moduleName}/${proprietaryId}/${fileId}${fileExtension}`;

    await this.minioClient.removeObject(this.configService.S3Config.bucketName, filePath);
  }
}
