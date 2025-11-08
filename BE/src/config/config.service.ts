// src/config/config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService) {}

  get port(): number {
    return Number(this.config.get('PORT')) || 5000;
  }

  get jwtSecret(): string {
    return this.config.get<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.config.get<string>('JWT_EXPIRES_IN') || '24h';
  }

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV') || 'development';
  }
}
