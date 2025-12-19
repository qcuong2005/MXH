// src/report/entities/report.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// 1. Định nghĩa 6 lý do báo cáo (Enum) để code sạch và dễ quản lý
export enum ReportReason {
  VIOLENCE = 'VIOLENCE',           // Bạo lực
  SEXUAL = 'SEXUAL',               // Nội dung 18+
  SPAM = 'SPAM',                   // Spam/Quảng cáo
  HATE_SPEECH = 'HATE_SPEECH',     // Ngôn từ thù ghét
  HARASSMENT = 'HARASSMENT',       // Quấy rối
  FALSE_INFO = 'FALSE_INFO',       // Tin giả/Lừa đảo
}

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reporterId: number;

  @Column()
  postId: number;

  // 2. Thay đổi: Lưu mảng các lý do (Checkbox)
  @Column({
    type: 'simple-array', // TypeORM tự động chuyển mảng <-> chuỗi
    nullable: false, 
  })
  reasons: ReportReason[]; 

  // 3. Thêm cột mô tả chi tiết (Optional - Textbox nhập thêm)
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @CreateDateColumn()
  createdAt: Date;
}