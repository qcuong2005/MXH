import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  // =======================
  // CREATE
  // =======================
  async create(createCommentDto: CreateCommentDto, userId: number): Promise<CommentEntity> {
    const { post_id, content, parent_Id } = createCommentDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const post = await this.postRepository.findOne({ where: { id: post_id } });
    if (!post) throw new NotFoundException('Post not found');

    if (!content?.trim()) {
      throw new BadRequestException('Comment content cannot be empty');
    }

    let parentComment: CommentEntity = null;
    if (parent_Id) {
      parentComment = await this.commentRepository.findOne({ where: { id: parent_Id } });
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    // ✅ ép kiểu cho TypeScript hiểu đúng
    const comment = this.commentRepository.create({
      user: user as any,
      post: post as any,
      content,
      parent: parentComment ? (parentComment as any) : null,
    } as DeepPartial<CommentEntity>);

    return await this.commentRepository.save(comment);
  }

  // =======================
  // FIND ALL
  // =======================
  async findAll(): Promise<CommentEntity[]> {
    return await this.commentRepository.find({
      relations: ['user', 'post', 'children', 'children.user'],
      order: { createdAt: 'DESC' },
    });
  }

  // =======================
  // FIND ONE
  // =======================
  async findOne(id: number): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });
    if (!comment) throw new NotFoundException(`Comment with ID ${id} not found`);
    return comment;
  }

  // =======================
  // UPDATE
  // =======================
  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    Object.assign(comment, updateCommentDto);
    return await this.commentRepository.save(comment);
  }

  // =======================
  // REMOVE
  // =======================
  async remove(id: number): Promise<{ message: string }> {
    const result = await this.commentRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Comment with ID ${id} not found`);

    return { message: `Comment #${id} deleted successfully` };
  }

  // =======================
  // FIND BY POST ID
  // =======================
  async findByPost(postId: number): Promise<CommentEntity[]> {
    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['user', 'post', 'parent', 'children', 'children.user'],
      order: { createdAt: 'ASC' },
    });

    const map = new Map<number, CommentEntity>();
    const roots: CommentEntity[] = [];

    for (const c of comments) {
      c.children = [];
      map.set(c.id, c);
    }

    for (const c of comments) {
      if (c.parent && c.parent.id) {
        const parent = map.get(c.parent.id);
        if (parent) parent.children.push(c);
      } else {
        roots.push(c);
      }
    }

    return roots;
  }
}
