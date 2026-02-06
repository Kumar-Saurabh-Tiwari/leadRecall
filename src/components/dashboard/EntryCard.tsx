import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Entry } from '@/types';
import { format } from 'date-fns';
import { Building2, Calendar, User, Mail, Phone, Linkedin } from 'lucide-react';

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
            <div className="relative w-32 bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
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
          <CardContent className="flex-1 p-4 flex flex-col justify-between gap-2">
            <div>
              <div className="flex items-start justify-between gap-2 mb-0">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {entry.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{entry.company}</span>
                  </div>
                </div>
              </div>
              
              {/* Contact Icons - Compact Single Line */}
              <div className="flex gap-1.5 items-center mt-2">
                {entry.email && (
                  <a 
                    href={`mailto:${entry.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 transition-colors flex-shrink-0"
                    title={entry.email}
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                )}
                {entry.phone && entry.phone !== 'N/A' && (
                  <a 
                    href={`tel:${entry.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 transition-colors flex-shrink-0"
                    title={entry.phone}
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                )}
                {entry.linkedin && entry.linkedin !== 'N/A' && (
                  <a 
                    href={entry.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors flex-shrink-0"
                    title="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground border-t border-border/30 pt-2">
              <span className="flex items-center gap-1 flex-shrink-0">
                <Calendar className="h-3 w-3" />
                {format(entry.createdAt, 'MMM d')}
              </span>
              <span className="text-primary font-medium text-xs truncate">{entry.event}</span>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
