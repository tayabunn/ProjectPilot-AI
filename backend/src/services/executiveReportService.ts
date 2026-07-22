// Executive Multi-Audience Report Service
// Tailors project status into 4 distinct persona perspectives: CEO, PM, Developer, and Investor.

export type AudienceType = 'ceo' | 'pm' | 'developer' | 'investor';

export interface ExecutiveReportOutput {
  audience: AudienceType;
  title: string;
  subtitle: string;
  executiveSummary: string;
  keyMetrics: Array<{
    label: string;
    value: string | number;
    change?: string;
    statusColor?: string;
  }>;
  sections: Array<{
    heading: string;
    items: string[];
  }>;
  riskAssessment: {
    level: string;
    summary: string;
  };
  deliveryConfidence: number;
}

export function generateExecutiveReport(
  project: any,
  tasks: any[],
  milestones: any[],
  health: any,
  audience: AudienceType
): ExecutiveReportOutput {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const blockedTasks = tasks.filter(t => t.status !== 'done' && t.dependencies && t.dependencies.length > 0).length;
  
  const totalSP = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completedSP = tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const spPercent = totalSP > 0 ? Math.round((completedSP / totalSP) * 100) : 0;

  const healthScore = health?.score || 85;
  const confidence = health?.confidence || 89;

  switch (audience) {
    case 'ceo':
      return {
        audience: 'ceo',
        title: 'CEO One-Page Executive Brief',
        subtitle: `High-level strategic status audit for ${project.name}`,
        executiveSummary: `Project "${project.name}" is operating at ${healthScore}/100 Health score with ${confidence}% delivery confidence. Overall project completion is at ${spPercent}% of target scope with ${blockedTasks} critical bottlenecks flagged for resolution.`,
        keyMetrics: [
          { label: 'Overall Progress', value: `${spPercent}%`, statusColor: 'emerald' },
          { label: 'Health Score', value: `${healthScore}/100`, statusColor: healthScore > 75 ? 'emerald' : 'amber' },
          { label: 'Delivery Risk', value: health?.timelineRisk || 'Low', statusColor: 'emerald' },
          { label: 'Strategic Alignment', value: 'High', statusColor: 'indigo' }
        ],
        sections: [
          {
            heading: 'Key Accomplishments & Milestones',
            items: [
              `Completed ${completedTasks} core backlog deliverables (${completedSP} Story Points delivered).`,
              `Milestones on track: ${milestones.filter(m => m.status === 'completed' || m.status === 'in-progress').length} of ${milestones.length || 1} phases active.`
            ]
          },
          {
            heading: 'Executive Strategic Focus',
            items: [
              `Maintain current velocity to hit primary milestone target.`,
              `Ensure zero blocking dependencies remain on critical path items.`
            ]
          }
        ],
        riskAssessment: {
          level: health?.timelineRisk || 'Low',
          summary: `Project timeline risk is currently rated ${health?.timelineRisk || 'Low'}. Requirement completeness is at ${health?.requirementCompleteness || 85}%.`
        },
        deliveryConfidence: confidence
      };

    case 'pm':
      return {
        audience: 'pm',
        title: 'Product Manager Feature & Roadmap Audit',
        subtitle: `Feature delivery, scope completeness, and milestone tracking for ${project.name}`,
        executiveSummary: `Scope completion stands at ${spPercent}% (${completedSP}/${totalSP} Story Points). Requirement completeness is rated at ${health?.requirementCompleteness || 90}%. Active milestones are progressing according to schedule with stable velocity.`,
        keyMetrics: [
          { label: 'Scope Completed', value: `${completedSP} / ${totalSP} SP`, statusColor: 'indigo' },
          { label: 'Requirements Coverage', value: `${health?.requirementCompleteness || 90}%`, statusColor: 'emerald' },
          { label: 'Sprint Velocity', value: health?.sprintVelocity || 'Stable', statusColor: 'emerald' },
          { label: 'Backlog Items', value: `${totalTasks - completedTasks} Pending`, statusColor: 'amber' }
        ],
        sections: [
          {
            heading: 'Milestone Timeline Breakdown',
            items: milestones.length > 0 
              ? milestones.map(m => `Phase: ${m.title} — ${m.description || 'In Progress'}`)
              : ['Phase 1: Foundation & Core Logic (Active)', 'Phase 2: Integration & Release (Pending)']
          },
          {
            heading: 'Feature Scope & Requirements Health',
            items: [
              `Total tasks tracked: ${totalTasks} (${completedTasks} Done, ${inProgressTasks} In Progress, ${totalTasks - completedTasks - inProgressTasks} Backlog).`,
              `Blocked features: ${blockedTasks} task(s) waiting on dependency resolution.`
            ]
          }
        ],
        riskAssessment: {
          level: blockedTasks > 2 ? 'Medium' : 'Low',
          summary: `${blockedTasks} task(s) currently blocked by dependencies. Feature scope remains stable with minimal drift.`
        },
        deliveryConfidence: confidence
      };

    case 'developer':
      return {
        audience: 'developer',
        title: 'Engineering & Developer Worklog Brief',
        subtitle: `Technical blockers, PR readiness, and task prioritization for ${project.name}`,
        executiveSummary: `Development backlog contains ${totalTasks - completedTasks} active items. ${blockedTasks} tasks require prerequisite dependency resolution. Technical debt score is rated as ${health?.technicalDebt || 'Low'}.`,
        keyMetrics: [
          { label: 'Active Sprint Tasks', value: `${inProgressTasks} In Progress`, statusColor: 'indigo' },
          { label: 'Blocked Tasks', value: `${blockedTasks} Bottlenecks`, statusColor: blockedTasks > 0 ? 'amber' : 'emerald' },
          { label: 'Technical Debt', value: health?.technicalDebt || 'Low', statusColor: 'emerald' },
          { label: 'Story Points Pending', value: `${totalSP - completedSP} SP`, statusColor: 'indigo' }
        ],
        sections: [
          {
            heading: 'Critical Technical Blockers & Dependencies',
            items: tasks.filter(t => t.dependencies && t.dependencies.length > 0 && t.status !== 'done').length > 0
              ? tasks.filter(t => t.dependencies && t.dependencies.length > 0 && t.status !== 'done').map(t => `Task "${t.title}" is blocked by prerequisite tasks.`)
              : ['No critical technical blockers detected in active engineering flow.']
          },
          {
            heading: 'Developer Priority Queue',
            items: tasks.filter(t => t.status === 'in-progress' || t.priority === 'high' || t.priority === 'urgent').slice(0, 4).map(t => `[${t.priority.toUpperCase()}] ${t.title} (${t.storyPoints || 2} SP) — ${t.status}`)
          }
        ],
        riskAssessment: {
          level: health?.technicalDebt === 'High' ? 'High' : 'Low',
          summary: `Technical debt is ${health?.technicalDebt || 'Low'}. Direct focus required on clearing prerequisite task blockers.`
        },
        deliveryConfidence: confidence
      };

    case 'investor':
      return {
        audience: 'investor',
        title: 'Investor & Stakeholder Delivery Report',
        subtitle: `Velocity, milestone progress, and capital ROI metrics for ${project.name}`,
        executiveSummary: `Project "${project.name}" exhibits a high delivery confidence rate of ${confidence}% with a overall Health score of ${healthScore}/100. Product velocity is ${health?.sprintVelocity || 'Stable'}, with ${spPercent}% of promised target milestones completed.`,
        keyMetrics: [
          { label: 'Delivery Confidence', value: `${confidence}%`, statusColor: 'emerald' },
          { label: 'Project Health', value: `${healthScore} / 100`, statusColor: 'emerald' },
          { label: 'Sprint Velocity Trend', value: health?.sprintVelocity || 'Stable', statusColor: 'indigo' },
          { label: 'Milestone Progress', value: `${progressPercent}%`, statusColor: 'emerald' }
        ],
        sections: [
          {
            heading: 'Delivery Velocity & ROI Metrics',
            items: [
              `Total engineering capacity delivered: ${completedSP} Story Points across ${completedTasks} completed features.`,
              `Sprint execution rate: ${health?.sprintVelocity || 'Stable'} velocity trend with low timeline risk.`
            ]
          },
          {
            heading: 'Milestone Projections & Market Readiness',
            items: [
              `Target product delivery remains on schedule with ${confidence}% confidence.`,
              `Core infrastructure and feature architecture successfully validated.`
            ]
          }
        ],
        riskAssessment: {
          level: 'Low',
          summary: `Low overall delivery risk. Financial and technical milestones are aligned with target launch dates.`
        },
        deliveryConfidence: confidence
      };
  }
}
