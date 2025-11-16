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
    
    console.log('Authorization header:', authHeader);
    
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }
    
    // Extract token from "Bearer <token>" format
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
    
    console.log('Extracted token:', token.substring(0, 50) + '...'); // Log first 50 chars

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
        console.error('JWT_SECRET not found in config');
        throw new Error('JWT_SECRET is not configured');
      }
      
      console.log('JWT_SECRET length:', secret.length);
      const payload = jwt.verify(token, secret) as { uid: string };
      console.log('JWT verification successful for uid:', payload.uid);
      
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
