// import { Test, TestingModule } from '@nestjs/testing';
// import faker from '@faker-js/faker';
//
// import { AuthService } from '../../auth.service';
// import { AppModule } from '../../../../app.module';
// import { RegisterDto, RegisteredDto, LoggedInDto } from '../../dtos';
//
// const registerDto: RegisterDto = {
//   firstName: faker.name.firstName(),
//   lastName: faker.name.lastName(),
//   email: faker.internet.email(),
//   password: faker.internet.password(5),
// };
//
// describe('Auth Flow', () => {
//   let authService: AuthService;
//   let moduleRef: TestingModule;
//
//   beforeAll(async () => {
//     moduleRef = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//
//     authService = moduleRef.get(AuthService);
//   });
//
//   afterAll(async () => {
//     await moduleRef.close();
//   });
//
//   describe('register', () => {
//     it('should register', async () => {
//       const data = await authService.register(registerDto);
//
//       expect(data.accessToken).toBeTruthy();
//       expect(data.refreshToken).toBeTruthy();
//       expect(data.user).toBeTruthy();
//     });
//
//     it('should throw on duplicate user register', async () => {
//       let register: RegisteredDto | undefined;
//       try {
//         register = await authService.register(registerDto);
//       } catch (error) {
//         expect(error.status).toBe(403);
//       }
//
//       expect(register).toBeUndefined();
//     });
//   });
//
//   describe('login', () => {
//     it('should throw if no existing user', async () => {
//       let login: LoggedInDto | undefined;
//       try {
//         login = await authService.login({
//           email: faker.internet.email(),
//           password: registerDto.password,
//         });
//       } catch (error) {
//         expect(error.status).toBe(403);
//       }
//
//       expect(login).toBeUndefined();
//     });
//
//     it('should login', async () => {
//       const login = await authService.login({
//         email: registerDto.email,
//         password: registerDto.password,
//       });
//
//       expect(login.accessToken).toBeTruthy();
//       expect(login.refreshToken).toBeTruthy();
//       expect(login.user).toBeTruthy();
//     });
//
//     it('should throw if password incorrect', async () => {
//       let login: LoggedInDto | undefined;
//       try {
//         login = await authService.login({
//           email: registerDto.email,
//           password: registerDto.password + 'a',
//         });
//       } catch (error) {
//         expect(error.status).toBe(403);
//       }
//
//       expect(login).toBeUndefined();
//     });
//   });
//
//   // describe('logout', () => {
//   //   it('should pass if call to non existent user', async () => {
//   //     const result = await authService.logout(
//   //       '13814015-1dd2-11b2-9be7-9c6db07a469f',
//   //     );
//   //
//   //     expect(result).toBeDefined();
//   //   });
//   //
//   //   it('should logout', async () => {
//   //     await authService.logout(userFromDb!.id);
//   //
//   //     userFromDb = await prisma.user.findFirst({
//   //       where: {
//   //         email: user.email,
//   //       },
//   //     });
//   //
//   //     expect(userFromDb?.hashedRt).toBeFalsy();
//   //   });
//   // });
//   //
//   // describe('refresh', () => {
//   //   beforeAll(async () => {
//   //     await prisma.cleanDatabase();
//   //   });
//   //
//   //   it('should throw if no existing user', async () => {
//   //     let tokens: Tokens | undefined;
//   //     try {
//   //       tokens = await authService.refreshTokens(1, '');
//   //     } catch (error) {
//   //       expect(error.status).toBe(403);
//   //     }
//   //
//   //     expect(tokens).toBeUndefined();
//   //   });
//   //
//   //   it('should throw if user logged out', async () => {
//   //     // signup and save refresh token
//   //     const _tokens = await authService.register({
//   //       email: user.email,
//   //       password: user.password,
//   //     });
//   //
//   //     const rt = _tokens.refresh_token;
//   //
//   //     // get user id from refresh token
//   //     // also possible to get using prisma like above
//   //     // but since we have the rt already, why not just decoding it
//   //     const decoded = decode(rt);
//   //     const userId = Number(decoded?.sub);
//   //
//   //     // logout the user so the hashedRt is set to null
//   //     await authService.logout(userId);
//   //
//   //     let tokens: Tokens | undefined;
//   //     try {
//   //       tokens = await authService.refreshTokens(userId, rt);
//   //     } catch (error) {
//   //       expect(error.status).toBe(403);
//   //     }
//   //
//   //     expect(tokens).toBeUndefined();
//   //   });
//   //
//   //   it('should throw if refresh token incorrect', async () => {
//   //     await prisma.cleanDatabase();
//   //
//   //     const _tokens = await authService.register({
//   //       email: user.email,
//   //       password: user.password,
//   //     });
//   //     console.log({
//   //       _tokens,
//   //     });
//   //
//   //     const rt = _tokens.refresh_token;
//   //
//   //     const decoded = decode(rt);
//   //     const userId = Number(decoded?.sub);
//   //
//   //     let tokens: Tokens | undefined;
//   //     try {
//   //       tokens = await authService.refreshTokens(userId, rt + 'a');
//   //     } catch (error) {
//   //       expect(error.status).toBe(403);
//   //     }
//   //
//   //     expect(tokens).toBeUndefined();
//   //   });
//   //
//   //   it('should refresh tokens', async () => {
//   //     // log in the user again and save rt + at
//   //     const _tokens = await authService.register({
//   //       email: user.email,
//   //       password: user.password,
//   //     });
//   //
//   //     const rt = _tokens.refresh_token;
//   //     const at = _tokens.access_token;
//   //
//   //     const decoded = decode(rt);
//   //     const userId = Number(decoded?.sub);
//   //
//   //     // since jwt uses seconds signature we need to wait for 1 second to have new jwts
//   //     await new Promise((resolve, reject) => {
//   //       setTimeout(() => {
//   //         resolve(true);
//   //       }, 1000);
//   //     });
//   //
//   //     const tokens = await authService.refreshTokens(userId, rt);
//   //     expect(tokens).toBeDefined();
//   //
//   //     // refreshed tokens should be different
//   //     expect(tokens.accessToken).not.toBe(at);
//   //     expect(tokens.refreshToken).not.toBe(rt);
//   //   });
//   // });
// });
