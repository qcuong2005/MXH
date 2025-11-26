import { Test, TestingModule } from '@nestjs/testing';
import { GroupMessagesGateway } from './group-messages.gateway';
import { GroupMessagesService } from './group-messages.service';

describe('GroupMessagesGateway', () => {
  let gateway: GroupMessagesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupMessagesGateway, GroupMessagesService],
    }).compile();

    gateway = module.get<GroupMessagesGateway>(GroupMessagesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
