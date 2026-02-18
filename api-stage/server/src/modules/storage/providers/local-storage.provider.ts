import { Injectable } from '@nestjs/common';
import { IStorageService } from '../interfaces/storage-service.interface';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class LocalStorageProvider implements IStorageService {
    private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';

    async uploadFile(params: {
        tenantId: string;
        file: Express.Multer.File;
        folder: string;
    }): Promise<string> {
        const { tenantId, file, folder } = params;
        const dir = path.join(this.uploadDir, tenantId, folder);
        await fs.ensureDir(dir);

        const filename = `${Date.now()}_${file.originalname}`;
        const filePath = path.join(dir, filename);

        await fs.writeFile(filePath, file.buffer);

        // Return relative path
        return path.join(tenantId, folder, filename);
    }

    async getFile(params: {
        tenantId: string;
        key: string;
    }): Promise<{ url: string; type: 'direct' | 'presigned' }> {
        const filePath = path.join(this.uploadDir, params.key);

        if (!(await fs.pathExists(filePath))) {
            throw new Error('File not found');
        }

        return {
            url: `/uploads/${params.key}`,
            type: 'direct',
        };
    }

    async deleteFile(params: {
        tenantId: string;
        key: string;
    }): Promise<void> {
        const filePath = path.join(this.uploadDir, params.key);
        await fs.remove(filePath);
    }

    async hardDeleteAllVersions(params: {
        tenantId: string;
        key: string;
    }): Promise<void> {
        // Local storage has no versioning, same as deleteFile
        await this.deleteFile(params);
    }

    async purgeTenantData(tenantId: string): Promise<{
        deletedCount: number;
        errors: string[];
    }> {
        const tenantDir = path.join(this.uploadDir, tenantId);
        const files = await this.listFilesRecursive(tenantDir);

        await fs.remove(tenantDir);

        return {
            deletedCount: files.length,
            errors: [],
        };
    }

    async listFiles(params: {
        tenantId: string;
        folder?: string;
    }): Promise<string[]> {
        const dir = params.folder
            ? path.join(this.uploadDir, params.tenantId, params.folder)
            : path.join(this.uploadDir, params.tenantId);

        return this.listFilesRecursive(dir);
    }

    private async listFilesRecursive(dir: string): Promise<string[]> {
        const files: string[] = [];

        if (!(await fs.pathExists(dir))) {
            return files;
        }

        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...(await this.listFilesRecursive(fullPath)));
            } else {
                files.push(fullPath);
            }
        }

        return files;
    }
}
