import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupCallDto } from './create-group-call.dto';

export class UpdateGroupCallDto extends PartialType(CreateGroupCallDto) {
  id: number;
}
