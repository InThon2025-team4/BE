import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileImageUploadDto {
  @ApiProperty({
    description: '(Required) 업로드할 파일명. 확장자를 포함해야 하며 원본 파일명을 사용하는 것이 좋습니다. 특수문자는 피하는 것을 권장합니다.',
    example: 'profile-pic.jpg',
    type: 'string',
    minLength: 1,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty({ message: '파일명이 필요합니다' })
  fileName: string;

  @ApiProperty({
    description: '(Required) 파일의 MIME 타입. 이미지 파일만 지원되며 지원되는 형식은 JPEG, PNG, GIF, WebP입니다. 이 값은 S3 업로드 시 Content-Type 헤더로 사용됩니다.',
    example: 'image/jpeg',
    enum: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    type: 'string'
  })
  @IsString()
  @IsNotEmpty({ message: '파일 타입이 필요합니다' })
  @Matches(/^image\/(jpeg|png|gif|webp)$/, {
    message: '지원하는 파일 타입: image/jpeg, image/png, image/gif, image/webp',
  })
  contentType: string;
}
