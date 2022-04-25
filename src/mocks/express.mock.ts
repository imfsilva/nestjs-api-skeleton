export const ExpressMock: any = {
  get(name: 'set-cookie'): string[] | undefined {
    return [''];
  },
};
