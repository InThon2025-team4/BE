import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class UpdateApplicationDto {
  @ApiProperty({
    enum: ApplicationStatus,
    description: 'Application status to update',
    example: 'ACCEPTED',
  })
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;
}
