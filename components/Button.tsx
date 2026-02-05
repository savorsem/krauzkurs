import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  loading = false,
  icon,
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "py-3 px-4 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#6C5DD3] text-white hover:bg-[#5b4eb8] shadow-[#6C5DD3]/20",
    secondary: "bg-[#2C2F36] text-white hover:bg-[#3A3E47] border border-white/10",
    outline: "border-2 border-[#6C5DD3] text-[#6C5DD3] hover:bg-[#6C5DD3]/10",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon && <span className="text-lg leading-none">{icon}</span>}
      {children}
    </button>
  );
};