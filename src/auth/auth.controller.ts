import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthTokenResponseDto, OnboardingRequiredDto } from './dto/token-response.dto';
import FirebaseLoginDto from './dto/firebaselogin.dto';
import { OnboardDto } from './dto/onboard.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Authenticate user via Firebase ID token and issue JWT.' })
    @ApiResponse({ status: 201, type: AuthTokenResponseDto })
    @ApiResponse({ status: 200, type: OnboardingRequiredDto })
    @Post('firebase')
    async loginWithFirebase(@Body() dto: FirebaseLoginDto): Promise<AuthTokenResponseDto | OnboardingRequiredDto> {
        return this.authService.loginWithFirebaseOrRegister(dto);
    }

    @ApiOperation({ summary: 'Complete user onboarding and create user account with full details.' })
    @ApiResponse({ status: 201, type: AuthTokenResponseDto })
    @Post('onboard')
    async completeOnboarding(@Body() dto: OnboardDto): Promise<AuthTokenResponseDto> {
        return this.authService.completeOnboarding(dto);
    }

    @ApiOperation({ summary: 'Get current user profile using Bearer token.' })
    @ApiResponse({ status: 200, description: 'Returns current user profile with decrypted phone number.' })
    @ApiBearerAuth()
    @UseGuards(AccessTokenGuard)
    @Get('profile')
    async getProfile(@Req() req: Request & { user: any }) {
        return req.user;
    }
}
