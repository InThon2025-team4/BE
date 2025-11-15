import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    PrismaModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
