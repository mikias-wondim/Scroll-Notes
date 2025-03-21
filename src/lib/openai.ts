import OpenAI from "openai";

if (!process.env.GITHUB_TOKEN) {
  throw new Error("Missing GITHUB_TOKEN environment variable");
}

const openai = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

export default openai;
