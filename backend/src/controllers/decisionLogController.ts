import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import DecisionLog from '../models/DecisionLog';
import Project from '../models/Project';

// Get AI decision logs for a project
export const getDecisionLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const logs = await DecisionLog.find({ projectId }).sort({ timestamp: -1 });
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new AI decision log entry
export const createDecisionLog = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, title, category, reason, confidence, impact } = req.body;
    if (!projectId || !title || !reason) {
      return res.status(400).json({ error: 'projectId, title, and reason are required' });
    }

    const log = new DecisionLog({
      projectId,
      title,
      category: category || 'prioritization',
      reason,
      confidence: confidence || 90,
      impact: impact || 'medium',
      timestamp: new Date()
    });

    await log.save();
    res.status(201).json({ success: true, log });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
