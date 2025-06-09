// Debug version of server.js with enhanced logging
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
  
  const originalSend = res.send;
  res.send = function(body) {
    console.log('Response:', body);
    return originalSend.call(this, body);
  };
  
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

// Test OpenAI connection endpoint
app.get('/api/test-openai', async (req, res) => {
  console.log('Testing OpenAI connection...');
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('Sending request to OpenAI...');
    const models = await openai.models.list();
    console.log('OpenAI response received');
    
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

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=== Debug Server Started ===`);
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY.slice(-4) : 'Not set'}`);
  console.log('===========================\n');
});
