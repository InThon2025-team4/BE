import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileImageUploadDto {
  @ApiProperty({
    example: 'profile-pic.jpg',
    description: '업로드할 파일명',
  })
  @IsString()
  @IsNotEmpty({ message: '파일명이 필요합니다' })
  fileName: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME 타입 (image/jpeg, image/png, image/gif, image/webp)',
  })
  @IsString()
  @IsNotEmpty({ message: '파일 타입이 필요합니다' })
  @Matches(/^image\/(jpeg|png|gif|webp)$/, {
    message: '지원하는 파일 타입: image/jpeg, image/png, image/gif, image/webp',
  })
  contentType: string;
}
