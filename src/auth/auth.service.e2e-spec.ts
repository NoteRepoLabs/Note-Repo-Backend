import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { postgresClient, prismaService } from '../../test/setupTests.e2e';
import { JwtService } from '../jwt/jwt.service';
import { CookieService } from '../cookie/cookie.service';
import { EmailService } from '../email/email.service';

describe('authService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        JwtService,
        CookieService,
        EmailService,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should create a user', async () => {
    // Start a transaction
    await postgresClient.query('BEGIN');

    try {
      const newUser = await service.signUp({
        email: 'anuolu1645@gmail.com',
        password: '12345678',
      });

      // Commit the transaction
      await postgresClient.query('COMMIT');

      // Query the database for the newly created user
      const result = await postgresClient.query(
        'SELECT * FROM "public"."User"',
      );

      expect(result.rows[0].email).toEqual(newUser.email);
      expect(result.rows[0].role).toEqual(newUser.role);
      expect(result.rows[0].isVerified).toEqual(newUser.isVerified);
      expect(result.rows[0].username).toBeNull();
      expect(result.rows[0].verificationId).toBeDefined();
    } catch (error) {
      // Rollback the transaction in case of an error
      await postgresClient.query('ROLLBACK');
      throw error;
    }
  });
});