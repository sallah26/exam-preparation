import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const extension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG are allowed.'), false);
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Materials
export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { academicPeriodId } = req.params;
    const { title, type } = req.body;
    
    if (!academicPeriodId) {
      return res.status(400).json({
        success: false,
        message: 'Academic period ID is required'
      });
    }
    
    const material = await prisma.material.create({
      data: { title, type, academicPeriodId }
    });
    
    return res.status(201).json({
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

export const getMaterials = async (req: Request, res: Response) => {
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

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }
    
    // Get material to check if it has a document file to delete
    const material = await prisma.material.findUnique({
      where: { id },
      include: { document: true }
    });
    
    if (material?.document) {
      const filePath = path.join(__dirname, '../../../uploads', path.basename(material.document.filePath));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await prisma.material.delete({
      where: { id }
    });
    
    return res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Document upload
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const file = req.file;
    
    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const document = await prisma.document.create({
      data: {
        materialId,
        filePath: file.filename,
        fileType: file.mimetype,
        originalName: file.originalname
      }
    });
    
    return res.status(201).json({
      success: true,
      data: document
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Questions
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const { questionText, options } = req.body;
    
    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }
    
    const question = await prisma.question.create({
      data: {
        materialId,
        questionText,
        options: {
          create: options.map((option: any) => ({
            optionText: option.text,
            isCorrect: option.isCorrect
          }))
        }
      },
      include: {
        options: true
      }
    });
    
    return res.status(201).json({
      success: true,
      data: question
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    
    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }
    
    const questions = await prisma.question.findMany({
      where: { materialId },
      include: {
        options: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    return res.json({
      success: true,
      data: questions
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { questionText, options } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Question ID is required'
      });
    }
    
    // Delete existing options and create new ones
    await prisma.questionOption.deleteMany({
      where: { questionId: id }
    });
    
    const question = await prisma.question.update({
      where: { id },
      data: {
        questionText,
        options: {
          create: options.map((option: any) => ({
            optionText: option.text,
            isCorrect: option.isCorrect
          }))
        }
      },
      include: {
        options: true
      }
    });
    
    return res.json({
      success: true,
      data: question
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Question ID is required'
      });
    }
    
    await prisma.question.delete({
      where: { id }
    });
    
    return res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 