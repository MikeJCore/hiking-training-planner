import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © {new Date().getFullYear()} Carrauntoohil Training Plan Generator
            </p>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/" className="text-sm hover:text-green-300">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-green-300">About</Link>
              </li>
              <li>
                <a 
                  href="https://www.mountaineering.ie/peakschallenges/Carrauntoohil/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm hover:text-green-300"
                >
                  Mountain Info
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;