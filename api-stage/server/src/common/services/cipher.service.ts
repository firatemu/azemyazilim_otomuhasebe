import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class CipherService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly secretKey: string;

    constructor(private configService: ConfigService) {
        this.secretKey = this.configService.get<string>('ENCRYPTION_KEY') || 'default-secret-key-must-be-32-chars';
    }

    async encrypt(text: string): Promise<string> {
        const iv = randomBytes(16);
        const salt = 'salt'; // In production, use a unique salt or derive properly
        const key = (await promisify(scrypt)(this.secretKey, salt, 32)) as Buffer;
        const cipher = createCipheriv(this.algorithm, key, iv);

        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();

        // Format: v1:iv_hex:tag_hex:ciphertext_hex
        return `v1:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
    }

    async decrypt(encryptedText: string): Promise<string> {
        // Handle legacy JSON format temporarily if needed, or strictly enforce new format.
        // Given "Foundation" phase, we enforce strict new format but handle errors gracefully.

        const parts = encryptedText.split(':');

        // Basic format check
        if (parts.length !== 4 || parts[0] !== 'v1') {
            // Fallback to legacy JSON parsing if valid, else throw
            try {
                const legacy = JSON.parse(encryptedText);
                if (legacy.iv && legacy.content && legacy.tag) {
                    return this.decryptLegacy(legacy);
                }
            } catch (e) {
                // Not JSON, throw error below
            }
            throw new Error('Invalid encryption format or unsupported version');
        }

        const [version, ivHex, tagHex, contentHex] = parts;

        const salt = 'salt';
        const key = (await promisify(scrypt)(this.secretKey, salt, 32)) as Buffer;
        const decipher = createDecipheriv(this.algorithm, key, Buffer.from(ivHex, 'hex'));

        decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

        const decrypted = Buffer.concat([decipher.update(Buffer.from(contentHex, 'hex')), decipher.final()]);

        return decrypted.toString('utf8');
    }

    private async decryptLegacy(legacy: { iv: string; content: string; tag: string }): Promise<string> {
        const key = (await promisify(scrypt)(this.secretKey, 'salt', 32)) as Buffer;
        const decipher = createDecipheriv(this.algorithm, key, Buffer.from(legacy.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(legacy.tag, 'hex'));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(legacy.content, 'hex')), decipher.final()]);
        return decrypted.toString('utf8');
    }
}
