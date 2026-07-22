import fs from 'fs';
import path from 'path';

// Automatically load environment variables from backend/.env
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, val] = line.split('=');
      process.env[key.trim()] = val.trim();
    }
  });
}

import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { StateGraph, StateGraphArgs } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

interface AgentState {
  messages: HumanMessage[];
}

const graphState: StateGraphArgs<AgentState>['channels'] = {
  messages: {
    reducer: (x: HumanMessage[], y: HumanMessage[]) => x.concat(y),
  },
};

const searchTool = tool(
  async ({ query }: { query: string }) => {
    if (
      query.toLowerCase().includes('sf') ||
      query.toLowerCase().includes('san francisco')
    ) {
      return "It's 60 degrees and foggy.";
    }
    return "It's 90 degrees and sunny.";
  },
  {
    name: 'search',
    description: 'Call to surf the web.',
    schema: z.object({
      query: z.string().describe('The query to use in your search.'),
    }),
  }
);

const tools = [searchTool];
const toolNode = new ToolNode<AgentState>(tools);

const model = new ChatOpenAI({
  model: 'gpt-4',
  temperature: 0,
}).bindTools(tools);

function shouldContinue(state: AgentState) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) {
    return 'tools';
  }
  return '__end__';
}

async function callModel(state: AgentState) {
  const messages = state.messages;
  const response = await model.invoke(messages);
  return { messages: [response] };
}

const workflow = new StateGraph<AgentState>({ channels: graphState })
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge('__start__', 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent');

const app = workflow.compile();

async function main() {
  console.log("Starting LangGraph workflow invocation...");
  const finalState = await app.invoke(
    { messages: [new HumanMessage('what is the weather in sf')] },
    { configurable: { thread_id: '42' } }
  );

  console.log("\nWorkflow complete!");
  console.log("Final Agent Output:", finalState.messages[finalState.messages.length - 1].content);
}

main().catch(console.error);
