import { Request, Response, NextFunction } from 'express';
import { SprintPredictionService } from '../services/sprintPredictionService';
import { SmartAssignmentService } from '../services/smartAssignmentService';
import { ReprioritizationService } from '../services/reprioritizationService';

export const getBurndownPrediction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const data = await SprintPredictionService.getBurndownPrediction(projectId);
    res.json({ success: true, prediction: data });
  } catch (error) {
    next(error);
  }
};

export const getSmartAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const recommendation = await SmartAssignmentService.recommendAssignment(taskId);
    res.json({ success: true, recommendation });
  } catch (error) {
    next(error);
  }
};

export const triggerReprioritization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const { event } = req.body;
    const cascade = await ReprioritizationService.triggerCascadeReprioritization(projectId, event);
    res.json({ success: true, cascade });
  } catch (error) {
    next(error);
  }
};
