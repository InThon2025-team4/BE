import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthTokenResponseDto, OnboardingRequiredDto } from './dto/token-response.dto';
import FirebaseLoginDto from './dto/firebaselogin.dto';
import { OnboardDto } from './dto/onboard.dto';

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
}
