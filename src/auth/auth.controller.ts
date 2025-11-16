import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginResponseDto, OnboardingRequiredDto, OnboardingResponseDto } from './dto/token-response.dto';
import SupabaseLoginDto from './dto/supabaselogin.dto';
import { OnboardDto } from './dto/onboard.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { Request } from 'express';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({
        summary: 'Supabase 액세스 토큰으로 로그인 또는 가입',
        description: '클라이언트에서 Supabase 인증을 통해 받은 액세스 토큰으로 서버에 로그인합니다. 기존 사용자면 JWT 토큰을 발급하고, 신규 사용자면 Onboarding이 필요함을 알립니다.'
    })
    @ApiResponse({
        status: 200,
        type: LoginResponseDto,
        description: '기존 사용자 - JWT 액세스 토큰과 사용자 프로필 반환'
    })
    @ApiResponse({
        status: 200,
        type: OnboardingRequiredDto,
        description: '신규 사용자 - Onboarding 필수, Supabase 액세스 토큰 반환'
    })
    @ApiBody({
        type: SupabaseLoginDto,
        description: 'Supabase 액세스 토큰 포함 요청본'
    })
    @Post('supabase')
    async loginWithSupabase(@Body() dto: SupabaseLoginDto): Promise<LoginResponseDto | OnboardingRequiredDto> {
        return this.authService.loginWithSupabaseOrRegister(dto);
    }

    @ApiOperation({
        summary: '신규 사용자 Onboarding 완료',
        description: '신규 사용자가 필요한 추가 정보(이름, 전화번호, 직무 등)를 입력하여 계정 생성을 완료합니다.'
    })
    @ApiResponse({
        status: 201,
        type: OnboardingResponseDto,
        description: 'Onboarding 완료 - JWT 액세스 토큰과 생성된 사용자 프로필 반환'
    })
    @ApiBody({
        type: OnboardDto,
        description: '사용자 프로필 정보 (name, email, phone 필수, 나머지는 Optional)'
    })
    @Post('onboard')
    async completeOnboarding(@Body() dto: OnboardDto): Promise<OnboardingResponseDto> {
        return this.authService.completeOnboarding(dto);
    }

    @ApiOperation({
        summary: '현재 사용자 프로필 조회',
        description: 'Bearer 토큰으로 인증된 사용자의 프로필 정보를 조회합니다. 전화번호는 자동으로 복호화됩니다.'
    })
    @ApiResponse({
        status: 200,
        description: '사용자 프로필 정보 반환 (전화번호 포함, 암호화 해제됨)'
    })
    @ApiBearerAuth()
    @UseGuards(AccessTokenGuard)
    @Get('profile')
    async getProfile(@Req() req: Request & { user: any }) {
        return req.user;
    }
}
