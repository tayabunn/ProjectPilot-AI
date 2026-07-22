import { IProject } from '../models/Project';

export interface ProjectResponseDTO {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  priority: string;
  status: string;
  riskScore: number;
  thumbnail: string;
  createdAt: string;
}

export class ProjectDTO {
  public static transform(project: IProject): ProjectResponseDTO {
    return {
      id: (project._id as any)?.toString() || '',
      name: project.name,
      description: project.description || '',
      repoUrl: project.repoUrl || '',
      priority: project.priority,
      status: project.status,
      riskScore: project.riskScore,
      thumbnail: project.thumbnail || '🚀',
      createdAt: project.createdAt.toISOString()
    };
  }

  public static transformMany(projects: IProject[]): ProjectResponseDTO[] {
    return projects.map(p => this.transform(p));
  }
}
