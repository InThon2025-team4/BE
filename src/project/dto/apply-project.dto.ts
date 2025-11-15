import { IsString, IsNotEmpty, IsArray, IsEnum, ArrayNotEmpty, IsOptional } from 'class-validator';
import { Position } from '@prisma/client';

export class ApplyProjectDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Position, { each: true })
  appliedPosition: Position[];

  @IsString()
  @IsOptional()
  coverLetter?: string;
}
