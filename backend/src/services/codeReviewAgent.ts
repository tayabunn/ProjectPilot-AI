import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

interface CodeReviewInput {
  prTitle: string;
  prDescription?: string;
  diffText: string;
}

export const runCodeReviewAgent = async (input: CodeReviewInput): Promise<string> => {
  const model = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    apiKey: process.env.GEMINI_API_KEY || '',
    temperature: 0.2,
  });

  const { prTitle, prDescription = 'No description provided', diffText } = input;

  const prompt = `You are an elite AI Code Review Agent.
Review the following Pull Request diff and details. Provide a comprehensive code review report.

Pull Request: "${prTitle}"
Description: "${prDescription}"

Diff Content:
\`\`\`diff
${diffText}
\`\`\`

You must structure your review report into these exact sections with clear suggestions:
1. **Performance Improvements**: Analyze execution speed, memory footprint, caching, database query efficiency, and asset sizes.
2. **Security Improvements**: Analyze common vulnerabilities (OWASP Top 10), data exposure, auth checks, inputs sanitization, and SQL injections.
3. **Architecture Improvements**: Check patterns, encapsulation, coupling, naming conventions, separation of concerns, and system structure.
4. **Readability Improvements**: Evaluate spacing, syntax complexities, code comments quality, function lengths, and naming clarity.
5. **Testing Improvements**: Suggest unit tests coverage, integration checks, mock definitions, and boundary condition test cases.

Respond in neat Markdown format. Do not use placeholders. If no changes are needed for a particular section, state "No critical improvements recommended for this area."`;

  const response = await model.invoke([
    new SystemMessage(`You are "ProjectPilot Code Reviewer" - a staff-level AI software engineer specialized in code quality, security audits, and systems performance.`),
    new HumanMessage(prompt)
  ]);

  return response.content as string;
};
