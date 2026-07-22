import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

interface ScrumMasterInput {
  contentType: string;
  projectName: string;
  projectDescription: string;
  tasks: any[];
  sprints: any[];
  style?: string;
  length?: string;
}

export const runScrumMasterAgent = async (input: ScrumMasterInput): Promise<string> => {
  const model = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    apiKey: process.env.GEMINI_API_KEY || '',
    temperature: 0.7,
  });

  const { contentType, projectName, projectDescription, tasks, sprints, style = 'Professional', length = 'Medium' } = input;

  const taskContext = tasks.map(t => `- [${t.status}] ${t.title} (Priority: ${t.priority}, SP: ${t.storyPoints}, Est: ${t.estimatedHours}h)`).join('\n');
  const sprintContext = sprints.map(s => `- ${s.name}: [${s.status}] Goal: ${s.goal || 'No goal set'} (${s.completedPoints || 0}/${s.totalPoints || 0} SP)`).join('\n');

  const prompts: Record<string, string> = {
    sprint_planning: `You are the Scrum Master Agent for "${projectName}".
Generate a detailed Sprint Planning proposal. Review the backlog and propose task allocation, sprint duration (default 2 weeks), and estimated velocity:
Backlog:
${taskContext}

Style: ${style}
Length: ${length}
Respond in neat Markdown format. Do not use placeholders.`,

    sprint_goals: `You are the Scrum Master Agent for "${projectName}".
Formulate clear, cohesive, and business-driven Sprint Goals for the current sprint backlog:
Backlog:
${taskContext}

Style: ${style}
Length: ${length}
Respond in neat Markdown format. Do not use placeholders.`,

    daily_standup: `You are the Scrum Master Agent for "${projectName}".
Simulate a daily standup update for the team based on the active tasks in progress, completed, or blocked:
Tasks:
${taskContext}

Format as typical daily update sections: Yesterday, Today, and Blockers/Risks.
Style: ${style}
Length: ${length}
Respond in neat Markdown format. Do not use placeholders.`,

    weekly_report: `You are the Scrum Master Agent for "${projectName}".
Generate a comprehensive Weekly Progress Report summarizing recent accomplishments, active task statuses, and key highlights:
Tasks:
${taskContext}
Sprints:
${sprintContext}

Style: ${style}
Length: ${length}
Respond in neat Markdown format. Do not use placeholders.`,

    sprint_report: `You are the Scrum Master Agent for "${projectName}".
Generate a Sprint Report evaluating overall performance, velocity achieved, milestone completions, and metrics breakdown:
Sprints:
${sprintContext}
Tasks:
${taskContext}

Style: ${style}
Length: ${length}
Respond in neat Markdown format. Do not use placeholders.`,

    retrospective: `You are the Scrum Master Agent for "${projectName}".
Analyze the sprint status and backlog to generate a Retrospective Summary highlighting:
1. What went well (based on completed tasks and goals).
2. What could be improved (based on incomplete tasks, delays, risks).
3. Action items for the next sprint.

Sprint/Tasks context:
${taskContext}
${sprintContext}

Style: ${style}
Length: ${length}
Respond in neat Markdown format. Do not use placeholders.`
  };

  const selectedPrompt = prompts[contentType] || prompts.weekly_report;

  const response = await model.invoke([
    new SystemMessage(`You are "ProjectPilot Scrum Master" - an elite autonomous AI Scrum Master and technical advisor.`),
    new HumanMessage(selectedPrompt)
  ]);

  return response.content as string;
};
