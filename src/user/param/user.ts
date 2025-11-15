import { ApiProperty } from "@nestjs/swagger";
import { Position, Proficiency, TechStack } from "@prisma/client";

export class UserParam {
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