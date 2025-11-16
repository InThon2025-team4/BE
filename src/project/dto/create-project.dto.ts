import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, Proficiency } from '@prisma/client';

/**
 * 프로젝트 생성 요청 DTO
 * 새로운 프로젝트를 생성할 때 필요한 정보를 제공합니다.
 */
export class CreateProjectDto {
  @ApiProperty({
    description: '(Required) 프로젝트 이름',
    example: 'Team4 Project'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '(Required) 프로젝트 설명 및 개요',
    example: 'This is a great project that will change the world'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    enum: Difficulty,
    description: '(Optional) 프로젝트 난이도 (BEGINNER, INTERMEDIATE, ADVANCED, UNKNOWN)',
    example: 'BEGINNER'
  })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @ApiPropertyOptional({
    description: '(Optional) 모집 시작 일자 (ISO 8601 형식)',
    example: '2025-01-01T00:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  recruitmentStartDate?: string;

  @ApiPropertyOptional({
    description: '(Optional) 모집 종료 일자 (ISO 8601 형식)',
    example: '2025-02-01T00:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  recruitmentEndDate?: string;

  @ApiProperty({
    description: '(Required) 프로젝트 시작 일자 (ISO 8601 형식)',
    example: '2025-02-01T00:00:00Z'
  })
  @IsDateString()
  @IsNotEmpty()
  projectStartDate: string;

  @ApiProperty({
    description: '(Required) 프로젝트 종료 일자 (ISO 8601 형식)',
    example: '2025-03-01T00:00:00Z'
  })
  @IsDateString()
  @IsNotEmpty()
  projectEndDate: string;

  @ApiPropertyOptional({
    description: '(Optional) GitHub 저장소 URL',
    example: 'https://github.com/user/repo'
  })
  @IsString()
  @IsOptional()
  githubRepoUrl?: string;

  @ApiPropertyOptional({
    description: '(Optional) 모집할 Backend 포지션 수 (기본값: 0)',
    example: 2,
    minimum: 0
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  limitBE?: number;

  @ApiPropertyOptional({
    description: '(Optional) 모집할 Frontend 포지션 수 (기본값: 0)',
    example: 2,
    minimum: 0
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  limitFE?: number;

  @ApiPropertyOptional({
    description: '(Optional) 모집할 PM 포지션 수 (기본값: 0)',
    example: 1,
    minimum: 0
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  limitPM?: number;

  @ApiPropertyOptional({
    description: '(Optional) 모집할 Mobile 포지션 수 (기본값: 0)',
    example: 1,
    minimum: 0
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  limitMobile?: number;

  @ApiPropertyOptional({
    description: '(Optional) 모집할 AI 포지션 수 (기본값: 0)',
    example: 1,
    minimum: 0
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  limitAI?: number;

  @ApiPropertyOptional({
    enum: Proficiency,
    description: '(Optional) 최소 요구 숙련도 (BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, UNKNOWN)',
    example: 'BRONZE'
  })
  @IsEnum(Proficiency)
  @IsOptional()
  minProficiency?: Proficiency;

  @ApiPropertyOptional({
    enum: Proficiency,
    description: '(Optional) 최대 수용 숙련도 (BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, UNKNOWN)',
    example: 'PLATINUM'
  })
  @IsEnum(Proficiency)
  @IsOptional()
  maxProficiency?: Proficiency;
}
