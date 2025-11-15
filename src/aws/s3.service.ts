import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION');
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  /**
   * 프로필 이미지 업로드를 위한 Presigned URL 생성
   * @param userId 사용자 ID
   * @param fileName 파일명
   * @param contentType 파일 타입 (예: image/jpeg)
   * @param expiresIn URL 만료 시간 (초 단위, 기본값 900 = 15분)
   * @returns Presigned URL
   */
  async generatePresignedUploadUrl(
    userId: string,
    fileName: string,
    contentType: string,
    expiresIn: number = 900,
  ): Promise<string> {
    // S3 객체 경로: profiles/{userId}/{timestamp}-{fileName}
    const timestamp = Date.now();
    const key = `profiles/${userId}/${timestamp}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    return presignedUrl;
  }

  /**
   * 프로필 이미지 다운로드를 위한 Presigned URL 생성
   * @param key S3 객체 키
   * @param expiresIn URL 만료 시간 (초 단위, 기본값 3600 = 1시간)
   * @returns Presigned URL
   */
  async generatePresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    return presignedUrl;
  }

  /**
   * S3 객체 경로를 URL로 변환 (Presigned URL 없이 공개 URL 사용 시)
   * @param key S3 객체 키
   * @returns 공개 URL
   */
  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * S3에서 프로필 이미지 삭제
   * @param key S3 객체 키
   */
  async deleteProfileImage(key: string): Promise<void> {
    if (!key) {
      throw new Error('S3 key is required for deletion');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}
