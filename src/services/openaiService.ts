'use client';
import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export const getOpenAIClient = () => {
  if (openaiClient) return openaiClient;
  const settings = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('ai_settings') || '{}' : '{}');
  const apiKey = settings.apiKey;
  if (!apiKey) throw new Error('OpenAI API key is not configured.');
  openaiClient = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  return openaiClient;
};

export const generateText = async (prompt: string, model = 'gpt-4o'): Promise<string> => {
  const client = getOpenAIClient();
  const response = await client.responses.create({ model, input: prompt });
  return response.output_text || '';
};
