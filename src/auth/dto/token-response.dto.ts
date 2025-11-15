import { ApiProperty } from '@nestjs/swagger';
import { Position, Proficiency, TechStack } from '@prisma/client';

class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firebaseUid: string;

  @ApiProperty()
  authProvider!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  phone?: string | null;

  @ApiProperty({ required: false, nullable: true })
  githubId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  profileImageUrl?: string | null;

  @ApiProperty({ isArray: true, enum: TechStack })
  techStacks!: TechStack[];

  @ApiProperty({ isArray: true, enum: Position })
  positions!: Position[];

  @ApiProperty({ enum: Proficiency })
  proficiency!: Proficiency;

  @ApiProperty({ required: false, nullable: true, description: 'JSON portfolio blob.' })
  portfolio?: unknown;
}

export class AuthTokenResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: () => UserProfileDto })
  user!: UserProfileDto;
}

export class OnboardingRequiredDto {
  @ApiProperty({ description: 'Indicates that the user needs to complete onboarding', example: true })
  requiresOnboarding!: boolean;

  @ApiProperty({ description: 'Firebase UID for the user', example: 'firebase_uid_12345' })
  firebaseUid!: string;

  @ApiProperty({ required: false, nullable: true })
  email?: string | null;

  @ApiProperty({ required: false, nullable: true })
  displayName?: string | null;
}
