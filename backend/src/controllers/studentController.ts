import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

// Get all exam types (public)
export const getExamTypes = async (req: Request, res: Response) => {
  try {
    const examTypes = await prisma.examType.findMany({
      include: {
        departments: {
          include: {
            academicPeriods: {
              include: {
                materials: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: examTypes
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get departments by exam type (public)
export const getDepartmentsByExamType = async (req: Request, res: Response) => {
  try {
    const { examTypeId } = req.params;
    
    if (!examTypeId) {
      return res.status(400).json({
        success: false,
        message: 'Exam Type ID is required'
      });
    }
    
    const departments = await prisma.department.findMany({
      where: { examTypeId },
      include: {
        academicPeriods: {
          include: {
            materials: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: departments
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get academic periods by department (public)
export const getAcademicPeriodsByDepartment = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;
    
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required'
      });
    }
    
    const academicPeriods = await prisma.academicPeriod.findMany({
      where: { departmentId },
      include: {
        materials: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: academicPeriods
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get materials by academic period (public)
export const getMaterialsByAcademicPeriod = async (req: Request, res: Response) => {
  try {
    const { academicPeriodId } = req.params;
    
    if (!academicPeriodId) {
      return res.status(400).json({
        success: false,
        message: 'Academic Period ID is required'
      });
    }
    
    const materials = await prisma.material.findMany({
      where: { academicPeriodId },
      include: {
        documents: true,
        questions: {
          include: {
            options: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: materials
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get material content (public)
export const getMaterialContent = async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    
    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }
    
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        documents: true,
        questions: {
          include: {
            options: true
          }
        }
      }
    });
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    return res.json({
      success: true,
      data: material
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Serve document files (public)
export const serveDocument = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }
    
    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.resolve(__dirname, '../../../uploads', sanitizedFilename);
    const uploadsDir = path.resolve(__dirname, '../../../uploads');
    
    // Ensure the file is within the uploads directory
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file path'
      });
    }
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      console.log('Files in uploads directory:', fs.readdirSync(uploadsDir));
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Get file stats and set appropriate headers
    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    // Set content type based on file extension
    const contentTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send file
    return res.sendFile(filePath);
  } catch (error: any) {
    console.error('Error serving document:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 