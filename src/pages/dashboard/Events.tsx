import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Zap, CheckCircle2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import { format } from 'date-fns';

type TimelineFilter = 'all' | 'upcoming' | 'live' | 'past';

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all');

  useEffect(() => {
    setEvents(eventService.getAll());
  }, []);

  const getEventTimeline = (eventDate: Date): 'upcoming' | 'live' | 'past' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateOnly = new Date(eventDate);
    eventDateOnly.setHours(0, 0, 0, 0);

    if (eventDateOnly.getTime() > today.getTime()) return 'upcoming';
    if (eventDateOnly.getTime() === today.getTime()) return 'live';
    return 'past';
  };

  const getTimelineIcon = (timeline: 'upcoming' | 'live' | 'past') => {
    switch (timeline) {
      case 'upcoming':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'live':
        return <Zap className="h-3 w-3 mr-1" />;
      case 'past':
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
    }
  };

  const getTimelineGradient = (timeline: 'upcoming' | 'live' | 'past') => {
    switch (timeline) {
      case 'upcoming':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0';
      case 'live':
        return 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0';
      case 'past':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0';
    }
  };

  const filteredEvents = events.filter(event => {
    const timelineMatch = timelineFilter === 'all' ||
      getEventTimeline(event.date) === timelineFilter;

    return timelineMatch;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground mb-1">Events</h1>
            <p className="text-sm text-muted-foreground">
              Upcoming conferences and meetups
            </p>
          </div>
          <Button 
            onClick={() => navigate('/dashboard/add/event')}
            size="sm"
            className="gradient-primary"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </motion.div>
      </header>

      {/* Filters */}
      <div className="sticky top-[70px] z-30 glass border-b border-border/50 px-4 py-3 space-y-3">
        {/* Timeline Filter */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Timeline</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'upcoming', 'live', 'past'] as const).map((timeline) => (
              <Button
                key={timeline}
                variant={timelineFilter === timeline ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimelineFilter(timeline)}
                className={timelineFilter === timeline && timeline !== 'all' ? getTimelineGradient(timeline) : ''}
              >
                {timeline === 'all' ? 'All Events' : 
                  <>
                    {timeline === 'upcoming' && <Clock className="h-3 w-3 mr-1" />}
                    {timeline === 'live' && <Zap className="h-3 w-3 mr-1" />}
                    {timeline === 'past' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {timeline.charAt(0).toUpperCase() + timeline.slice(1)}
                  </>
                }
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Event List */}
      <div className="p-4 space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card 
                className="shadow-card hover:shadow-elevated transition-all border-border/50 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/dashboard/event/${event.id}`)}
              >
                {/* Accent bar */}
                <div className={`h-1 ${event.role === 'exhibitor' ? 'gradient-primary' : 'bg-secondary'}`} />
                
                {/* Event Image */}
                {event.image && (
                  <div className="w-full h-48 overflow-hidden bg-muted">
                    <img 
                      src={event.image} 
                      alt={event.name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&q=80&blend=https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&blend-mode=lighten';
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-size='16' fill='%236b7280' text-anchor='middle' dy='.3em' font-family='sans-serif'%3EEvent Image Unavailable%3C/text%3E%3C/svg%3E`;
                      }}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-foreground text-lg">
                      {event.name}
                    </h3>
                    <Badge className={getTimelineGradient(getEventTimeline(event.date))}>
                      {getTimelineIcon(getEventTimeline(event.date))}
                      {getEventTimeline(event.date).charAt(0).toUpperCase() + getEventTimeline(event.date).slice(1)}
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
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No events found</p>
            <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
