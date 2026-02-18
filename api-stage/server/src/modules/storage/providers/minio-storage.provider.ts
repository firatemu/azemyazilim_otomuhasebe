import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { IStorageService } from '../interfaces/storage-service.interface';
import * as Minio from 'minio';
import { TenantContextService } from '../../../common/services/tenant-context.service';

@Injectable()
export class MinIOStorageProvider implements IStorageService, OnModuleInit {
    private readonly logger = new Logger(MinIOStorageProvider.name);
    private client: Minio.Client;
    private readonly bucketName = process.env.MINIO_BUCKET || 'otomuhasebe';

    constructor(private readonly tenantContext: TenantContextService) {
        this.client = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'minio',
            port: parseInt(process.env.MINIO_PORT || '9000'),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY,
        });
    }

    async onModuleInit() {
        try {
            // Ensure bucket exists
            const exists = await this.client.bucketExists(this.bucketName);

            if (!exists) {
                await this.client.makeBucket(this.bucketName);
                this.logger.log(`✅ Bucket '${this.bucketName}' created`);
            }

            // Enable versioning
            await this.client.setBucketVersioning(this.bucketName, {
                Status: 'Enabled',
            });
            this.logger.log(`✅ Versioning enabled for '${this.bucketName}'`);
        } catch (error) {
            this.logger.error(`❌ MinIO initialization failed: ${error.message}`);
            throw error;
        }
    }

    async uploadFile(params: {
        tenantId?: string; // Optional, defaults to context
        file: Express.Multer.File;
        folder: string;
    }): Promise<string> {
        let { tenantId } = params;
        const { file, folder } = params;

        // Auto-resolve tenant if not passed (Strict Isolation)
        if (!tenantId) {
            tenantId = this.tenantContext.getTenantId();
        }

        // Fail-Fast: Security Guard
        if (!tenantId) {
            this.logger.error('Security Alert: Attempted file upload without Tenant Context.');
            throw new BadRequestException('Tenant context missing for storage operation.');
        }

        const objectKey = `${tenantId}/${folder}/${Date.now()}_${file.originalname}`;

        await this.client.putObject(
            this.bucketName,
            objectKey,
            file.buffer,
            file.size,
            {
                'Content-Type': file.mimetype,
                'X-Tenant-Id': tenantId,
            },
        );

        this.logger.log(`✅ Uploaded file: ${objectKey}`);
        return objectKey;
    }

    async getFile(params: {
        tenantId: string;
        key: string;
    }): Promise<{ url: string; type: 'direct' | 'presigned' }> {
        // Generate presigned URL (valid for 1 hour)
        const url = await this.client.presignedGetObject(
            this.bucketName,
            params.key,
            3600,
        );

        return {
            url,
            type: 'presigned',
        };
    }

    async deleteFile(params: {
        tenantId: string;
        key: string;
    }): Promise<void> {
        // Soft delete - creates a delete marker
        await this.client.removeObject(this.bucketName, params.key);
        this.logger.log(`🗑️ Soft deleted file: ${params.key}`);
    }

    async hardDeleteAllVersions(params: {
        tenantId: string;
        key: string;
    }): Promise<void> {
        const versions = await this.listObjectVersions(params.key);

        for (const version of versions) {
            await this.client.removeObject(this.bucketName, params.key, {
                versionId: version.versionId,
            });
        }

        this.logger.log(
            `💀 Hard deleted all versions of file: ${params.key} (${versions.length} versions)`,
        );
    }

    async purgeTenantData(tenantId: string): Promise<{
        deletedCount: number;
        errors: string[];
    }> {
        const prefix = `${tenantId}/`;
        const objectsStream = this.client.listObjectsV2(
            this.bucketName,
            prefix,
            true, // recursive
        );

        const objects: string[] = [];

        for await (const obj of objectsStream) {
            objects.push(obj.name);
        }

        let deletedCount = 0;
        const errors: string[] = [];

        for (const objectKey of objects) {
            try {
                // Hard delete all versions
                await this.hardDeleteAllVersions({ tenantId, key: objectKey });
                deletedCount++;
            } catch (error) {
                errors.push(`Failed to delete ${objectKey}: ${error.message}`);
            }
        }

        this.logger.warn(
            `💥 Purged tenant ${tenantId}: ${deletedCount} files deleted`,
        );

        return { deletedCount, errors };
    }

    async listFiles(params: {
        tenantId: string;
        folder?: string;
    }): Promise<string[]> {
        const prefix = params.folder
            ? `${params.tenantId}/${params.folder}/`
            : `${params.tenantId}/`;

        const objectsStream = this.client.listObjectsV2(
            this.bucketName,
            prefix,
            true,
        );

        const files: string[] = [];

        for await (const obj of objectsStream) {
            files.push(obj.name);
        }

        return files;
    }

    private async listObjectVersions(key: string): Promise<
        Array<{
            versionId: string;
            isLatest: boolean;
        }>
    > {
        const versions: Array<{ versionId: string; isLatest: boolean }> = [];

        const stream = this.client.listObjects(this.bucketName, key, false, {
            IncludeVersion: true,
        });

        for await (const obj of stream) {
            if (obj.versionId) {
                versions.push({
                    versionId: obj.versionId,
                    isLatest: obj.isLatest || false,
                });
            }
        }

        return versions;
    }
}
