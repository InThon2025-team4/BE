import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../user/user.repository';
import SupabaseLoginDto from './dto/supabaselogin.dto';
import { LoginResponseDto, OnboardingRequiredDto, OnboardingResponseDto } from './dto/token-response.dto';
import { OnboardDto } from './dto/onboard.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { sign as jwtSign } from 'jsonwebtoken';
import { encrypt, decrypt } from '../libs/crypto';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly userRepository: UserRepository,
        private readonly prismaService: PrismaService,
        @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    ) {}

    private generateJwtToken(uid: string): string {
        try {
            const secret = this.configService.get<string>('JWT_SECRET');
            if (!secret) {
                console.error('JWT_SECRET environment variable is not set');
                throw new BadRequestException('JWT_SECRET is not configured in environment variables');
            }
            console.log('JWT_SECRET for token generation:', secret.substring(0, 20) + '... (length: ' + secret.length + ')');
            console.log('Generating JWT token for user:', uid);
            const token = jwtSign({ uid }, secret, { expiresIn: '24h' });
            console.log('JWT token generated successfully:', token.substring(0, 50) + '...');
            return token;
        } catch (error) {
            console.error('Error generating JWT token:', error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`JWT 토큰 생성 실패: ${error.message || '알 수 없는 오류'}`);
        }
    }

    private getEncryptionKey(): string {
        const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
        if (!encryptionKey) {
            throw new BadRequestException('ENCRYPTION_KEY is not configured in environment variables');
        }
        return encryptionKey;
    }

    private decryptPhoneOrFallback(phone: string | null, encryptionKey: string): string | null {
        if (!phone) return phone;
        try {
            return decrypt(phone, encryptionKey);
        } catch (error) {
            console.warn('Failed to decrypt phone; returning stored value as-is.');
            return phone;
        }
    }

    async loginWithSupabaseOrRegister(dto: SupabaseLoginDto): Promise<LoginResponseDto | OnboardingRequiredDto> {
        const supabaseAccessToken = dto.accessToken
        try {
            // Verify the Supabase access token and get user
            const { data: { user: supabaseUser }, error: userError } = await this.supabase.auth.getUser(supabaseAccessToken);
            
            if (userError || !supabaseUser) {
                console.error('Supabase verification error:', userError);
                throw new UnauthorizedException(`Invalid Supabase access token: ${userError?.message || 'Unknown error'}`);
            }
            
            const supabaseUid = supabaseUser.id;
            console.log('Verified Supabase user:', supabaseUid);

            let user = await this.prismaService.user.findUnique({
                where: { supabaseUid },
            });
            if (user) {
                console.log('Existing user found:', user.id);
                const accessToken = this.generateJwtToken(user.id);
                // Decrypt phone number before returning
                const encryptionKey = this.getEncryptionKey();
                const decryptedUser = {
                    ...user,
                    phone: this.decryptPhoneOrFallback(user.phone, encryptionKey),
                };
                return { accessToken, user: decryptedUser };
            } else {
                const email = supabaseUser.email;
                const displayName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null;
                console.log('New user requires onboarding:', { email, supabaseUid });
                
                if (!email)
                throw new UnauthorizedException('이메일이 없는 계정입니다.');

                // Email이 중복되었을수도 있으므로 있는지 체크.
                const existingUser = await this.prismaService.user.findUnique({
                where: { email },
                });
                if (existingUser)
                throw new UnauthorizedException('이미 가입된 이메일입니다.');

                // 신규 유저는 온보딩 필요
                return {
                    requiresOnboarding: true,
                    supabaseUid,
                    email,
                    displayName,
                    supabaseAccessToken: supabaseAccessToken,
            };
        }
        } catch (error) {
        console.error('Error in AuthService.supabaseLoginOrRegister:', error);
        // Preserve original exception type if it's already an HTTP exception
        if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
            throw error;
        }
        throw new BadRequestException(
            `Supabase 로그인/회원가입 실패: ${error.message || '알 수 없는 오류'}`,
        );
        }
    }

    async completeOnboarding(dto: OnboardDto): Promise<OnboardingResponseDto> {
        try {
            // Verify the Supabase access token
            const { data: { user: supabaseUser }, error: userError } = await this.supabase.auth.getUser(dto.accessToken);
            
            if (userError || !supabaseUser) {
                throw new UnauthorizedException('Invalid Supabase access token');
            }
            
            const supabaseUid = supabaseUser.id;

            // Check if user already exists
            const existingUser = await this.prismaService.user.findUnique({
                where: { supabaseUid },
            });

            if (existingUser) {
                throw new BadRequestException('이미 온보딩을 완료한 사용자입니다.');
            }

            // Check email and githubId uniqueness
            const emailExists = await this.prismaService.user.findUnique({
                where: { email: dto.email },
            });
            if (emailExists) {
                throw new BadRequestException('이미 사용 중인 이메일입니다.');
            }

            const githubIdExists = await this.prismaService.user.findUnique({
                where: { githubId: dto.githubId },
            });
            if (githubIdExists) {
                throw new BadRequestException('이미 사용 중인 GitHub ID입니다.');
            }

            // Encrypt phone number before storing
            const encryptionKey = this.getEncryptionKey();
            const encryptedPhone = encrypt(dto.phone, encryptionKey);

            // Create new user with full onboarding data
            const user = await this.prismaService.user.create({
                data: {
                    supabaseUid,
                    authProvider: dto.authProvider,
                    email: dto.email,
                    name: dto.name,
                    phone: encryptedPhone,
                    githubId: dto.githubId,
                    profileImageUrl: dto.profileImageUrl,
                    techStacks: dto.techStacks || [],
                    positions: dto.positions || [],
                    proficiency: dto.proficiency ?? 'UNKNOWN',
                    portfolio: dto.portfolio ?? null,
                },
            });

            const accessToken = this.generateJwtToken(user.id);
            // Decrypt phone number before returning
            const decryptedUser = {
                ...user,
                phone: this.decryptPhoneOrFallback(user.phone, encryptionKey),
            };
            return { accessToken, user: decryptedUser };
        } catch (error) {
            console.error('Error in AuthService.completeOnboarding:', error);
            // Preserve original exception type if it's already an HTTP exception
            if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(
                `온보딩 완료 실패: ${error.message || '알 수 없는 오류'}`,
            );
        }
    }
}
