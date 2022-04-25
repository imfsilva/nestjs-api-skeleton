import { Test } from '@nestjs/testing';
import { InstanceToken } from '@nestjs/core/injector/module';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer/dist/mailer.service';
import { I18nService } from 'nestjs-i18n';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

import { MailerService } from '../services/mailer.service';
import { UserEntity } from '../../users/entities/user.entity';
import { Languages } from '../../../common/constants';

const moduleMocker = new ModuleMocker(global);

describe('MailerService', () => {
  let service: MailerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MailerService],
    })
      .useMocker((token: InstanceToken | undefined) => {
        if (token === I18nService) {
          return { translate: jest.fn().mockReturnValue('i18nMessage') };
        }

        if (token === NestMailerService) {
          return { sendMail: jest.fn() };
        }

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = moduleRef.get(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('forgotPassword', () => {
    it('should send forgot password email', async () => {
      const user = new UserEntity();
      user.settings = { language: Languages.en, user, id: 'settingsId', userId: 'userId' };
      await expect(service.forgotPassword(user, 'appUrl')).resolves.not.toThrow();
    });
  });
});
