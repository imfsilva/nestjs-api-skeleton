import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { I18nService } from 'nestjs-i18n';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: NestMailerService,
    private readonly i18n: I18nService,
  ) {}

  async forgotPassword(user: UserEntity, appUrl: string): Promise<void> {
    const subject: string = await this.i18n.translate(
      'mailer.forgot_password_subject',
      { lang: user.settings.language },
    );

    const changePasswordButtonHref = `${appUrl}/recover-password/${user.settings.language}.html?token=${user.recoverPasswordToken}`;

    await this.mailerService.sendMail({
      to: [user.email],
      subject,
      template: `recover-password-${user.settings.language}`,
      context: {
        userFullName: user.fullName,
        changePasswordButtonHref,
      },
    });
  }
}
