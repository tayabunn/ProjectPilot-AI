import Project, { IProject } from '../models/Project';

export class ProjectRepository {
  public static async findById(id: string): Promise<IProject | null> {
    return Project.findById(id);
  }

  public static async findAllByOwner(ownerId: string): Promise<IProject[]> {
    return Project.find({ ownerId }).sort({ createdAt: -1 });
  }

  public static async create(projectData: Partial<IProject>): Promise<IProject> {
    const project = new Project(projectData);
    return project.save();
  }

  public static async update(id: string, updates: Partial<IProject>): Promise<IProject | null> {
    return Project.findByIdAndUpdate(id, updates, { new: true });
  }

  public static async delete(id: string): Promise<IProject | null> {
    return Project.findByIdAndDelete(id);
  }
}
