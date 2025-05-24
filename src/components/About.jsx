import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">About Carrauntoohil Training Plan Generator</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">About Carrauntoohil</h2>
        <p className="mb-4">
          Carrauntoohil (Irish: Corrán Tuathail) is Ireland's highest peak, standing proudly at 1,039 meters (3,414 feet) 
          in County Kerry's MacGillycuddy's Reeks range. As part of the magnificent Reeks, it presents a challenging but 
          rewarding climb for hiking enthusiasts.
        </p>
        <p className="mb-4">
          The mountain offers several routes to the summit, with the Devil's Ladder being the most popular. Each route 
          presents its own unique challenges and requires proper preparation and training.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">About the Training Plan Generator</h2>
        <p className="mb-4">
          Our training plan generator creates personalized preparation programs for climbing Carrauntoohil. Using advanced 
          AI technology, it considers your:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Current fitness level</li>
          <li>Hiking experience</li>
          <li>Location in Ireland</li>
          <li>Available training time</li>
          <li>Local hiking opportunities</li>
        </ul>
        <p>
          Each plan is tailored to prepare you for the specific challenges of Carrauntoohil, incorporating local training 
          hikes and progressive workouts leading up to your summit attempt.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Safety First</h2>
        <p className="mb-4">
          While our training plans are comprehensive, mountain climbing always carries inherent risks. We recommend:
        </p>
        <ul className="list-disc ml-6">
          <li>Always checking weather conditions before attempting any hike</li>
          <li>Never hiking alone, especially during training for Carrauntoohil</li>
          <li>Carrying appropriate safety equipment</li>
          <li>Informing others of your hiking plans</li>
          <li>Staying within your skill level during training</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Target Date: September 26, 2025</h2>
        <p>
          All training plans are designed to prepare you for a summit attempt on September 26, 2025. This date was chosen 
          for optimal climbing conditions while giving adequate preparation time. Your personalized plan will help you 
          build the strength, endurance, and skills needed for a successful summit attempt.
        </p>
      </section>
    </div>
  );
};

export default About;