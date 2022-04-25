export const S3ServiceMock = {
  uploadSingleFile: jest.fn(),
  uploadMultipleFiles: jest.fn(),
  deleteFile: jest.fn(),
  createBucketIfNotExist: jest.fn(),
  bucketMetadata: jest.fn(),
  getUrlPath: jest.fn(),
  getFileExtension: jest.fn(),
};
