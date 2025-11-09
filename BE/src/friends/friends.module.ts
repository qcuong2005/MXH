import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { Friend } from './entities/friend.entity';
import { User } from 'src/user/entities/user.entity';
import { FriendsGateway } from './friends.gateway'; // <-- 1. IMPORT GATEWAY

@Module({
 imports: [
  TypeOrmModule.forFeature([Friend, User])
 ],
 providers: [
    FriendsService, 
    FriendsGateway // <-- 2. THÊM GATEWAY VÀO PROVIDERS
  ],
 controllers: [FriendsController],
})
export class FriendsModule {}