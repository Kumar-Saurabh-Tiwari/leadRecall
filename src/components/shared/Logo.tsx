import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className={`${sizes[size]} rounded-xl gradient-primary flex items-center justify-center shadow-soft group-hover:shadow-elevated transition-shadow`}>
        <Zap className="text-primary-foreground w-1/2 h-1/2" />
      </div>
      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-bold text-foreground`}>
          lead<span className="text-primary">-Recall</span>
        </span>
        {showTagline && (
          <span className="text-xs text-muted-foreground">Connect. Capture. Convert.</span>
        )}
      </div>
    </Link>
  );
}
