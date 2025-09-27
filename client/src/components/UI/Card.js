import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
  const hoverClasses = hover ? 'hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${className}`;

  const CardComponent = (
    <div className={classes} {...props}>
      {children}
    </div>
  );

  if (hover && onClick) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        onClick={onClick}
      >
        {CardComponent}
      </motion.div>
    );
  }

  return CardComponent;
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

const CardBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
