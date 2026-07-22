// Architecture Stack Recommendation Service
// Analyzes PRD text to recommend an optimal tech stack with reasoning for each choice.

interface StackOption {
  name: string;
  keywords: string[];
  reasoning: string;
  icon: string;
}

interface StackCategory {
  category: string;
  label: string;
  options: StackOption[];
  fallback: StackOption;
}

export interface StackRecommendation {
  category: string;
  label: string;
  recommended: string;
  reasoning: string;
  icon: string;
  confidence: number;
  matchedKeywords: string[];
}

export interface StackAnalysisResult {
  recommendations: StackRecommendation[];
  overallConfidence: number;
  prdSignals: number;
}

const STACK_CATEGORIES: StackCategory[] = [
  {
    category: 'frontend',
    label: 'Frontend',
    options: [
      {
        name: 'Next.js',
        keywords: ['next.js', 'nextjs', 'ssr', 'server side render', 'seo', 'static site', 'react', 'landing page', 'blog', 'marketing', 'e-commerce', 'dashboard'],
        reasoning: 'Next.js provides SSR/SSG for SEO, React ecosystem compatibility, API routes, and optimized performance out of the box. Ideal for production-grade applications requiring fast initial loads.',
        icon: '⚛️'
      },
      {
        name: 'Vite + React',
        keywords: ['spa', 'single page', 'vite', 'client side', 'real-time', 'interactive', 'game', 'canvas', 'webgl'],
        reasoning: 'Vite offers blazing-fast HMR and build times for SPAs. Best when SEO is not critical and the app is highly interactive with client-side routing.',
        icon: '⚡'
      },
      {
        name: 'Angular',
        keywords: ['angular', 'enterprise', 'typescript strict', 'large team', 'corporate', 'form heavy', 'complex forms'],
        reasoning: 'Angular provides opinionated architecture, dependency injection, and RxJS integration. Suited for large enterprise teams needing strict conventions.',
        icon: '🅰️'
      },
      {
        name: 'Vue.js + Nuxt',
        keywords: ['vue', 'nuxt', 'progressive', 'lightweight frontend'],
        reasoning: 'Vue offers a gentler learning curve with excellent documentation. Nuxt adds SSR capabilities similar to Next.js in the Vue ecosystem.',
        icon: '💚'
      }
    ],
    fallback: {
      name: 'Next.js',
      keywords: [],
      reasoning: 'Next.js is the safest default for most web applications — it combines React, SSR, API routes, and excellent DX with strong community support and Vercel deployment.',
      icon: '⚛️'
    }
  },
  {
    category: 'backend',
    label: 'Backend',
    options: [
      {
        name: 'Express.js',
        keywords: ['express', 'node', 'rest api', 'api', 'javascript', 'typescript', 'middleware', 'lightweight backend', 'microservice'],
        reasoning: 'Express is the most widely-adopted Node.js framework with extensive middleware ecosystem. Minimal overhead, maximum flexibility for REST APIs.',
        icon: '🟢'
      },
      {
        name: 'FastAPI (Python)',
        keywords: ['python', 'fastapi', 'machine learning', 'ml', 'ai model', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch'],
        reasoning: 'FastAPI provides auto-generated OpenAPI docs, async support, and seamless Python ML/AI library integration. Best when ML pipelines are core to the product.',
        icon: '🐍'
      },
      {
        name: 'NestJS',
        keywords: ['nestjs', 'nest', 'graphql', 'enterprise backend', 'modular', 'decorator', 'dependency injection'],
        reasoning: 'NestJS brings Angular-style architecture to Node.js with decorators, modules, and built-in GraphQL support. Excellent for large-scale structured backends.',
        icon: '🏗️'
      },
      {
        name: 'Django',
        keywords: ['django', 'admin panel', 'orm', 'python web', 'content management', 'cms'],
        reasoning: 'Django includes batteries: ORM, admin panel, auth, and migrations. Ideal for content-heavy applications needing rapid prototyping.',
        icon: '🎸'
      }
    ],
    fallback: {
      name: 'Express.js',
      keywords: [],
      reasoning: 'Express.js pairs naturally with a JavaScript/TypeScript frontend stack, offering lightweight routing, vast npm ecosystem, and proven scalability patterns.',
      icon: '🟢'
    }
  },
  {
    category: 'database',
    label: 'Database',
    options: [
      {
        name: 'MongoDB',
        keywords: ['mongodb', 'mongo', 'nosql', 'document', 'flexible schema', 'json', 'unstructured', 'prototype', 'mvp', 'agile'],
        reasoning: 'MongoDB\'s flexible document model accelerates iteration during early development. Schema-less design adapts to evolving requirements without migrations.',
        icon: '🍃'
      },
      {
        name: 'PostgreSQL',
        keywords: ['postgres', 'postgresql', 'sql', 'relational', 'transaction', 'acid', 'complex queries', 'financial', 'banking', 'analytics'],
        reasoning: 'PostgreSQL offers ACID compliance, complex joins, and advanced indexing. Essential for financial data, analytics workloads, and strict data integrity requirements.',
        icon: '🐘'
      },
      {
        name: 'MySQL',
        keywords: ['mysql', 'wordpress', 'php', 'legacy'],
        reasoning: 'MySQL is battle-tested and widely supported. Good for read-heavy workloads and applications with well-defined relational schemas.',
        icon: '🐬'
      },
      {
        name: 'Firebase / Firestore',
        keywords: ['firebase', 'firestore', 'realtime database', 'serverless', 'mobile app', 'offline sync'],
        reasoning: 'Firebase provides real-time sync, offline support, and zero-config backend. Ideal for mobile-first apps and rapid MVP launches.',
        icon: '🔥'
      }
    ],
    fallback: {
      name: 'MongoDB',
      keywords: [],
      reasoning: 'MongoDB is the most flexible choice for new projects — its document model maps naturally to JSON APIs and evolves with your schema as requirements change.',
      icon: '🍃'
    }
  },
  {
    category: 'auth',
    label: 'Authentication',
    options: [
      {
        name: 'Better Auth',
        keywords: ['better auth', 'betterauth', 'auth library', 'session', 'magic link', 'social login', 'oauth'],
        reasoning: 'Better Auth provides a modern, framework-agnostic auth solution with built-in social providers, magic links, and session management out of the box.',
        icon: '🔐'
      },
      {
        name: 'NextAuth.js',
        keywords: ['nextauth', 'next-auth', 'next.js auth'],
        reasoning: 'NextAuth.js integrates seamlessly with Next.js, offering OAuth providers, JWT/session strategies, and database adapters with minimal configuration.',
        icon: '🔑'
      },
      {
        name: 'Auth0',
        keywords: ['auth0', 'identity provider', 'enterprise auth', 'sso', 'single sign-on', 'saml', 'ldap'],
        reasoning: 'Auth0 provides enterprise-grade identity management with SSO, MFA, and compliance features. Best for B2B SaaS with complex org structures.',
        icon: '🛡️'
      },
      {
        name: 'Firebase Auth',
        keywords: ['firebase auth', 'google auth', 'phone auth', 'anonymous auth'],
        reasoning: 'Firebase Auth offers plug-and-play authentication with phone, email, and social providers. Tightly integrated with the Firebase ecosystem.',
        icon: '🔥'
      },
      {
        name: 'JWT + bcrypt (Custom)',
        keywords: ['jwt', 'bcrypt', 'custom auth', 'token', 'password hash'],
        reasoning: 'Custom JWT authentication gives full control over the auth flow. Suitable when you need fine-grained control and minimal third-party dependencies.',
        icon: '⚙️'
      }
    ],
    fallback: {
      name: 'Better Auth',
      keywords: [],
      reasoning: 'Better Auth is the modern default — lightweight, framework-agnostic, with built-in social providers and session management. Reduces auth implementation time significantly.',
      icon: '🔐'
    }
  },
  {
    category: 'payments',
    label: 'Payments',
    options: [
      {
        name: 'Stripe',
        keywords: ['stripe', 'payment', 'subscription', 'billing', 'checkout', 'invoice', 'pricing', 'plan', 'premium', 'pro', 'pricing tier', 'monetize', 'charge', 'credit card'],
        reasoning: 'Stripe offers the most comprehensive payment APIs — subscriptions, invoicing, 3D Secure, and 135+ currencies. Developer experience and documentation are industry-leading.',
        icon: '💳'
      },
      {
        name: 'Paddle',
        keywords: ['paddle', 'merchant of record', 'tax', 'global payments', 'saas billing'],
        reasoning: 'Paddle acts as merchant of record, handling global tax compliance and billing. Ideal for SaaS companies wanting to offload tax/VAT responsibilities.',
        icon: '🏓'
      },
      {
        name: 'LemonSqueezy',
        keywords: ['lemonsqueezy', 'lemon squeezy', 'digital product', 'license key'],
        reasoning: 'LemonSqueezy specializes in digital products with built-in license key management, tax handling, and a simple checkout experience.',
        icon: '🍋'
      }
    ],
    fallback: {
      name: 'Stripe',
      keywords: [],
      reasoning: 'Stripe is the industry standard for web payments — extensive API surface, excellent documentation, webhook support, and handles everything from one-time charges to complex subscription billing.',
      icon: '💳'
    }
  },
  {
    category: 'storage',
    label: 'Storage',
    options: [
      {
        name: 'Cloudinary',
        keywords: ['cloudinary', 'image', 'upload', 'media', 'thumbnail', 'avatar', 'photo', 'gallery', 'video', 'transform', 'resize', 'cdn image'],
        reasoning: 'Cloudinary provides automatic image/video optimization, transformations, and CDN delivery. Reduces image payload sizes by 40-60% with zero manual effort.',
        icon: '☁️'
      },
      {
        name: 'AWS S3',
        keywords: ['s3', 'aws', 'amazon', 'bucket', 'file storage', 'blob', 'object storage', 'backup', 'archive'],
        reasoning: 'S3 offers virtually unlimited object storage with fine-grained access policies, versioning, and lifecycle rules. The backbone of most production file storage.',
        icon: '📦'
      },
      {
        name: 'Supabase Storage',
        keywords: ['supabase', 'supabase storage'],
        reasoning: 'Supabase Storage integrates directly with Supabase auth and RLS policies. Simple API with built-in CDN for projects already using Supabase.',
        icon: '⚡'
      },
      {
        name: 'Firebase Storage',
        keywords: ['firebase storage', 'google cloud storage'],
        reasoning: 'Firebase Storage provides direct mobile SDK uploads with security rules. Best for apps already in the Firebase ecosystem.',
        icon: '🔥'
      }
    ],
    fallback: {
      name: 'Cloudinary',
      keywords: [],
      reasoning: 'Cloudinary is the best default for media-heavy applications — automatic format optimization (WebP/AVIF), responsive transformations, and global CDN delivery with a generous free tier.',
      icon: '☁️'
    }
  },
  {
    category: 'hosting',
    label: 'Hosting & Deployment',
    options: [
      {
        name: 'Vercel',
        keywords: ['vercel', 'next.js', 'nextjs', 'serverless', 'edge', 'jamstack', 'frontend cloud'],
        reasoning: 'Vercel is the native deployment platform for Next.js with automatic previews, edge functions, and zero-config CI/CD. Fastest path from code to production.',
        icon: '▲'
      },
      {
        name: 'AWS (EC2/ECS)',
        keywords: ['aws', 'ec2', 'ecs', 'docker', 'kubernetes', 'k8s', 'container', 'microservice', 'scale', 'load balancer'],
        reasoning: 'AWS provides full infrastructure control with auto-scaling, container orchestration, and 200+ services. Essential for complex architectures requiring fine-grained control.',
        icon: '☁️'
      },
      {
        name: 'Railway',
        keywords: ['railway', 'simple deploy', 'hobby', 'side project'],
        reasoning: 'Railway offers one-click deployments with automatic database provisioning. Perfect for side projects and small teams wanting simplicity.',
        icon: '🚂'
      },
      {
        name: 'DigitalOcean',
        keywords: ['digitalocean', 'droplet', 'vps', 'affordable hosting'],
        reasoning: 'DigitalOcean provides predictable pricing with simple VPS management. Good balance of control and simplicity for teams not needing AWS complexity.',
        icon: '🌊'
      }
    ],
    fallback: {
      name: 'Vercel',
      keywords: [],
      reasoning: 'Vercel provides the fastest deployment experience — git push to production, automatic previews, edge CDN, and native Next.js optimization. Free tier covers most early-stage projects.',
      icon: '▲'
    }
  },
  {
    category: 'testing',
    label: 'Testing',
    options: [
      {
        name: 'Vitest + Playwright',
        keywords: ['test', 'testing', 'unit test', 'e2e', 'end to end', 'integration test', 'qa', 'quality', 'vitest', 'playwright', 'cypress'],
        reasoning: 'Vitest for lightning-fast unit tests with native ESM support, paired with Playwright for reliable cross-browser E2E testing. The modern testing stack.',
        icon: '🧪'
      },
      {
        name: 'Jest + React Testing Library',
        keywords: ['jest', 'react testing', 'snapshot', 'mock'],
        reasoning: 'Jest is the most established JS test runner with snapshot testing, mocking, and code coverage. React Testing Library encourages testing user behavior over implementation.',
        icon: '🃏'
      }
    ],
    fallback: {
      name: 'Vitest + Playwright',
      keywords: [],
      reasoning: 'Vitest provides Jest-compatible APIs with 10x faster execution via native ESM. Playwright adds reliable cross-browser E2E testing with auto-wait and trace debugging.',
      icon: '🧪'
    }
  }
];

export function runStackRecommendation(prdText: string, taskTitles: string[]): StackAnalysisResult {
  const combinedText = [prdText, ...taskTitles].join(' ').toLowerCase();
  let totalSignals = 0;

  const recommendations: StackRecommendation[] = STACK_CATEGORIES.map(cat => {
    let bestMatch: StackOption | null = null;
    let bestScore = 0;
    let bestKeywords: string[] = [];

    for (const option of cat.options) {
      const matched: string[] = [];
      for (const kw of option.keywords) {
        if (combinedText.includes(kw.toLowerCase())) {
          matched.push(kw);
        }
      }
      if (matched.length > bestScore) {
        bestScore = matched.length;
        bestMatch = option;
        bestKeywords = matched;
      }
    }

    if (bestMatch && bestScore > 0) {
      totalSignals += bestScore;
      const confidence = Math.min(98, 55 + (bestScore * 12));
      return {
        category: cat.category,
        label: cat.label,
        recommended: bestMatch.name,
        reasoning: bestMatch.reasoning,
        icon: bestMatch.icon,
        confidence,
        matchedKeywords: bestKeywords
      };
    }

    // Fallback
    return {
      category: cat.category,
      label: cat.label,
      recommended: cat.fallback.name,
      reasoning: cat.fallback.reasoning,
      icon: cat.fallback.icon,
      confidence: 45,
      matchedKeywords: []
    };
  });

  const overallConfidence = recommendations.length > 0
    ? Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length)
    : 0;

  return {
    recommendations,
    overallConfidence,
    prdSignals: totalSignals
  };
}
