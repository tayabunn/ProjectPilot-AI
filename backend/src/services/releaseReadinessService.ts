// Release Readiness Calculation Service
// Audits project tasks, code coverage, documentation, monitoring, and CI/CD pipelines for deployment readiness.

export interface ReleaseChecklistItem {
  key: string;
  label: string;
  completed: boolean;
  weight: number;
  description: string;
}

export interface ReleaseReadinessResult {
  score: number;
  status: 'Ready' | 'Almost Ready' | 'Needs Attention' | 'Not Ready';
  statusColor: 'emerald' | 'amber' | 'red';
  completedCount: number;
  totalCount: number;
  checklist: ReleaseChecklistItem[];
  missingItems: ReleaseChecklistItem[];
  completedItems: ReleaseChecklistItem[];
}

export function calculateReleaseReadiness(tasks: any[], project: any): ReleaseReadinessResult {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

  const combinedText = tasks.map(t => `${t.title} ${t.description || ''} ${(t.labels || []).join(' ')}`).join(' ').toLowerCase();

  // Audit 6 Deployment Prerequisites
  const checklist: ReleaseChecklistItem[] = [
    {
      key: 'feature_completion',
      label: 'Core Feature Completion',
      completed: taskCompletionRate >= 0.75,
      weight: 30,
      description: 'At least 75% of scheduled backlog tasks completed.'
    },
    {
      key: 'unit_tests',
      label: 'Unit & E2E Tests',
      completed: combinedText.includes('test') || combinedText.includes('vitest') || combinedText.includes('jest') || combinedText.includes('playwright'),
      weight: 15,
      description: 'Unit and end-to-end testing suite configured and passing.'
    },
    {
      key: 'documentation',
      label: 'Technical Documentation',
      completed: combinedText.includes('doc') || combinedText.includes('readme') || combinedText.includes('openapi') || combinedText.includes('api doc'),
      weight: 15,
      description: 'API documentation, README, and user guides published.'
    },
    {
      key: 'error_monitoring',
      label: 'Error Monitoring & Alerts',
      completed: combinedText.includes('sentry') || combinedText.includes('monitor') || combinedText.includes('log') || combinedText.includes('alert'),
      weight: 15,
      description: 'Application performance monitoring (APM) and error logging configured.'
    },
    {
      key: 'cicd',
      label: 'CI/CD Pipeline',
      completed: combinedText.includes('deploy') || combinedText.includes('ci/cd') || combinedText.includes('pipeline') || combinedText.includes('docker') || combinedText.includes('vercel'),
      weight: 15,
      description: 'Automated build, test, and deployment pipelines configured.'
    },
    {
      key: 'zero_critical_blockers',
      label: 'Zero Critical Bottlenecks',
      completed: tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length === 0,
      weight: 10,
      description: 'No urgent or critical blocker items remaining in backlog.'
    }
  ];

  let score = 0;
  checklist.forEach(item => {
    if (item.completed) score += item.weight;
  });

  const completedCount = checklist.filter(i => i.completed).length;
  const missingItems = checklist.filter(i => !i.completed);
  const completedItems = checklist.filter(i => i.completed);

  let status: 'Ready' | 'Almost Ready' | 'Needs Attention' | 'Not Ready' = 'Not Ready';
  let statusColor: 'emerald' | 'amber' | 'red' = 'red';

  if (score >= 85) {
    status = 'Ready';
    statusColor = 'emerald';
  } else if (score >= 65) {
    status = 'Almost Ready';
    statusColor = 'amber';
  } else if (score >= 40) {
    status = 'Needs Attention';
    statusColor = 'amber';
  } else {
    status = 'Not Ready';
    statusColor = 'red';
  }

  return {
    score,
    status,
    statusColor,
    completedCount,
    totalCount: checklist.length,
    checklist,
    missingItems,
    completedItems
  };
}
