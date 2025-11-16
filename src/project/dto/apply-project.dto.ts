import { IsString, IsNotEmpty, IsArray, IsEnum, ArrayNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Position } from '@prisma/client';

/**
 * 프로젝트 지원 요청 DTO
 * 사용자가 프로젝트에 특정 포지션으로 지원할 때 사용합니다.
 */
export class ApplyProjectDto {
  @ApiProperty({
    enum: Position,
    isArray: true,
    description: '(Required) 지원할 직무 포지션 (여러 개 가능)',
    example: ['BACKEND', 'FRONTEND']
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Position, { each: true })
  appliedPosition: Position[];

  @ApiPropertyOptional({
    description: '(Optional) 지원서 또는 자기소개',
    example: '이 프로젝트에 매우 관심이 있습니다. 저는 ...'
  })
  @IsString()
  @IsOptional()
  coverLetter?: string;
}
