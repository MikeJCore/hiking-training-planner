import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMountain, 
  faDumbbell, 
  faUser, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faPersonRunning, 
  faCheckCircle, 
  faFire, 
  faHeart, 
  faShoePrints,
  faMountainSun,
  faChartLine,
  faClock,
  faCalendarDay,
  faCheck 
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import FloatingInput from './FloatingInput';
import ThemeToggle from './ThemeToggle';
import '../styles/globals.css';

// Add icons to library
library.add(
  faMountain, 
  faDumbbell, 
  faUser, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faPersonRunning, 
  faCheckCircle, 
  faFire, 
  faHeart, 
  faShoePrints,
  faMountainSun,
  faChartLine,
  faClock,
  faCalendarDay,
  faCheck 
);

const UserForm = ({ onSubmit, error, planData, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    fitnessLevel: 'beginner',
    hikingExperience: 'none',
    county: 'Clare',
    daysPerWeek: '3',
    model: 'gpt-4.1-mini' 
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  const [showPlan, setShowPlan] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    setDirection(1);
    if (currentStep === 1 && (!formData.fitnessLevel || !formData.name.trim())) {
      console.log("Name and Fitness Level are required.");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[UserForm] Form submission prevented. Current step:', currentStep);
    
    // Only proceed if this is the final step and we're not already submitting
    if (currentStep === 3 && !isSubmitting) {
      console.log('[UserForm] Final step - handling form submission');
      handleGeneratePlan();
    }
  };
  
  const handleContinue = (e) => {
    e.preventDefault();
    console.log('[UserForm] Continue button clicked. Current step:', currentStep);
    nextStep();
  };
  
  const handleGeneratePlan = async () => {
    console.log('[UserForm] handleGeneratePlan called');
    
    // Validate form data
    if (!formData.name?.trim() || !formData.fitnessLevel || !formData.hikingExperience) {
      console.log('[UserForm] Form validation failed');
      return;
    }
    
    console.log('[UserForm] Form validation passed');
    
    try {
      console.log('[UserForm] Setting isSubmitting to true');
      setIsSubmitting(true);
      
      console.log('[UserForm] Calling onSubmit with form data');
      await onSubmit(formData);
      console.log('[UserForm] onSubmit completed successfully');
    } catch (error) {
      console.error('Error during form submission:', error);
    } finally {
      console.log('[UserForm] Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 sm:space-y-6"
          >
            <div className="space-y-1">
              <FloatingInput
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                showLabel={false}
                icon={
                  <FontAwesomeIcon icon="user" className="h-5 w-5 text-gray-400" />
                }
                required
              />
            </div>
            <div className="space-y-1">
              <FloatingInput
                label="Fitness Level"
                id="fitnessLevel"
                name="fitnessLevel"
                type="select"
                value={formData.fitnessLevel}
                onChange={handleChange}
                placeholder="Select your fitness level"
                options={[
                  { value: 'beginner', label: 'Occasional exerciser' },
                  { value: 'intermediate', label: 'Regular exerciser' },
                  { value: 'advanced', label: 'Advanced exerciser' },
                ]}
                icon={
                  <FontAwesomeIcon icon="person-running" className="h-5 w-5 text-gray-400" />
                }
                required
              />
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            key="step2"
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 sm:space-y-6"
          >
            <div className="space-y-1">
              <FloatingInput
                label="Hiking Experience"
                id="hikingExperience"
                name="hikingExperience"
                type="select"
                value={formData.hikingExperience}
                onChange={handleChange}
                placeholder="Select your hiking experience"
                options={[
                  { value: 'none', label: 'Never Hiked' },
                  { value: 'beginner', label: 'Occasional Hiker' },
                  { value: 'intermediate', label: 'Regular Hiker' },
                  { value: 'experienced', label: 'Expert Hiker' }
                ]}
                icon={
                  <FontAwesomeIcon icon="mountain" className="h-5 w-5 text-gray-400" />
                }
                required
              />
            </div>
            <div className="space-y-1">
              <FloatingInput
                label="County"
                id="county"
                name="county"
                type="select"
                value={formData.county}
                onChange={handleChange}
                options={[
                  { value: 'Antrim', label: 'Antrim' },
                  { value: 'Armagh', label: 'Armagh' },
                  { value: 'Carlow', label: 'Carlow' },
                  { value: 'Cavan', label: 'Cavan' },
                  { value: 'Clare', label: 'Clare' },
                  { value: 'Cork', label: 'Cork' },
                  { value: 'Derry', label: 'Derry' },
                  { value: 'Donegal', label: 'Donegal' },
                  { value: 'Down', label: 'Down' },
                  { value: 'Dublin', label: 'Dublin' },
                  { value: 'Fermanagh', label: 'Fermanagh' },
                  { value: 'Galway', label: 'Galway' },
                  { value: 'Kerry', label: 'Kerry' },
                  { value: 'Kildare', label: 'Kildare' },
                  { value: 'Kilkenny', label: 'Kilkenny' },
                  { value: 'Laois', label: 'Laois' },
                  { value: 'Leitrim', label: 'Leitrim' },
                  { value: 'Limerick', label: 'Limerick' },
                  { value: 'Longford', label: 'Longford' },
                  { value: 'Louth', label: 'Louth' },
                  { value: 'Mayo', label: 'Mayo' },
                  { value: 'Meath', label: 'Meath' },
                  { value: 'Monaghan', label: 'Monaghan' },
                  { value: 'Offaly', label: 'Offaly' },
                  { value: 'Roscommon', label: 'Roscommon' },
                  { value: 'Sligo', label: 'Sligo' },
                  { value: 'Tipperary', label: 'Tipperary' },
                  { value: 'Tyrone', label: 'Tyrone' },
                  { value: 'Waterford', label: 'Waterford' },
                  { value: 'Westmeath', label: 'Westmeath' },
                  { value: 'Wexford', label: 'Wexford' },
                  { value: 'Wicklow', label: 'Wicklow' }
                ]}
                icon={
                  <FontAwesomeIcon icon="map-marker-alt" className="h-5 w-5 text-gray-400" />
                }
                required
              />
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            key="step3"
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center">Training Preferences</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Customize your training plan by selecting your preferred options.
            </p>
            
            <div className="space-y-1">
              <FloatingInput
                label="Days per Week"
                id="daysPerWeek"
                name="daysPerWeek"
                type="select"
                value={formData.daysPerWeek}
                onChange={handleChange}
                options={[
                  { value: '2', label: '2 days per week' },
                  { value: '3', label: '3 days per week (recommended)' },
                  { value: '4', label: '4 days per week' },
                  { value: '5', label: '5 days per week' }
                ]}
                icon={
                  <FontAwesomeIcon icon="calendar-alt" className="h-5 w-5 text-gray-400" />
                }
                required
              />
            </div>
            <input type="hidden" name="model" value={formData.model} />
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Selections</h3>
              <p className="text-gray-800 dark:text-gray-200"><span className="font-semibold">Name:</span> {formData.name || 'Not provided'}</p>
              <p className="text-gray-800 dark:text-gray-200"><span className="font-semibold">Fitness Level:</span> {
                formData.fitnessLevel === 'beginner' ? 'Occasional exerciser' :
                formData.fitnessLevel === 'intermediate' ? 'Regular exerciser' :
                'Advanced exerciser'
              }</p>
              <p className="text-gray-800 dark:text-gray-200"><span className="font-semibold">Hiking Experience:</span> {
                formData.hikingExperience === 'none' ? 'Never Hiked' :
                formData.hikingExperience === 'beginner' ? 'Occasional Hiker' :
                formData.hikingExperience === 'intermediate' ? 'Regular Hiker' :
                'Expert Hiker'
              }</p>
              <p className="text-gray-800 dark:text-gray-200"><span className="font-semibold">County:</span> {formData.county}</p>
              <p className="text-gray-800 dark:text-gray-200"><span className="font-semibold">Training Days/Week:</span> {formData.daysPerWeek} {formData.daysPerWeek === '1' ? 'day' : 'days'} per week</p>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  const renderPlan = () => {
    if (!planData) return null;
    
    return (
      <div className="space-y-8">
        {/* Plan Overview */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mr-4">
              <FontAwesomeIcon icon="mountain-sun" className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Hiking Training Plan</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Here's your personalized {formData.weeks} week training plan to prepare for your hike in {formData.county}.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3">
                  <FontAwesomeIcon icon="chart-line" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fitness Level</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.fitnessLevel === 'beginner' ? 'Beginner' : 
                     formData.fitnessLevel === 'intermediate' ? 'Intermediate' : 'Advanced'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-3">
                  <FontAwesomeIcon icon="shoe-prints" className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.hikingExperience === 'none' ? 'None' : 
                     formData.hikingExperience === 'beginner' ? 'Beginner' :
                     formData.hikingExperience === 'intermediate' ? 'Intermediate' : 'Experienced'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mr-3">
                  <FontAwesomeIcon icon="calendar-day" className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formData.weeks} weeks</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full mr-3">
                  <FontAwesomeIcon icon="fire" className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Workouts/Week</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formData.daysPerWeek} days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Weekly Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <FontAwesomeIcon icon="calendar-day" className="h-5 w-5 text-green-500 mr-2" />
              Weekly Training Schedule
            </h3>
            
            {/* Day Selector */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {planData.weeks[0].days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDay(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeDay === index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {day.name}
                </button>
              ))}
            </div>
            
            {/* Day Content */}
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Workout</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {planData.weeks[0].days[activeDay]?.workout || 'Rest day'}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Details</h4>
                <ul className="space-y-2">
                  {planData.weeks[0].days[activeDay]?.details?.map((detail, i) => (
                    <li key={i} className="flex items-start">
                      <FontAwesomeIcon 
                        icon="check-circle" 
                        className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" 
                      />
                      <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                    </li>
                  )) || <li className="text-gray-500 italic">No details available</li>}
                </ul>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tips</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {planData.weeks[0].days[activeDay]?.tips || 'Take it easy and listen to your body.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setShowPlan(false)}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Back to Form
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Print Plan
          </button>
        </div>
      </div>
    );
  };

  if (planData) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          {renderPlan()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon="mountain" 
                  className="h-8 w-8 text-green-500 mr-3" 
                />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hiking Training Plan</h1>
              </div>
              <ThemeToggle />
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full ${
                          currentStep >= step
                            ? 'bg-gradient-to-br from-green-400 to-teal-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        } font-medium text-lg relative z-10 transition-all duration-300`}
                      >
                        {currentStep > step ? (
                          <FontAwesomeIcon icon="check" className="h-5 w-5" />
                        ) : (
                          step
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${
                        currentStep >= step 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step === 1 ? 'Personal Info' : step === 2 ? 'Hiking Details' : 'Preferences'}
                      </span>
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 mx-1 ${
                        currentStep > step 
                          ? 'bg-gradient-to-r from-green-400 to-teal-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      } relative -top-4`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 sm:space-y-6">
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1 || loading}
                    className={`px-6 py-2.5 text-sm font-medium ${
                      currentStep === 1 
                        ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                        : 'text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    } border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors`}
                  >
                    Back
                  </button>
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={
                        (currentStep === 1 && (!formData.fitnessLevel || !formData.name.trim())) || 
                        (currentStep === 2 && !formData.hikingExperience)
                      }
                      className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || isSubmitting}
                      className={`px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform shadow-lg flex items-center justify-center min-w-[200px] ${
                        loading || isSubmitting
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:from-green-600 hover:to-teal-600 hover:shadow-xl hover:scale-105'
                      }`}
                    >
                      {loading || isSubmitting ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <FontAwesomeIcon icon="mountain" className="h-4 w-4 mr-2" />
                          <span>Generate My Training Plan</span>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
