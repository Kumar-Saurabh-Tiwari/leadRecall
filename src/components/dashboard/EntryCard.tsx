import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Entry } from '@/types';
import { format } from 'date-fns';
import { Building2, Calendar, User } from 'lucide-react';

interface EntryCardProps {
  entry: Entry;
  onClick?: () => void;
  delay?: number;
}

export function EntryCard({ entry, onClick, delay = 0 }: EntryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card 
        className="shadow-card hover:shadow-elevated transition-all cursor-pointer group border-border/50 overflow-hidden"
        onClick={onClick}
      >
        <div className="flex">
          {/* Image Section - Left */}
          {entry.image ? (
            <div className="relative w-32 h-40 bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img 
                src={entry.image} 
                alt={entry.name}
                className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-32 h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0">
              <User className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Content Section - Right */}
          <CardContent className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {entry.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="truncate">{entry.company}</span>
                  </div>
                </div>
                <Badge 
                  variant={entry.type === 'exhibitor' ? 'default' : 'secondary'}
                  className={entry.type === 'exhibitor' 
                    ? 'gradient-primary text-primary-foreground border-0 flex-shrink-0' 
                    : 'bg-secondary text-secondary-foreground flex-shrink-0'
                  }
                >
                  {entry.type === 'exhibitor' ? 'Exhibitor' : 'Attendee'}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {entry.notes}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(entry.createdAt, 'MMM d, yyyy')}
              </span>
              <span className="text-primary font-medium">{entry.event}</span>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
