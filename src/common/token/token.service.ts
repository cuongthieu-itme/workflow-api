import { Injectable } from '@nestjs/common';
import { DecodeAuthTokenDTO } from './dtos';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async decodeAuthToken(dto: DecodeAuthTokenDTO) {
    const secret = this._getSecretKey();
    const token = this.jwtService.sign(dto, { expiresIn: '30d', secret });
    await this._resetSessionsByUserId(dto.userId);
    await this._createSession(dto.userId, token);
    return token;
  }

  verifyToken(token: string): DecodeAuthTokenDTO | null {
    try {
      return this.jwtService.verify(token, { secret: this._getSecretKey() });
    } catch (error) {
      // Handle JWT errors gracefully by returning null
      // This allows the guard to throw appropriate UnauthorizedException
      return null;
    }
  }

  generateVerificationToken() {
    return randomBytes(10).toString('hex');
  }

  generatePasswordResetToken(email: string): string {
    const secret = this._getSecretKey();
    const payload = { email, type: 'password_reset' };
    return this.jwtService.sign(payload, { expiresIn: '5m', secret });
  }

  verifyPasswordResetToken(token: string): { email: string; type: string } {
    const secret = this._getSecretKey();
    return this.jwtService.verify(token, { secret });
  }

  private _createSession(userId: number, token: string) {
    return this.prismaService.userSession.create({ data: { token, userId } });
  }

  private _resetSessionsByUserId(userId: number) {
    return this.prismaService.userSession.deleteMany({ where: { userId } });
  }

  private _getSecretKey() {
    return this.configService.get('TOKEN_SECRET_KEY');
  }
}
