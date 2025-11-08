import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { Global } from '@nestjs/common';
import { ConfigModule as ConfigModuleNest } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModuleNest],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
