import { ApiProperty } from '@nestjs/swagger';

export class ProfileImageResponseDto {
  @ApiProperty({
    description: 'S3 presigned URL (클라이언트에서 이 URL로 PUT 요청)',
  })
  presignedUrl: string;

  @ApiProperty({
    example: 'profile-pic.jpg',
    description: '업로드할 파일명',
  })
  fileName: string;

  @ApiProperty({
    example: '2025-11-16T10:30:00.000Z',
    description: '응답 생성 시간',
    required: false,
  })
  uploadedAt?: string;

  @ApiProperty({
    example: 900,
    description: 'Presigned URL 만료 시간 (초 단위)',
  })
  expiresIn: number;
}
