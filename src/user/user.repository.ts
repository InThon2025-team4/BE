import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { decrypt } from '../libs/crypto';

@Injectable()
export class UserRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Decrypts phone number in user object
     */
    private decryptUserPhone(user: User | null): User | null {
        if (!user || !user.phone) return user;
        
        try {
            const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
            if (!encryptionKey) {
                console.warn('ENCRYPTION_KEY not configured, returning encrypted phone');
                return user;
            }
            return {
                ...user,
                phone: decrypt(user.phone, encryptionKey),
            };
        } catch (error) {
            console.warn('Failed to decrypt phone number:', error.message);
            console.warn('Returning user with encrypted phone');
            return user;
        }
    }

    async findById(uid: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: uid },
        });
        return this.decryptUserPhone(user);
    }

    async findBySupabaseUid(supabaseUid: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { supabaseUid },
        });
        return this.decryptUserPhone(user);
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        const user = await this.prisma.user.update({
            where: { id },
            data,
        });
        return this.decryptUserPhone(user);
    }
}