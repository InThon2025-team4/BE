import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../aws/s3.service';
import { ProfileImageUploadDto } from './dto/profile-image-upload.dto';
import { ProfileImageResponseDto } from './dto/profile-image-response.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async generateProfileImagePresignedUrl(
    userId: string,
    profileImageUploadDto: ProfileImageUploadDto,
  ): Promise<ProfileImageResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다');
    }

    const { fileName, contentType } = profileImageUploadDto;

    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        '지원하지 않는 파일 형식입니다. 지원 형식: jpg, jpeg, png, gif, webp',
      );
    }

    try {
      const presignedUrl = await this.s3Service.generatePresignedUploadUrl(
        userId,
        fileName,
        contentType,
        900, // 15분
      );

      return {
        presignedUrl,
        fileName,
        uploadedAt: new Date().toISOString(),
        expiresIn: 900,
      };
    } catch (error) {
      throw new BadRequestException('Presigned URL 생성에 실패했습니다');
    }
  }

  async updateProfileImageUrl(userId: string, s3Key: string): Promise<void> {
    const imageUrl = this.s3Service.getPublicUrl(s3Key);

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser?.profileImageUrl) {
      try {
        const oldKey = existingUser.profileImageUrl.split('.amazonaws.com/')[1];
        if (oldKey) {
          await this.s3Service.deleteProfileImage(oldKey);
        }
      } catch (error) {
        console.error('Failed to delete old profile image:', error);
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        profileImageUrl: imageUrl,
      },
    });
  }

  async getProfileImageUrl(userId: string): Promise<{ profileImageUrl: string | null }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { profileImageUrl: true },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다');
    }

    return { profileImageUrl: user.profileImageUrl };
  }
}
