import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileImageResponseDto {
  @ApiProperty({
    description: '(Required) AWS S3 Presigned URL. 클라이언트에서 이 URL로 PUT 요청을 보내 이미지를 업로드합니다. URL에는 서명과 만료 시간이 포함되어 있습니다.',
    example: 'https://my-bucket.s3.amazonaws.com/profiles/550e8400-e29b-41d4-a716-446655440000/profile-pic.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Date=20251116T103000Z&X-Amz-Expires=900&X-Amz-Signature=...',
    type: 'string'
  })
  presignedUrl: string;

  @ApiProperty({
    description: '(Required) 업로드할 파일명. 요청에서 제공받은 파일명과 동일합니다.',
    example: 'profile-pic.jpg',
    type: 'string'
  })
  fileName: string;

  @ApiPropertyOptional({
    description: '(Optional) 이 응답이 생성된 시간 (ISO 8601 형식). 클라이언트에서 Presigned URL의 유효성을 판단할 때 참고할 수 있습니다.',
    example: '2025-11-16T10:30:00.000Z',
    type: 'string'
  })
  uploadedAt?: string;

  @ApiProperty({
    description: '(Required) Presigned URL의 만료 시간 (초 단위). 이 시간이 경과하면 URL은 더 이상 유효하지 않습니다. 기본값은 900초(15분)입니다.',
    example: 900,
    type: 'number'
  })
  expiresIn: number;
}
