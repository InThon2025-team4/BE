import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, Proficiency } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name', example: 'Team4 Project' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Project description', example: 'This is a great project' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: Difficulty, description: 'Project difficulty level', example: 'BEGINNER' })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @ApiPropertyOptional({ description: 'Recruitment start date in ISO 8601 format', example: '2025-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  recruitmentStartDate?: string;

  @ApiPropertyOptional({ description: 'Recruitment end date in ISO 8601 format', example: '2025-02-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  recruitmentEndDate?: string;

  @ApiProperty({ description: 'Project start date in ISO 8601 format', example: '2025-02-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  projectStartDate: string;

  @ApiProperty({ description: 'Project end date in ISO 8601 format', example: '2025-03-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  projectEndDate: string;

  @ApiPropertyOptional({ description: 'GitHub repository URL', example: 'https://github.com/user/repo' })
  @IsString()
  @IsOptional()
  githubRepoUrl?: string;

  @ApiPropertyOptional({ description: 'Limit of Backend positions', example: 2, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  limitBE?: number;

  @ApiPropertyOptional({ description: 'Limit of Frontend positions', example: 2, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  limitFE?: number;

  @ApiPropertyOptional({ description: 'Limit of PM positions', example: 1, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  limitPM?: number;

  @ApiPropertyOptional({ description: 'Limit of Mobile positions', example: 1, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  limitMobile?: number;

  @ApiPropertyOptional({ description: 'Limit of AI positions', example: 1, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  limitAI?: number;

  @ApiPropertyOptional({
    enum: Proficiency,
    description: 'Minimum proficiency level required',
    example: 'BRONZE',
  })
  @IsEnum(Proficiency)
  @IsOptional()
  minProficiency?: Proficiency;

  @ApiPropertyOptional({
    enum: Proficiency,
    description: 'Maximum proficiency level accepted',
    example: 'PLATINUM',
  })
  @IsEnum(Proficiency)
  @IsOptional()
  maxProficiency?: Proficiency;
}
