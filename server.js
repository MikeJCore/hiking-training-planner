import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ics from 'ics';
import dotenv from 'dotenv';
import { StatusCodes } from 'http-status-codes';

// Load environment variables
dotenv.config();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 10000; // Default to Render's port

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS configuration
const allowedOrigins = [
  'https://hiking-training-planner.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5001'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      console.error(`[${new Date().toISOString()}] ${msg}`);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 600 // Cache preflight request for 10 minutes
};

// Apply CORS middleware
app.use(cors(corsOptions));


// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the dist directory if it exists
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }));
  console.log('Serving static files from:', distPath);
} else {
  console.log('No dist directory found, static file serving disabled');
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parser with increased limit for large JSON payloads
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle SPA (Single Page Application)
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = process.env.NODE_ENV === 'production' && statusCode >= 500
    ? 'Something went wrong!'
    : err.message;
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});


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
      timeout: 30000, // 30 seconds
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

// Define predefined plans for fallback
const predefinedPlans = {
  beginner: {
    3: {
      personalizedIntro: "This is a beginner-friendly training plan to prepare you for Carrauntoohil. We'll focus on building your endurance and strength gradually.",
      weeklyPlans: [
        {
          weekNumber: 1,
          focus: "Building Base Fitness",
          workouts: [
            { day: 1, activity: "30 min brisk walk", duration: "30 minutes", notes: "Focus on good posture and steady breathing" },
            { day: 3, activity: "45 min walk with hills", duration: "45 minutes", notes: "Find a route with some inclines" },
            { day: 5, activity: "1 hour easy hike", duration: "1 hour", notes: "Practice on uneven terrain if possible" }
          ]
        }
      ],
      recommendedHikes: [
        { name: "Local Park Trails", recommendedWeek: 2, preparation: "Wear comfortable shoes and bring water" }
      ],
      equipmentRecommendations: {
        essential: ["Hiking boots with ankle support", "Waterproof jacket", "Backpack (20-30L)", "Water bottle (1-2L)"],
        recommended: ["Hiking poles", "Moisture-wicking clothing", "First aid kit"]
      },
      nutritionGuidance: {
        training: "Stay hydrated and eat balanced meals with protein, complex carbs, and healthy fats",
        preclimb: "Eat a carb-rich meal the night before, hydrate well",
        dayCare: "Bring high-energy snacks like nuts, dried fruit, and energy bars"
      }
    }
  },
  intermediate: {
    3: {
      personalizedIntro: "This is an intermediate training plan to prepare you for Carrauntoohil. We'll build on your existing fitness and prepare you for the challenge.",
      weeklyPlans: [
        {
          weekNumber: 1,
          focus: "Building Endurance",
          workouts: [
            { day: 1, activity: "45 min brisk walk with hills", duration: "45 minutes", notes: "Include some steep sections" },
            { day: 3, activity: "1 hour hike with elevation gain", duration: "1 hour", notes: "Find a trail with 200-300m elevation gain" },
            { day: 5, activity: "1.5 hour endurance hike", duration: "1.5 hours", notes: "Maintain a steady pace" }
          ]
        }
      ],
      recommendedHikes: [
        { name: "Local Mountain Trails", recommendedWeek: 3, preparation: "Bring proper hiking gear and check weather conditions" }
      ],
      equipmentRecommendations: {
        essential: ["Sturdy hiking boots", "Waterproof layers", "Navigation tools", "Adequate water supply"],
        recommended: ["Trekking poles", "GPS device", "Emergency shelter"]
      },
      nutritionGuidance: {
        training: "Focus on protein for recovery and complex carbs for energy",
        preclimb: "Increase carb intake 2-3 days before the hike",
        dayCare: "Pack high-energy, easily digestible snacks and electrolytes"
      }
    }
  },
  advanced: {
    3: {
      personalizedIntro: "This is an advanced training plan to prepare you for Carrauntoohil. We'll focus on building strength and endurance for the challenge ahead.",
      weeklyPlans: [
        {
          weekNumber: 1,
          focus: "Strength and Endurance",
          workouts: [
            { day: 1, activity: "1 hour hill repeats", duration: "1 hour", notes: "Find a steep hill and do 6-8 repeats" },
            { day: 3, activity: "1.5 hour hike with weighted pack", duration: "1.5 hours", notes: "Carry 10-15% of your body weight" },
            { day: 5, activity: "2+ hour endurance hike", duration: "2+ hours", notes: "Focus on maintaining a good pace on varied terrain" }
          ]
        }
      ],
      recommendedHikes: [
        { name: "Challenging Mountain Routes", recommendedWeek: 2, preparation: "Full gear test, including emergency equipment" }
      ],
      equipmentRecommendations: {
        essential: ["High-quality hiking boots", "All-weather gear", "Emergency supplies", "Navigation tools"],
        recommended: ["Satellite communicator", "Extra food and water", "Bivvy bag"]
      },
      nutritionGuidance: {
        training: "High-protein recovery meals, complex carbs pre-workout",
        preclimb: "Carb-loading strategy starting 3 days before",
        dayCare: "High-energy, easily digestible food, electrolytes, and hydration strategy"
      }
    }
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
      model = DEFAULT_MODEL // Default to environment's default model
    } = req.body;
    
    // If OpenAI is not available, use the fallback plan
    if (!openai) {
      console.error('OpenAI API client not initialized. Cannot generate plan.');
      return res.status(503).json({ 
        success: false, 
        error: 'OpenAI API client not initialized. Please check server logs and API key configuration.' 
      });
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
      console.error('OpenAI API error during plan generation:', apiError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate training plan from OpenAI.',
        details: apiError.message || 'Unknown error during OpenAI API call.'
      });
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

// Start the server
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

// Function to start server with port handling
const startServer = (port) => {
  const server = app.listen(port, HOST, () => {
    console.log(`Server is running on http://${HOST}:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${parseInt(port) + 1}...`);
      startServer(parseInt(port) + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
  
  return server;
};

// Start the server
const server = startServer(PORT);

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