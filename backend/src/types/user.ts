import { User } from '@prisma/client';

// Base User type from Prisma
export type UserModel = User;

// DTOs for API requests
export interface CreateUserDto {
  name: string;
  email: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

// Response types
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsersListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

// Query parameters for list endpoint
export interface GetUsersQuery {
  page?: string;
  limit?: string;
  search?: string;
} 