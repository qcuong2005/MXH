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
  const callData = {
   ...createCallDto,
   status: 'ongoing', 
   started_at: new Date(), 
   ended_at: null, // <--- BẠN GÁN LÀ NULL
  };
  const call = this.callRepository.create(callData);
  return this.callRepository.save(call); // <-- LỖI SẼ XẢY RA Ở ĐÂY
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


// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Call } from './entities/call.entity';
// import { CreateCallDto } from './dto/create-call.dto';
// import { UpdateCallDto } from './dto/update-call.dto';

// // --- IMPORT MODULE THÔNG BÁO ---
// import { NotificationsService } from 'src/notifications/notifications.service';
// import { NotificationType } from 'src/notifications/entities/notification.entity';
// // -------------------------------

// @Injectable()
// export class CallService {
//   constructor(
//     @InjectRepository(Call)
//     private callRepository: Repository<Call>,

//     // Inject Service thông báo
//     private readonly notificationsService: NotificationsService,
//   ) {}

//   async create(createCallDto: CreateCallDto): Promise<Call> {
//     const callData = {
//       ...createCallDto,
//       status: 'ongoing',
//       started_at: new Date(),
//       // Fix lỗi TypeScript: Ép kiểu null thành Date để tránh lỗi type checker
//       ended_at: null as unknown as Date, 
//     };

//     const call = this.callRepository.create(callData);
//     const savedCall = await this.callRepository.save(call);

//     // --- GỬI THÔNG BÁO CUỘC GỌI ĐẾN ---
//     // Giả định trong DTO của bạn có field 'receiver_id' (người nghe) và 'sender_id' (người gọi)
//     // Nếu tên field khác (ví dụ: calleeId, callerId), hãy sửa lại cho khớp
//     const receiverId = (createCallDto as any).receiver_id || (createCallDto as any).calleeId;
//     const senderId = (createCallDto as any).sender_id || (createCallDto as any).callerId;

//     if (receiverId) {
//       await this.notificationsService.create({
//         user_id: receiverId,            // Người nhận thông báo (người bị gọi)
//         sender_id: senderId,            // Người gọi
//         type: NotificationType.INCOMING_CALL,
//         content: 'đang gọi cho bạn...',
//         resource_id: savedCall.id,      // ID cuộc gọi
//         resource_url: `/calls/${savedCall.id}`, // Link để bắt máy
//       });
//     }
//     // -----------------------------------

//     return savedCall;
//   }

//   async update(id: number, updateCallDto: UpdateCallDto): Promise<Call> {
//     await this.callRepository.update(id, updateCallDto);
//     return this.callRepository.findOne({ where: { id } });
//   }

//   async findAll(): Promise<Call[]> {
//     return this.callRepository.find();
//   }

//   async findOne(id: number): Promise<Call> {
//     return this.callRepository.findOne({ where: { id } });
//   }
// }