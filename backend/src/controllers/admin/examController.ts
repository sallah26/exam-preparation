import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Exam Types
export const createExamType = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    const examType = await prisma.examType.create({
      data: { name, description }
    });
    
    return res.status(201).json({
      success: true,
      data: examType
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getExamTypes = async (req: Request, res: Response) => {
  try {
    const examTypes = await prisma.examType.findMany({
      include: { departments: true },
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

export const updateExamType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }
    
    const examType = await prisma.examType.update({
      where: { id },
      data: { name, description }
    });
    
    return res.json({
      success: true,
      data: examType
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteExamType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }
    
    await prisma.examType.delete({
      where: { id }
    });
    
    return res.json({
      success: true,
      message: 'Exam type deleted successfully'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Departments
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { examTypeId } = req.params;
    const { name } = req.body;
    
    if (!examTypeId) {
      return res.status(400).json({
        success: false,
        message: 'Exam type ID is required'
      });
    }
    
    const department = await prisma.department.create({
      data: { name, examTypeId }
    });
    
    return res.status(201).json({
      success: true,
      data: department
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getDepartments = async (req: Request, res: Response) => {
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
      include: { academicPeriods: true },
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

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }
    
    const department = await prisma.department.update({
      where: { id },
      data: { name }
    });
    
    return res.json({
      success: true,
      data: department
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }
    
    await prisma.department.delete({
      where: { id }
    });
    
    return res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Academic Periods
export const createAcademicPeriod = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;
    const { name } = req.body;
    
    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required'
      });
    }
    
    const academicPeriod = await prisma.academicPeriod.create({
      data: { name, departmentId }
    });
    
    return res.status(201).json({
      success: true,
      data: academicPeriod
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAcademicPeriods = async (req: Request, res: Response) => {
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
      include: { materials: true },
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

export const updateAcademicPeriod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }
    
    const academicPeriod = await prisma.academicPeriod.update({
      where: { id },
      data: { name }
    });
    
    return res.json({
      success: true,
      data: academicPeriod
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteAcademicPeriod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }
    
    await prisma.academicPeriod.delete({
      where: { id }
    });
    
    return res.json({
      success: true,
      message: 'Academic period deleted successfully'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 