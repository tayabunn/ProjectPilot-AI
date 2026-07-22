import GithubSync from '../models/GithubSync';
import Project from '../models/Project';

export class GithubService {
  /**
   * Fetch synced GitHub data for project or seed mock data if none exists
   */
  static async getGithubData(projectId: string) {
    let syncData = await GithubSync.findOne({ projectId });

    if (!syncData) {
      syncData = await this.syncGithubRepository(projectId);
    }

    return syncData;
  }

  /**
   * Sync/refresh GitHub repository metadata (Issues, PRs, Commits, Branches)
   */
  static async syncGithubRepository(projectId: string) {
    const project = await Project.findById(projectId);
    const repoName = project ? `${project.name.toLowerCase().replace(/\s+/g, '-')}-repo` : 'project-repo';

    const now = new Date();

    const mockCommits = [
      {
        hash: 'c8f3a9b',
        message: 'feat: Add initial Next.js frontend structure and components',
        author: 'alex-dev',
        avatarUrl: 'https://github.com/identicons/alex-dev.png',
        branch: 'main',
        timestamp: new Date(now.getTime() - 25 * 60 * 1000)
      },
      {
        hash: 'e41d82f',
        message: 'fix: Resolve CORS middleware headers in Express backend',
        author: 'sarah-eng',
        avatarUrl: 'https://github.com/identicons/sarah-eng.png',
        branch: 'fix/cors-issue',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        hash: '90b12ca',
        message: 'refactor: Optimize release readiness calculation logic',
        author: 'tayab-lead',
        avatarUrl: 'https://github.com/identicons/tayab-lead.png',
        branch: 'feature/release-score',
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000)
      },
      {
        hash: '7a884fe',
        message: 'docs: Update API documentation and integration endpoints',
        author: 'alex-dev',
        avatarUrl: 'https://github.com/identicons/alex-dev.png',
        branch: 'main',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000)
      },
      {
        hash: '12ef45b',
        message: 'chore: Configure GitHub Actions CI workflow for test suite',
        author: 'devops-bot',
        avatarUrl: 'https://github.com/identicons/devops-bot.png',
        branch: 'main',
        timestamp: new Date(now.getTime() - 36 * 60 * 60 * 1000)
      }
    ];

    const mockPullRequests = [
      {
        id: 'pr-101',
        number: 42,
        title: 'feat(auth): Integrate Better Auth middleware & session validation',
        author: 'sarah-eng',
        avatarUrl: 'https://github.com/identicons/sarah-eng.png',
        status: 'open' as const,
        targetBranch: 'main',
        sourceBranch: 'feature/auth-integration',
        additions: 340,
        deletions: 45,
        reviewers: ['tayab-lead', 'alex-dev'],
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        isReviewRequested: true
      },
      {
        id: 'pr-102',
        number: 41,
        title: 'feat(payments): Setup Stripe checkout session controller & webhook routes',
        author: 'alex-dev',
        avatarUrl: 'https://github.com/identicons/alex-dev.png',
        status: 'open' as const,
        targetBranch: 'main',
        sourceBranch: 'feature/stripe-payments',
        additions: 512,
        deletions: 12,
        reviewers: ['sarah-eng'],
        createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
        isReviewRequested: false
      },
      {
        id: 'pr-100',
        number: 40,
        title: 'feat(ai): Implement AI Decision Log & Daily Standup prompt engine',
        author: 'tayab-lead',
        avatarUrl: 'https://github.com/identicons/tayab-lead.png',
        status: 'merged' as const,
        targetBranch: 'main',
        sourceBranch: 'feature/ai-standup',
        additions: 780,
        deletions: 98,
        reviewers: ['alex-dev', 'sarah-eng'],
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        mergedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        isReviewRequested: false
      },
      {
        id: 'pr-99',
        number: 39,
        title: 'refactor(db): Migration script for MongoDB indexes & schema models',
        author: 'sarah-eng',
        avatarUrl: 'https://github.com/identicons/sarah-eng.png',
        status: 'merged' as const,
        targetBranch: 'main',
        sourceBranch: 'refactor/db-schema',
        additions: 120,
        deletions: 89,
        reviewers: ['tayab-lead'],
        createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
        mergedAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
        isReviewRequested: false
      }
    ];

    const mockIssues = [
      {
        id: 'issue-1',
        number: 88,
        title: 'Bug: Stripe webhook signature validation failing on staging',
        state: 'open' as const,
        author: 'alex-dev',
        labels: ['bug', 'payments', 'p1'],
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000)
      },
      {
        id: 'issue-2',
        number: 87,
        title: 'Feature: Add release readiness checklist indicators',
        state: 'closed' as const,
        author: 'tayab-lead',
        labels: ['feature', 'ui'],
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
      }
    ];

    const mockBranches = ['main', 'develop', 'feature/auth-integration', 'feature/stripe-payments', 'fix/cors-issue'];

    const updatedData = await GithubSync.findOneAndUpdate(
      { projectId },
      {
        repoName,
        repoUrl: `https://github.com/org/${repoName}`,
        lastSyncedAt: new Date(),
        commits: mockCommits,
        pullRequests: mockPullRequests,
        issues: mockIssues,
        branches: mockBranches
      },
      { upsert: true, new: true }
    );

    return updatedData;
  }
}
