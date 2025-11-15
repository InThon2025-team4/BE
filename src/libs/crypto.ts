import { createHash, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-cbc';

function getKeyAndIV(secret: string): { key: Buffer; iv: Buffer } {
  const hash = createHash('sha256').update(secret).digest();
  const key = hash.subarray(0, 32);
  const iv = hash.subarray(0, 16);
  return { key, iv };
}

export function encrypt(text: string, secret: string): string {
  if (!text) return text;
  
  const { key, iv } = getKeyAndIV(secret);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(encrypted: string, secret: string): string {
  if (!encrypted) return encrypted;
  
  const { key, iv } = getKeyAndIV(secret);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}
