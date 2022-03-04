import { ImageDto } from '../../../src/modules/users/dtos';

export const testImageDto = (image: ImageDto) => {
  if (!image) return;

  expect(image.url).toBeTruthy();
};
