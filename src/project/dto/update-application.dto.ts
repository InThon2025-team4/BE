import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

/**
 * 지원 상태 업데이트 요청 DTO
 * 프로젝트 소유자가 지원자의 지원 상태를 변경할 때 사용합니다.
 */
export class UpdateApplicationDto {
  @ApiProperty({
    enum: ApplicationStatus,
    description: '(Required) 업데이트할 지원 상태 (PENDING: 검토중, ACCEPTED: 수락, REJECTED: 거절)',
    example: 'ACCEPTED'
  })
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;
}
