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
      throw new UnauthorizedException('No token provided');
    }
    const token = authHeader.split(' ')[1];

    if (token.startsWith('uid:') && process.env.NODE_ENV === 'local') {
      const uid = token.split(':')[1];
      const user = await this.userRepository.findById(uid);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = user;
      return true;
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');

      const payload = jwt.verify(token, secret) as { uid: string };
      const user = await this.userRepository.findById(payload.uid);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      request.user = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
