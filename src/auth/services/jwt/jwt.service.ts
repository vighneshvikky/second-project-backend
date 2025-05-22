import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/auth/interfaces/token-payload.interface';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwt: NestJwtService) {}

  signAccessToken(payload: TokenPayload): string {
    return this.jwt.sign(payload, {
      expiresIn: '15m',
    });
  }

  signRefreshToken(payload: TokenPayload): string {
    return this.jwt.sign(payload, {
      expiresIn: '7d',
    });
  }

  verifyToken(token: string): TokenPayload {
    return this.jwt.verify(token);
  }

  decodeToken(token: string): TokenPayload | null {
    return this.jwt.decode(token) as TokenPayload | null;
  }

  signPasswordResetToken(payload: TokenPayload): string {
    return this.jwt.sign(payload, {
      expiresIn: '1h', 
      secret: process.env.JWT_RESET_SECRET || 'default-reset-secret',
    });
  }

  verifyPasswordResetToken(token: string): TokenPayload {
    return this.jwt.verify(token, {
      secret: process.env.JWT_RESET_SECRET || 'default-reset-secret',
    });
  }

  
}
