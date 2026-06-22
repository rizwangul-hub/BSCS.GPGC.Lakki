import { motion } from 'framer-motion';

/**
 * Reusable animated card component supporting glassmorphism and custom variants
 */
const Card = ({
  children,
  className = '',
  onClick,
  hoverEffect = true,
  glass = false,
  ...props
}) => {
  const baseStyle = glass
    ? 'bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6'
    : 'bg-card-light border border-slate-100 shadow-sm rounded-xl p-6';

  const hoverAnimation = hoverEffect && !onClick
    ? { transition: { duration: 0.3 } }
    : {};

  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverEffect ? { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' } : {}}
      className={`${baseStyle} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...hoverAnimation}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
