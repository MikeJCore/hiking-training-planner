// Enhanced test script for API connection
import axios from 'axios';

async function testApi() {
  try {
    console.log('Sending request to generate training plan...');
    
    const response = await axios.post('http://localhost:5001/api/generate-plan', {
      fitnessLevel: 'beginner',
      hikingExperience: 'none',
      county: 'Wicklow',
      targetDate: '2024-08-15',
      daysPerWeek: 3,
      email: 'test@example.com',
      name: 'Test User'
    }, {
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('API Error Details:');
    console.error('- Message:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('- Status:', error.response.status);
      console.error('- Data:', error.response.data);
      console.error('- Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('- Request was made but no response received');
      console.error('- Request config:', error.config);
    } else {
      // Something happened in setting up the request
      console.error('- Error config:', error.config);
    }
  }
}

// Run the test
testApi();
