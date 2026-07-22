import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

interface RecommendationInput {
  projectName: string;
  projectDescription: string;
  tasks: any[];
  sprints: any[];
  riskScore: number;
}

export const runRecommendationEngine = async (input: RecommendationInput): Promise<string> => {
  const model = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    apiKey: process.env.GEMINI_API_KEY || '',
    temperature: 0.2,
  });

  const { projectName, projectDescription, tasks, sprints, riskScore } = input;

  const taskContext = tasks.map(t => `- [${t.status}] ${t.title} (Priority: ${t.priority}, SP: ${t.storyPoints || 2}, Est: ${t.estimatedHours || 4}h)`).join('\n');
  const sprintContext = sprints.map(s => `- ${s.name}: [${s.status}] Goal: ${s.goal || 'No goal set'} (${s.completedPoints || 0}/${s.totalPoints || 0} SP)`).join('\n');

  const prompt = `You are the AI Smart Recommendation Engine for the project "${projectName}".
Analyze the project details, task statuses, sprint velocity, and risk levels below.

Project Context:
Description: ${projectDescription}
Overall Risk Level: ${riskScore}%

Current Sprints History:
${sprintContext}

Active Backlog & Tasks:
${taskContext}

Provide a comprehensive recommendations report addressing:
1. **Next Recommended Tasks**: Propose the next specific tasks the team should pick up (e.g. database setup, auth module) based on priorities, status, and dependency trees.
2. **Sprint Priority Guidelines**: Suggest which stories are critical for the immediate/upcoming sprint.
3. **Roadmap Changes**: Suggest adjustments to project milestones or phase deadlines if any delays or scope creeps are detected.
4. **Schedule & Velocity Improvements**: Recommend actions to improve overall sprint velocity, clear blockers, or reduce risk levels.

Respond in neat Markdown format. Do not use placeholders.`;

  const response = await model.invoke([
    new SystemMessage(`You are "ProjectPilot Recommendation Engine" - a senior Agile consultant and data analyst.`),
    new HumanMessage(prompt)
  ]);

  return response.content as string;
};
