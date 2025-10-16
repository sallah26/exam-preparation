import { getAuthJwtClient } from './auth-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  temporaryPassword?: string;
}

export interface Admin {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  creator?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface AdminStats {
  total: number;
  active: number;
  inactive: number;
  superAdmins: number;
}

export interface InviteAdminInput {
  fullName: string;
  email: string;
}

class SuperAdminApi {
  private getHeaders(): HeadersInit {
    const { token } = getAuthJwtClient();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Invite a new admin
   */
  async inviteAdmin(input: InviteAdminInput): Promise<ApiResponse<{ admin: Admin; temporaryPassword?: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/invite`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(input),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to invite admin:', error);
      return {
        success: false,
        message: 'Failed to invite admin. Please try again.',
      };
    }
  }

  /**
   * Get all admins
   */
  async getAllAdmins(): Promise<ApiResponse<Admin[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/admins`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      return {
        success: false,
        message: 'Failed to fetch admins. Please try again.',
      };
    }
  }

  /**
   * Get admin by ID
   */
  async getAdminById(adminId: string): Promise<ApiResponse<Admin>> {
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/admins/${adminId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch admin:', error);
      return {
        success: false,
        message: 'Failed to fetch admin details. Please try again.',
      };
    }
  }

  /**
   * Toggle admin status (activate/deactivate)
   */
  async toggleAdminStatus(adminId: string): Promise<ApiResponse<{ admin: Admin }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/admins/${adminId}/toggle-status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
      return {
        success: false,
        message: 'Failed to update admin status. Please try again.',
      };
    }
  }

  /**
   * Delete admin
   */
  async deleteAdmin(adminId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to delete admin:', error);
      return {
        success: false,
        message: 'Failed to delete admin. Please try again.',
      };
    }
  }

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/stats`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      return {
        success: false,
        message: 'Failed to fetch statistics. Please try again.',
      };
    }
  }
}

export const superAdminApi = new SuperAdminApi();
