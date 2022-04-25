import { SettingsDto } from '../../dtos';

export const testSettingsDto = (settings: SettingsDto) => {
  expect(settings.language).toBeTruthy();
};
