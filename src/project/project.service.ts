import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApplyProjectDto } from './dto/apply-project.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import {
  ProjectResponseDto,
  ProjectDetailResponseDto,
  ApplicationResponseDto,
  OwnerDashboardResponseDto,
  MemberDashboardResponseDto,
  DashboardResponseDto,
} from './dto/project-response.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async createProject(
    userId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.createProject({
      ...createProjectDto,
      projectStartDate: new Date(createProjectDto.projectStartDate),
      projectEndDate: new Date(createProjectDto.projectEndDate),
      recruitmentStartDate: createProjectDto.recruitmentStartDate
        ? new Date(createProjectDto.recruitmentStartDate)
        : undefined,
      recruitmentEndDate: createProjectDto.recruitmentEndDate
        ? new Date(createProjectDto.recruitmentEndDate)
        : undefined,
      owner: {
        connect: { id: userId },
      },
    });

    return this.mapToProjectResponse(project);
  }

  async getAllProjects(
    skip?: number,
    take?: number,
  ): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepository.findAllProjects({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => this.mapToProjectResponse(project));
  }

  async getProjectById(projectId: string): Promise<ProjectDetailResponseDto> {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    return this.mapToProjectDetailResponse(project);
  }

  async updateProject(
    userId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('프로젝트를 수정할 권한이 없습니다.');
    }

    const updateData: any = { ...updateProjectDto };
    if (updateProjectDto.projectStartDate) {
      updateData.projectStartDate = new Date(updateProjectDto.projectStartDate);
    }
    if (updateProjectDto.projectEndDate) {
      updateData.projectEndDate = new Date(updateProjectDto.projectEndDate);
    }
    if (updateProjectDto.recruitmentStartDate) {
      updateData.recruitmentStartDate = new Date(
        updateProjectDto.recruitmentStartDate,
      );
    }
    if (updateProjectDto.recruitmentEndDate) {
      updateData.recruitmentEndDate = new Date(
        updateProjectDto.recruitmentEndDate,
      );
    }

    const updatedProject = await this.projectRepository.updateProject(
      projectId,
      updateData,
    );

    return this.mapToProjectResponse(updatedProject);
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('프로젝트를 삭제할 권한이 없습니다.');
    }

    await this.projectRepository.deleteProject(projectId);
  }

  async applyToProject(
    userId: string,
    projectId: string,
    applyProjectDto: ApplyProjectDto,
  ): Promise<ApplicationResponseDto> {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.ownerId === userId) {
      throw new BadRequestException('본인이 개설한 프로젝트에는 신청할 수 없습니다.');
    }

    const existingApplication =
      await this.projectRepository.findApplicationByUserAndProject(
        userId,
        projectId,
      );

    if (existingApplication) {
      throw new ConflictException('이미 신청한 프로젝트입니다.');
    }

    const existingMember = await this.projectRepository.findProjectMember(
      userId,
      projectId,
    );

    if (existingMember) {
      throw new ConflictException('이미 참여 중인 프로젝트입니다.');
    }

    const application = await this.projectRepository.createApplication({
      user: { connect: { id: userId } },
      project: { connect: { id: projectId } },
      appliedPosition: applyProjectDto.appliedPosition,
      coverLetter: applyProjectDto.coverLetter,
    });

    return this.mapToApplicationResponse(application);
  }

  async getMyApplications(userId: string): Promise<ApplicationResponseDto[]> {
    const applications =
      await this.projectRepository.findApplicationsByUserId(userId);

    return applications.map((application) =>
      this.mapToApplicationResponse(application),
    );
  }

  async getProjectApplications(
    userId: string,
    projectId: string,
  ): Promise<ApplicationResponseDto[]> {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('신청자 목록을 조회할 권한이 없습니다.');
    }

    const applications =
      await this.projectRepository.findApplicationsByProjectId(projectId);

    return applications.map((application) =>
      this.mapToApplicationResponse(application),
    );
  }

  async updateApplicationStatus(
    userId: string,
    projectId: string,
    applicantId: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('신청 상태를 변경할 권한이 없습니다.');
    }

    const application =
      await this.projectRepository.findApplicationByUserAndProject(
        applicantId,
        projectId,
      );

    if (!application) {
      throw new NotFoundException('신청 내역을 찾을 수 없습니다.');
    }

    const updatedApplication = await this.projectRepository.updateApplication(
      applicantId,
      projectId,
      { status: updateApplicationDto.status },
    );

    // 승인된 경우 멤버로 추가
    if (updateApplicationDto.status === ApplicationStatus.ACCEPTED) {
      const existingMember = await this.projectRepository.findProjectMember(
        applicantId,
        projectId,
      );

      if (!existingMember) {
        await this.projectRepository.addProjectMember({
          user: { connect: { id: applicantId } },
          project: { connect: { id: projectId } },
          role: application.appliedPosition,
        });
      }
    }

    return this.mapToApplicationResponse(updatedApplication);
  }

  async cancelApplication(userId: string, projectId: string): Promise<void> {
    const application =
      await this.projectRepository.findApplicationByUserAndProject(
        userId,
        projectId,
      );

    if (!application) {
      throw new NotFoundException('신청 내역을 찾을 수 없습니다.');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('대기 중인 신청만 취소할 수 있습니다.');
    }

    await this.projectRepository.deleteApplication(userId, projectId);
  }

  async getDashboard(userId: string): Promise<DashboardResponseDto> {
    const [ownedProjects, memberProjects, applications] = await Promise.all([
      this.projectRepository.findProjectsByOwnerId(userId),
      this.projectRepository.findProjectsByMemberId(userId),
      this.projectRepository.findApplicationsByUserId(userId),
    ]);

    return {
      ownedProjects: ownedProjects.map((project) =>
        this.mapToProjectDetailResponse(project),
      ),
      myProjects: memberProjects.map((project) =>
        this.mapToProjectResponse(project),
      ),
      myApplications: applications.map((application) =>
        this.mapToApplicationResponse(application),
      ),
    };
  }

  async getOwnerDashboard(userId: string): Promise<OwnerDashboardResponseDto> {
    const ownedProjects = await this.projectRepository.findProjectsByOwnerId(userId);

    return {
      ownedProjects: ownedProjects.map((project) =>
        this.mapToProjectDetailResponse(project),
      ),
    };
  }

  async getMemberDashboard(userId: string): Promise<MemberDashboardResponseDto> {
    const [memberProjects, applications] = await Promise.all([
      this.projectRepository.findProjectsByMemberId(userId),
      this.projectRepository.findApplicationsByUserId(userId),
    ]);

    return {
      myProjects: memberProjects.map((project) =>
        this.mapToProjectResponse(project),
      ),
      myApplications: applications.map((application) =>
        this.mapToApplicationResponse(application),
      ),
    };
  }

  private mapToProjectResponse(project: any): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      difficulty: project.difficulty,
      recruitmentStartDate: project.recruitmentStartDate,
      recruitmentEndDate: project.recruitmentEndDate,
      projectStartDate: project.projectStartDate,
      projectEndDate: project.projectEndDate,
      githubRepoUrl: project.githubRepoUrl,
      limitBE: project.limitBE,
      limitFE: project.limitFE,
      limitPM: project.limitPM,
      limitMobile: project.limitMobile,
      limitAI: project.limitAI,
      ownerId: project.ownerId,
      owner: project.owner,
      memberCount: project._count?.members,
      applicationCount: project._count?.applications,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  private mapToProjectDetailResponse(project: any): ProjectDetailResponseDto {
    return {
      ...this.mapToProjectResponse(project),
      members: project.members,
      applications: project.applications,
    };
  }

  private mapToApplicationResponse(application: any): ApplicationResponseDto {
    return {
      userId: application.userId,
      projectId: application.projectId,
      appliedPosition: application.appliedPosition,
      status: application.status,
      coverLetter: application.coverLetter,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      project: application.project
        ? this.mapToProjectResponse(application.project)
        : undefined,
    };
  }
}
