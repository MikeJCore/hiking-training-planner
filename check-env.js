import dotenv from 'dotenv';

dotenv.config();

console.log('Checking environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY.slice(-4) : 'Not set');

// Check if we can initialize OpenAI
if (process.env.OPENAI_API_KEY) {
  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('OpenAI initialization: SUCCESS');
    
    // Test a simple API call
    console.log('Testing OpenAI API connection...');
    const models = await openai.models.list();
    console.log('Available models:', models.data.map(m => m.id).join(', '));
  } catch (error) {
    console.error('OpenAI initialization FAILED:', error.message);
  }
} else {
  console.log('OPENAI_API_KEY is not set in .env file');
}
