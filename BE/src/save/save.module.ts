import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaveService } from './save.service';
import { SaveController } from './save.controller';
import { Save } from './entities/save.entity';
import { Post } from 'src/post/entities/post.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Save, Post])],
  controllers: [SaveController],
  providers: [SaveService],
})
export class SaveModule {}