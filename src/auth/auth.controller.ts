import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthTokenResponseDto, OnboardingRequiredDto } from './dto/token-response.dto';
import SupabaseLoginDto from './dto/supabaselogin.dto';
import { OnboardDto } from './dto/onboard.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { Request } from 'express';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Authenticate user via Supabase access token and issue JWT' })
    @ApiResponse({ status: 200, type: AuthTokenResponseDto, description: 'User already exists, returns JWT token' })
    @ApiResponse({ status: 200, type: OnboardingRequiredDto, description: 'New user, requires onboarding' })
    @ApiBody({ type: SupabaseLoginDto })
    @Post('supabase')
    async loginWithSupabase(@Body() dto: SupabaseLoginDto): Promise<AuthTokenResponseDto | OnboardingRequiredDto> {
        return this.authService.loginWithSupabaseOrRegister(dto);
    }

    @ApiOperation({ summary: 'Complete user onboarding and create user account with full details' })
    @ApiResponse({ status: 201, type: AuthTokenResponseDto, description: 'Onboarding completed successfully' })
    @ApiBody({ type: OnboardDto })
    @Post('onboard')
    async completeOnboarding(@Body() dto: OnboardDto): Promise<AuthTokenResponseDto> {
        return this.authService.completeOnboarding(dto);
    }

    @ApiOperation({ summary: 'Get current user profile using Bearer token' })
    @ApiResponse({ status: 200, description: 'Returns current user profile with decrypted phone number' })
    @ApiBearerAuth()
    @UseGuards(AccessTokenGuard)
    @Get('profile')
    async getProfile(@Req() req: Request & { user: any }) {
        return req.user;
    }
}
