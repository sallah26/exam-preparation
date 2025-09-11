import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

// Get all exam types
export const getExamTypes = async (req: Request, res: Response) => {
  try {
    const examTypes = await prisma.examType.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: examTypes
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get departments by exam type
export const getDepartmentsByExamType = async (req: Request, res: Response) => {
  try {
    const { examTypeId } = req.params;
    
    if (!examTypeId) {
      return res.status(400).json({
        success: false,
        message: 'Exam type ID is required'
      });
    }
    
    const departments = await prisma.department.findMany({
      where: { examTypeId },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: departments
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get academic periods by department
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
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: academicPeriods
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get materials by academic period
export const getMaterialsByAcademicPeriod = async (req: Request, res: Response) => {
  try {
    const { academicPeriodId } = req.params;
    
    if (!academicPeriodId) {
      return res.status(400).json({
        success: false,
        message: 'Academic period ID is required'
      });
    }
    
    const materials = await prisma.material.findMany({
      where: { academicPeriodId },
      include: {
        document: true,
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
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get material content (document or questions)
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
        document: true,
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
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Download/serve document file
export const serveDocument = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }
    
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    return res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 