import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

/**
 * 프로젝트 업데이트 요청 DTO
 * CreateProjectDto의 모든 필드는 Optional입니다.
 * 포함된 필드만 업데이트됩니다.
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
