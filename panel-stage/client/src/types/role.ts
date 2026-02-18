export interface Permission {
    id: string;
    module: string;
    action: string;
    description?: string;
}

export interface RolePermission {
    id: string;
    permissionId: string;
    permission: Permission;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    isSystemRole: boolean;
    tenantId: string;
    users: { id: string }[]; // Count usually sufficient for list, detailed for edit
    permissions: RolePermission[];
    _count?: {
        users: number;
    };
}

export interface CreateRoleData {
    name: string;
    description?: string;
    permissions: string[]; // Permission IDs
}

export interface UpdateRoleData {
    name?: string;
    description?: string;
    permissions?: string[]; // Permission IDs
}
