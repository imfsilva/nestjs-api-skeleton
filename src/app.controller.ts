import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';
import { Public } from './common/decorators';

@Controller()
@ApiTags('Root')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Welcome message',
  })
  welcome(): string {
    return this.appService.getWelcomeMessage();
  }
}
