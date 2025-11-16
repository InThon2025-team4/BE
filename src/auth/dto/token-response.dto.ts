import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Position, Proficiency, TechStack } from '@prisma/client';

export class UserProfileDto {
  @ApiProperty({
    description: '사용자 고유 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Supabase 사용자 UID',
    example: 'supabase_uid_12345'
  })
  supabaseUid: string;

  @ApiProperty({
    description: '인증 제공자 (예: "email", "google")',
    example: 'email'
  })
  authProvider!: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com'
  })
  email!: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '김준호'
  })
  name!: string;

  @ApiPropertyOptional({
    description: '(Optional) 암호화된 전화번호 (AES-256-CBC)',
    example: '010-1234-5678 (복호화 후)',
    nullable: true
  })
  phone?: string | null;

  @ApiPropertyOptional({
    description: '(Optional) GitHub 사용자명',
    example: 'octocat',
    nullable: true
  })
  githubId?: string | null;

  @ApiPropertyOptional({
    description: '(Optional) 프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    nullable: true
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({
    description: '(Optional) 기술 스택 목록',
    isArray: true,
    enum: TechStack,
    example: ['REACT', 'NODEJS']
  })
  techStacks!: TechStack[];

  @ApiPropertyOptional({
    description: '(Optional) 직무 포지션 목록',
    isArray: true,
    enum: Position,
    example: ['BACKEND', 'FRONTEND']
  })
  positions!: Position[];

  @ApiProperty({
    enum: Proficiency,
    description: '기술 숙련도 (BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, UNKNOWN)',
    example: 'SILVER'
  })
  proficiency!: Proficiency;

  @ApiPropertyOptional({
    description: '(Optional) 포트폴리오 정보 (JSON 형식)',
    example: { projects: ['Project 1'], github: 'https://github.com/user' },
    nullable: true,
    type: 'object'
  })
  portfolio?: unknown;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'NestJS에서 생성한 JWT access token (HS256, 24시간 유효)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken!: string;

  @ApiProperty({
    type: () => UserProfileDto,
    description: '로그인한 사용자 프로필 정보'
  })
  user!: UserProfileDto;
}

/**
 * Onboarding 완료 응답 DTO
 * 새로운 사용자의 Onboarding 완료 후 JWT 토큰과 사용자 정보를 반환합니다.
 */
export class OnboardingResponseDto {
  @ApiProperty({
    description: 'NestJS에서 생성한 JWT access token (HS256, 24시간 유효)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken!: string;

  @ApiProperty({
    type: () => UserProfileDto,
    description: '새로 생성된 사용자 프로필 정보'
  })
  user!: UserProfileDto;
}

/**
 * Onboarding 요구 응답 DTO
 * 새로운 Supabase 사용자이고 추가 정보 입력이 필요한 경우 반환됩니다.
 */
export class OnboardingRequiredDto {
  @ApiProperty({
    description: '신규 사용자이므로 Onboarding이 필요함을 나타내는 플래그',
    example: true
  })
  requiresOnboarding!: boolean;

  @ApiProperty({
    description: 'Supabase 사용자 UID',
    example: 'supabase_uid_12345'
  })
  supabaseUid!: string;

  @ApiPropertyOptional({
    description: '(Optional) Supabase 계정의 이메일',
    example: 'user@example.com',
    nullable: true
  })
  email?: string | null;

  @ApiPropertyOptional({
    description: '(Optional) Supabase에 등록된 표시 이름',
    example: 'John Doe',
    nullable: true
  })
  displayName?: string | null;

  @ApiProperty({
    description: 'POST /auth/onboard 엔드포인트에서 사용할 Supabase access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  supabaseAccessToken!: string;
}
