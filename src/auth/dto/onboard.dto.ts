import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Position, Proficiency, TechStack } from '@prisma/client';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

export class OnboardDto {
  @ApiProperty({ description: 'Firebase ID token received after client-side authentication.' })
  @IsString()
  idToken!: string;

  @ApiProperty({ description: 'Authentication provider stored alongside the Firebase user.' })
  @IsString()
  authProvider!: string;

  @ApiPropertyOptional({ enum: TechStack, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TechStack, { each: true })
  techStacks?: TechStack[];

  @ApiPropertyOptional({ enum: Position, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Position, { each: true })
  positions?: Position[];

  @ApiPropertyOptional({ enum: Proficiency, default: Proficiency.UNKNOWN })
  @IsOptional()
  @IsEnum(Proficiency)
  proficiency?: Proficiency;

  @ApiProperty({ description: 'Display name that will be persisted on the user profile.' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Email address that must match the Firebase user.' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Phone number required for direct contact.', example: '010-1234-5678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^010-\d{4}-\d{4}$/, {
    message: 'Phone number must be in format: 010-XXXX-XXXX',
  })
  phone!: string;

  @ApiProperty({ description: 'GitHub username or unique identifier stored for the user.' })
  @IsString()
  @IsNotEmpty()
  githubId!: string;

  @ApiPropertyOptional({ description: 'Profile image URL.' })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiPropertyOptional({ description: 'Optional portfolio metadata stored as JSON.' })
  @IsOptional()
  portfolio?: object;
}
