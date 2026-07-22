import Project from '../models/Project';
import Task from '../models/Task';
import { Milestone, Roadmap } from '../models/Roadmap';
import SprintHistory from '../models/SprintHistory';
import mongoose from 'mongoose';

export interface IProjectHealth {
  score: number;
  status: 'Healthy' | 'At Risk' | 'Critical';
  statusColor: 'green' | 'yellow' | 'red';
  timelineRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  requirementCompleteness: number;
  sprintVelocity: 'Stable' | 'Declining' | 'Improving' | 'No Sprints';
  blockedTasks: number;
  technicalDebt: 'Low' | 'Medium' | 'High';
  confidence: number;
}

export const calculateProjectHealth = async (projectId: string | mongoose.Types.ObjectId): Promise<IProjectHealth> => {
  const projIdStr = projectId.toString();
  const project = await Project.findById(projIdStr);
  if (!project) {
    throw new Error('Project not found');
  }

  const tasks = await Task.find({ projectId: projIdStr });
  const sprints = await SprintHistory.find({ projectId: projIdStr }).sort({ startDate: 1 });
  const roadmap = await Roadmap.findOne({ projectId: projIdStr });
  let milestones: any[] = [];
  if (roadmap) {
    milestones = await Milestone.find({ roadmapId: roadmap._id });
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done');

  // 1. Requirement / Project Completeness
  const totalSP = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completedSP = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  let requirementCompleteness = 0;
  if (totalSP > 0) {
    requirementCompleteness = Math.round((completedSP / totalSP) * 100);
  } else if (totalTasks > 0) {
    requirementCompleteness = Math.round((completedTasks.length / totalTasks) * 100);
  }

  // Map tasks for quick lookup
  const taskMap = new Map<string, any>();
  tasks.forEach(t => taskMap.set(t._id.toString(), t));

  // 2. Blocked Tasks (tasks that are not done and have incomplete dependencies)
  let blockedTasksCount = 0;
  tasks.forEach(t => {
    if (t.status !== 'done') {
      const isBlocked = t.dependencies?.some(depId => {
        const depTask = taskMap.get(depId.toString());
        return depTask && depTask.status !== 'done';
      });
      if (isBlocked) {
        blockedTasksCount++;
      }
    }
  });

  // 3. Overdue Tasks
  // Incomplete tasks where parent milestone targetDate has passed, project deadline has passed,
  // or task is older than 14 days and still not done
  const overdueMilestoneIds = new Set(
    milestones
      .filter(m => m.targetDate && new Date(m.targetDate) < new Date() && m.status !== 'completed' && m.progress < 100)
      .map(m => m._id.toString())
  );

  let overdueTasksCount = 0;
  const now = new Date().getTime();
  tasks.forEach(t => {
    if (t.status !== 'done') {
      const isLinkedToOverdueMilestone = t.milestoneId && overdueMilestoneIds.has(t.milestoneId.toString());
      const isProjectOverdue = project.deadline && new Date(project.deadline) < new Date();
      const isOldTask = (now - new Date(t.createdAt).getTime()) > 14 * 24 * 60 * 60 * 1000;

      if (isLinkedToOverdueMilestone || isProjectOverdue || isOldTask) {
        overdueTasksCount++;
      }
    }
  });

  // 4. Sprint Velocity Trend
  const completedSprints = sprints.filter(s => s.status === 'completed');
  let sprintVelocity: 'Stable' | 'Declining' | 'Improving' | 'No Sprints' = 'Stable';

  if (completedSprints.length === 0) {
    sprintVelocity = 'No Sprints';
  } else if (completedSprints.length === 1) {
    const ratio = completedSprints[0].totalPoints > 0
      ? completedSprints[0].completedPoints / completedSprints[0].totalPoints
      : 1;
    sprintVelocity = ratio >= 0.75 ? 'Stable' : 'Declining';
  } else {
    const last = completedSprints[completedSprints.length - 1];
    const prev = completedSprints[completedSprints.length - 2];

    const lastRatio = last.totalPoints > 0 ? last.completedPoints / last.totalPoints : 1;
    const prevRatio = prev.totalPoints > 0 ? prev.completedPoints / prev.totalPoints : 1;

    if (lastRatio > prevRatio + 0.1) {
      sprintVelocity = 'Improving';
    } else if (lastRatio < prevRatio - 0.1) {
      sprintVelocity = 'Declining';
    } else {
      sprintVelocity = 'Stable';
    }
  }

  // 5. Dependency Graph Complexity (DFS cycle check)
  let hasCycle = false;
  const visited = new Set<string>();
  const recStack = new Set<string>();

  const checkCycle = (taskId: string): boolean => {
    visited.add(taskId);
    recStack.add(taskId);

    const task = taskMap.get(taskId);
    if (task && task.dependencies) {
      for (const depId of task.dependencies) {
        const depStr = depId.toString();
        if (!visited.has(depStr)) {
          if (checkCycle(depStr)) return true;
        } else if (recStack.has(depStr)) {
          return true;
        }
      }
    }

    recStack.delete(taskId);
    return false;
  };

  for (const taskId of taskMap.keys()) {
    if (!visited.has(taskId)) {
      if (checkCycle(taskId)) {
        hasCycle = true;
        break;
      }
    }
  }

  // 6. Technical Debt
  const reviewTasksCount = tasks.filter(t => t.status === 'review').length;
  const backlogTasksCount = tasks.filter(t => t.status === 'backlog').length;
  const doneTasksCount = tasks.filter(t => t.status === 'done').length;

  let technicalDebt: 'Low' | 'Medium' | 'High' = 'Low';
  if (reviewTasksCount > totalTasks * 0.25 || (totalTasks > 5 && doneTasksCount === 0)) {
    technicalDebt = 'High';
  } else if (backlogTasksCount > doneTasksCount * 2 && doneTasksCount > 0) {
    technicalDebt = 'Medium';
  }

  // 7. Timeline Risk
  let timelineRisk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  const daysRemaining = project.deadline
    ? (new Date(project.deadline).getTime() - now) / (1000 * 60 * 60 * 24)
    : null;

  if (daysRemaining !== null) {
    if (daysRemaining < 0 && completedTasks.length < totalTasks) {
      timelineRisk = 'Critical';
    } else if (daysRemaining < 7 && completedTasks.length < totalTasks * 0.8) {
      timelineRisk = 'High';
    } else if (daysRemaining < 14) {
      timelineRisk = 'Medium';
    }
  }

  if (timelineRisk !== 'Critical' && timelineRisk !== 'High') {
    if (blockedTasksCount > 3 || overdueTasksCount > 3 || project.riskScore > 60) {
      timelineRisk = 'High';
    } else if (blockedTasksCount > 0 || overdueTasksCount > 0 || project.riskScore > 30) {
      timelineRisk = 'Medium';
    }
  }

  // 8. Confidence Rate
  let confidence = 95;
  if (sprints.length === 0) confidence -= 10;
  if (blockedTasksCount > 0) confidence -= Math.min(20, blockedTasksCount * 5);
  if (overdueTasksCount > 0) confidence -= Math.min(25, overdueTasksCount * 5);
  if (sprintVelocity === 'Declining') confidence -= 15;
  if (technicalDebt === 'High') confidence -= 10;
  if (confidence < 50) confidence = 50;

  // 9. Composite Health Score Calculation (0-100)
  let score = 100;
  score -= Math.min(25, blockedTasksCount * 8);
  score -= Math.min(30, overdueTasksCount * 10);

  if (timelineRisk === 'Critical') score -= 35;
  else if (timelineRisk === 'High') score -= 20;
  else if (timelineRisk === 'Medium') score -= 8;

  if (sprintVelocity === 'Declining') score -= 15;

  if (technicalDebt === 'High') score -= 15;
  else if (technicalDebt === 'Medium') score -= 5;

  score = Math.max(0, Math.min(100, score));

  let status: 'Healthy' | 'At Risk' | 'Critical' = 'Healthy';
  let statusColor: 'green' | 'yellow' | 'red' = 'green';

  if (score < 50) {
    status = 'Critical';
    statusColor = 'red';
  } else if (score < 80) {
    status = 'At Risk';
    statusColor = 'yellow';
  }

  return {
    score,
    status,
    statusColor,
    timelineRisk,
    requirementCompleteness,
    sprintVelocity,
    blockedTasks: blockedTasksCount,
    technicalDebt,
    confidence
  };
};
