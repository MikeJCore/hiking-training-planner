import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingInput = ({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange, 
  options,
  required = false,
  className = '',
  icon = null,
  showLabel = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = showLabel && (isFocused || value || type === 'date' || type === 'time');

  if (type === 'select') {
    return (
      <div className="relative group">
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          
          <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            className={`block w-full h-12 pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:ring-opacity-50
              bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 appearance-none cursor-pointer
              transition-all duration-200 ${className} pt-3`}
            required={required}
            style={{ paddingLeft: icon ? '2.5rem' : '1rem' }}
            {...props}
          >
            <option value="" disabled hidden>
              {label}
            </option>
            {options?.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                className="py-2 dark:bg-gray-800 dark:text-gray-200"
              >
                {option.label || option.value}
              </option>
            ))}
          </select>
          
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <AnimatePresence>
        {isFloating && (
          <motion.label
            htmlFor={id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute left-3 -top-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-1.5 rounded pointer-events-none z-10"
          >
            {label}
          </motion.label>
        )}
      </AnimatePresence>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={!showLabel || !isFloating ? label || props.placeholder : ''}
          className={`block w-full h-12 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
            focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:ring-opacity-50
            bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
            transition-all duration-200 ${className}`}
          style={{ paddingLeft: icon ? '2.5rem' : '1rem' }}
          required={required}
          {...props}
        />
      </div>
      
      {!isFloating && !value && (
        <label 
          htmlFor={id}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none transition-all duration-200"
          style={{ left: icon ? '2.5rem' : '1rem' }}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default FloatingInput;