import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMessage } from './entities/group-message.entity';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { UpdateGroupMessageDto } from './dto/update-group-message.dto';
import { User } from '../user/entities/user.entity'; // Path điều chỉnh nếu cần

@Injectable()
export class GroupMessagesService {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly repository: Repository<GroupMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createGroupMessageDto: CreateGroupMessageDto): Promise<GroupMessage> {
    const message = this.repository.create(createGroupMessageDto);
    return await this.repository.save(message);
  }

  async findAll(groupId: number): Promise<GroupMessage[]> {
    return await this.repository.find({
      where: { group_id: groupId },
      relations: ['sender'], // Load sender info
      order: { created_at: 'ASC' },
    });
  }

  async findOne(groupId: number, id: number): Promise<GroupMessage> {
    const message = await this.repository.findOne({
      where: { group_id: groupId, id },
      relations: ['sender'],
    });
    if (!message) {
      throw new NotFoundException(`Message #${id} in group ${groupId} not found`);
    }
    return message;
  }

  async update(groupId: number, id: number, updateGroupMessageDto: UpdateGroupMessageDto): Promise<GroupMessage> {
    await this.repository.update({ group_id: groupId, id }, updateGroupMessageDto);
    return this.findOne(groupId, id);
  }

  async remove(groupId: number, id: number): Promise<void> {
    const result = await this.repository.delete({ group_id: groupId, id });
    if (result.affected === 0) {
      throw new NotFoundException(`Message #${id} in group ${groupId} not found`);
    }
  }
}