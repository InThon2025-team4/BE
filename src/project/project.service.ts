import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createProject(
    userId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    const projectData: any = {
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
    };

    // isOpen 초기값 설정
    const { isOpen } = this.checkProjectApplicability(projectData);
    projectData.isOpen = isOpen;

    const project = await this.projectRepository.createProject(projectData);

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

    // 업데이트될 프로젝트 정보를 기반으로 isOpen 상태 재계산
    const projectForValidation = {
      ...project,
      ...updateData,
    };
    const { isOpen } = this.checkProjectApplicability(projectForValidation);
    updateData.isOpen = isOpen;

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

    // 프로젝트 지원 가능 여부 판단
    const applicationStatus = this.checkProjectApplicability(project);
    if (!applicationStatus.isOpen) {
      throw new BadRequestException(applicationStatus.reason);
    }

    // 직군별 지원 가능 여부 판단
    for (const position of applyProjectDto.appliedPosition) {
      const positionAvailable = this.checkPositionAvailability(project, position);
      if (!positionAvailable) {
        throw new BadRequestException(
          `${position} 직군의 지원 인원이 가득 찼습니다.`,
        );
      }
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

  /**
   * 프로젝트를 응답 DTO로 변환
   * 선택적으로 사용자 포지션 정보를 받아 사용자별 지원 가능 여부를 계산
   */
  private mapToProjectResponse(
    project: any,
    userPositions?: string[],
  ): ProjectResponseDto {
    const isOpenForUser =
      userPositions &&
      this.isProjectOpenForUser(project, userPositions);

    // 포지션별 현재 인원수 계산
    const { currentBE, currentFE, currentPM, currentMobile, currentAI } =
      this.calculateCurrentMembersByPosition(project);

    const dto: ProjectResponseDto = {
      id: project.id,
      name: project.name,
      description: project.description,
      difficulty: project.difficulty,
      isOpen: project.isOpen,
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
      currentBE,
      currentFE,
      currentPM,
      currentMobile,
      currentAI,
      minProficiency: project.minProficiency,
      maxProficiency: project.maxProficiency,
      ownerId: project.ownerId,
      owner: project.owner,
      memberCount: project._count?.members,
      applicationCount: project._count?.applications,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };

    if (isOpenForUser !== undefined) {
      dto.isOpenForUser = isOpenForUser;
    }

    return dto;
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

  /**
   * 포지션별 현재 멤버 수 계산
   */
  private calculateCurrentMembersByPosition(project: any): {
    currentBE: number;
    currentFE: number;
    currentPM: number;
    currentMobile: number;
    currentAI: number;
  } {
    const counts = {
      currentBE: 0,
      currentFE: 0,
      currentPM: 0,
      currentMobile: 0,
      currentAI: 0,
    };

    if (!project.members || project.members.length === 0) {
      return counts;
    }

    // 각 멤버의 역할(role)을 확인하여 포지션별 인원 카운트
    for (const member of project.members) {
      if (member.role && Array.isArray(member.role)) {
        for (const role of member.role) {
          switch (role) {
            case 'BACKEND':
              counts.currentBE++;
              break;
            case 'FRONTEND':
              counts.currentFE++;
              break;
            case 'PM':
              counts.currentPM++;
              break;
            case 'MOBILE':
              counts.currentMobile++;
              break;
            case 'AI':
              counts.currentAI++;
              break;
          }
        }
      }
    }

    return counts;
  }

  /**
   * 프로젝트 지원 가능 여부 판단
   * 조건:
   * 1. 현재 시간이 모집 기간 내
   * 2. 프로젝트 시작 전
   * 
   * 반환값의 isOpen은 데이터베이스에 저장할 값
   */
  private checkProjectApplicability(
    project: any,
  ): { isOpen: boolean; reason?: string } {
    const now = new Date();

    // 모집 기간 설정이 되어있는 경우 확인
    if (project.recruitmentStartDate || project.recruitmentEndDate) {
      if (project.recruitmentStartDate && now < project.recruitmentStartDate) {
        return {
          isOpen: false,
          reason: `모집이 아직 시작되지 않았습니다. (${project.recruitmentStartDate.toLocaleDateString()})`,
        };
      }

      if (project.recruitmentEndDate && now > project.recruitmentEndDate) {
        return {
          isOpen: false,
          reason: `모집 기간이 종료되었습니다. (${project.recruitmentEndDate.toLocaleDateString()})`,
        };
      }
    }

    // 프로젝트가 이미 시작된 경우
    if (now >= project.projectStartDate) {
      return { isOpen: false, reason: '프로젝트가 이미 시작되었습니다.' };
    }

    return { isOpen: true };
  }

  /**
   * 특정 직군의 지원 가능 여부 판단
   * 직군별 모집 인원이 남아있는지 확인
   */
  private checkPositionAvailability(project: any, position: string): boolean {
    const memberCounts = this.countMembersByPosition(project.members || []);
    const limits: Record<string, number> = {
      BACKEND: project.limitBE,
      FRONTEND: project.limitFE,
      MOBILE: project.limitMobile,
      AI: project.limitAI,
      PM: project.limitPM,
    };

    const limit = limits[position] || 0;
    const currentCount = memberCounts[position] || 0;

    // limit이 0이면 무제한으로 간주
    if (limit === 0) {
      return true;
    }

    return currentCount < limit;
  }

  /**
   * 직군별 멤버 수 집계
   */
  private countMembersByPosition(
    members: any[],
  ): Record<string, number> {
    const counts: Record<string, number> = {
      BACKEND: 0,
      FRONTEND: 0,
      MOBILE: 0,
      AI: 0,
      PM: 0,
    };

    for (const member of members) {
      if (member.role && Array.isArray(member.role)) {
        for (const role of member.role) {
          if (counts.hasOwnProperty(role)) {
            counts[role]++;
          }
        }
      }
    }

    return counts;
  }

  /**
   * 사용자의 Proficiency가 프로젝트 요구사항을 충족하는지 판단
   * minProficiency <= userProficiency <= maxProficiency
   */
  private isProficiencyWithinRange(
    userProficiency: string,
    minProficiency: string,
    maxProficiency: string,
  ): boolean {
    const proficiencyOrder = {
      UNKNOWN: 0,
      BRONZE: 1,
      SILVER: 2,
      GOLD: 3,
      PLATINUM: 4,
      DIAMOND: 5,
    };

    const userLevel = proficiencyOrder[userProficiency as keyof typeof proficiencyOrder] || 0;
    const minLevel = proficiencyOrder[minProficiency as keyof typeof proficiencyOrder] || 0;
    const maxLevel = proficiencyOrder[maxProficiency as keyof typeof proficiencyOrder] || 5;

    return userLevel >= minLevel && userLevel <= maxLevel;
  }

  /**
   * 사용자가 프로젝트에 지원 가능한지 판단
   * 조건:
   * 1. 기본 isOpen 조건 만족 (모집 기간 내, 프로젝트 시작 전)
   * 2. 사용자의 포지션 중 프로젝트에서 모집 중인 포지션이 있는지 확인
   *    - 사용자의 포지션별로 해당 포지션의 limit이 현재 멤버 수를 초과하는지 확인
   */
  private isProjectOpenForUser(
    project: any,
    userPositions: string[],
  ): boolean {
    // 기본 isOpen 조건 확인
    if (!project.isOpen) {
      return false;
    }

    // 사용자의 포지션이 비어있으면 false
    if (!userPositions || userPositions.length === 0) {
      return false;
    }

    // 멤버 수를 포지션별로 계산
    const memberCounts = this.countMembersByPosition(project.members || []);

    // 사용자의 포지션 중 하나라도 모집 가능한 포지션이 있는지 확인
    for (const position of userPositions) {
      const limit = this.getPositionLimit(project, position);
      const currentCount = memberCounts[position] || 0;

      // limit이 0이면 무제한 모집 (모집 중)
      // limit > 0이고 currentCount < limit이면 모집 중
      if (limit === 0 || currentCount < limit) {
        return true;
      }
    }

    return false;
  }

  /**
   * Position에 해당하는 limit 값 반환
   */
  private getPositionLimit(project: any, position: string): number {
    const limitMap: Record<string, number> = {
      BACKEND: project.limitBE,
      FRONTEND: project.limitFE,
      MOBILE: project.limitMobile,
      AI: project.limitAI,
      PM: project.limitPM,
    };

    return limitMap[position] || 0;
  }

  /**
   * 사용자별로 isOpenForUser가 포함된 프로젝트 목록 반환
   */
  async getAllProjectsWithUserContext(
    userId?: string,
    skip?: number,
    take?: number,
  ): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepository.findAllProjects({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    // 사용자 정보 조회 (사용자가 있을 경우)
    let userPositions: string[] | undefined;
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { positions: true },
      });
      userPositions = user?.positions;
    }

    return projects.map((project) =>
      this.mapToProjectResponse(project, userPositions),
    );
  }

  /**
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    const { isOpen } = this.checkProjectApplicability(project);

    // isOpen 상태가 변경된 경우에만 업데이트
    if (project.isOpen !== isOpen) {
      await this.projectRepository.updateProject(projectId, { isOpen });
    }
  }

  /**
   * 사용자가 프로젝트에 지원 가능한지 종합적으로 판단
   */
  async checkUserApplicability(
    userId: string,
    projectId: string,
    appliedPositions: string[],
    userProficiency: string,
  ): Promise<{ applicable: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    // 프로젝트 조회
    const project = await this.projectRepository.findProjectById(projectId);
    if (!project) {
      return { applicable: false, reasons: ['프로젝트를 찾을 수 없습니다.'] };
    }

    // 본인이 개설한 프로젝트인지 확인
    if (project.ownerId === userId) {
      reasons.push('본인이 개설한 프로젝트에는 신청할 수 없습니다.');
    }

    // 이미 신청했는지 확인
    const existingApplication =
      await this.projectRepository.findApplicationByUserAndProject(
        userId,
        projectId,
      );
    if (existingApplication) {
      reasons.push('이미 신청한 프로젝트입니다.');
    }

    // 이미 참여 중인지 확인
    const existingMember = await this.projectRepository.findProjectMember(
      userId,
      projectId,
    );
    if (existingMember) {
      reasons.push('이미 참여 중인 프로젝트입니다.');
    }

    // 프로젝트 지원 가능 여부 확인
    const projectStatus = this.checkProjectApplicability(project);
    if (!projectStatus.isOpen) {
      reasons.push(projectStatus.reason || '프로젝트는 지원 불가능 상태입니다.');
    }

    // 직군별 모집 인원 확인
    for (const position of appliedPositions) {
      if (!this.checkPositionAvailability(project, position)) {
        reasons.push(`${position} 직군의 모집이 마감되었습니다.`);
      }
    }

    // Proficiency 범위 확인
    if (
      !this.isProficiencyWithinRange(
        userProficiency,
        project.minProficiency,
        project.maxProficiency,
      )
    ) {
      reasons.push(
        `사용자의 능력 등급(${userProficiency})이 프로젝트 요구사항(${project.minProficiency}~${project.maxProficiency})을 충족하지 않습니다.`,
      );
    }

    return { applicable: reasons.length === 0, reasons };
  }
}
