import OpenAI from "openai";
import { IS_MOCK } from "../config/env";

// Lazy initialization to avoid crashes if API key is missing
let openaiClient: OpenAI | null = null;

export const getOpenAIClient = () => {
  if (openaiClient) return openaiClient;

  const settings = JSON.parse(localStorage.getItem('ai_settings') || '{}');
  const apiKey = settings.apiKey;

  if (!apiKey && !IS_MOCK) {
    throw new Error('OpenAI API key is not configured.');
  }

  openaiClient = new OpenAI({
    apiKey: apiKey || 'mock-key',
    dangerouslyAllowBrowser: true // Required for client-side usage in this environment
  });

  return openaiClient;
};

export const generateText = async (prompt: string, model: string = 'gpt-5') => {
  console.log('--- AI Insight Generation Debug ---');
  console.log('Prompt:', prompt);
  console.log('Model:', model);
  console.log('IS_MOCK:', IS_MOCK);

  if (IS_MOCK) {
    console.log('Running in MOCK mode.');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockResponse = JSON.stringify({
      insights: [
        { 
          id: `mock-${Date.now()}-1`,
          date: '2026-03-05',
          type: 'Projects',
          keyword: 'Improve Mobile UX', 
          summary: 'Users report crashes on login.',
          details: 'Users report crashes on login. Focus on stability. Our analysis shows it happens on Android devices.',
          recommendations: ['Fix login API', 'Add error logging', 'Update Android SDK'],
          importantForCompany: 'Critical for user retention' 
        },
        { 
          id: `mock-${Date.now()}-2`,
          date: '2026-03-05',
          type: 'Overview',
          keyword: 'Feature Request: Dark Mode', 
          summary: 'Many users are asking for a dark theme.',
          details: 'Many users are asking for a dark theme. It is a top request in the feedback module.',
          recommendations: ['Implement theme switcher', 'Add toggle in settings'],
          importantForCompany: 'Enhances accessibility and user experience' 
        },
        { 
          id: `mock-${Date.now()}-3`,
          date: '2026-03-05',
          type: 'Campaigns',
          keyword: 'Q1 Survey Response', 
          summary: 'Response rate is lower than expected.',
          details: 'The Q1 survey response rate is 15% lower than Q4. Users find the survey too long.',
          recommendations: ['Shorten survey', 'Add progress bar'],
          importantForCompany: 'Essential for data-driven decision making' 
        }
      ]
    });
    console.log('Mock response:', mockResponse);
    return mockResponse;
  }

  try {
    console.log('Attempting real API call...');
    const client = getOpenAIClient();
    console.log('OpenAI client initialized.');
    
    const response = await client.responses.create({
      model: model,
      input: prompt
    });
    
    console.log('API Response received:', response);
    return response.output_text || "";
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
