import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';

@ApiTags('gemini')
@Controller('gemini')
export class GeminiController {
    constructor(private readonly geminiService: GeminiService) {}

    @Post('difficulty')
    @ApiOperation({
        summary: 'Evaluate project difficulty level',
        description: 'Analyzes a project description using Google Gemini AI to determine the project difficulty level. The AI evaluates technical requirements, complexity factors, and system architecture to assign a difficulty rating.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                description: {
                    type: 'string',
                    example: 'Build a real-time collaborative document editor with multi-user support, version control, and cloud storage integration',
                    description: 'Detailed project description that includes features, technologies, and requirements to be evaluated',
                },
            },
            required: ['description'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Project difficulty evaluation completed successfully',
        schema: {
            type: 'object',
            properties: {
                difficulty: {
                    type: 'string',
                    enum: ['하', '중', '상'],
                    example: '상',
                    description: '하 (Easy): Basic CRUD, simple UI/UX | 중 (Medium): Async processing, external integrations | 상 (Hard): Complex architecture, AI/ML, real-time systems',
                },
            },
        },
    })
    @ApiInternalServerErrorResponse({
        description: 'Error occurred during Gemini API request or JSON parsing',
    })
    async getDifficulty(@Body('description') description: string) {
        const result = await this.geminiService.process(description);
        return { difficulty: result.difficulty };
    }

    @Post('reason')
    @ApiOperation({
        summary: 'Get project difficulty explanation',
        description: 'Retrieves the detailed reasoning and explanation for why a project was assigned a specific difficulty level. Includes analysis of technical components, complexity factors, and infrastructure requirements.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                description: {
                    type: 'string',
                    example: 'Build a real-time collaborative document editor with multi-user support, version control, and cloud storage integration',
                    description: 'Detailed project description to analyze',
                },
            },
            required: ['description'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Difficulty reasoning retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                reason: {
                    type: 'string',
                    example: 'This project requires complex system architecture due to real-time multi-user synchronization, distributed data handling, version control mechanisms, and cloud infrastructure integration. Advanced technologies and careful design patterns are needed.',
                    description: 'Detailed explanation of the difficulty assessment based on technical requirements and complexity analysis',
                },
            },
        },
    })
    @ApiInternalServerErrorResponse({
        description: 'Error occurred during Gemini API request or JSON parsing',
    })
    async getReason(@Body('description') description: string) {
        const result = await this.geminiService.process(description);
        return { reason: result.reason };
    }
}
