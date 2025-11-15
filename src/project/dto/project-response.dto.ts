import { Difficulty, Position, ApplicationStatus } from '@prisma/client';

export class ProjectResponseDto {
  id: string;
  name: string;
  description: string;
  difficulty?: Difficulty;
  recruitmentStartDate?: Date;
  recruitmentEndDate?: Date;
  projectStartDate: Date;
  projectEndDate: Date;
  githubRepoUrl?: string;
  limitBE: number;
  limitFE: number;
  limitPM: number;
  limitMobile: number;
  limitAI: number;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
  memberCount?: number;
  applicationCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectDetailResponseDto extends ProjectResponseDto {
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
  userId: string;
  projectId: string;
  appliedPosition: Position[];
  status: ApplicationStatus;
  coverLetter?: string;
  createdAt: Date;
  updatedAt: Date;
  project?: ProjectResponseDto;
}

export class OwnerDashboardResponseDto {
  ownedProjects: ProjectDetailResponseDto[];
}

export class MemberDashboardResponseDto {
  myProjects: ProjectResponseDto[];
  myApplications: ApplicationResponseDto[];
}

export class DashboardResponseDto {
  ownedProjects: ProjectDetailResponseDto[];
  myProjects: ProjectResponseDto[];
  myApplications: ApplicationResponseDto[];
}
