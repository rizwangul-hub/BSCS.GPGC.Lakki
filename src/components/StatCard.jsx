import { motion } from 'framer-motion';
import Card from './Card';

/**
 * Overview statistics card with hover effects and scroll/mount animation
 */
const StatCard = ({ title, value, suffix = '', icon: Icon, description = '', color = 'text-primary' }) => {
  return (
    <Card 
      className="relative overflow-hidden group border border-slate-100 hover:shadow-xl transition-all bg-white"
      hoverEffect={true}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col text-left">
          <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
            {title}
          </span>
          <span className="font-heading font-extrabold text-3xl text-secondary mt-1.5 leading-none">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {value}
            </motion.span>
            <span className="text-xl text-text-secondary ml-0.5">{suffix}</span>
          </span>
          {description && (
            <span className="text-[11px] text-text-secondary mt-2 leading-none">
              {description}
            </span>
          )}
        </div>

        {Icon && (
          <div className={`p-4 rounded-xl bg-slate-50 group-hover:bg-primary/5 transition-colors duration-300`}>
            <Icon className={`text-2xl ${color}`} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
