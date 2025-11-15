import { Injectable } from '@nestjs/common';
import { Project, Application, ProjectMember, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ========== Project CRUD ==========
  
  async createProject(data: Prisma.ProjectCreateInput): Promise<Project> {
    return this.prisma.project.create({ data });
  }

  async findProjectById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
            githubId: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImageUrl: true,
                githubId: true,
              },
            },
          },
        },
        applications: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImageUrl: true,
                githubId: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            applications: true,
          },
        },
      },
    });
  }

  async findAllProjects(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput;
  }): Promise<Project[]> {
    return this.prisma.project.findMany({
      ...options,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
          },
        },
        _count: {
          select: {
            members: true,
            applications: true,
          },
        },
      },
    });
  }

  async findProjectsByOwnerId(ownerId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImageUrl: true,
                githubId: true,
              },
            },
          },
        },
        applications: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImageUrl: true,
                githubId: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProject(
    id: string,
    data: Prisma.ProjectUpdateInput,
  ): Promise<Project> {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async deleteProject(id: string): Promise<Project> {
    return this.prisma.project.delete({
      where: { id },
    });
  }

  // ========== Application Management ==========

  async createApplication(
    data: Prisma.ApplicationCreateInput,
  ): Promise<Application> {
    return this.prisma.application.create({ data });
  }

  async findApplicationByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Application | null> {
    return this.prisma.application.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
            githubId: true,
          },
        },
        project: true,
      },
    });
  }

  async findApplicationsByUserId(userId: string): Promise<Application[]> {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImageUrl: true,
              },
            },
            _count: {
              select: {
                members: true,
                applications: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findApplicationsByProjectId(
    projectId: string,
  ): Promise<Application[]> {
    return this.prisma.application.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
            githubId: true,
            techStacks: true,
            positions: true,
            proficiency: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateApplication(
    userId: string,
    projectId: string,
    data: Prisma.ApplicationUpdateInput,
  ): Promise<Application> {
    return this.prisma.application.update({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      data,
    });
  }

  async deleteApplication(
    userId: string,
    projectId: string,
  ): Promise<Application> {
    return this.prisma.application.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  }

  // ========== Project Member Management ==========

  async addProjectMember(
    data: Prisma.ProjectMemberCreateInput,
  ): Promise<ProjectMember> {
    return this.prisma.projectMember.create({ data });
  }

  async findProjectMember(
    userId: string,
    projectId: string,
  ): Promise<ProjectMember | null> {
    return this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  }

  async findProjectsByMemberId(userId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
          },
        },
        _count: {
          select: {
            members: true,
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeProjectMember(
    userId: string,
    projectId: string,
  ): Promise<ProjectMember> {
    return this.prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  }
}
