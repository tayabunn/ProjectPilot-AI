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

import { createAgent, tool } from 'langchain';
import { z } from 'zod';

const getWeather = tool((input) => `It's always sunny in ${input.city}!`, {
  name: 'get_weather',
  description: 'Get the weather for a given city',
  schema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
});

const agent = createAgent({
  model: 'openai:gpt-5-mini',
  tools: [getWeather],
});

async function main() {
  console.log("Invoking agent...");
  const response = await agent.invoke({
    messages: [{ role: 'user', content: "What's the weather in San Francisco?" }],
  });
  console.log("Agent response:", response);
}

main().catch(console.error);
