import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  uid: string;
}

export function sign(
  payload: JwtPayload,
  secret: string,
  options?: SignOptions,
): string {
  return jwt.sign(payload, secret, options);
}

export function verify<T = JwtPayload>(token: string, secret: string): T {
  try {
    return jwt.verify(token, secret) as T;
  } catch (err) {
    throw err;
  }
}
