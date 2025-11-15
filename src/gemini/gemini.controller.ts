import { Body, Controller, Post } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
    constructor(private readonly geminiService: GeminiService) {}

    @Post('difficulty')
    async getDifficulty(@Body('description') description: string) {
        const result = await this.geminiService.process(description);
        return { difficulty: result.difficulty };
    }

    @Post('reason')
    async getReason(@Body('description') description: string) {
        const result = await this.geminiService.process(description);
        return { reason: result.reason };
    }
}
