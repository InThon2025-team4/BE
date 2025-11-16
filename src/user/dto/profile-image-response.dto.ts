import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileImageResponseDto {
  @ApiProperty({
    description: '(Required) S3 Presigned URL (클라이언트에서 이 URL로 PUT 요청하여 이미지 업로드)',
    example: 'https://s3.amazonaws.com/bucket/profiles/user-id/profile.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...'
  })
  presignedUrl: string;

  @ApiProperty({
    description: '(Required) 업로드할 파일명',
    example: 'profile-pic.jpg'
  })
  fileName: string;

  @ApiPropertyOptional({
    description: '(Optional) 응답 생성 시간 (ISO 8601)',
    example: '2025-11-16T10:30:00.000Z'
  })
  uploadedAt?: string;

  @ApiProperty({
    description: '(Required) Presigned URL 만료 시간 (초 단위)',
    example: 900
  })
  expiresIn: number;
}
