// Daily AI Standup Generation Service
// Automatically generates daily standup updates based on project state and task updates.

export interface DailyStandupResult {
  date: string;
  completedYesterday: Array<{
    id: string;
    title: string;
    storyPoints: number;
  }>;
  plannedToday: Array<{
    id: string;
    title: string;
    priority: string;
    storyPoints: number;
  }>;
  risksAndBlockers: Array<{
    id: string;
    title: string;
    reason: string;
    severity: 'medium' | 'high' | 'critical';
  }>;
  suggestedFocus: {
    taskId?: string;
    title: string;
    reasoning: string;
  };
  summary: string;
}

export function generateDailyStandup(tasks: any[], project: any): DailyStandupResult {
  const completedYesterday = tasks
    .filter(t => t.status === 'done')
    .slice(0, 5)
    .map(t => ({
      id: t._id?.toString() || t.id,
      title: t.title,
      storyPoints: t.storyPoints || 2
    }));

  const plannedToday = tasks
    .filter(t => t.status === 'in-progress' || t.status === 'todo')
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
    })
    .slice(0, 5)
    .map(t => ({
      id: t._id?.toString() || t.id,
      title: t.title,
      priority: t.priority || 'medium',
      storyPoints: t.storyPoints || 2
    }));

  const risksAndBlockers: Array<{ id: string; title: string; reason: string; severity: 'medium' | 'high' | 'critical' }> = [];
  
  tasks.forEach(t => {
    if (t.status !== 'done' && t.dependencies && t.dependencies.length > 0) {
      const incompleteDeps = t.dependencies.filter((depId: any) => {
        const depTask = tasks.find(dep => dep._id?.toString() === depId.toString());
        return depTask && depTask.status !== 'done';
      });
      if (incompleteDeps.length > 0) {
        risksAndBlockers.push({
          id: t._id?.toString() || t.id,
          title: t.title,
          reason: `Blocked by ${incompleteDeps.length} incomplete prerequisite task${incompleteDeps.length > 1 ? 's' : ''}`,
          severity: t.priority === 'urgent' || t.priority === 'high' ? 'critical' : 'high'
        });
      }
    } else if (t.priority === 'urgent' && t.status !== 'done') {
      risksAndBlockers.push({
        id: t._id?.toString() || t.id,
        title: t.title,
        reason: 'Urgent task pending resolution',
        severity: 'high'
      });
    }
  });

  // Determine top suggested focus
  let focusTask = plannedToday[0];
  let reasoning = 'Highest priority active task in current sprint queue.';

  const criticalBlocker = risksAndBlockers.find(r => r.severity === 'critical');
  if (criticalBlocker) {
    focusTask = tasks.find(t => (t._id?.toString() || t.id) === criticalBlocker.id);
    reasoning = 'Critical bottleneck resolving prerequisite blockers to unblock downstream engineering flow.';
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  return {
    date: todayStr,
    completedYesterday,
    plannedToday,
    risksAndBlockers: risksAndBlockers.slice(0, 5),
    suggestedFocus: {
      taskId: focusTask ? ((focusTask as any)._id?.toString() || focusTask.id) : undefined,
      title: focusTask ? focusTask.title : 'Sprint Backlog Planning',
      reasoning
    },
    summary: `Daily Standup Summary for ${project.name}: ${completedYesterday.length} completed, ${plannedToday.length} active in workflow, ${risksAndBlockers.length} flagged risks.`
  };
}
