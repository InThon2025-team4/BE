import { IsString, IsNotEmpty, IsArray, IsEnum, ArrayNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Position } from '@prisma/client';

export class ApplyProjectDto {
  @ApiProperty({
    enum: Position,
    isArray: true,
    description: 'Positions you want to apply for',
    example: ['BACKEND', 'FRONTEND'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Position, { each: true })
  appliedPosition: Position[];

  @ApiPropertyOptional({
    description: 'Cover letter for the application',
    example: 'I am very interested in this project...',
  })
  @IsString()
  @IsOptional()
  coverLetter?: string;
}
