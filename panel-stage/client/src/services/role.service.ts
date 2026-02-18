import axiosInstance from '../lib/axios';
import { Role, CreateRoleData, UpdateRoleData, Permission } from '../types/role.ts'; // Ensure correct path

export const RoleService = {
    getRoles: async (): Promise<Role[]> => {
        const response = await axiosInstance.get('/roles');
        return response.data;
    },

    getRole: async (id: string): Promise<Role> => {
        const response = await axiosInstance.get(`/roles/${id}`);
        return response.data;
    },

    createRole: async (data: CreateRoleData): Promise<Role> => {
        const response = await axiosInstance.post('/roles', data);
        return response.data;
    },

    updateRole: async (id: string, data: UpdateRoleData): Promise<Role> => {
        const response = await axiosInstance.put(`/roles/${id}`, data);
        return response.data;
    },

    deleteRole: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/roles/${id}`);
    },

    getAllPermissions: async (): Promise<Permission[]> => {
        const response = await axiosInstance.get('/roles/permissions'); // Adjusted endpoint
        return response.data;
    },
};
