/**
 * Utility functions for validation and sanitization
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

export const validatePaginationParams = (page: string, limit: string) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    throw new Error('Page must be a positive number');
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new Error('Limit must be between 1 and 100');
  }
  
  return { pageNum, limitNum };
};

export const validateUserData = (data: { name?: string; email?: string }) => {
  const errors: string[] = [];
  
  if (data.name !== undefined) {
    const sanitizedName = sanitizeString(data.name);
    if (sanitizedName.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    if (sanitizedName.length > 100) {
      errors.push('Name must be less than 100 characters');
    }
  }
  
  if (data.email !== undefined) {
    if (!isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }
  }
  
  return errors;
}; 