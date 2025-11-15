import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApplyProjectDto } from './dto/apply-project.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import {
  ProjectResponseDto,
  ProjectDetailResponseDto,
  ApplicationResponseDto,
  DashboardResponseDto,
} from './dto/project-response.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // ========== Dashboard ==========

  @Get('dashboard')
  @UseGuards(AccessTokenGuard)
  async getDashboard(@Request() req): Promise<DashboardResponseDto> {
    return this.projectService.getDashboard(req.user.id);
  }

  @Get('my/owned')
  @UseGuards(AccessTokenGuard)
  async getMyOwnedProjects(@Request() req): Promise<ProjectDetailResponseDto[]> {
    return this.projectService.getMyOwnedProjects(req.user.id);
  }

  @Get('my/member')
  @UseGuards(AccessTokenGuard)
  async getMyProjects(@Request() req): Promise<ProjectResponseDto[]> {
    return this.projectService.getMyProjects(req.user.id);
  }

  // ========== Project CRUD ==========

  @Post()
  @UseGuards(AccessTokenGuard)
  async createProject(
    @Request() req,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectService.createProject(req.user.id, createProjectDto);
  }

  @Get()
  async getAllProjects(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<ProjectResponseDto[]> {
    return this.projectService.getAllProjects(
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
    );
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string): Promise<ProjectDetailResponseDto> {
    return this.projectService.getProjectById(id);
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard)
  async updateProject(
    @Request() req,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProject(req.user.id, id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  async deleteProject(@Request() req, @Param('id') id: string): Promise<void> {
    return this.projectService.deleteProject(req.user.id, id);
  }

  // ========== Application Management ==========

  @Post(':id/apply')
  @UseGuards(AccessTokenGuard)
  async applyToProject(
    @Request() req,
    @Param('id') projectId: string,
    @Body() applyProjectDto: ApplyProjectDto,
  ): Promise<ApplicationResponseDto> {
    return this.projectService.applyToProject(
      req.user.id,
      projectId,
      applyProjectDto,
    );
  }

  @Get('applications/my')
  @UseGuards(AccessTokenGuard)
  async getMyApplications(@Request() req): Promise<ApplicationResponseDto[]> {
    return this.projectService.getMyApplications(req.user.id);
  }

  @Get(':id/applications')
  @UseGuards(AccessTokenGuard)
  async getProjectApplications(
    @Request() req,
    @Param('id') projectId: string,
  ): Promise<ApplicationResponseDto[]> {
    return this.projectService.getProjectApplications(req.user.id, projectId);
  }

  @Put(':id/applications/:userId')
  @UseGuards(AccessTokenGuard)
  async updateApplicationStatus(
    @Request() req,
    @Param('id') projectId: string,
    @Param('userId') applicantId: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    return this.projectService.updateApplicationStatus(
      req.user.id,
      projectId,
      applicantId,
      updateApplicationDto,
    );
  }

  @Delete(':id/applications')
  @UseGuards(AccessTokenGuard)
  async cancelApplication(
    @Request() req,
    @Param('id') projectId: string,
  ): Promise<void> {
    return this.projectService.cancelApplication(req.user.id, projectId);
  }
}

