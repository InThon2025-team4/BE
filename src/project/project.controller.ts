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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
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
  OwnerDashboardResponseDto,
  MemberDashboardResponseDto,
  DashboardResponseDto,
} from './dto/project-response.dto';

@ApiTags('projects')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Get user dashboard with owner and member projects' })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  @ApiBearerAuth()
  @Get('dashboard')
  @UseGuards(AccessTokenGuard)
  async getDashboard(@Request() req): Promise<DashboardResponseDto> {
    return this.projectService.getDashboard(req.user.id);
  }

  @ApiOperation({ summary: 'Get owner dashboard for projects owned by the user' })
  @ApiResponse({ status: 200, type: OwnerDashboardResponseDto })
  @ApiBearerAuth()
  @Get('dashboard/owner')
  @UseGuards(AccessTokenGuard)
  async getOwnerDashboard(@Request() req): Promise<OwnerDashboardResponseDto> {
    return this.projectService.getOwnerDashboard(req.user.id);
  }

  @ApiOperation({ summary: 'Get member dashboard for projects user is a member of' })
  @ApiResponse({ status: 200, type: MemberDashboardResponseDto })
  @ApiBearerAuth()
  @Get('dashboard/member')
  @UseGuards(AccessTokenGuard)
  async getMemberDashboard(@Request() req): Promise<MemberDashboardResponseDto> {
    return this.projectService.getMemberDashboard(req.user.id);
  }

  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, type: ProjectResponseDto })
  @ApiBearerAuth()
  @Post()
  @UseGuards(AccessTokenGuard)
  async createProject(
    @Request() req,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectService.createProject(req.user.id, createProjectDto);
  }

  @ApiOperation({ summary: 'Get all projects with pagination' })
  @ApiResponse({ status: 200, type: [ProjectResponseDto] })
  @ApiQuery({ name: 'skip', type: 'number', required: false })
  @ApiQuery({ name: 'take', type: 'number', required: false })
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

  @ApiOperation({ summary: 'Get project details by ID' })
  @ApiResponse({ status: 200, type: ProjectDetailResponseDto })
  @ApiParam({ name: 'id', type: 'string', description: 'Project ID' })
  @Get(':id')
  async getProjectById(@Param('id') id: string): Promise<ProjectDetailResponseDto> {
    return this.projectService.getProjectById(id);
  }

  @ApiOperation({ summary: 'Update project information' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  @ApiParam({ name: 'id', type: 'string', description: 'Project ID' })
  @ApiBearerAuth()
  @Put(':id')
  @UseGuards(AccessTokenGuard)
  async updateProject(
    @Request() req,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProject(req.user.id, id, updateProjectDto);
  }

  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 204 })
  @ApiParam({ name: 'id', type: 'string', description: 'Project ID' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  async deleteProject(@Request() req, @Param('id') id: string): Promise<void> {
    return this.projectService.deleteProject(req.user.id, id);
  }

  @ApiOperation({ summary: 'Apply to a project' })
  @ApiResponse({ status: 201, type: ApplicationResponseDto })
  @ApiParam({ name: 'id', type: 'string', description: 'Project ID' })
  @ApiBearerAuth()
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

  @ApiOperation({ summary: 'Get my project applications' })
  @ApiResponse({ status: 200, type: [ApplicationResponseDto] })
  @ApiBearerAuth()
  @Get('applications/my')
  @UseGuards(AccessTokenGuard)
  async getMyApplications(@Request() req): Promise<ApplicationResponseDto[]> {
    return this.projectService.getMyApplications(req.user.id);
  }

  @ApiOperation({ summary: 'Get all applications for a project' })
  @ApiResponse({ status: 200, type: [ApplicationResponseDto] })
  @ApiParam({ name: 'id', type: 'string', description: 'Project ID' })
  @ApiBearerAuth()
  @Get(':id/applications')
  @UseGuards(AccessTokenGuard)
  async getProjectApplications(
    @Request() req,
    @Param('id') projectId: string,
  ): Promise<ApplicationResponseDto[]> {
    return this.projectService.getProjectApplications(req.user.id, projectId);
  }

  @ApiOperation({ summary: 'Update application status' })
  @ApiResponse({ status: 200, type: ApplicationResponseDto })
  @ApiParam({ name: 'id', type: 'string', description: 'Project ID' })
  @ApiParam({ name: 'userId', type: 'string', description: 'Applicant User ID' })
  @ApiBearerAuth()
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

  @ApiOperation({ summary: 'Cancel application for a project' })
  @ApiResponse({ status: 204 })
  @ApiParam({ name: 'id', type: 'string', description: 'Project ID' })
  @ApiBearerAuth()
  @Delete(':id/applications')
  @UseGuards(AccessTokenGuard)
  async cancelApplication(
    @Request() req,
    @Param('id') projectId: string,
  ): Promise<void> {
    return this.projectService.cancelApplication(req.user.id, projectId);
  }
}

