import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserForm from './components/UserForm';
import TrainingPlan from './components/TrainingPlan';
import Header from './components/Header';
import Footer from './components/Footer';
import About from './components/About';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateTrainingPlan = async (formData) => {
    console.log('[GP] Starting generateTrainingPlan', JSON.parse(JSON.stringify(formData)));
    setLoading(true);
    // First validate the form data
    if (!formData || !formData.name || !formData.fitnessLevel || !formData.hikingExperience) {
      console.log('[GP] Validation failed: Missing fields');
      setError('Please fill in all required fields');
      throw new Error('Validation failed');
    }
    console.log('[GP] Validation passed');
    
    setError(null);
    
    try {
      console.log('[GP] Entering try block, about to fetch...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('[GP] Fetch timeout triggered after 120 seconds.');
        controller.abort();
      }, 120000); // 120 seconds timeout

      // Use environment variable for API URL with fallback to localhost for development
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiUrl = `${baseUrl}/api/generate-plan`;
      console.log('[GP] Using local server URL:', apiUrl);
      
      console.log('[GP] Sending request to:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fitnessLevel: formData.fitnessLevel,
          hikingExperience: formData.hikingExperience,
          county: formData.county,
          targetDate: formData.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days from now
          daysPerWeek: parseInt(formData.daysPerWeek) || 3,
          email: formData.email || 'user@example.com',
          name: formData.name
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if fetch completes/errors in time
      console.log('[GP] Fetch completed, response status:', response.status);

      // First check if the response is ok (status 200-299)
      if (!response.ok) {
        console.log('[GP] Response not OK');
        let errorMsg = `Server responded with status: ${response.status}`;
        try {
          // Try to parse the error response as JSON
          const errorData = await response.json();
          console.log('[GP] Parsed error response from server:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.log('[GP] Could not parse error response as JSON:', e);
          // If we can't parse the error as JSON, use the status text
          errorMsg = `Server error: ${response.status} ${response.statusText}`;
        }
        console.log(`[GP] Throwing error due to !response.ok: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      console.log('[GP] Response OK, about to parse JSON...');

      // If response is ok, try to parse JSON
      let data;
      try {
        data = await response.json();
        console.log('[GP] JSON parsed successfully:', data);
      } catch (e) {
        console.log('[GP] Error parsing JSON:', e);
        throw new Error('Invalid JSON response from server');
      }
      
      // Check if we got a valid plan in the response
      if (!data.plan) {
        console.log('[GP] No plan in data:', data);
        throw new Error(data.error || 'No training plan data received from server');
      }
      console.log('[GP] Plan received, updating state...');

      setTrainingPlan(data.plan);
      setUserData(formData);
      console.log('[GP] State updated, generateTrainingPlan successful.');
    } catch (error) {
      console.error('Error generating training plan:', error.message);
      setError(error.message || 'Failed to generate training plan. Please try again.');
      throw error; // Re-throw to be caught by the form's error handling
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTrainingPlan(null);
    setUserData(null);
    setError(null);
  };

  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        <LoadingScreen isLoading={loading} />
        <Header />
        <main className="container mx-auto p-4 flex-grow">
          <Routes>
            <Route 
              path="/" 
              element={
                trainingPlan ? (
                  <TrainingPlan 
                    plan={trainingPlan} 
                    userData={userData} 
                    onReset={handleReset} 
                  />
                ) : (
                  <UserForm 
                    onSubmit={generateTrainingPlan}
                    error={error} 
                  />
                )
              } 
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;