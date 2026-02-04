import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <motion.div 
        className={`${sizes[size]} rounded-xl gradient-primary flex items-center justify-center shadow-soft group-hover:shadow-elevated transition-shadow`}
        whileHover={{ scale: 1.05, rotate: -5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Zap className={`${iconSizes[size]} text-primary-foreground`} />
      </motion.div>
      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-bold text-foreground tracking-tight`}>
          lead<span className="text-primary">-Recall</span>
        </span>
        {showTagline && (
          <motion.span 
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Connect. Capture. Convert.
          </motion.span>
        )}
      </div>
    </Link>
  );
}
