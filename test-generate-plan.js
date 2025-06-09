import axios from 'axios';

async function testGeneratePlan() {
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
      timeout: 60000, // 60 seconds timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error Details:');
    console.error('- Message:', error.message);
    
    if (error.response) {
      console.error('- Status:', error.response.status);
      console.error('- Data:', error.response.data);
    } else if (error.request) {
      console.error('- Request was made but no response received');
      console.error('- Request config:', error.config);
    } else {
      console.error('- Error config:', error.config);
    }
  }
}

// Run the test
testGeneratePlan();
