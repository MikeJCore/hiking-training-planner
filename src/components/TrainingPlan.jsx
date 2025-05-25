import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiCalendar, FiShare, FiArrowLeft, FiCheck, FiCopy } from 'react-icons/fi';

const TrainingPlan = ({ 
  plan = { 
    weeklyPlans: [],
    recommendedHikes: [],
    equipmentRecommendations: { essential: [], recommended: [], progressiveAcquisition: '' },
    nutritionGuidance: { training: '', preclimb: '', dayCare: '' },
    personalizedIntro: ''
  }, 
  userData = { name: '' }, 
  onReset = () => {} 
}) => {
  // Ensure plan has all required properties with defaults
  const safePlan = {
    weeklyPlans: [],
    recommendedHikes: [],
    equipmentRecommendations: { essential: [], recommended: [], progressiveAcquisition: '' },
    nutritionGuidance: { training: '', preclimb: '', dayCare: '' },
    personalizedIntro: ''
  };

  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [activeWeek, setActiveWeek] = useState(0);
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const title = `My Carrauntoohil Training Plan - ${userData?.name || ''}`.trim();
  
  // Safely access nested properties with defaults
  const weeklyPlans = plan?.weeklyPlans || [];
  const recommendedHikes = plan?.recommendedHikes || [];
  const personalizedIntro = plan?.personalizedIntro || 'Your personalized training plan will be generated here.';
  
  const copyPlanLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const shareOnWhatsApp = () => {
    const text = `Check out my Carrauntoohil training plan! ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, userData }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Carrauntoohil_Training_Plan.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleDownloadCalendar = async () => {
    try {
      const response = await fetch('/api/generate-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, userData }),
      });

      if (!response.ok) throw new Error('Failed to generate calendar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Carrauntoohil_Training_Plan.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading calendar:', error);
      alert('Failed to download calendar. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header with Actions */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
              Your Training Plan
            </h1>
            {userData?.name && (
              <p className="text-gray-600 dark:text-gray-300">
                Prepared for {userData.name} • {plan.weeks} weeks • {plan.difficulty} difficulty
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-teal-500 text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              <FiDownload className="w-5 h-5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            
            <button
              onClick={handleDownloadCalendar}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <FiCalendar className="w-5 h-5" />
              <span className="hidden sm:inline">Add to Calendar</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all shadow-md hover:shadow-lg"
              >
                <FiShare className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              
              <AnimatePresence>
                {showShareOptions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Share training plan</h3>
                      <button 
                        onClick={() => setShowShareOptions(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                      >
                        <FaFacebookF className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </a>
                      
                      <a 
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                      >
                        <FaTwitter className="w-5 h-5 text-blue-400" />
                      </a>
                      
                      <button 
                        onClick={shareOnWhatsApp}
                        className="flex items-center justify-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
                      >
                        <FaWhatsapp className="w-5 h-5 text-green-500" />
                      </button>
                      
                      <a 
                        href={`mailto:?subject=${encodeURIComponent(title)}&body=Check out my Carrauntoohil training plan! ${encodeURIComponent(shareUrl)}`}
                        className="flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FaEnvelope className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </a>
                    </div>
                    
                    <div className="relative">
                      <input 
                        type="text" 
                        readOnly 
                        value={shareUrl} 
                        className="w-full px-3 py-2 pr-10 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200"
                        onClick={(e) => e.target.select()}
                      />
                      <button
                        onClick={copyPlanLink}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
                      >
                        {copied ? (
                          <>
                            <FiCheck className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <FiCopy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={onReset}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all shadow-md hover:shadow-lg"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Start Over</span>
            </button>
          </div>
        </div>
        
        {/* Progress Tracker */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Training Progress</h3>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Week {activeWeek + 1} of {plan.weeklyPlans?.length || 4}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-green-500 to-teal-400 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${((activeWeek + 1) / (plan.weeklyPlans?.length || 4)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">{personalizedIntro}</p>
      </div>

      {weeklyPlans.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Weekly Schedule</h2>
          {weeklyPlans.map((week = { week: 1, focus: '', days: [] }, weekIndex) => (
            <div key={week.week || weekIndex} className="mb-6 border-b pb-6">
              <h3 className="text-xl font-semibold mb-3">
                Week {week.week || weekIndex + 1}: {week.focus || 'General Training'}
              </h3>
              <div className="grid gap-4">
                {(week.days || []).length > 0 ? (
                  (week.days || []).map((day = { day: 1, activity: '', duration: '', notes: '' }, dayIndex) => (
                    <div key={day.day || dayIndex} className="bg-gray-50 p-4 rounded">
                      <h4 className="font-semibold">Day {day.day || dayIndex + 1}</h4>
                      <p className="mb-2">{day.activity || 'Rest day'}</p>
                      {day.duration && <p className="text-sm text-gray-600">Duration: {day.duration}</p>}
                      {day.notes && <p className="text-sm text-gray-600">Notes: {day.notes}</p>}
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-gray-600">No training days scheduled for this week.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-gray-600">No weekly plans available. Please check back later or try regenerating your plan.</p>
        </div>
      )}

      {recommendedHikes.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Recommended Local Hikes</h2>
          <div className="grid gap-4">
            {recommendedHikes.map((hike, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold">{hike.name}</h3>
                {hike.recommendedWeek && <p>Recommended Week: {hike.recommendedWeek}</p>}
                {hike.preparation && <p>Preparation: {hike.preparation}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-gray-600">No recommended hikes available.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Equipment</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Essential Items:</h3>
            <ul className="list-disc pl-5">
              {(plan.equipmentRecommendations?.essential || []).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Recommended Items:</h3>
            <ul className="list-disc pl-5">
              {(plan.equipmentRecommendations?.recommended || []).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
              {(plan.equipmentRecommendations?.recommended || []).length === 0 && (
                <li>No recommended items</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Acquisition Strategy:</h3>
            <p>{plan.equipmentRecommendations?.progressiveAcquisition || 'No acquisition strategy provided.'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Nutrition Guide</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">During Training:</h3>
            <p>{plan.nutritionGuidance?.training || 'No specific training nutrition guidance provided.'}</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Pre-Climb:</h3>
            <p>{plan.nutritionGuidance?.preclimb || 'No pre-climb nutrition guidance provided.'}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Day of Climb:</h3>
            <p>{plan.nutritionGuidance?.dayCare || 'No day-of nutrition guidance provided.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPlan;