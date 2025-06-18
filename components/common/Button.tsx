
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading = false, fullWidth = false, className, ...props }) => {
  const baseStyles = "px-4 py-2 rounded-md font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150";
  
  let variantStyles = "";
  switch (variant) {
    case 'primary':
      variantStyles = "bg-primary text-white hover:bg-teal-700 focus:ring-primary";
      break;
    case 'secondary':
      variantStyles = "bg-accent text-white hover:bg-blue-700 focus:ring-accent";
      break;
    case 'danger':
      variantStyles = "bg-danger text-white hover:bg-red-700 focus:ring-danger";
      break;
    case 'outline':
      variantStyles = "bg-transparent text-primary border border-primary hover:bg-teal-50 focus:ring-primary";
      break;
    default:
      variantStyles = "bg-primary text-white hover:bg-teal-700 focus:ring-primary";
  }

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${widthStyles} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
    