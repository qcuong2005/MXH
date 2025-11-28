import { Test, TestingModule } from '@nestjs/testing';
import { GroupCallService } from './group-call.service';

describe('GroupCallService', () => {
  let service: GroupCallService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupCallService],
    }).compile();

    service = module.get<GroupCallService>(GroupCallService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
