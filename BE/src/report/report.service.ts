import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { Report, ReportStatus } from './entities/report.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  /**
   * 1. Tạo báo cáo mới (User)
   * Lưu mảng lý do (checkboxes) và mô tả thêm.
   */
  async create(createReportDto: CreateReportDto, reporterId: number): Promise<Report> {
    // Lưu ý: Tại đây bạn có thể inject PostService để kiểm tra xem postId có tồn tại không
    // Ví dụ: const post = await this.postService.findOne(createReportDto.postId);
    // if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const newReport = this.reportRepository.create({
      postId: createReportDto.postId,
      reasons: createReportDto.reasons,        // Mảng các lý do (Enum)
      description: createReportDto.description, // Mô tả chi tiết (nếu có)
      reporterId: reporterId,                   // ID người báo cáo (lấy từ token)
      status: ReportStatus.PENDING,             // Mặc định là chờ xử lý
    });

    return await this.reportRepository.save(newReport);
  }

  /**
   * 2. Lấy danh sách tất cả báo cáo (Admin Dashboard)
   * Sắp xếp theo thời gian tạo mới nhất -> cũ nhất
   */
  async findAll(): Promise<Report[]> {
    return await this.reportRepository.find({
      order: {
        createdAt: 'DESC',
      },
      // Nếu bạn đã thiết lập quan hệ (Relations) trong Entity, hãy bỏ comment dòng dưới
      // relations: ['reporter', 'post'], 
    });
  }

  /**
   * 3. Lấy chi tiết một báo cáo theo ID
   */
  async findOne(id: number): Promise<Report> {
    const report = await this.reportRepository.findOneBy({ id });
    if (!report) {
      throw new NotFoundException(`Không tìm thấy báo cáo với ID: ${id}`);
    }
    return report;
  }

  /**
   * 4. Cập nhật trạng thái báo cáo (Admin duyệt/từ chối)
   * Ví dụ: Chuyển từ PENDING -> RESOLVED (Đã xử lý) hoặc REJECTED (Báo cáo sai)
   */
  async updateStatus(id: number, status: ReportStatus): Promise<Report> {
    const report = await this.findOne(id); // Tái sử dụng hàm findOne để check tồn tại

    report.status = status;
    return await this.reportRepository.save(report);
  }

  /**
   * 5. Xóa báo cáo (Tùy chọn - Dọn dẹp dữ liệu rác)
   */
  async remove(id: number): Promise<void> {
    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
  }
}