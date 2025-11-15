import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(@Res() res: Response): void {
    res.sendFile('index.html', { root: 'public' });
  }

  @Get('api/config')
  getConfig() {
    return {
      supabaseUrl: this.configService.get<string>('SUPABASE_URL'),
      supabaseAnonKey: this.configService.get<string>('SUPABASE_ANON_KEY'),
    };
  }
}
