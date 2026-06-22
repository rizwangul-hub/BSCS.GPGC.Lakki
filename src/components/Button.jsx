import { motion } from 'framer-motion';

/**
 * Reusable animated button using framer-motion and Tailwind CSS
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2.5 px-5';

  const variants = {
    primary: 'bg-primary hover:bg-blue-700 text-white focus:ring-primary',
    secondary: 'bg-secondary hover:bg-slate-700 text-white focus:ring-secondary',
    accent: 'bg-accent hover:bg-cyan-600 text-white focus:ring-accent',
    outline: 'border border-slate-300 bg-transparent text-secondary hover:bg-slate-50 focus:ring-slate-300',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.96 } : {}}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            document="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : Icon ? (
        <Icon className="mr-2 h-4 w-4" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
