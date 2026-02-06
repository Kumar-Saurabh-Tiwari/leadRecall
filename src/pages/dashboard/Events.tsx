import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Zap, CheckCircle2, Plus, Briefcase, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import { format } from 'date-fns';
import { useEvents } from '@/contexts/EventContext';

type TimelineFilter = 'all' | 'upcoming' | 'live' | 'past';

export default function Events() {
  const navigate = useNavigate();
  const { events, isLoading } = useEvents();
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all');

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
      <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-5 bg-gradient-to-r from-background via-background to-primary/5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-0.5 flex items-center gap-2">
                Events
                <Badge variant="secondary" className="text-xs">{events.length}</Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your conferences and meetups
              </p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => navigate('/dashboard/add/event')}
              size="sm"
              className="gradient-primary shadow-lg hover:shadow-xl transition-all px-2 py-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </motion.div>
        </motion.div>
      </header>

      {/* Filters */}
      <div className="sticky top-[88px] z-30 glass border-b border-border/50 px-4 py-4 space-y-3 bg-background/80">
        {/* Timeline Filter */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            Filter by Timeline
          </p>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'upcoming', 'live', 'past'] as const).map((timeline, index) => (
              <motion.div
                key={timeline}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={timelineFilter === timeline ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimelineFilter(timeline)}
                  className={`${timelineFilter === timeline && timeline !== 'all' ? getTimelineGradient(timeline) : ''} ${timelineFilter === timeline ? 'shadow-md' : ''} transition-all px-2 py-1 text-xs`}
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
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Event List */}
      <div className="p-4 space-y-5">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => {
            const timeline = getEventTimeline(event.date);
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/dashboard/event/${event.id}`)}
                className="cursor-pointer"
              >
                <Card 
                  className="shadow-lg hover:shadow-2xl transition-all duration-300 border-border/50 overflow-hidden group backdrop-blur"
                >
                  {/* Event Image with Overlay */}
                  {event.image ? (
                    <div className="relative w-full h-56 overflow-hidden bg-muted">
                      <img 
                        src={event.image} 
                        alt={event.name}
                        onError={(e) => {
                          e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-size='16' fill='%236b7280' text-anchor='middle' dy='.3em' font-family='sans-serif'%3EEvent Image Unavailable%3C/text%3E%3C/svg%3E`;
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Badges on Image */}
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                        <Badge 
                          className={`${event.role === 'exhibitor' ? 'gradient-primary' : 'bg-white/90 text-gray-900'} shadow-lg backdrop-blur`}
                        >
                          {event.role === 'exhibitor' ? (
                            <><Briefcase className="h-3 w-3 mr-1" /> Exhibiting</>
                          ) : (
                            <><Users className="h-3 w-3 mr-1" /> Attending</>
                          )}
                        </Badge>
                        <Badge className={`${getTimelineGradient(timeline)} shadow-lg`}>
                          {getTimelineIcon(timeline)}
                          {timeline.charAt(0).toUpperCase() + timeline.slice(1)}
                        </Badge>
                      </div>
                      
                      {/* Event Name on Image */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-white text-xl mb-1 drop-shadow-lg">
                          {event.name}
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-primary/30" />
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                        <Badge 
                          className={`${event.role === 'exhibitor' ? 'gradient-primary' : 'bg-secondary'}`}
                        >
                          {event.role === 'exhibitor' ? (
                            <><Briefcase className="h-3 w-3 mr-1" /> Exhibiting</>
                          ) : (
                            <><Users className="h-3 w-3 mr-1" /> Attending</>
                          )}
                        </Badge>
                        <Badge className={getTimelineGradient(timeline)}>
                          {getTimelineIcon(timeline)}
                          {timeline.charAt(0).toUpperCase() + timeline.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-5">
                    {/* Event name if no image */}
                    {!event.image && (
                      <h3 className="font-bold text-foreground text-xl mb-3">
                        {event.name}
                      </h3>
                    )}

                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Date</p>
                          <p className="text-sm font-semibold text-foreground">
                            {format(event.date, 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-secondary/30 to-transparent border border-border/50">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Location</p>
                          <p className="text-sm font-semibold text-foreground line-clamp-1">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
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
