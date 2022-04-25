import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let appService: AppService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });

  it('should return "Welcome to the [SKELETON] API. Documentation: /docs"', () => {
    expect(appService.getWelcomeMessage()).toBe(
      'Welcome to the [SKELETON] API. Documentation: /docs',
    );
  });
});
