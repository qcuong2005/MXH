import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallController } from './call.controller';
import { CallService } from './call.service';
import { Call } from './entities/call.entity';
import { CallGateway } from './call.gateway'; // Nhập CallGateway

@Module({
  imports: [TypeOrmModule.forFeature([Call])],
  controllers: [CallController],
  providers: [CallService, CallGateway], // Cung cấp CallGateway
})
export class CallModule {}
