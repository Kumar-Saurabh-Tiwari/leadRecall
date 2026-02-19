import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Zap, CheckCircle2, Plus, Briefcase, Users, TrendingUp, Edit2, ChevronRight, Search, LayoutGrid, List, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import { format } from 'date-fns';
import { useEvents } from '@/contexts/EventContext';

type TimelineFilter = 'all' | 'upcoming' | 'live' | 'past';

export default function Events() {
  const navigate = useNavigate();
  const { events, isLoading } = useEvents();
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const getEventTimeline = (eventDate: Date, eventEndDate?: Date): 'upcoming' | 'live' | 'past' => {
    const now = new Date();
    const eventStart = new Date(eventDate);
    const eventEnd = eventEndDate ? new Date(eventEndDate) : new Date(eventDate);

    if (now > eventEnd) return 'past';
    if (now >= eventStart && now <= eventEnd) return 'live';
    return 'upcoming';
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
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0';
      case 'past':
        return 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0';
    }
  };

  const filteredEvents = events.filter(event => {
    const timelineMatch = timelineFilter === 'all' ||
      getEventTimeline(event.date, event.endDate) === timelineFilter;
    
    const searchMatch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.location.toLowerCase().includes(searchQuery.toLowerCase());

    return timelineMatch && searchMatch;
  });

  return (
    <div className="min-h-screen dark:bg-background pb-24">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-[20%] -left-[5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-2 gradient-primary border-b border-primary/10 backdrop-blur-md bg-opacity-95">
        <div className="flex flex-col gap-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex-1">
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                Events
              </h1>
              <p className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                <span className="inline-flex h-1.5 text-xs w-1.5 rounded-full bg-primary animate-pulse" />
                {events.length} total events organized
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/add/event')}
                className="h-9 w-9 rounded-lg transition-all gradient-primary text-dark-foreground hover:text-dark hover:shadow-md shadow-primary/25 hover:scale-105 border border-primary/50"
                title="Add Event"
              >
                <Plus className="h-6 w-6 font-bold" />
              </Button>

              {/* Search Toggle Icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className={`h-9 w-9 rounded-lg transition-all border border-primary/50 ${isSearchExpanded ? 'bg-primary/20 text-primary shadow-md' : 'gradient-primary text-dark-foreground hover:text-dark hover:shadow-md shadow-primary/25 hover:scale-105'}`}
              >
                {isSearchExpanded ? <X className="h-6 w-6 font-bold" /> : <Search className="h-6 w-6 font-bold" />}
              </Button>
            </div>
          </motion.div>

          {/* Search Bar and Filters - Expandable */}
          <AnimatePresence>
            {isSearchExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-1.5 pt-1"
              >
                {/* Search Bar */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="relative"
                >
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full h-9 pl-9 pr-3 bg-white dark:bg-card border border-primary/10 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/30 transition-all outline-none text-sm"
                  />
                </motion.div>

                {/* Tabs Filter */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Tabs defaultValue="all" onValueChange={setTimelineFilter} className="w-full bg-white dark:bg-card rounded-lg shadow-sm border border-primary/10">
                    <TabsList className="bg-muted/50 p-0.5 h-8 w-full justify-start overflow-x-auto no-scrollbar rounded-lg">
                      <TabsTrigger value="all" className="rounded-md px-2 py-0.5 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="live" className="rounded-md px-2 py-0.5 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1">
                        <Zap className="h-3 w-3 text-green-500" />
                        Live
                      </TabsTrigger>
                      <TabsTrigger value="upcoming" className="rounded-md px-2 py-0.5 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-500" />
                        Upcoming
                      </TabsTrigger>
                      <TabsTrigger value="past" className="rounded-md px-2 py-0.5 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-red-500" />
                        Past
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Event List */}
      <div className="px-4 py-6 space-y-2">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => {
            const timeline = getEventTimeline(event.date, event.endDate);
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -2 }}
                className="group"
              >
                <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden bg-white dark:bg-card cursor-pointer" onClick={() => navigate(`/dashboard/event/${event.id}`)}>
                  <CardContent className="p-2 flex gap-3">
                    {/* Event Image - Left */}
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden relative">
                      {event.image ? (
                        <img 
                          src={event.image} 
                          alt={event.name}
                          onError={(e) => {
                            e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect fill='%23e5e7eb' width='96' height='96'/%3E%3Ctext x='50%' y='50%' font-size='9' fill='%236b7280' text-anchor='middle' dy='.3em' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E`;
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary/40" />
                        </div>
                      )}
                      {/* Badge Overlay */}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5">
                        <Badge className={`${getTimelineGradient(timeline)} shadow-md text-xs w-full justify-center`}>
                          {getTimelineIcon(timeline)}
                          {timeline.charAt(0).toUpperCase() + timeline.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Top: Title */}
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-bold text-sm text-foreground line-clamp-1 flex-1 cursor-pointer hover:underline"
                          onClick={() => navigate(`/dashboard/event-info/${event.id}`)}
                          title="View Event Info"
                        >
                          {event.name}
                        </h3>
                      </div>

                      {/* Bottom: Location & Date */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground/70" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 flex-shrink-0 text-muted-foreground/70" />
                          <span>{format(event.date, 'MMM d, yyyy')}</span>
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
            <p className="text-muted-foreground text-sm">No events found</p>
            <p className="text-xs text-muted-foreground/70">Try adjusting your filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
