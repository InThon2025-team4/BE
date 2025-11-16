import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: '서버 상태 확인',
    description: '서버가 정상 동작하는지 확인하는 헬스 체크 엔드포인트입니다.'
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok'
        }
      }
    },
    description: '서버 상태가 정상임을 나타냅니다'
  })
  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
