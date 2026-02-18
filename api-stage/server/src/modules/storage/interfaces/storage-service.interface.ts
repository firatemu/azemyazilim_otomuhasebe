export interface IStorageService {
    /**
     * Upload a file to storage
     * @returns Object key or file path
     */
    uploadFile(params: {
        tenantId: string;
        file: Express.Multer.File;
        folder: string; // e.g., 'invoices', 'documents', 'images'
    }): Promise<string>;

    /**
     * Get a file URL (direct path for local, presigned URL for MinIO)
     */
    getFile(params: {
        tenantId: string;
        key: string;
    }): Promise<{ url: string; type: 'direct' | 'presigned' }>;

    /**
     * Delete a file (soft delete - creates delete marker if versioned)
     */
    deleteFile(params: {
        tenantId: string;
        key: string;
    }): Promise<void>;

    /**
     * Hard delete all versions of an object
     * Used for tenant purge - removes all versions permanently
     */
    hardDeleteAllVersions(params: {
        tenantId: string;
        key: string;
    }): Promise<void>;

    /**
     * Delete all objects under a tenant prefix
     * Used for complete tenant data purge
     */
    purgeTenantData(tenantId: string): Promise<{
        deletedCount: number;
        errors: string[];
    }>;

    /**
     * List all files for a tenant
     */
    listFiles(params: {
        tenantId: string;
        folder?: string;
    }): Promise<string[]>;
}
