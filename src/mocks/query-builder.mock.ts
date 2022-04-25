export const QueryBuilderMock = (returnedValue: any): any =>
  jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValueOnce(returnedValue),
    getMany: jest.fn().mockResolvedValueOnce([returnedValue]),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
  }));
