import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, Min, IsEnum } from 'class-validator';
import { Difficulty } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsDateString()
  @IsOptional()
  recruitmentStartDate?: string;

  @IsDateString()
  @IsOptional()
  recruitmentEndDate?: string;

  @IsDateString()
  @IsNotEmpty()
  projectStartDate: string;

  @IsDateString()
  @IsNotEmpty()
  projectEndDate: string;

  @IsString()
  @IsOptional()
  githubRepoUrl?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  limitBE?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  limitFE?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  limitPM?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  limitMobile?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  limitAI?: number;
}
