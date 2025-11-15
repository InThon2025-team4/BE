import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../user/user.repository';
import FirebaseLoginDto from './dto/firebaselogin.dto';
import { AuthTokenResponseDto, OnboardingRequiredDto } from './dto/token-response.dto';
import { OnboardDto } from './dto/onboard.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';
import { sign as signJwt } from './libs/jwt'
import { encrypt, decrypt } from '../libs/crypto';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly userRepository: UserRepository,
        private readonly prismaService: PrismaService,
        @Inject('FIREBASE_ADMIN') private readonly firebaseApp: admin.app.App,
    ) {}

    private generateJwtToken(uid: string): string {
        const secret = this.configService.get<string>('JWT_SECRET');
        return signJwt({ uid }, secret);
    }

    async loginWithFirebaseOrRegister(dto: FirebaseLoginDto): Promise<AuthTokenResponseDto | OnboardingRequiredDto> {
        const firebaseAccessToken = dto.idToken
        try {
        const decoded = await this.firebaseApp
            .auth()
            .verifyIdToken(firebaseAccessToken);
        const firebaseUid = decoded.uid;

        let user = await this.prismaService.user.findUnique({
            where: { firebaseUid },
        });
        if (user) {
            const accessToken = this.generateJwtToken(user.id);
            // Decrypt phone number before returning
            const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
            const decryptedUser = {
                ...user,
                phone: user.phone ? decrypt(user.phone, encryptionKey) : user.phone,
            };
            return { accessToken, user: decryptedUser };
        } else {
            const fbUser = await this.firebaseApp.auth().getUser(firebaseUid);

            const email = fbUser.email;
            const displayName = fbUser.displayName;
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
                firebaseUid,
                email,
                displayName
            };
        }
        } catch (error) {
        console.error('Error in AuthService.firebaseLoginOrRegister:', error);
        // Preserve original exception type if it's already an HTTP exception
        if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
            throw error;
        }
        throw new BadRequestException(
            `firebase 로그인/회원가입 실패: ${error.message || '알 수 없는 오류'}`,
        );
        }
    }

    async completeOnboarding(dto: OnboardDto): Promise<AuthTokenResponseDto> {
        try {
            // Verify the Firebase token
            const decoded = await this.firebaseApp
                .auth()
                .verifyIdToken(dto.idToken);
            const firebaseUid = decoded.uid;

            // Check if user already exists
            const existingUser = await this.prismaService.user.findUnique({
                where: { firebaseUid },
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
            const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
            const encryptedPhone = encrypt(dto.phone, encryptionKey);

            // Create new user with full onboarding data
            const user = await this.prismaService.user.create({
                data: {
                    firebaseUid,
                    authProvider: dto.authProvider,
                    email: dto.email,
                    name: dto.name,
                    phone: encryptedPhone,
                    githubId: dto.githubId,
                    profileImageUrl: dto.profileImageUrl,
                    techStacks: dto.techStacks || [],
                    positions: dto.positions || [],
                    proficiency: dto.proficiency || 'UNKNOWN',
                    portfolio: dto.portfolio ?? null,
                },
            });

            const accessToken = this.generateJwtToken(user.id);
            // Decrypt phone number before returning
            const decryptedUser = {
                ...user,
                phone: decrypt(user.phone, encryptionKey),
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
