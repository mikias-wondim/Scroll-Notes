import OpenAI from "openai";

// Make sure GitHub token is properly set
if (!process.env.GITHUB_TOKEN) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing GITHUB_TOKEN environment variable in production");
  } else {
    console.warn("Warning: Missing GITHUB_TOKEN environment variable");
  }
}

const openai = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
  timeout: 30000, // 30 second timeout for requests
  maxRetries: 2, // Retry failed requests twice
});

export default openai;
