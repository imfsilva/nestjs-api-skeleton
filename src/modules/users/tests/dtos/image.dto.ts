import { ImageDto } from '../../dtos';

export const testImageDto = (image: ImageDto) => {
  if (!image) return;

  expect(image.url).toBeTruthy();
};
