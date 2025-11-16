import { ApiPropertyOptional } from '@nestjs/swagger';
import { Position, Proficiency, TechStack } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 사용자 프로필 업데이트 요청 DTO
 * 
 * 모든 필드는 Optional이며, 포함된 필드만 업데이트됩니다.
 * 이를 통해 부분 업데이트(PATCH 스타일)를 PUT 요청으로 구현합니다.
 * 
 * 사용 예시:
 * ```json
 * {
 *   "name": "김준호",
 *   "techStacks": ["REACT", "NODEJS", "TYPESCRIPT"],
 *   "positions": ["BACKEND", "FULLSTACK"],
 *   "proficiency": "SILVER",
 *   "portfolio": {
 *     "projects": ["Portfolio Site", "E-Commerce Platform"],
 *     "github": "https://github.com/user",
 *     "blog": "https://blog.example.com"
 *   }
 * }
 * ```
 * 
 * 주의사항:
 * - 모든 필드는 생략 가능합니다
 * - 각 필드를 명시적으로 포함하지 않으면 기존 값이 유지됩니다
 * - 휴대폰번호는 보안 상 변경 불가능합니다 (온보딩 시에만 설정)
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: '(Optional) 사용자 이름. 최대 100자까지 입력 가능합니다. 특수문자나 이모지도 포함될 수 있습니다.',
    example: '김준호',
    maxLength: 100,
    minLength: 1,
    type: 'string'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    enum: TechStack,
    isArray: true,
    description: '(Optional) 보유한 기술 스택 목록. 여러 개의 기술을 선택할 수 있습니다. 사용 가능한 값: REACT, NODEJS, TYPESCRIPT, PYTHON, JAVA, GO, RUST, POSTGRESQL, MONGODB, REDIS, DOCKER, KUBERNETES, AWS, GCP, AZURE 등',
    example: ['REACT', 'NODEJS', 'TYPESCRIPT'],
    type: 'array',
    items: { type: 'string' }
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TechStack, { each: true })
  techStacks?: TechStack[];

  @ApiPropertyOptional({
    enum: Position,
    isArray: true,
    description: '(Optional) 희망하는 직무 위치/직군. 여러 개를 선택할 수 있습니다. 사용 가능한 값: BACKEND, FRONTEND, FULLSTACK, DEVOPS, QA, DATA_ENGINEER 등',
    example: ['BACKEND', 'FRONTEND'],
    type: 'array',
    items: { type: 'string' }
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Position, { each: true })
  positions?: Position[];

  @ApiPropertyOptional({
    enum: Proficiency,
    description: '(Optional) 기술 숙련도 수준. 사용 가능한 값: BRONZE (초급), SILVER (중급), GOLD (고급), PLATINUM (매우 고급), DIAMOND (전문가), UNKNOWN (미지정)',
    example: 'SILVER',
    type: 'string'
  })
  @IsOptional()
  @IsEnum(Proficiency)
  proficiency?: Proficiency;

  @ApiPropertyOptional({
    description: '(Optional) 포트폴리오 정보를 자유 형식의 JSON 객체로 저장합니다. 프로젝트 목록, GitHub 링크, 블로그 등 자유롭게 구성할 수 있습니다.',
    example: {
      projects: [
        { title: 'E-Commerce Platform', description: 'React + Node.js 기반 전자상거래 플랫폼', url: 'https://example.com/ecommerce' },
        { title: 'Portfolio Site', description: 'Next.js로 구축한 포트폴리오', url: 'https://portfolio.example.com' }
      ],
      github: 'https://github.com/user',
      blog: 'https://blog.example.com',
      linkedin: 'https://linkedin.com/in/user',
      awards: ['2024 Web Dev Award', '2023 Hackathon Winner']
    },
    type: 'object'
  })
  @IsOptional()
  portfolio?: object;
}
