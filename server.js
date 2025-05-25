import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ics from 'ics';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from the dist directory after build
app.use(express.static(path.join(__dirname, 'dist')));

// County data including suitable training hikes
const countyData = {
  Antrim: {
    hikes: [
      { name: "Slemish Mountain", difficulty: "Moderate", elevation: 437, distance: 1.5, description: "Volcanic plug with steep incline, great for leg strength" },
      { name: "Divis and Black Mountain", difficulty: "Easy to Moderate", elevation: 478, distance: 4.2, description: "Rolling hills with marked trails and views of Belfast" }
    ]
  },
  Armagh: {
    hikes: [
      { name: "Slieve Gullion", difficulty: "Moderate", elevation: 573, distance: 9.5, description: "Circular route with stunning views of South Armagh" }
    ]
  },
  Carlow: {
    hikes: [
      { name: "Mount Leinster", difficulty: "Moderate", elevation: 795, distance: 5, description: "Highest mountain in the Blackstairs range with a path to the summit" },
      { name: "Brandon Hill", difficulty: "Moderate", elevation: 515, distance: 6, description: "Highest point in County Kilkenny with clear paths" }
    ]
  },
  Cavan: {
    hikes: [
      { name: "Cuilcagh Mountain", difficulty: "Moderate", elevation: 665, distance: 14.8, description: "Boardwalk trail leading to the summit with spectacular views" }
    ]
  },
  Clare: {
    hikes: [
      { name: "Moylussa", difficulty: "Moderate", elevation: 532, distance: 10, description: "Highest point in Clare with views over Lough Derg" }
    ]
  },
  Cork: {
    hikes: [
      { name: "Hungry Hill", difficulty: "Difficult", elevation: 685, distance: 8, description: "Challenging mountain with steep ascents and beautiful views" },
      { name: "Mount Gabriel", difficulty: "Moderate", elevation: 407, distance: 5, description: "Accessible peak with views of Roaringwater Bay" }
    ]
  },
  Derry: {
    hikes: [
      { name: "Binevenagh", difficulty: "Moderate", elevation: 385, distance: 4, description: "Dramatic cliff face with panoramic views of the coast" }
    ]
  },
  Donegal: {
    hikes: [
      { name: "Mount Errigal", difficulty: "Difficult", elevation: 751, distance: 4.5, description: "Iconic quartzite peak with challenging ascent" },
      { name: "Slieve League", difficulty: "Moderate to Difficult", elevation: 601, distance: 12, description: "Some of Europe's highest sea cliffs with marked trails" }
    ]
  },
  Down: {
    hikes: [
      { name: "Slieve Donard", difficulty: "Difficult", elevation: 850, distance: 9, description: "Highest peak in Northern Ireland with well-marked trail" }
    ]
  },
  Dublin: {
    hikes: [
      { name: "Two Rock Mountain", difficulty: "Moderate", elevation: 536, distance: 6, description: "Popular hiking destination with views over Dublin city" },
      { name: "Ticknock", difficulty: "Easy to Moderate", elevation: 445, distance: 5.5, description: "Forest trails with city views" }
    ]
  },
  Fermanagh: {
    hikes: [
      { name: "Cuilcagh Mountain", difficulty: "Moderate", elevation: 665, distance: 14.8, description: "Famous boardwalk trail with stunning views" }
    ]
  },
  Galway: {
    hikes: [
      { name: "Diamond Hill", difficulty: "Moderate", elevation: 442, distance: 7, description: "Well-marked trail in Connemara National Park" },
      { name: "Benbaun", difficulty: "Difficult", elevation: 729, distance: 10, description: "Highest peak in the Twelve Bens" }
    ]
  },
  Kerry: {
    hikes: [
      { name: "Torc Mountain", difficulty: "Moderate", elevation: 535, distance: 7.5, description: "Good practice hike with similar terrain to Carrauntoohil but more accessible" },
      { name: "Purple Mountain", difficulty: "Difficult", elevation: 832, distance: 10, description: "Challenging ridge walk with exceptional views of the MacGillycuddy's Reeks" },
      { name: "Mount Brandon", difficulty: "Difficult", elevation: 952, distance: 8, description: "Ireland's second-highest peak, excellent preparation for Carrauntoohil" }
    ]
  },
  Kildare: {
    hikes: [
      { name: "Hill of Allen", difficulty: "Easy", elevation: 202, distance: 3, description: "Historic hill with gentle slopes" }
    ]
  },
  Kilkenny: {
    hikes: [
      { name: "Brandon Hill", difficulty: "Moderate", elevation: 515, distance: 6, description: "Highest point in Kilkenny with clear trails" }
    ]
  },
  Laois: {
    hikes: [
      { name: "Ridge of Capard", difficulty: "Moderate", elevation: 483, distance: 7, description: "Scenic walk in the Slieve Bloom Mountains" }
    ]
  },
  Leitrim: {
    hikes: [
      { name: "Truskmore", difficulty: "Moderate", elevation: 647, distance: 8, description: "Highest point in Leitrim with views of Sligo Bay" }
    ]
  },
  Limerick: {
    hikes: [
      { name: "Galtymore", difficulty: "Difficult", elevation: 919, distance: 10, description: "Highest inland mountain in Ireland" }
    ]
  },
  Longford: {
    hikes: [
      { name: "Cairn Hill", difficulty: "Easy to Moderate", elevation: 279, distance: 4, description: "Highest point in Longford with forest trails" }
    ]
  },
  Louth: {
    hikes: [
      { name: "Slieve Foye", difficulty: "Moderate", elevation: 589, distance: 8, description: "Highest point in Louth with views of Carlingford Lough" }
    ]
  },
  Mayo: {
    hikes: [
      { name: "Croagh Patrick", difficulty: "Difficult", elevation: 764, distance: 7, description: "Ireland's holy mountain with steep ascent" },
      { name: "Mweelrea", difficulty: "Difficult", elevation: 814, distance: 12, description: "Connacht's highest mountain" }
    ]
  },
  Meath: {
    hikes: [
      { name: "Hill of Tara", difficulty: "Easy", elevation: 155, distance: 3, description: "Historic site with gentle walking trails" }
    ]
  },
  Monaghan: {
    hikes: [
      { name: "Sliabh Beagh", difficulty: "Moderate", elevation: 380, distance: 8, description: "Highest point in Monaghan with waymarked trails" }
    ]
  },
  Offaly: {
    hikes: [
      { name: "Arderin", difficulty: "Moderate", elevation: 527, distance: 10, description: "Highest point in the Slieve Bloom Mountains" }
    ]
  },
  Roscommon: {
    hikes: [
      { name: "Seltannasaggart", difficulty: "Moderate", elevation: 428, distance: 6, description: "Highest point in Roscommon" }
    ]
  },
  Sligo: {
    hikes: [
      { name: "Benbulbin", difficulty: "Difficult", elevation: 526, distance: 8, description: "Distinctive table mountain with challenging trails" },
      { name: "Knocknarea", difficulty: "Moderate", elevation: 327, distance: 5, description: "Prominent hill with queen Maeve's cairn" }
    ]
  },
  Tipperary: {
    hikes: [
      { name: "Galtymore", difficulty: "Difficult", elevation: 919, distance: 10, description: "Highest inland mountain in Ireland" }
    ]
  },
  Tyrone: {
    hikes: [
      { name: "Sawel Mountain", difficulty: "Moderate", elevation: 678, distance: 12, description: "Highest point in County Tyrone" }
    ]
  },
  Waterford: {
    hikes: [
      { name: "Knockmealdown", difficulty: "Difficult", elevation: 794, distance: 13, description: "Highest point in the Knockmealdown Mountains" }
    ]
  },
  Westmeath: {
    hikes: [
      { name: "Hill of Uisneach", difficulty: "Easy", elevation: 182, distance: 2.5, description: "Historic hill with gentle slopes" }
    ]
  },
  Wexford: {
    hikes: [
      { name: "Mount Leinster", difficulty: "Moderate", elevation: 795, distance: 5, description: "Highest point in the Blackstairs Mountains" }
    ]
  },
  Wicklow: {
    hikes: [
      { name: "Lugnaquilla", difficulty: "Difficult", elevation: 925, distance: 13, description: "Highest mountain in Wicklow and Leinster" },
      { name: "Mount Kippure", difficulty: "Moderate", elevation: 757, distance: 8, description: "Accessible mountain with boggy terrain" }
    ]
  }
};

// Initialize OpenAI with environment variable for API key
let openai;
const DEFAULT_MODEL = 'gpt-4.1-mini'; // Hardcode the model to ensure it's always used
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();

if (OPENAI_API_KEY) {
  try {
    console.log('Initializing OpenAI with model:', DEFAULT_MODEL);
    openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      defaultHeaders: {
        'OpenAI-Model': DEFAULT_MODEL,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`OpenAI API initialized successfully with model: ${DEFAULT_MODEL}`);
    
    // Log the configuration being used
    console.log('OpenAI Configuration:', {
      model: DEFAULT_MODEL,
      apiKey: '***' + OPENAI_API_KEY.slice(-4) + '...',
      baseURL: openai.baseURL
    });
  } catch (error) {
    console.warn('Failed to initialize OpenAI API, using fallback plans');
    console.error('OpenAI Error:', error.message);
    openai = null;
  }
} else {
  console.warn('No OPENAI_API_KEY found in environment variables, using fallback plans');
  openai = null;
}

// Predefined training plans
const predefinedPlans = {
  beginner: {
    2: {
      personalizedIntro: "As a beginner hiker, we'll focus on building your endurance and strength gradually. Start with shorter hikes and gradually increase the difficulty.",
      weeklyPlans: [
        {
          week: 1,
          focus: "Building a foundation",
          days: [
            { day: 1, activity: "30-minute walk on flat terrain", duration: "30 minutes", notes: "Focus on maintaining a steady pace" },
            { day: 2, activity: "Rest day", duration: "-", notes: "Allow your body to recover" },
            { day: 3, activity: "45-minute walk with light hills", duration: "45 minutes", notes: "Include some elevation if possible" },
            { day: 4, activity: "Rest day", duration: "-", notes: "Active recovery or complete rest" },
            { day: 5, activity: "60-minute walk with backpack (5kg)", duration: "60 minutes", notes: "Get used to carrying weight" },
            { day: 6, activity: "Rest day", duration: "-", notes: "Light stretching or yoga" },
            { day: 7, activity: "Rest day", duration: "-", notes: "Complete rest" }
          ]
        },
        // Additional weeks would be added here
      ],
      recommendedHikes: [
        { name: "Dublin Mountains Way (Partial)", recommendedWeek: 3, preparation: "Start with shorter sections of the trail" },
        { name: "Howth Cliff Walk", recommendedWeek: 5, preparation: "Good for practicing elevation changes" }
      ],
      equipmentRecommendations: {
        essential: ["Hiking boots with good ankle support", "Weather-appropriate clothing", "Backpack (20-30L)", "Water bottle (2L)"],
        recommended: ["Hiking poles", "Rain cover for backpack", "First aid kit"],
        progressiveAcquisition: "Start with essential footwear and clothing, then gradually add other items as you progress."
      },
      nutritionGuidance: {
        training: "Stay hydrated and eat balanced meals with carbs, protein, and healthy fats.",
        preclimb: "Eat a carb-rich meal the night before and a light breakfast 2 hours before hiking.",
        dayCare: "Bring high-energy snacks like nuts, dried fruit, and energy bars."
      }
    },
    3: {
      // Similar structure for 3 days/week plan
      personalizedIntro: "With 3 days per week, we can balance training and recovery effectively. We'll focus on building your hiking-specific fitness.",
      weeklyPlans: [
        // Weekly plans would be defined here
      ]
    },
    4: {
      // 4 days/week plan
    },
    5: {
      // 5+ days/week plan
    }
  },
  intermediate: {
    // Similar structure for intermediate hikers
  },
  advanced: {
    // Similar structure for advanced hikers
  }
};

// Generate a fallback plan when API is not available
const generateFallbackPlan = (fitnessLevel, daysPerWeek) => {
  const levelPlans = predefinedPlans[fitnessLevel.toLowerCase()] || predefinedPlans.beginner;
  const weeklyPlan = levelPlans[daysPerWeek] || levelPlans[Object.keys(levelPlans)[0]];
  
  return {
    success: true,
    plan: weeklyPlan,
    isFallback: true
  };
};

// API routes
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { 
      fitnessLevel, 
      hikingExperience, 
      county, 
      daysPerWeek, 
      name, 
      ageGroup,
      model = DEFAULT_MODEL // Default to environment's default model
    } = req.body;
    
    // If OpenAI is not available, use the fallback plan
    if (!openai) {
      console.log('Using fallback plan as OpenAI is not available');
      const fallbackPlan = generateFallbackPlan(fitnessLevel, daysPerWeek);
      return res.json(fallbackPlan);
    }
    
    // If we have OpenAI, proceed with generating a plan using the API
    
    // Calculate weeks remaining until September 26, 2025
    const targetDate = new Date('2025-09-26');
    const currentDate = new Date();
    const timeRemaining = targetDate - currentDate;
    const weeksRemaining = Math.ceil(timeRemaining / (7 * 24 * 60 * 60 * 1000));
    
    // Get county-specific hike recommendations
    const countyHikes = countyData[county]?.hikes || [];
    
    // Generate prompt for OpenAI
    const prompt = `
      You are an expert hiking trainer specialized in mountain climbing preparation.
      
      Generate a comprehensive training plan for climbing Carrauntoohil (3,414 ft) on September 26, 2025.
      
      USER DETAILS:
      - Name: ${name || 'Anonymous'}
      - Age Group: ${ageGroup}
      - Fitness Level: ${fitnessLevel}
      - Hiking Experience: ${hikingExperience}
      - Located in: County ${county}, Ireland
      - Available training days: ${daysPerWeek} days per week
      - Time remaining: ${weeksRemaining} weeks
      
      COUNTY-SPECIFIC HIKING RECOMMENDATIONS:
      ${countyHikes.map(hike => `- ${hike.name}: ${hike.difficulty}, ${hike.elevation}m, ${hike.distance}km - ${hike.description}`).join('\n')}
      
      INSTRUCTIONS:
      1. Create a progressive weekly training schedule for the entire ${weeksRemaining} weeks
      2. Include specific workouts for each of the ${daysPerWeek} training days per week
      3. Incorporate the recommended local hikes from the user's county as part of the training
      4. Include rest days and recovery activities
      5. Add equipment recommendations specific to Irish weather conditions
      6. Include nutrition guidance both for training and the actual climb
      
      Structure the response in the following JSON format:
      {
        "personalizedIntro": "A paragraph of encouragement and overview tailored to the user's specific situation",
        "weeklyPlans": [
          {
            "week": 1,
            "focus": "Main focus of this week",
            "days": [
              {
                "day": 1,
                "activity": "Detailed activity description",
                "duration": "Estimated duration",
                "notes": "Any specific guidance or tips"
              }
            ]
          }
        ],
        "recommendedHikes": [
          {
            "name": "Name of the hike",
            "recommendedWeek": "Week number when this hike should be attempted",
            "preparation": "Specific preparation needed for this hike"
          }
        ],
        "equipmentRecommendations": {
          "essential": ["List of essential items"],
          "recommended": ["List of recommended but optional items"],
        },
        "nutritionGuidance": {
          "training": "Nutrition advice during training",
          "preclimb": "What to eat the day before",
          "dayCare": "What to bring for the climb day"
        }
      }
    `;

    let trainingPlan;
    
    try {
      // Try to get a plan from OpenAI
      console.log('\n--- Sending request to OpenAI ---');
      console.log('Model:', DEFAULT_MODEL);
      console.log('API Key:', '***' + OPENAI_API_KEY.slice(-4) + '...');
      
      const requestBody = {
        model: DEFAULT_MODEL,
        messages: [
          { 
            role: "system", 
            content: `You are an expert hiking trainer specializing in mountain climbing preparation. 
                      Always respond with valid JSON that includes a personalized training plan.
                      The plan should be for a ${fitnessLevel} hiker with ${hikingExperience} experience,
                      training ${daysPerWeek} days per week for a hike in ${county}.
                      
                      Format your response as a JSON object with the following structure:
                      {
                        "personalizedIntro": "...",
                        "weeklyPlans": [
                          {
                            "weekNumber": 1,
                            "focus": "...",
                            "workouts": ["...", "..."]
                          }
                        ],
                        "recommendedHikes": [
                          {
                            "name": "...",
                            "recommendedWeek": "...",
                            "preparation": "..."
                          }
                        ],
                        "equipmentRecommendations": {
                          "essential": ["..."],
                          "recommended": ["..."]
                        },
                        "nutritionGuidance": {
                          "training": "...",
                          "preclimb": "...",
                          "dayCare": "..."
                        }
                      }`
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 4000, // Increased to allow for larger responses
        response_format: { type: "json_object" }
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const completion = await openai.chat.completions.create(requestBody);
      
      console.log('OpenAI Response:', JSON.stringify(completion, null, 2));

      // Parse the response
      trainingPlan = JSON.parse(completion.choices[0]?.message?.content || '{}');
      if (!trainingPlan || Object.keys(trainingPlan).length === 0) {
        throw new Error('Empty response from OpenAI');
      }
    } catch (apiError) {
      console.error('OpenAI API error, using fallback plan:', apiError);
      return res.json(generateFallbackPlan(fitnessLevel, daysPerWeek));
    }
    
    // Return the training plan
    res.json({
      success: true,
      plan: trainingPlan,
      weeksRemaining,
      countyHikes
    });
    
  } catch (error) {
    console.error('Error generating training plan:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate training plan',
      isConfigError: error.status === 403 || error.message.includes('API key')
    });
  }
});

app.post('/api/generate-pdf', (req, res) => {
  try {
    const { plan, userData } = req.body;
    
    // Create a PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 72, right: 72 }
    });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Carrauntoohil_Training_Plan.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(24).text('Carrauntoohil Training Plan', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Prepared for: ${userData.name || 'Anonymous'}`, { align: 'center' });
    doc.fontSize(14).text(`Fitness Level: ${userData.fitnessLevel}`, { align: 'center' });
    doc.fontSize(14).text(`County: ${userData.county}`, { align: 'center' });
    doc.fontSize(14).text(`Training Days: ${userData.daysPerWeek} per week`, { align: 'center' });
    
    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF'
    });
  }
});

app.post('/api/generate-calendar', (req, res) => {
  try {
    const { plan, userData } = req.body;
    const events = [];
    
    // Add training events
    plan.weeklyPlans.forEach(week => {
      week.days.forEach(day => {
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + ((week.week - 1) * 7) + (day.day - 1));
        
        events.push({
          title: `Training: ${day.activity.substring(0, 50)}...`,
          description: `${day.activity}\n\nNotes: ${day.notes}`,
          start: [
            eventDate.getFullYear(),
            eventDate.getMonth() + 1,
            eventDate.getDate(),
            9, // Default to 9AM
            0
          ],
          duration: { hours: 2 }, // Default duration
          categories: ['training', 'fitness', 'preparation']
        });
      });
    });
    
    ics.createEvents(events, (error, value) => {
      if (error) {
        throw error;
      }
      
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename=Carrauntoohil_Training_Plan.ics');
      res.send(value);
    });
    
  } catch (error) {
    console.error('Error generating calendar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate calendar file'
    });
  }
});

// Handle React Router routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Add error handling for unhandled promises
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

// Function to start server
const startServer = (port) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${parseInt(port) + 1}...`);
      startServer(parseInt(port) + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

// Start the server
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

// Add error handling for the server
const server = app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Handle SIGTERM (for Render's shutdown signal)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Log when the server is ready
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Server listening on ${bind}`);
});

// For Render's health checks
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Start the server if this file is run directly
if (process.env.NODE_ENV !== 'test') {
  console.log(`Starting server on port ${PORT}...`);
  server.on('listening', () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}