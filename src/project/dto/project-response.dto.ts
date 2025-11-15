import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, Position, ApplicationStatus, Proficiency } from '@prisma/client';

export class ProjectResponseDto {
  @ApiProperty({ description: 'Project ID' })
  id: string;

  @ApiProperty({ description: 'Project name' })
  name: string;

  @ApiProperty({ description: 'Project description' })
  description: string;

  @ApiPropertyOptional({ enum: Difficulty, description: 'Project difficulty level' })
  difficulty?: Difficulty;

  @ApiProperty({ description: 'Project is open for applications (based on time constraints)' })
  isOpen: boolean;

  @ApiPropertyOptional({ description: 'Is this project open for the current user (based on tech stack matching)' })
  isOpenForUser?: boolean;

  @ApiPropertyOptional({ description: 'Reason why project is not open for user' })
  userBlockReason?: string;

  @ApiPropertyOptional({ description: 'Recruitment start date' })
  recruitmentStartDate?: Date;

  @ApiPropertyOptional({ description: 'Recruitment end date' })
  recruitmentEndDate?: Date;

  @ApiProperty({ description: 'Project start date' })
  projectStartDate: Date;

  @ApiProperty({ description: 'Project end date' })
  projectEndDate: Date;

  @ApiPropertyOptional({ description: 'GitHub repository URL' })
  githubRepoUrl?: string;

  @ApiProperty({ description: 'Limit of Backend positions' })
  limitBE: number;

  @ApiProperty({ description: 'Limit of Frontend positions' })
  limitFE: number;

  @ApiProperty({ description: 'Limit of PM positions' })
  limitPM: number;

  @ApiProperty({ description: 'Limit of Mobile positions' })
  limitMobile: number;

  @ApiProperty({ description: 'Limit of AI positions' })
  limitAI: number;

  @ApiProperty({ enum: Proficiency, description: 'Minimum proficiency level required' })
  minProficiency: Proficiency;

  @ApiProperty({ enum: Proficiency, description: 'Maximum proficiency level accepted' })
  maxProficiency: Proficiency;

  @ApiProperty({ description: 'Project owner ID' })
  ownerId: string;

  @ApiPropertyOptional({ description: 'Project owner information' })
  owner?: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };

  @ApiPropertyOptional({ description: 'Total number of members' })
  memberCount?: number;

  @ApiPropertyOptional({ description: 'Total number of applications' })
  applicationCount?: number;

  @ApiProperty({ description: 'Project creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Project last update date' })
  updatedAt: Date;
}

export class ProjectDetailResponseDto extends ProjectResponseDto {
  @ApiPropertyOptional({ description: 'Project members' })
  members?: {
    id: string;
    userId: string;
    role: Position[];
    joinedAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      profileImageUrl?: string;
      githubId: string;
    };
  }[];

  @ApiPropertyOptional({ description: 'Project applications' })
  applications?: {
    userId: string;
    appliedPosition: Position[];
    status: ApplicationStatus;
    coverLetter?: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      profileImageUrl?: string;
      githubId: string;
    };
  }[];
}

export class ApplicationResponseDto {
  @ApiProperty({ description: 'User ID of the applicant' })
  userId: string;

  @ApiProperty({ description: 'Project ID' })
  projectId: string;

  @ApiProperty({ enum: Position, isArray: true, description: 'Applied positions' })
  appliedPosition: Position[];

  @ApiProperty({ enum: ApplicationStatus, description: 'Application status' })
  status: ApplicationStatus;

  @ApiPropertyOptional({ description: 'Cover letter' })
  coverLetter?: string;

  @ApiProperty({ description: 'Application creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Application last update date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Associated project information' })
  project?: ProjectResponseDto;
}

export class OwnerDashboardResponseDto {
  @ApiProperty({ type: [ProjectDetailResponseDto], description: 'Projects owned by the user' })
  ownedProjects: ProjectDetailResponseDto[];
}

export class MemberDashboardResponseDto {
  @ApiProperty({ type: [ProjectResponseDto], description: 'Projects user is a member of' })
  myProjects: ProjectResponseDto[];

  @ApiProperty({ type: [ApplicationResponseDto], description: 'User\'s project applications' })
  myApplications: ApplicationResponseDto[];
}

export class DashboardResponseDto {
  @ApiProperty({ type: [ProjectDetailResponseDto], description: 'Projects owned by the user' })
  ownedProjects: ProjectDetailResponseDto[];

  @ApiProperty({ type: [ProjectResponseDto], description: 'Projects user is a member of' })
  myProjects: ProjectResponseDto[];

  @ApiProperty({ type: [ApplicationResponseDto], description: 'User\'s project applications' })
  myApplications: ApplicationResponseDto[];
}
