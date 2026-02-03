import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import { format } from 'date-fns';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setEvents(eventService.getAll());
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-xl font-bold text-foreground mb-1">Events</h1>
          <p className="text-sm text-muted-foreground">
            Upcoming conferences and meetups
          </p>
        </motion.div>
      </header>

      {/* Event List */}
      <div className="p-4 space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="shadow-card hover:shadow-elevated transition-all border-border/50 overflow-hidden">
              {/* Accent bar */}
              <div className={`h-1 ${event.role === 'exhibitor' ? 'gradient-primary' : 'bg-secondary'}`} />
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-foreground text-lg">
                    {event.name}
                  </h3>
                  <Badge 
                    variant={event.role === 'exhibitor' ? 'default' : 'secondary'}
                    className={event.role === 'exhibitor' 
                      ? 'gradient-primary text-primary-foreground border-0' 
                      : 'bg-secondary text-secondary-foreground'
                    }
                  >
                    {event.role === 'exhibitor' ? (
                      <><Briefcase className="h-3 w-3 mr-1" /> Exhibiting</>
                    ) : (
                      <><Users className="h-3 w-3 mr-1" /> Attending</>
                    )}
                  </Badge>
                </div>

                {event.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {event.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    {format(event.date, 'MMMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    {event.location}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
