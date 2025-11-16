import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Position, Proficiency, TechStack } from '@prisma/client';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

export class OnboardDto {
  @ApiProperty({
    description: '새로운 사용자 등록 시 Supabase에서 받은 액세스 토큰. 사용자 정보 검증 및 계정 생성에 사용됩니다.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  accessToken!: string;

  @ApiProperty({
    description: 'Supabase에 설정된 인증 제공자 (예: "email", "google", "github" 등)',
    example: 'email'
  })
  @IsString()
  authProvider!: string;

  @ApiPropertyOptional({
    enum: TechStack,
    isArray: true,
    description: '(Optional) 사용자가 보유한 기술 스택 목록. 여러 개 선택 가능',
    example: ['REACT', 'NODEJS', 'TYPESCRIPT']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TechStack, { each: true })
  techStacks?: TechStack[];

  @ApiPropertyOptional({
    enum: Position,
    isArray: true,
    description: '(Optional) 희망 직무 위치 (여러 개 선택 가능: BACKEND, FRONTEND, MOBILE, AI, PM)',
    example: ['BACKEND', 'FRONTEND']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Position, { each: true })
  positions?: Position[];

  @ApiPropertyOptional({
    enum: Proficiency,
    description: '(Optional) 기술 숙련도 수준 (기본값: UNKNOWN)',
    example: 'SILVER',
    default: 'UNKNOWN'
  })
  @IsOptional()
  @IsEnum(Proficiency)
  proficiency?: Proficiency = Proficiency.UNKNOWN;

  @ApiProperty({
    description: '프로필에 표시될 사용자 이름 (최대 100자)',
    example: '김준호',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Supabase 계정의 이메일 주소. 반드시 일치해야 함',
    example: 'user@example.com'
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: '연락처용 휴대폰 번호 (형식: 010-XXXX-XXXX)',
    example: '010-1234-5678',
    pattern: '^010-\\d{4}-\\d{4}$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^010-\d{4}-\d{4}$/, {
    message: 'Phone number must be in format: 010-XXXX-XXXX',
  })
  phone!: string;

  @ApiProperty({
    description: 'GitHub 사용자명 또는 고유 식별자',
    example: 'octocat'
  })
  @IsString()
  @IsNotEmpty()
  githubId!: string;

  @ApiPropertyOptional({
    description: '(Optional) 프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    type: 'string',
    format: 'uri'
  })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiPropertyOptional({
    description: '(Optional) 포트폴리오 정보 (JSON 형식)',
    example: { projects: ['Project 1', 'Project 2'], github: 'https://github.com/user' },
    type: 'object'
  })
  @IsOptional()
  portfolio?: object;
}
