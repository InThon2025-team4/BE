import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, Position, ApplicationStatus, Proficiency } from '@prisma/client';

/**
 * 프로젝트 응답 DTO
 * 프로젝트 목록 및 상세 조회 시 반환되는 기본 프로젝트 정보
 */
export class ProjectResponseDto {
  @ApiProperty({
    description: '(Required) 프로젝트 고유 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: '(Required) 프로젝트 이름',
    example: 'Team4 Project'
  })
  name: string;

  @ApiProperty({
    description: '(Required) 프로젝트 설명',
    example: 'This is a great project'
  })
  description: string;

  @ApiPropertyOptional({
    enum: Difficulty,
    description: '(Optional) 프로젝트 난이도 (BEGINNER, INTERMEDIATE, ADVANCED, UNKNOWN)',
    example: 'BEGINNER'
  })
  difficulty?: Difficulty;

  @ApiProperty({
    description: '(Required) 프로젝트 모집 가능 여부 (모집 기간 및 프로젝트 시작 전 여부)',
    example: true
  })
  isOpen: boolean;

  @ApiPropertyOptional({
    description: '(Optional) 현재 사용자의 기술 스택/숙련도 기반 프로젝트 오픈 여부',
    example: true
  })
  isOpenForUser?: boolean;

  @ApiPropertyOptional({
    description: '(Optional) 사용자가 프로젝트에 지원할 수 없는 이유',
    example: '필요한 기술 스택이 부족합니다'
  })
  userBlockReason?: string;

  @ApiPropertyOptional({
    description: '(Optional) 모집 시작 일자 (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z'
  })
  recruitmentStartDate?: Date;

  @ApiPropertyOptional({
    description: '(Optional) 모집 종료 일자 (ISO 8601)',
    example: '2025-02-01T00:00:00.000Z'
  })
  recruitmentEndDate?: Date;

  @ApiProperty({
    description: '(Required) 프로젝트 시작 일자 (ISO 8601)',
    example: '2025-02-01T00:00:00.000Z'
  })
  projectStartDate: Date;

  @ApiProperty({
    description: '(Required) 프로젝트 종료 일자 (ISO 8601)',
    example: '2025-03-01T00:00:00.000Z'
  })
  projectEndDate: Date;

  @ApiPropertyOptional({
    description: '(Optional) GitHub 저장소 URL',
    example: 'https://github.com/user/repo'
  })
  githubRepoUrl?: string;

  @ApiProperty({
    description: '(Required) 모집 예정 Backend 포지션 수',
    example: 2,
    minimum: 0
  })
  limitBE: number;

  @ApiProperty({
    description: '(Required) 모집 예정 Frontend 포지션 수',
    example: 2,
    minimum: 0
  })
  limitFE: number;

  @ApiProperty({
    description: '(Required) 모집 예정 PM 포지션 수',
    example: 1,
    minimum: 0
  })
  limitPM: number;

  @ApiProperty({
    description: '(Required) 모집 예정 Mobile 포지션 수',
    example: 1,
    minimum: 0
  })
  limitMobile: number;

  @ApiProperty({
    description: '(Required) 모집 예정 AI 포지션 수',
    example: 1,
    minimum: 0
  })
  limitAI: number;

  @ApiProperty({
    description: '(Required) 현재 참여 중인 Backend 멤버 수',
    example: 1,
    minimum: 0
  })
  currentBE: number;

  @ApiProperty({
    description: '(Required) 현재 참여 중인 Frontend 멤버 수',
    example: 1,
    minimum: 0
  })
  currentFE: number;

  @ApiProperty({
    description: '(Required) 현재 참여 중인 PM 멤버 수',
    example: 0,
    minimum: 0
  })
  currentPM: number;

  @ApiProperty({
    description: '(Required) 현재 참여 중인 Mobile 멤버 수',
    example: 1,
    minimum: 0
  })
  currentMobile: number;

  @ApiProperty({
    description: '(Required) 현재 참여 중인 AI 멤버 수',
    example: 0,
    minimum: 0
  })
  currentAI: number;

  @ApiProperty({
    enum: Proficiency,
    description: '(Required) 최소 요구 숙련도 (BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, UNKNOWN)',
    example: 'BRONZE'
  })
  minProficiency: Proficiency;

  @ApiProperty({
    enum: Proficiency,
    description: '(Required) 최대 수용 숙련도 (BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, UNKNOWN)',
    example: 'PLATINUM'
  })
  maxProficiency: Proficiency;

  @ApiProperty({
    description: '(Required) 프로젝트 소유자(개설자) ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  ownerId: string;

  @ApiPropertyOptional({
    description: '(Optional) 프로젝트 소유자 정보',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: '김준호',
      email: 'user@example.com',
      profileImageUrl: 'https://example.com/profile.jpg'
    }
  })
  owner?: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };

  @ApiPropertyOptional({
    description: '(Optional) 총 멤버 수',
    example: 3,
    minimum: 0
  })
  memberCount?: number;

  @ApiPropertyOptional({
    description: '(Optional) 총 지원자 수',
    example: 5,
    minimum: 0
  })
  applicationCount?: number;

  @ApiProperty({
    description: '(Required) 프로젝트 생성 시간 (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '(Required) 프로젝트 마지막 수정 시간 (ISO 8601)',
    example: '2025-01-15T12:30:00.000Z'
  })
  updatedAt: Date;
}

/**
 * 프로젝트 상세 응답 DTO
 * 프로젝트 상세 조회 시 반환 (멤버 및 지원자 정보 포함)
 */
export class ProjectDetailResponseDto extends ProjectResponseDto {
  @ApiPropertyOptional({
    description: '(Optional) 프로젝트 멤버 목록',
    example: [{
      id: 'member-id',
      userId: 'user-id',
      role: ['BACKEND'],
      joinedAt: '2025-01-01T00:00:00.000Z',
      user: {
        id: 'user-id',
        name: '김준호',
        email: 'user@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        githubId: 'octocat'
      }
    }]
  })
  members?: {
    id: string;
    userId: string;
    role: Position[];
    joinedAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      profileImageUrl?: string;
      githubId: string;
    };
  }[];

  @ApiPropertyOptional({
    description: '(Optional) 프로젝트 지원자 목록',
    example: [{
      userId: 'applicant-id',
      appliedPosition: ['BACKEND'],
      status: 'PENDING',
      coverLetter: 'I am interested in this project',
      createdAt: '2025-01-01T00:00:00.000Z',
      user: {
        id: 'applicant-id',
        name: '박수진',
        email: 'applicant@example.com',
        profileImageUrl: 'https://example.com/profile2.jpg',
        githubId: 'user123'
      }
    }]
  })
  applications?: {
    userId: string;
    appliedPosition: Position[];
    status: ApplicationStatus;
    coverLetter?: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      profileImageUrl?: string;
      githubId: string;
    };
  }[];
}

/**
 * 프로젝트 지원 응답 DTO
 * 지원 생성/조회 시 반환되는 지원 정보
 */
export class ApplicationResponseDto {
  @ApiProperty({
    description: '(Required) 지원자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  userId: string;

  @ApiProperty({
    description: '(Required) 프로젝트 ID',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  projectId: string;

  @ApiProperty({
    enum: Position,
    isArray: true,
    description: '(Required) 지원한 포지션 목록',
    example: ['BACKEND', 'FRONTEND']
  })
  appliedPosition: Position[];

  @ApiProperty({
    enum: ApplicationStatus,
    description: '(Required) 지원 상태 (PENDING, ACCEPTED, REJECTED)',
    example: 'PENDING'
  })
  status: ApplicationStatus;

  @ApiPropertyOptional({
    description: '(Optional) 자기소개 또는 지원서',
    example: '이 프로젝트에 매우 관심이 있습니다'
  })
  coverLetter?: string;

  @ApiProperty({
    description: '(Required) 지원 생성 시간 (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '(Required) 지원 마지막 수정 시간 (ISO 8601)',
    example: '2025-01-15T12:30:00.000Z'
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: ProjectResponseDto,
    description: '(Optional) 연관된 프로젝트 정보'
  })
  project?: ProjectResponseDto;
}

/**
 * 프로젝트 소유자 대시보드 응답 DTO
 * 사용자가 소유한 프로젝트 목록
 */
export class OwnerDashboardResponseDto {
  @ApiProperty({
    type: [ProjectDetailResponseDto],
    description: '(Required) 사용자가 소유한 프로젝트 목록 (멤버 및 지원자 정보 포함)',
    example: []
  })
  ownedProjects: ProjectDetailResponseDto[];
}

/**
 * 프로젝트 멤버 대시보드 응답 DTO
 * 사용자가 멤버로 참여한 프로젝트 및 지원한 프로젝트
 */
export class MemberDashboardResponseDto {
  @ApiProperty({
    type: [ProjectResponseDto],
    description: '(Required) 사용자가 멤버로 참여 중인 프로젝트 목록',
    example: []
  })
  myProjects: ProjectResponseDto[];

  @ApiProperty({
    type: [ApplicationResponseDto],
    description: '(Required) 사용자의 프로젝트 지원 기록',
    example: []
  })
  myApplications: ApplicationResponseDto[];
}

/**
 * 통합 대시보드 응답 DTO
 * 사용자가 소유한 프로젝트, 참여 중인 프로젝트, 지원한 프로젝트 모두 포함
 */
export class DashboardResponseDto {
  @ApiProperty({
    type: [ProjectDetailResponseDto],
    description: '(Required) 사용자가 소유한 프로젝트 목록 (멤버 및 지원자 정보 포함)',
    example: []
  })
  ownedProjects: ProjectDetailResponseDto[];

  @ApiProperty({
    type: [ProjectResponseDto],
    description: '(Required) 사용자가 멤버로 참여 중인 프로젝트 목록',
    example: []
  })
  myProjects: ProjectResponseDto[];

  @ApiProperty({
    type: [ApplicationResponseDto],
    description: '(Required) 사용자의 프로젝트 지원 기록',
    example: []
  })
  myApplications: ApplicationResponseDto[];
}
