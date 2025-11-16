import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ProfileImageUploadDto } from './dto/profile-image-upload.dto';
import { ProfileImageResponseDto } from './dto/profile-image-response.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { User } from './decorators/user.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post(':id/profile-image/upload-url')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '프로필 이미지 Presigned URL 생성',
    description:
      '클라이언트가 S3에 직접 업로드하기 위한 Presigned URL을 생성합니다. ' +
      '반환된 URL로 PUT 요청을 보내 이미지를 업로드하세요.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID (자신의 ID와 일치해야 함)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    type: ProfileImageUploadDto,
    description: '업로드할 파일 정보 (fileName과 contentType 필수)'
  })
  @ApiResponse({
    status: 200,
    type: ProfileImageResponseDto,
    description: 'S3 Presigned URL과 파일 정보 반환'
  })
  async generateProfileImagePresignedUrl(
    @Param('id') userId: string,
    @Body() profileImageUploadDto: ProfileImageUploadDto,
    @User() user: { id: string },
  ): Promise<ProfileImageResponseDto> {
    // 사용자 인증 확인
    if (!user || !user.id) {
      throw new BadRequestException('사용자 인증이 필요합니다');
    }

    // 자신의 프로필만 업로드 가능
    if (userId !== user.id) {
      throw new BadRequestException('자신의 프로필만 수정할 수 있습니다');
    }

    return this.userService.generateProfileImagePresignedUrl(
      userId,
      profileImageUploadDto,
    );
  }

  @Post(':id/profile-image/confirm')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '프로필 이미지 업로드 완료',
    description:
      'S3에 이미지 업로드가 완료되었음을 서버에 알리고 데이터베이스를 업데이트합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID (자신의 ID와 일치해야 함)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        s3Key: {
          type: 'string',
          description: '(Required) S3에 업로드된 파일의 키 (profiles/ 로 시작)',
          example: 'profiles/user-id/profile-pic.jpg'
        }
      },
      required: ['s3Key']
    },
    description: 'S3 파일 키 정보'
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '프로필 이미지가 성공적으로 업데이트되었습니다'
        }
      }
    },
    description: '프로필 이미지 업데이트 성공 메시지'
  })
  async confirmProfileImageUpload(
    @Param('id') userId: string,
    @Body() body: { s3Key: string },
    @User() user: { id: string },
  ): Promise<{ message: string }> {
    // 사용자 인증 확인
    if (!user || !user.id) {
      throw new BadRequestException('사용자 인증이 필요합니다');
    }

    // 자신의 프로필만 수정 가능
    if (userId !== user.id) {
      throw new BadRequestException('자신의 프로필만 수정할 수 있습니다');
    }

    if (!body.s3Key || typeof body.s3Key !== 'string' || body.s3Key.trim() === '') {
      throw new BadRequestException('유효한 S3 키가 필요합니다');
    }

    // S3 키 형식 검증
    if (!body.s3Key.startsWith('profiles/')) {
      throw new BadRequestException('S3 키는 profiles/ 로 시작해야 합니다');
    }

    await this.userService.updateProfileImageUrl(userId, body.s3Key);

    return { message: '프로필 이미지가 성공적으로 업데이트되었습니다' };
  }

  @Get(':id/profile-image')
  @ApiOperation({
    summary: '프로필 이미지 조회',
    description: '사용자의 프로필 이미지 URL을 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        profileImageUrl: {
          type: 'string',
          nullable: true,
          description: '(Optional) 프로필 이미지 URL (없으면 null)',
          example: 'https://example.com/profile.jpg'
        }
      }
    },
    description: '사용자의 프로필 이미지 URL'
  })
  async getProfileImage(
    @Param('id') userId: string,
  ): Promise<{ profileImageUrl: string | null }> {
    return this.userService.getProfileImageUrl(userId);
  }
}
