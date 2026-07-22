// Requirement Gap Analysis Service
// Scans PRD text and generated tasks for coverage of standard software requirement categories.

interface GapCategory {
  name: string;
  description: string;
  keywords: string[];
  covered: boolean;
  confidence: number;
  evidence?: string;
}

export interface GapAnalysisResult {
  totalCategories: number;
  coveredCount: number;
  missingCount: number;
  coveragePercent: number;
  categories: GapCategory[];
}

const REQUIREMENT_CATEGORIES: Omit<GapCategory, 'covered' | 'confidence' | 'evidence'>[] = [
  {
    name: 'Authentication & Login',
    description: 'User authentication flows including signup, login, and session management',
    keywords: ['auth', 'login', 'signup', 'sign up', 'sign in', 'register', 'session', 'token', 'jwt', 'oauth', 'sso', 'credential']
  },
  {
    name: 'Password Reset',
    description: 'Password recovery, reset flows, and email verification',
    keywords: ['password reset', 'forgot password', 'recover', 'reset link', 'email verification', 'password recovery', 'change password']
  },
  {
    name: 'Error States & Handling',
    description: 'Error messages, validation feedback, fallback states, and loading indicators',
    keywords: ['error', 'validation', 'fallback', 'loading', 'empty state', 'toast', 'notification', 'alert', 'error handling', '404', '500', 'timeout', 'retry']
  },
  {
    name: 'Accessibility (a11y)',
    description: 'WCAG compliance, screen reader support, keyboard navigation, and ARIA labels',
    keywords: ['accessibility', 'a11y', 'wcag', 'screen reader', 'keyboard', 'aria', 'alt text', 'contrast', 'focus', 'tab order', 'assistive']
  },
  {
    name: 'Security',
    description: 'Input sanitization, CSRF/XSS protection, rate limiting, encryption, and data security',
    keywords: ['security', 'sanitize', 'csrf', 'xss', 'injection', 'encrypt', 'https', 'ssl', 'tls', 'rate limit', 'firewall', 'vulnerability', 'secure', 'hash']
  },
  {
    name: 'User Roles & Permissions',
    description: 'Role-based access control, admin/user permissions, and authorization levels',
    keywords: ['role', 'permission', 'admin', 'user role', 'rbac', 'authorization', 'access control', 'privilege', 'moderator', 'owner', 'member']
  },
  {
    name: 'Acceptance Criteria',
    description: 'Test cases, success criteria, definition of done, and QA requirements',
    keywords: ['acceptance criteria', 'test case', 'definition of done', 'given when then', 'success criteria', 'qa', 'quality assurance', 'test plan', 'regression']
  },
  {
    name: 'Performance & Scalability',
    description: 'Load times, caching strategies, optimization targets, and scalability requirements',
    keywords: ['performance', 'load time', 'cache', 'caching', 'optimize', 'scalab', 'latency', 'throughput', 'cdn', 'lazy load', 'pagination', 'bundle']
  },
  {
    name: 'Data Privacy & Compliance',
    description: 'GDPR, data retention policies, consent management, and privacy controls',
    keywords: ['privacy', 'gdpr', 'data retention', 'consent', 'cookie', 'personal data', 'compliance', 'regulation', 'pii', 'anonymize', 'right to delete']
  },
  {
    name: 'API Documentation',
    description: 'Endpoint documentation, request/response schemas, versioning, and developer guides',
    keywords: ['api doc', 'swagger', 'openapi', 'endpoint', 'schema', 'versioning', 'rest api', 'graphql', 'api reference', 'developer guide']
  },
  {
    name: 'Monitoring & Logging',
    description: 'Application monitoring, error tracking, logging infrastructure, and alerting',
    keywords: ['monitor', 'logging', 'log', 'sentry', 'alert', 'observability', 'metrics', 'dashboard', 'uptime', 'health check', 'tracing', 'apm']
  },
  {
    name: 'Deployment & CI/CD',
    description: 'Deployment pipelines, CI/CD configuration, staging environments, and rollback strategies',
    keywords: ['deploy', 'ci/cd', 'pipeline', 'staging', 'production', 'rollback', 'docker', 'kubernetes', 'github actions', 'jenkins', 'release', 'devops']
  }
];

export function runGapAnalysis(prdText: string, taskTitles: string[]): GapAnalysisResult {
  const combinedText = [prdText, ...taskTitles].join(' ').toLowerCase();

  const categories: GapCategory[] = REQUIREMENT_CATEGORIES.map(cat => {
    const matchedKeywords: string[] = [];

    for (const kw of cat.keywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
      }
    }

    const covered = matchedKeywords.length > 0;
    const confidence = covered
      ? Math.min(100, Math.round((matchedKeywords.length / cat.keywords.length) * 100) + 40)
      : 0;

    return {
      name: cat.name,
      description: cat.description,
      keywords: cat.keywords,
      covered,
      confidence,
      evidence: covered ? `Matched: ${matchedKeywords.join(', ')}` : undefined
    };
  });

  const coveredCount = categories.filter(c => c.covered).length;
  const missingCount = categories.length - coveredCount;

  return {
    totalCategories: categories.length,
    coveredCount,
    missingCount,
    coveragePercent: Math.round((coveredCount / categories.length) * 100),
    categories
  };
}
