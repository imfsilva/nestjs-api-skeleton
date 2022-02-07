import { v4 as uuid } from 'uuid';

export class GeneratorProvider {
  static uuid(): string {
    return uuid();
  }
}
