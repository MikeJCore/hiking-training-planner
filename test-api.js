// Test script to check API connection
import axios from 'axios';

async function testApi() {
  try {
    const response = await axios.post('http://localhost:5001/api/generate-plan', {
      fitnessLevel: 'beginner',
      hikingExperience: 'none',
      county: 'Wicklow',
      targetDate: '2024-08-15',
      daysPerWeek: 3,
      email: 'test@example.com',
      name: 'Test User'
    });
    
    console.log('API Response:', response.data);
  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
  }
}

testApi();
