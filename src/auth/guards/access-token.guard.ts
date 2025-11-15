import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../../user/user.repository';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or invalid format');
    }
    
    const token = authHeader.split(' ')[1];

    if (token.startsWith('uid:') && process.env.NODE_ENV === 'local') {
      const uid = token.split(':')[1];
      const user = await this.userRepository.findById(uid);
      if (!user) {
        throw new UnauthorizedException('User not found with provided UID');
      }

      request.user = user;
      return true;
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const payload = jwt.verify(token, secret) as { uid: string };
      const user = await this.userRepository.findById(payload.uid);
      
      if (!user) {
        throw new UnauthorizedException(`User not found for uid: ${payload.uid}`);
      }
      
      request.user = user;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      console.error('Token verification error:', err);
      throw new UnauthorizedException(`Token verification failed: ${err.message}`);
    }
  }
}
