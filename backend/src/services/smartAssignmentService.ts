import Task from '../models/Task';

export interface ITeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  currentLoadSP: number;
  avatar: string;
}

export class SmartAssignmentService {
  private static teamMembers: ITeamMember[] = [
    {
      id: 'member-1',
      name: 'Alice',
      role: 'Senior Backend Engineer',
      skills: ['Node.js', 'Express', 'Stripe', 'Better Auth', 'Backend', 'Database', 'API', 'Security'],
      currentLoadSP: 8,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
    },
    {
      id: 'member-2',
      name: 'Bob',
      role: 'Frontend Architect',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'UI/UX', 'Frontend', 'Kanban', 'Recharts'],
      currentLoadSP: 12,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    },
    {
      id: 'member-3',
      name: 'Charlie',
      role: 'DevOps & Infrastructure Lead',
      skills: ['Docker', 'CI/CD', 'GitHub Actions', 'Cloudinary', 'Deployment', 'Monitoring', 'Sentry'],
      currentLoadSP: 6,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
    }
  ];

  static async getTeamMembers() {
    return this.teamMembers;
  }

  static async recommendAssignment(taskId: string) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const taskText = `${task.title} ${task.description || ''} ${task.labels?.join(' ') || ''}`.toLowerCase();

    let bestMember = this.teamMembers[0];
    let maxScore = -1;
    let matchReason = '';

    for (const member of this.teamMembers) {
      let score = 0;
      const matchedSkills: string[] = [];

      member.skills.forEach(skill => {
        if (taskText.includes(skill.toLowerCase())) {
          score += 3;
          matchedSkills.push(skill);
        }
      });

      // Factor in workload (prefer lower current load)
      score += Math.max(0, 10 - member.currentLoadSP);

      if (score > maxScore) {
        maxScore = score;
        bestMember = member;
        if (matchedSkills.length > 0) {
          matchReason = `Strong ${matchedSkills.join(' & ')} experience with optimal workload.`;
        } else {
          matchReason = `Available capacity (${member.currentLoadSP} SP current load) and relevant domain skills.`;
        }
      }
    }

    const confidenceScore = Math.min(98, 80 + maxScore * 2);

    return {
      taskId: task._id,
      taskTitle: task.title,
      recommendedAssignee: {
        id: bestMember.id,
        name: bestMember.name,
        role: bestMember.role,
        avatar: bestMember.avatar
      },
      reasoning: matchReason || `Strong ${bestMember.role.toLowerCase()} expertise.`,
      confidence: confidenceScore,
      allCandidates: this.teamMembers.map(m => ({
        name: m.name,
        role: m.role,
        loadSP: m.currentLoadSP
      }))
    };
  }
}
