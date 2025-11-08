import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsBoolean, IsIn } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  fullName: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'User online status',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_online?: boolean = false;

  @ApiProperty({
    description: 'The user selects their gender.',
    example: 'Boys, girls, or girls.',
    enum: ['Boys', 'girls', 'girls'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['Boys', 'girls', 'girls'])
  gender: String;
}
