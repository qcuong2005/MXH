import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call } from './entities/call.entity';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';

@Injectable()
export class CallService {
  constructor(
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
  ) {}

  async create(createCallDto: CreateCallDto): Promise<Call> {
    const call = this.callRepository.create(createCallDto);
    return this.callRepository.save(call);
  }

  async update(id: number, updateCallDto: UpdateCallDto): Promise<Call> {
    await this.callRepository.update(id, updateCallDto);
    return this.callRepository.findOne({where: {id}});
  }

  async findAll(): Promise<Call[]> {
    return this.callRepository.find();
  }

  async findOne(id: number): Promise<Call> {
    return this.callRepository.findOne({where: {id}});
  }
}
