import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n--- New ${req.method} request to ${req.path} ---`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check endpoint called');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Test OpenAI connection endpoint
app.get('/api/test-openai', async (req, res) => {
  console.log('Testing OpenAI connection...');
  
  try {
    const models = await openai.models.list();
    console.log('Successfully connected to OpenAI');
    res.status(200).json({
      success: true,
      message: 'OpenAI connection successful',
      modelCount: models.data.length
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate training plan endpoint
app.post('/api/generate-plan', async (req, res) => {
  console.log('Received request to generate training plan');
  
  const { fitnessLevel, hikingExperience, county, targetDate, daysPerWeek, email, name } = req.body;
  
  // Validate required fields
  if (!fitnessLevel || !hikingExperience || !county || !targetDate || !daysPerWeek || !email || !name) {
    console.error('Missing required fields');
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  try {
    console.log('Generating training plan with OpenAI...');
    
    // Create a prompt for the training plan
    const prompt = `Create a ${fitnessLevel} level ${daysPerWeek}-day per week training plan for hiking in ${county}. 
    The user has ${hikingExperience} hiking experience and is training for a hike on ${targetDate}. 
    Include a variety of exercises and rest days.`;
    
    console.log('Sending request to OpenAI with prompt:', prompt);
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are a helpful hiking training assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    const trainingPlan = completion.choices[0]?.message?.content;
    
    if (!trainingPlan) {
      throw new Error('No training plan generated');
    }
    
    console.log('Successfully generated training plan');
    
    res.status(200).json({
      success: true,
      plan: trainingPlan,
      userData: { name, email, fitnessLevel, hikingExperience, county, targetDate, daysPerWeek }
    });
    
  } catch (error) {
    console.error('Error generating training plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate training plan',
      details: error.message
    });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=== Hiking Training Planner Server ===`);
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY.slice(-4) : 'Not set'}`);
  console.log('==================================\n');
});
