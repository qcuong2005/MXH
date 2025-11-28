import { Test, TestingModule } from '@nestjs/testing';
import { GroupCallGateway } from './group-call.gateway';
import { GroupCallService } from './group-call.service';

describe('GroupCallGateway', () => {
  let gateway: GroupCallGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupCallGateway, GroupCallService],
    }).compile();

    gateway = module.get<GroupCallGateway>(GroupCallGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
