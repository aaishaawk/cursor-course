import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// Define the output schema using Zod
const repoSummarySchema = z.object({
  summary: z.string().describe("A concise summary of the repository from its README (2-3 sentences)"),
  cool_facts: z.array(z.string()).describe("A list of at least 3 cool or interesting facts/features from the README"),
});

export type RepoSummary = z.infer<typeof repoSummarySchema>;

// Create the prompt template
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful assistant that analyzes GitHub repositories. Analyze the README and extract key information.",
  ],
  [
    "human",
    `Analyze this GitHub repository based on its README file and provide:
1. A concise summary (2-3 sentences)
2. At least 3 cool or interesting facts/features

README Content:
{readme}`,
  ],
]);

/**
 * Summarize a GitHub repository README using LangChain and OpenAI
 * Uses withStructuredOutput for type-safe responses
 */
export async function summarizeReadme(readmeContent: string): Promise<RepoSummary> {
  // Initialize the LLM
  const llm = new ChatOpenAI({
    temperature: 0.2,
    modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Bind structured output schema to the model
  const structuredLlm = llm.withStructuredOutput(repoSummarySchema);

  // Create the chain: prompt -> structured LLM
  const chain = prompt.pipe(structuredLlm);

  // Invoke the chain with the README content
  const result = await chain.invoke({ readme: readmeContent });

  return result;
}

/**
 * Generate mock summary for testing without OpenAI API key
 */
function generateMockSummary(readmeContent: string): RepoSummary {
  // Extract title from README (first # heading)
  const titleMatch = readmeContent.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : "This project";

  // Extract bullet points or features
  const bulletPoints = readmeContent.match(/^[-*]\s+(.+)$/gm) || [];
  const features = bulletPoints.slice(0, 3).map(b => b.replace(/^[-*]\s+/, ""));

  return {
    summary: `${title} is a software project. This is a MOCK summary generated for testing purposes because no OpenAI API key was provided. The actual summary would analyze the README content and provide meaningful insights.`,
    cool_facts: features.length > 0 
      ? features.map(f => `[MOCK] ${f}`)
      : [
          "[MOCK] This is a placeholder fact #1",
          "[MOCK] This is a placeholder fact #2", 
          "[MOCK] This is a placeholder fact #3"
        ],
  };
}

/**
 * Wrapper function with error handling
 */
export async function summarizeGithubRepo(readmeContent: string): Promise<{
  success: boolean;
  summary: string | null;
  cool_facts: string[];
  error?: string;
  mock?: boolean;
}> {
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.log("⚠️ MOCK MODE: No OPENAI_API_KEY found, returning mock summary");
    const mockResult = generateMockSummary(readmeContent);
    return {
      success: true,
      summary: mockResult.summary,
      cool_facts: mockResult.cool_facts,
      mock: true,
    };
  }

  try {
    const result = await summarizeReadme(readmeContent);
    return {
      success: true,
      summary: result.summary,
      cool_facts: result.cool_facts,
    };
  } catch (err) {
    console.error("LangChain summarization error:", err);
    return {
      success: false,
      summary: null,
      cool_facts: [],
      error: err instanceof Error ? err.message : "Failed to summarize repository",
    };
  }
}
