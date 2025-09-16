import { AdminUser, CreateAdminData } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class SuperAdminApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message: string }> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  // Admin Management
  async getAllAdmins(): Promise<{ success: boolean; data?: AdminUser[]; message: string }> {
    const response = await this.makeRequest<{ admins: AdminUser[] }>('/api/super-admin/admins');
    
    // Extract the admins array from the nested structure
    if (response.success && response.data?.admins) {
      return {
        success: response.success,
        data: response.data.admins,
        message: response.message
      };
    }
    
    return {
      success: response.success,
      data: [],
      message: response.message
    };
  }

  async getAdminDetails(adminId: string): Promise<{ success: boolean; data?: AdminUser; message: string }> {
    return this.makeRequest<AdminUser>(`/api/super-admin/admins/${adminId}`);
  }

  async createAdmin(adminData: CreateAdminData): Promise<{ success: boolean; data?: AdminUser; message: string }> {
    return this.makeRequest<AdminUser>('/api/super-admin/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async updateAdmin(
    adminId: string, 
    updates: Partial<CreateAdminData & { isActive: boolean }>
  ): Promise<{ success: boolean; data?: AdminUser; message: string }> {
    return this.makeRequest<AdminUser>(`/api/super-admin/admins/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAdmin(adminId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/api/super-admin/admins/${adminId}`, {
      method: 'DELETE',
    });
  }

  // User Management
  async getAllUsers(params?: { 
    page?: number; 
    limit?: number; 
    search?: string 
  }): Promise<{ 
    success: boolean; 
    data?: { 
      users: any[]; 
      pagination: { page: number; limit: number; total: number; pages: number } 
    }; 
    message: string 
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    const endpoint = `/api/super-admin/users${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  async updateUserStatus(
    userId: string, 
    isActive: boolean
  ): Promise<{ success: boolean; data?: any; message: string }> {
    return this.makeRequest(`/api/super-admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  // System Statistics
  async getSystemStats(): Promise<{ 
    success: boolean; 
    data?: {
      stats: {
        admins: { total: number; active: number; superAdmins: number };
        users: { total: number; active: number };
        content: { examTypes: number; departments: number; materials: number };
      }
    }; 
    message: string 
  }> {
    return this.makeRequest('/api/super-admin/stats');
  }
}

export const superAdminApi = new SuperAdminApiService(); 