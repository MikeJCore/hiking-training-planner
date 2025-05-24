import OpenAI from 'openai';
import dotenv from 'dotenv';
import process from 'process';

// Load environment variables
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY?.trim();

if (!apiKey) {
  console.error('Error: OPENAI_API_KEY is not set in the environment variables');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: apiKey
});

async function listModels() {
  try {
    console.log('Fetching available models...');
    const models = await openai.models.list();
    console.log('Available models:');
    models.data.forEach(model => console.log(`- ${model.id}`));
  } catch (error) {
    console.error('Error fetching models:', error.message);
    console.error('Full error:', error);
  }
}

listModels();
