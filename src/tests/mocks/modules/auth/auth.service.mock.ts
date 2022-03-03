export const AuthServiceMock = {
  login: jest.fn().mockReturnValue({}),
  register: jest.fn().mockReturnValue({}),
  logout: jest.fn().mockReturnValue({}),
  refreshTokens: jest.fn().mockReturnValue({}),
  updateRtHash: jest.fn().mockReturnValue({}),
  getTokens: jest.fn().mockReturnValue({}),
  forgotPassword: jest.fn().mockReturnValue({}),
  checkRecoverPasswordToken: jest.fn().mockReturnValue({}),
  recoverPassword: jest.fn().mockReturnValue({}),
};
