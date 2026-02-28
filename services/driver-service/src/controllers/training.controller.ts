import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Driver Training and Resources Controller
 * Manages training materials, guidelines, and educational content for drivers
 */

// Training Material model
const TrainingMaterial = mongoose.model('TrainingMaterial', new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['onboarding', 'safety', 'customer_service', 'app_usage', 'vehicle_maintenance', 'regulations', 'tips_tricks'],
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'document', 'interactive', 'quiz', 'checklist'],
    required: true
  },
  content: {
    url: String,
    text: String,
    duration: Number, // in minutes for videos
    fileSize: Number // in MB
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  required: {
    type: Boolean,
    default: false // Is this mandatory training?
  },
  order: Number, // Display order
  thumbnail: String,
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

// Training Progress model
const TrainingProgress = mongoose.model('TrainingProgress', new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
    index: true
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingMaterial',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'expired'],
    default: 'not_started'
  },
  progress: {
    percentage: { type: Number, default: 0 },
    lastPosition: Number, // For videos
    attempts: { type: Number, default: 0 },
    score: Number // For quizzes
  },
  startedAt: Date,
  completedAt: Date,
  expiresAt: Date, // For materials that need renewal
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

// Quiz model
const Quiz = mongoose.model('Quiz', new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingMaterial',
    required: true
  },
  questions: [{
    question: String,
    type: { type: String, enum: ['multiple_choice', 'true_false', 'fill_blank'] },
    options: [String],
    correctAnswer: mongoose.Schema.Types.Mixed,
    explanation: String,
    points: { type: Number, default: 1 }
  }],
  passingScore: { type: Number, default: 70 },
  timeLimit: Number, // in minutes
  maxAttempts: Number,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}));

/**
 * Get all training materials
 */
export const getTrainingMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, type, difficulty, required, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (required !== undefined) query.required = required === 'true';
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const materials = await TrainingMaterial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await TrainingMaterial.countDocuments(query);
    
    res.status(200).json({
      materials,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch training materials' });
    return;
  }
};

/**
 * Get training material by ID
 */
export const getTrainingMaterialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const material = await TrainingMaterial.findById(id);
    
    if (!material) {
      res.status(404).json({ error: 'Training material not found' });
      return;
    }
    
    // Get associated quiz if exists
    const quiz = await Quiz.findOne({ materialId: id });
    
    res.status(200).json({
      material,
      hasQuiz: !!quiz,
      quiz: quiz ? {
        questionCount: quiz.questions.length,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit
      } : null
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch training material' });
    return;
  }
};

/**
 * Get driver's training progress
 */
export const getDriverProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    const { category } = req.query;
    
    // Get all required materials
    const query: any = {};
    if (category) query.category = category;
    
    const allMaterials = await TrainingMaterial.find(query);
    
    // Get driver's progress
    const progress = await TrainingProgress.find({ driverId })
      .populate('materialId', 'title category type required');
    
    // Calculate overall statistics
    const totalMaterials = allMaterials.length;
    const requiredMaterials = allMaterials.filter(m => m.required).length;
    const completedMaterials = progress.filter(p => p.status === 'completed').length;
    const completedRequired = progress.filter(p => 
      p.status === 'completed' && allMaterials.find(m => m._id.toString() === p.materialId.toString())?.required
    ).length;
    
    const overallPercentage = totalMaterials > 0 
      ? Math.round((completedMaterials / totalMaterials) * 100) 
      : 0;
    
    const requiredPercentage = requiredMaterials > 0 
      ? Math.round((completedRequired / requiredMaterials) * 100) 
      : 0;
    
    res.status(200).json({
      driverId,
      statistics: {
        totalMaterials,
        requiredMaterials,
        completedMaterials,
        completedRequired,
        overallPercentage,
        requiredPercentage,
        isFullyCompliant: requiredPercentage === 100
      },
      progress
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver progress' });
    return;
  }
};

/**
 * Start training material
 */
export const startTraining = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    const { materialId } = req.body;
    
    // Check if already started
    let progress = await TrainingProgress.findOne({ driverId, materialId });
    
    if (progress) {
      if (progress.status === 'completed') {
        res.status(400).json({ error: 'Training already completed' });
        return;
      }
      
      progress.status = 'in_progress';
      progress.updatedAt = new Date();
      await progress.save();
    } else {
      progress = new TrainingProgress({
        driverId,
        materialId,
        status: 'in_progress',
        startedAt: new Date()
      });
      await progress.save();
    }
    
    res.status(200).json(progress);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to start training' });
    return;
  }
};

/**
 * Update training progress
 */
export const updateProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId, materialId } = req.params;
    const { percentage, lastPosition } = req.body;
    
    const progress = await TrainingProgress.findOne({ driverId, materialId });
    
    if (!progress) {
      res.status(404).json({ error: 'Training progress not found' });
      return;
    }
    
    progress.progress.percentage = percentage;
    if (lastPosition !== undefined) {
      progress.progress.lastPosition = lastPosition;
    }
    
    // Auto-complete if 100%
    if (percentage >= 100 && progress.status !== 'completed') {
      progress.status = 'completed';
      progress.completedAt = new Date();
    }
    
    progress.updatedAt = new Date();
    await progress.save();
    
    res.status(200).json(progress);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
    return;
  }
};

/**
 * Submit quiz
 */
export const submitQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId, materialId } = req.params;
    const { answers } = req.body;
    
    const quiz = await Quiz.findOne({ materialId });
    
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }
    
    // Check progress
    let progress = await TrainingProgress.findOne({ driverId, materialId });
    
    if (!progress) {
      progress = new TrainingProgress({
        driverId,
        materialId,
        status: 'in_progress',
        startedAt: new Date()
      });
    }
    
    progress.progress.attempts += 1;
    
    // Check max attempts
    if (quiz.maxAttempts && progress.progress.attempts > quiz.maxAttempts) {
      res.status(400).json({ error: 'Maximum attempts exceeded' });
      return;
    }
    
    // Calculate score
    let correct = 0;
    let totalPoints = 0;
    
    const results = quiz.questions.map((question: any, index: number) => {
      totalPoints += question.points;
      const userAnswer = answers[index];
      const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer);
      
      if (isCorrect) {
        correct += question.points;
      }
      
      return {
        questionIndex: index,
        correct: isCorrect,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      };
    });
    
    const score = Math.round((correct / totalPoints) * 100);
    const passed = score >= quiz.passingScore;
    
    progress.progress.score = score;
    
    if (passed) {
      progress.status = 'completed';
      progress.completedAt = new Date();
      progress.progress.percentage = 100;
    }
    
    progress.updatedAt = new Date();
    await progress.save();
    
    res.status(200).json({
      passed,
      score,
      passingScore: quiz.passingScore,
      correct,
      total: totalPoints,
      attempts: progress.progress.attempts,
      maxAttempts: quiz.maxAttempts,
      results: passed ? results : results.map(r => ({ ...r, correctAnswer: undefined })) // Hide answers if failed
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit quiz' });
    return;
  }
};

/**
 * Get recommended training
 */
export const getRecommendedTraining = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    
    // Get driver's completed training
    const completed = await TrainingProgress.find({
      driverId,
      status: 'completed'
    }).select('materialId');
    
    const completedIds = completed.map(p => p.materialId);
    
    // Get required materials not completed
    const requiredNotCompleted = await TrainingMaterial.find({
      required: true,
      _id: { $nin: completedIds }
    }).limit(5);
    
    // Get recommended materials based on category (simple recommendation logic)
    const recommended = await TrainingMaterial.find({
      required: false,
      _id: { $nin: completedIds }
    })
      .sort({ order: 1 })
      .limit(5);
    
    res.status(200).json({
      required: requiredNotCompleted,
      recommended
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommended training' });
    return;
  }
};

/**
 * Create training material (Admin)
 */
export const createTrainingMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const material = new TrainingMaterial(req.body);
    await material.save();
    
    res.status(201).json(material);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create training material' });
    return;
  }
};

/**
 * Create quiz for material (Admin)
 */
export const createQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { materialId } = req.params;
    
    // Check if quiz already exists
    const existing = await Quiz.findOne({ materialId });
    
    if (existing) {
      res.status(400).json({ error: 'Quiz already exists for this material' });
      return;
    }
    
    const quiz = new Quiz({
      materialId,
      ...req.body
    });
    
    await quiz.save();
    
    res.status(201).json(quiz);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quiz' });
    return;
  }
};

/**
 * Get training statistics (Admin)
 */
export const getTrainingStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalDrivers = await TrainingProgress.distinct('driverId').countDocuments();
    const totalMaterials = await TrainingMaterial.countDocuments();
    
    const completionStats = await TrainingProgress.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const categoryStats = await TrainingMaterial.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const avgCompletionTime = await TrainingProgress.aggregate([
      {
        $match: { status: 'completed', completedAt: { $exists: true }, startedAt: { $exists: true } }
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ['$completedAt', '$startedAt'] },
              1000 * 60 // Convert to minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);
    
    res.status(200).json({
      overview: {
        totalDrivers,
        totalMaterials
      },
      completionStats,
      categoryStats,
      avgCompletionTime: avgCompletionTime[0]?.avgDuration || 0
    });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch training statistics' });
    return;
  }
};
