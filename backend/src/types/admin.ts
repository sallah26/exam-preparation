import { Admin } from '@prisma/client';

// Base Admin type from Prisma
export type AdminModel = Admin;

// DTOs for API requests
export interface AdminRegisterDto {
  fullName: string;
  email: string;
  password: string;
}

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminUpdateDto {
  fullName?: string;
  email?: string;
  isActive?: boolean;
}

// Response types
export interface AdminResponse {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminRegisterResponse {
  admin: AdminResponse;
  message: string;
}

export interface AdminsListResponse {
  admins: AdminResponse[];
  total: number;
  page: number;
  limit: number;
}

// Query parameters for list endpoint
export interface GetAdminsQuery {
  page?: string;
  limit?: string;
  search?: string;
  isActive?: string;
} 