import { SettingsDto } from '../../../src/modules/users/dtos';

export const testSettingsDto = (settings: SettingsDto) => {
  expect(settings.language).toBeTruthy();
};
