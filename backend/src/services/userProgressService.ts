import { prisma } from '../prisma/client';
import { AuthenticationError } from '../modules/auth/utils/auth.errors';

export interface UserProgressInput {
  userId: string;
  materialId: string;
  timeSpent?: number;
  completed?: boolean;
}

export interface UserProgressStats {
  totalMaterials: number;
  completedMaterials: number;
  totalTimeSpent: number;
  recentActivity: {
    materialId: string;
    materialTitle: string;
    lastAccessed: Date;
    timeSpent: number;
    completed: boolean;
  }[];
}

export class UserProgressService {
  /**
   * Record or update user progress for a material
   */
  static async recordProgress(input: UserProgressInput): Promise<void> {
    const { userId, materialId, timeSpent = 0, completed = false } = input;

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    // Verify material exists
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      throw new Error('Material not found');
    }

    // Upsert progress record
    await prisma.userProgress.upsert({
      where: {
        userId_materialId: {
          userId,
          materialId,
        },
      },
      update: {
        timeSpent: {
          increment: timeSpent,
        },
        completed,
        lastAccessed: new Date(),
      },
      create: {
        userId,
        materialId,
        timeSpent,
        completed,
        lastAccessed: new Date(),
      },
    });
  }

  /**
   * Get user's progress statistics
   */
  static async getUserStats(userId: string): Promise<UserProgressStats> {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Get user progress with material details
    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            type: true,
            academicPeriod: {
              select: {
                name: true,
                department: {
                  select: {
                    name: true,
                    examType: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        lastAccessed: 'desc',
      },
    });

    // Calculate statistics
    const totalMaterials = userProgress.length;
    const completedMaterials = userProgress.filter(p => p.completed).length;
    const totalTimeSpent = userProgress.reduce((sum, p) => sum + p.timeSpent, 0);

    // Get recent activity (last 10 materials accessed)
    const recentActivity = userProgress.slice(0, 10).map(progress => ({
      materialId: progress.materialId,
      materialTitle: progress.material.title,
      lastAccessed: progress.lastAccessed,
      timeSpent: progress.timeSpent,
      completed: progress.completed,
    }));

    return {
      totalMaterials,
      completedMaterials,
      totalTimeSpent,
      recentActivity,
    };
  }

  /**
   * Get user's progress for a specific material
   */
  static async getMaterialProgress(userId: string, materialId: string) {
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_materialId: {
          userId,
          materialId,
        },
      },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            type: true,
            academicPeriod: {
              select: {
                name: true,
                department: {
                  select: {
                    name: true,
                    examType: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return progress;
  }

  /**
   * Get user's progress grouped by exam type
   */
  static async getProgressByExamType(userId: string) {
    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        material: {
          include: {
            academicPeriod: {
              include: {
                department: {
                  include: {
                    examType: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Group by exam type
    const examTypeGroups: { [key: string]: any } = {};

    userProgress.forEach(progress => {
      const examType = progress.material.academicPeriod.department.examType;
      const department = progress.material.academicPeriod.department;
      const period = progress.material.academicPeriod;

      if (!examTypeGroups[examType.id]) {
        examTypeGroups[examType.id] = {
          examType: {
            id: examType.id,
            name: examType.name,
          },
          departments: {},
          totalMaterials: 0,
          completedMaterials: 0,
          totalTimeSpent: 0,
        };
      }

      if (!examTypeGroups[examType.id].departments[department.id]) {
        examTypeGroups[examType.id].departments[department.id] = {
          department: {
            id: department.id,
            name: department.name,
          },
          periods: {},
          totalMaterials: 0,
          completedMaterials: 0,
          totalTimeSpent: 0,
        };
      }

      if (!examTypeGroups[examType.id].departments[department.id].periods[period.id]) {
        examTypeGroups[examType.id].departments[department.id].periods[period.id] = {
          period: {
            id: period.id,
            name: period.name,
          },
          materials: [],
          totalMaterials: 0,
          completedMaterials: 0,
          totalTimeSpent: 0,
        };
      }

      // Add material to period
      const periodGroup = examTypeGroups[examType.id].departments[department.id].periods[period.id];
      periodGroup.materials.push({
        id: progress.material.id,
        title: progress.material.title,
        type: progress.material.type,
        timeSpent: progress.timeSpent,
        completed: progress.completed,
        lastAccessed: progress.lastAccessed,
      });

      // Update counters
      periodGroup.totalMaterials++;
      examTypeGroups[examType.id].departments[department.id].totalMaterials++;
      examTypeGroups[examType.id].totalMaterials++;

      if (progress.completed) {
        periodGroup.completedMaterials++;
        examTypeGroups[examType.id].departments[department.id].completedMaterials++;
        examTypeGroups[examType.id].completedMaterials++;
      }

      periodGroup.totalTimeSpent += progress.timeSpent;
      examTypeGroups[examType.id].departments[department.id].totalTimeSpent += progress.timeSpent;
      examTypeGroups[examType.id].totalTimeSpent += progress.timeSpent;
    });

    // Convert to array and clean up nested objects
    const result = Object.values(examTypeGroups).map(examTypeGroup => ({
      ...examTypeGroup,
      departments: Object.values(examTypeGroup.departments).map((deptGroup: any) => ({
        ...deptGroup,
        periods: Object.values(deptGroup.periods),
      })),
    }));

    return result;
  }

  /**
   * Mark material as completed
   */
  static async markCompleted(userId: string, materialId: string): Promise<void> {
    await this.recordProgress({
      userId,
      materialId,
      completed: true,
    });
  }

  /**
   * Get leaderboard (top users by completed materials)
   */
  static async getLeaderboard(limit: number = 10) {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        userProgress: {
          select: {
            completed: true,
            timeSpent: true,
          },
        },
      },
    });

    // Calculate stats for each user
    const userStats = users.map(user => {
      const completedMaterials = user.userProgress.filter(p => p.completed).length;
      const totalTimeSpent = user.userProgress.reduce((sum, p) => sum + p.timeSpent, 0);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        completedMaterials,
        totalTimeSpent,
        totalMaterials: user.userProgress.length,
      };
    });

    // Sort by completed materials (descending) then by time spent (ascending)
    userStats.sort((a, b) => {
      if (b.completedMaterials !== a.completedMaterials) {
        return b.completedMaterials - a.completedMaterials;
      }
      return a.totalTimeSpent - b.totalTimeSpent;
    });

    return userStats.slice(0, limit);
  }
} 