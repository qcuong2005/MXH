import { Test, TestingModule } from '@nestjs/testing';
import { FollowsGateway } from './follows.gateway';
import { FollowsService } from './follows.service';

describe('FollowsGateway', () => {
  let gateway: FollowsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FollowsGateway, FollowsService],
    }).compile();

    gateway = module.get<FollowsGateway>(FollowsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
