import { encryptSecret, decryptSecret } from "@/server/lib/mailer/crypto";

/**
 * ISP: secret-protection seam (DIP). AES-GCM today; rotate without touching callers (OCP).
 */
export interface ISecretCipher {
  encrypt(plain: string): string;
  decrypt(payload: string): string;
}

export class AesGcmSecretCipher implements ISecretCipher {
  encrypt(plain: string): string {
    return encryptSecret(plain);
  }
  decrypt(payload: string): string {
    return decryptSecret(payload);
  }
}
