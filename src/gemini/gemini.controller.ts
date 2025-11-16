import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';

@ApiTags('gemini')
@Controller('gemini')
export class GeminiController {
    constructor(private readonly geminiService: GeminiService) {}

    @Post('difficulty')
    @ApiOperation({
        summary: '프로젝트 난이도 평가',
        description: 'Google Gemini AI를 사용하여 프로젝트 설명을 분석하고 난이도 수준을 결정합니다. 기술 요구사항, 복잡도 요소, 시스템 아키텍처를 평가하여 난이도를 할당합니다.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                description: {
                    type: 'string',
                    example: 'Build a real-time collaborative document editor with multi-user support, version control, and cloud storage integration',
                    description: '(Required) 평가할 프로젝트 설명 (기능, 기술, 요구사항 포함)',
                },
            },
            required: ['description'],
        },
        description: '프로젝트 설명 정보'
    })
    @ApiResponse({
        status: 200,
        description: '프로젝트 난이도 평가 완료',
        schema: {
            type: 'object',
            properties: {
                difficulty: {
                    type: 'string',
                    enum: ['하', '중', '상'],
                    example: '상',
                    description: '하 (Easy): 기본 CRUD, 간단한 UI/UX | 중 (Medium): 비동기 처리, 외부 연동 | 상 (Hard): 복잡한 아키텍처, AI/ML, 실시간 시스템',
                },
            },
        },
    })
    @ApiInternalServerErrorResponse({
        description: 'Gemini API 요청 또는 JSON 파싱 중 오류 발생',
    })
    async getDifficulty(@Body('description') description: string) {
        const result = await this.geminiService.process(description);
        return { difficulty: result.difficulty };
    }

    @Post('reason')
    @ApiOperation({
        summary: '프로젝트 난이도 이유 조회',
        description: '프로젝트가 특정 난이도로 할당된 이유에 대한 상세 설명과 이유를 제공합니다. 기술 요소, 복잡도 요소, 인프라 요구사항 분석을 포함합니다.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                description: {
                    type: 'string',
                    example: 'Build a real-time collaborative document editor with multi-user support, version control, and cloud storage integration',
                    description: '(Required) 분석할 프로젝트 설명',
                },
            },
            required: ['description'],
        },
        description: '프로젝트 설명 정보'
    })
    @ApiResponse({
        status: 200,
        description: '난이도 판단 이유 조회 완료',
        schema: {
            type: 'object',
            properties: {
                reason: {
                    type: 'string',
                    example: 'This project requires complex system architecture due to real-time multi-user synchronization, distributed data handling, version control mechanisms, and cloud infrastructure integration. Advanced technologies and careful design patterns are needed.',
                    description: '기술 요구사항 및 복잡도 분석에 기반한 난이도 판단 이유',
                },
            },
        },
    })
    @ApiInternalServerErrorResponse({
        description: 'Gemini API 요청 또는 JSON 파싱 중 오류 발생',
    })
    async getReason(@Body('description') description: string) {
        const result = await this.geminiService.process(description);
        return { reason: result.reason };
    }
}
