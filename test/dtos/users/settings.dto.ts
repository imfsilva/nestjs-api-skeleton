import { SettingsDto } from '../../../dist/modules/users/dtos';

export const testSettingsDto = (settings: SettingsDto) => {
  expect(settings.language).toBeTruthy();
};
