import { Request, Response, NextFunction } from 'express';
import { GithubService } from '../services/githubService';

export const getGithubData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const data = await GithubService.getGithubData(projectId);
    res.json({ success: true, github: data });
  } catch (error) {
    next(error);
  }
};

export const syncGithubData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const data = await GithubService.syncGithubRepository(projectId);
    res.json({ success: true, message: 'GitHub repository successfully synced', github: data });
  } catch (error) {
    next(error);
  }
};
