import { motion } from 'framer-motion';

/**
 * Reusable full-screen or inline spinner loader
 */
const Loader = ({ fullPage = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
  };

  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className={`rounded-full border-primary border-t-transparent ${sizeClasses[size]}`}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-light/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm font-semibold text-text-secondary animate-pulse">
            Loading System...
          </p>
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
};

export default Loader;
