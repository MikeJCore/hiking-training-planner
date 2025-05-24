import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

// Add spinner to library if not already added globally
library.add(faSpinner);

const LoadingScreen = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark overlay
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999, // Ensure it's on top
            color: 'white',
            textAlign: 'center',
            padding: '20px'
          }}
        >
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <h2 style={{ marginTop: '20px', fontSize: '1.5rem' }}>Generating Your Plan...</h2>
          <p style={{ marginTop: '10px', fontSize: '1rem' }}>
            Our AI is crafting the perfect hiking schedule for you.
            <br />
            This might take a moment, please wait.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
