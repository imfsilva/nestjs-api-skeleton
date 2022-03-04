import { UserSettingsEntity } from '../../../../modules/users/entities/user-settings.entity';

export const CreateSettingHandlerMock = {
  execute: jest.fn().mockReturnValue(new UserSettingsEntity()),
};
