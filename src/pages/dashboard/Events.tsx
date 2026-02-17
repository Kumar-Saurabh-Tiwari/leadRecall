import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Zap, CheckCircle2, Plus, Briefcase, Users, TrendingUp, Edit2, ChevronRight, Search, LayoutGrid, List } from 'lucide-react';
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
      <header className="relative px-6 pt-3 pb-1">
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Events
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                <span className="inline-flex h-2 text-sm w-2 rounded-full bg-primary animate-pulse" />
                {events.length} total events organized
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => navigate('/dashboard/add/event')}
                size="default"
                className="gradient-primary shadow-lg shadow-primary/20 hover:shadow-xl transition-all h-10 rounded-2xl px-4"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Event
              </Button>
            </motion.div>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white dark:bg-card border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-base"
            />
          </motion.div>

          {/* Tabs Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="all" onValueChange={setTimelineFilter} className="w-full bg-white dark:bg-card rounded-2xl shadow-sm">
              <TabsList className="bg-muted/50 p-1 h-12 w-full justify-start overflow-x-auto no-scrollbar rounded-2xl">
                <TabsTrigger value="all" className="rounded-xl px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  All
                </TabsTrigger>
                <TabsTrigger value="live" className="rounded-xl px-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-green-500" />
                  Live
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="rounded-xl px-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="past" className="rounded-xl px-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-500" />
                  Past
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        </div>
      </header>

      {/* Event List */}
      <div className="px-3 py-2 space-y-3">
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
                  <CardContent className="p-1 flex gap-4">
                    {/* Event Image - Left */}
                    <div className="flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden relative">
                      {event.image ? (
                        <img 
                          src={event.image} 
                          alt={event.name}
                          onError={(e) => {
                            e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='112'%3E%3Crect fill='%23e5e7eb' width='112' height='112'/%3E%3Ctext x='50%' y='50%' font-size='10' fill='%236b7280' text-anchor='middle' dy='.3em' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E`;
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary/40" />
                        </div>
                      )}
                      {/* Badge Overlay */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <Badge className={`${getTimelineGradient(timeline)} shadow-md text-xs w-full justify-center`}>
                          {getTimelineIcon(timeline)}
                          {timeline.charAt(0).toUpperCase() + timeline.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {/* Event Details & Edit Button */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Top: Title and Edit Button */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3
                          className="font-bold text-base text-foreground line-clamp-1 flex-1 cursor-pointer hover:underline"
                          onClick={() => navigate(`/dashboard/event-info/${event.id}`)}
                          title="View Event Info"
                        >
                          {event.name}
                        </h3>
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/edit-entry/${event.id}`);
                          }}
                          className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 flex-shrink-0"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button> */}
                      </div>

                      {/* Middle: Location & Date */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground/70" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground/70" />
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
            <p className="text-muted-foreground">No events found</p>
            <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
