import { StateGraph, StateGraphArgs } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { SystemMessage } from '@langchain/core/messages';

// Define the Graph state
export interface GraphState {
  prdText: string;
  goals: string[];
  milestones: Array<{ title: string; description: string }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    storyPoints: number;
    estimatedHours: number;
    labels: string[];
    acceptanceCriteria: string[];
    dependencies: string[];
  }>;
  risks: Array<{ title: string; mitigation: string }>;
  research?: {
    architecture: string;
    technologies: string[];
    libraries: string[];
    bestPractices: string[];
    missingInfo: string[];
  };
}

const graphState: StateGraphArgs<GraphState>['channels'] = {
  prdText: {
    value: (x: string, y: string) => y,
    default: () => '',
  },
  goals: {
    value: (x: string[], y: string[]) => y,
    default: () => [],
  },
  milestones: {
    value: (x: any[], y: any[]) => y,
    default: () => [],
  },
  tasks: {
    value: (x: any[], y: any[]) => y,
    default: () => [],
  },
  risks: {
    value: (x: any[], y: any[]) => y,
    default: () => [],
  },
  research: {
    value: (x: any, y: any) => y,
    default: () => ({
      architecture: '',
      technologies: [],
      libraries: [],
      bestPractices: [],
      missingInfo: []
    }),
  },
};

// Create the model
const getModel = () => {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    apiKey: process.env.GEMINI_API_KEY || '',
    temperature: 0.2,
  });
};

// Node 1: Planner Agent
// Responsible for:
// - Analyzing PRD
// - Understanding project goals
// - Generating milestones and high level roadmap
const plannerAgent = async (state: GraphState) => {
  const model = getModel();
  const prompt = `You are a Senior Project Planner Agent.
Analyze the following Product Requirement Document (PRD) and extract:
1. The project goals (list of strings).
2. Key milestones / phases for the project roadmap (list of objects with title and description).

PRD:
"${state.prdText}"

Return a JSON object conforming exactly to this structure:
{
  "goals": ["Goal 1", "Goal 2"],
  "milestones": [
    { "title": "Milestone Title", "description": "Short description of target delivery" }
  ]
}
Return ONLY valid JSON.`;

  const response = await model.invoke([new SystemMessage(prompt)]);
  let cleanText = response.content as string;
  // Clean potential markdown blocks
  cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    const data = JSON.parse(cleanText);
    return {
      goals: data.goals || [],
      milestones: data.milestones || []
    };
  } catch (e) {
    console.error("Planner agent JSON parse error:", e);
    return {};
  }
};

// Node 2: Issue Generator Agent
// Responsible for:
// - Generating task breakdown, estimates, priorities, and labels based on goals and milestones
const issueGeneratorAgent = async (state: GraphState) => {
  const model = getModel();
  const prompt = `You are an Issue Generator & Scrum Master Agent.
Based on the project goals, milestones, and tech recommendations generated below, break down the project into concrete implementation tasks.
Goals:
${JSON.stringify(state.goals, null, 2)}
Milestones:
${JSON.stringify(state.milestones, null, 2)}
Tech Recommendations:
${JSON.stringify(state.research, null, 2)}

PRD Context:
"${state.prdText}"

Generate a list of technical implementation tasks. For each task specify:
- id: string (e.g. "task_1", "task_2")
- title: string
- description: string (concrete detail)
- priority: "low" | "medium" | "high" | "urgent"
- storyPoints: 1 | 2 | 3 | 5 | 8
- estimatedHours: number
- labels: array of strings (e.g. ["frontend", "backend", "database"])
- acceptanceCriteria: array of strings (concrete testable requirements)
- dependencies: array of strings (matching the "id"s of other tasks in this list that MUST be completed first)

Return a JSON object conforming exactly to this structure:
{
  "tasks": [
    {
      "id": "task_1",
      "title": "Task Title",
      "description": "Task description",
      "priority": "medium",
      "storyPoints": 3,
      "estimatedHours": 6,
      "labels": ["frontend"],
      "acceptanceCriteria": ["Verify integration endpoints run successfully"],
      "dependencies": []
    }
  ]
}
Return ONLY valid JSON.`;

  const response = await model.invoke([new SystemMessage(prompt)]);
  let cleanText = response.content as string;
  cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    const data = JSON.parse(cleanText);
    return {
      tasks: data.tasks || []
    };
  } catch (e) {
    console.error("Issue generator JSON parse error:", e);
    return {};
  }
};

// Node 3: Risk Analyzer Agent
// Responsible for:
// - Identifying potential risks and recommending mitigation strategies
const riskAnalyzerAgent = async (state: GraphState) => {
  const model = getModel();
  const prompt = `You are a Risk Analyzer Agent.
Analyze the project details, goals, milestones, and task list below.
Identify and flag critical delivery risks in these specific categories:
1. Unclear requirements (ambiguous logic or specifications)
2. Large tasks (large story points/estimated hours that require sub-tasks)
3. Risky dependencies (nested dependency paths or cycles)
4. Integration risks (API conflicts, auth bottlenecks, database scaling limits)
5. Timeline risks (unrealistic timelines or delivery milestones)
6. Missing specifications (features omitted or edge cases ignored)

For each detected risk, provide a detailed mitigation strategy.

Project Details:
Goals: ${JSON.stringify(state.goals)}
Milestones: ${JSON.stringify(state.milestones)}
Tasks: ${JSON.stringify(state.tasks)}

PRD Context:
"${state.prdText}"

Return a JSON object conforming exactly to this structure:
{
  "risks": [
    {
      "title": "Category Name - Risk description",
      "mitigation": "Mitigation recommendation action details"
    }
  ]
}
Return ONLY valid JSON.`;

  const response = await model.invoke([new SystemMessage(prompt)]);
  let cleanText = response.content as string;
  cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    const data = JSON.parse(cleanText);
    return {
      risks: data.risks || []
    };
  } catch (e) {
    console.error("Risk analyzer JSON parse error:", e);
    return {};
  }
};

// Node 4: Research Agent
// Responsible for:
// - Suggesting architecture
// - Suggesting technology choices
// - Recommending libraries
// - Recommending best engineering practices
// - Identifying missing information
const researchAgent = async (state: GraphState) => {
  const model = getModel();
  const prompt = `You are a Senior Technical Research & Architect Agent.
Analyze the following Product Requirement Document (PRD), project goals, and milestones to formulate technical decisions.

PRD:
"${state.prdText}"

Goals:
${JSON.stringify(state.goals)}

Milestones:
${JSON.stringify(state.milestones)}

Provide:
1. Suggested architecture (e.g. monolithic, microservices, serverless, client-server structure).
2. Technology choices (e.g. languages, databases, hosting).
3. Recommended libraries or frameworks.
4. Best engineering practices for this specific build (e.g. testing strategy, CI/CD, linting).
5. Missing information (any ambiguities or gaps in the PRD).

Return a JSON object conforming exactly to this structure:
{
  "architecture": "Suggested architecture details",
  "technologies": ["Tech 1", "Tech 2"],
  "libraries": ["Library 1", "Library 2"],
  "bestPractices": ["Practice 1", "Practice 2"],
  "missingInfo": ["Gap 1", "Gap 2"]
}
Return ONLY valid JSON.`;

  const response = await model.invoke([new SystemMessage(prompt)]);
  let cleanText = response.content as string;
  cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    const data = JSON.parse(cleanText);
    return {
      research: {
        architecture: data.architecture || '',
        technologies: data.technologies || [],
        libraries: data.libraries || [],
        bestPractices: data.bestPractices || [],
        missingInfo: data.missingInfo || []
      }
    };
  } catch (e) {
    console.error("Research agent JSON parse error:", e);
    return {};
  }
};

// Assemble the graph
const workflow = new StateGraph<GraphState>({ channels: graphState })
  .addNode('planner', plannerAgent as any)
  .addNode('researcher', researchAgent as any)
  .addNode('issueGenerator', issueGeneratorAgent as any)
  .addNode('riskAnalyzer', riskAnalyzerAgent as any)
  .addEdge('__start__', 'planner')
  .addEdge('planner', 'researcher')
  .addEdge('researcher', 'issueGenerator')
  .addEdge('issueGenerator', 'riskAnalyzer')
  .addEdge('riskAnalyzer', '__end__');

export const runMultiAgentPlanning = async (prdText: string): Promise<GraphState> => {
  const app = workflow.compile();
  const result = await app.invoke({ prdText });
  return result as any;
};
