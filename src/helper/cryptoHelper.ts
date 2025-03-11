import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import ENV_PROP from '../config/config';
import { CryptoReqRes } from '../types/internalType';

export function encrypt(
  text: any,
  iv: Buffer | string = randomBytes(16)
): CryptoReqRes {
  iv = typeof iv === 'string' ? Buffer.from(iv, 'hex') : iv;
  const cipher = createCipheriv(
    ENV_PROP.CRYPTO_ALGO,
    ENV_PROP.CRYPTO_SECRET,
    iv
  );
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  };
}

export function decrypt(hash: CryptoReqRes): any {
  const decipher = createDecipheriv(
    ENV_PROP.CRYPTO_ALGO,
    ENV_PROP.CRYPTO_SECRET,
    Buffer.from(hash.iv, 'hex')
  );
  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ]);
  return decrpyted.toString();
}
