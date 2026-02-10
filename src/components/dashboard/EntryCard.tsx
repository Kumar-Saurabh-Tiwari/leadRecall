import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Entry } from '@/types';
import { format } from 'date-fns';
import { Building2, Calendar, User, Mail, Phone, Linkedin, ChevronRight, MapPin } from 'lucide-react';
import { forwardRef } from 'react';

interface EntryCardProps {
  entry: Entry;
  onClick?: () => void;
  delay?: number;
  viewMode?: 'grid' | 'list' | 'compact' | 'card';
}

export const EntryCard = forwardRef<HTMLDivElement, EntryCardProps>(
  ({ entry, onClick, delay = 0, viewMode = 'grid' }, ref) => {
  
  // Carousel Card View - High-end Professional Profile
  if (viewMode === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay }}
        className="flex-shrink-0 w-80 h-full pb-4"
      >
        <div
          onClick={onClick}
          className="bg-card dark:bg-slate-900 rounded-3xl border border-border/50 overflow-hidden shadow-card hover:shadow-elevated hover:border-primary/20 transition-all duration-500 cursor-pointer h-full flex flex-col group"
        >
          {/* Image Section - High quality portrait */}
          <div className="w-full h-72 bg-muted/30 flex items-center justify-center overflow-hidden relative">
            {entry.image ? (
              <img 
                src={entry.image} 
                alt={entry.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <User className="h-24 w-24 text-primary/10" />
              </div>
            )}
            
            <div className="absolute top-4 right-4">
              <Badge 
                className={`shadow-sm border-none font-semibold ${
                  entry.type === 'exhibitor' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {entry.type === 'exhibitor' ? 'Exhibitor' : 'Attendee'}
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="font-bold text-foreground text-2xl tracking-tight group-hover:text-primary transition-colors mb-1">
                {entry.name}
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <Building2 className="h-4 w-4 text-primary/60" />
                <span className="truncate">{entry.company || 'Private Organization'}</span>
              </div>
            </div>

            {entry.notes && (
              <p className="text-sm text-muted-foreground/80 line-clamp-3 mb-6 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                "{entry.notes}"
              </p>
            )}

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between text-xs pt-4 border-t border-border/40">
                <div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider font-semibold">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {format(entry.createdAt, 'MMM d, yyyy')}
                </div>
                <div className="font-medium text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded">
                  {format(entry.createdAt, 'hh:mm a')}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  {entry.linkedin && entry.linkedin !== 'N/A' && (
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800/30">
                      <Linkedin className="h-4 w-4" />
                    </div>
                  )}
                  {entry.phone && entry.phone !== 'N/A' && (
                    <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-100 dark:border-green-800/30">
                      <Phone className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                <Badge 
                  variant="outline"
                  className="bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/20 font-bold px-3 py-1 rounded-full whitespace-nowrap overflow-hidden max-w-[120px]"
                >
                  <span className="truncate flex items-center gap-1.5">
                    <span className="scale-110">🎪</span> {entry.event}
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view - Professional Vertical layout
  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay }}
        className="h-full"
      >
        <Card 
          className="shadow-sm hover:shadow-md transition-all cursor-pointer group border-border/60 overflow-hidden flex flex-col h-full bg-card"
          onClick={onClick}
        >
          {/* Top Image Section - Portrait aspect */}
          <div className="relative w-full aspect-[4/5] bg-muted/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {entry.image ? (
              <img 
                src={entry.image} 
                alt={entry.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-slate-800 dark:to-slate-700/50 flex items-center justify-center">
                <User className="h-16 w-16 text-muted-foreground/20" />
              </div>
            )}
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 text-[10px] px-1.5 py-0 h-5 bg-background/80 backdrop-blur-sm border-none font-medium text-foreground"
            >
              {entry.type === 'exhibitor' ? 'Exhibitor' : 'Attendee'}
            </Badge>
          </div>
          
          {/* Content Section */}
          <CardContent className="flex-1 p-3 flex flex-col gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                {entry.name}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{entry.company || 'Unknown Company'}</span>
              </div>
            </div>
            
            <div className="mt-auto pt-1 flex items-center justify-between gap-1.5">
              <div className="flex gap-1">
                {entry.linkedin && entry.linkedin !== 'N/A' && (
                  <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-slate-50 transition-colors">
                    <Linkedin className="h-3.5 w-3.5" />
                  </div>
                )}
                {entry.phone && entry.phone !== 'N/A' && (
                  <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-slate-50 transition-colors">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300 px-2 py-1 rounded-full border border-amber-100 dark:border-amber-800/30 max-w-[60%] shadow-sm">
                <span className="text-[9px] font-bold truncate leading-none">🎪 {entry.event}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // List view - Horizontal layout
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay }}
      >
        <div 
          className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer group border border-border/10 overflow-hidden rounded-3xl p-3"
          onClick={onClick}
        >
          <div className="flex gap-4">
            {/* Left Column - Image Section */}
            <div className="relative w-28 h-28 flex-shrink-0">
              {entry.image ? (
                <img 
                  src={entry.image} 
                  alt={entry.name}
                  className="h-full w-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 dark:from-slate-800 dark:to-slate-700/50 rounded-2xl flex items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
              
              {/* Image Label/Badge */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5">
                 <div className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1 rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                    <div className="bg-primary/10 p-0.5 rounded-full">
                       {entry.type === 'exhibitor' ? <Building2 className="h-3 w-3 text-primary" /> : <User className="h-3 w-3 text-primary" />}
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                      {entry.type === 'exhibitor' ? 'Exhibitor' : 'Contact'}
                    </span>
                    {/* <div className="ml-auto bg-green-600 text-[9px] text-white w-4 h-4 rounded-full flex items-center justify-center font-black">
                      {entry.notes ? '1' : '3'}
                    </div> */}
                 </div>
              </div>
            </div>
            
            {/* Right Column - Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-[17px] text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors truncate">
                    {entry.name}
                  </h3>
                </div>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 truncate uppercase tracking-tight">
                  {entry.role ? `${entry.role} @ ` : ''}{entry.company || 'Private Participant'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Event/Type Icon */}
                  <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/40 shadow-sm">
                    <MapPin className="h-4 w-4" />
                  </div>
                  
                  {/* LinkedIn */}
                  {entry.linkedin && entry.linkedin !== 'N/A' && (
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/40 shadow-sm">
                      <Linkedin className="h-4 w-4" />
                    </div>
                  )}
                  
                  {/* Mail */}
                  {entry.email && (
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/40 shadow-sm">
                      <Mail className="h-4 w-4" />
                    </div>
                  )}
                  
                  {/* Phone */}
                  {entry.phone && entry.phone !== 'N/A' && (
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/40 shadow-sm">
                      <Phone className="h-4 w-4" />
                    </div>
                  )}

                  {/* More/Plus Badge */}
                  {/* <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/40 shadow-sm text-[10px] font-black">
                    +7
                  </div> */}
                </div>
                
                <ChevronRight className="h-5 w-5 text-amber-500/60 group-hover:text-amber-500 transition-all group-hover:translate-x-0.5" />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-bold tracking-wide">
                <span>{format(entry.createdAt, 'EEE d MMM yyyy')}</span>
                <span className="mx-0.5 opacity-50 font-black">•</span>
                <span>{format(entry.createdAt, 'hh:mm a')}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Compact view - Minimal layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card 
        className="shadow-card hover:shadow-elevated transition-all cursor-pointer group border-border/50 overflow-hidden h-full"
        onClick={onClick}
      >
        <CardContent className="p-4 h-full flex flex-col justify-between">
          <div>
            {/* Small Image */}
            {entry.image ? (
              <div className="relative w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden mb-3">
                <img 
                  src={entry.image} 
                  alt={entry.name}
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center mb-3">
                <User className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
              {entry.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
              {entry.company || 'No company'}
            </p>
            
            {/* Badge */}
            <Badge variant="outline" className="text-xs mb-2">
              {entry.type === 'exhibitor' ? 'Exhibitor' : 'Attendee'}
            </Badge>
          </div>
          
          {/* Contact Icons */}
          <div className="flex gap-1 items-center pt-2 border-t border-border/30">
            {entry.email && (
              <a 
                href={`mailto:${entry.email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center w-7 h-7 rounded bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 transition-colors text-xs font-medium"
                title={entry.email}
              >
                <Mail className="h-3 w-3" />
              </a>
            )}
            {entry.phone && entry.phone !== 'N/A' && (
              <a 
                href={`tel:${entry.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center w-7 h-7 rounded bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 transition-colors text-xs font-medium"
                title={entry.phone}
              >
                <Phone className="h-3 w-3" />
              </a>
            )}
            {entry.linkedin && entry.linkedin !== 'N/A' && (
              <a 
                href={entry.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center w-7 h-7 rounded bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors text-xs font-medium"
                title="LinkedIn"
              >
                <Linkedin className="h-3 w-3" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  }
);

EntryCard.displayName = 'EntryCard';
