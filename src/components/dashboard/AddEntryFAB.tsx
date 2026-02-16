import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, QrCode, UserPlus, ScanText, Calendar, Check, MapPin, Clock, Zap, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import { useEvents } from '@/contexts/EventContext';
import { format } from 'date-fns';

interface AddOption {
  id: string;
  label: string;
  description: string;
  icon: typeof QrCode;
  path: string;
}

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

const addOptions: AddOption[] = [
  {
    id: 'scan-qr',
    label: 'Scan QR For Contact',
    description: 'Scan QR code to add contact',
    icon: QrCode,
    path: '/dashboard/add/scan-qr',
  },
  {
    id: 'add-manual',
    label: 'Add Contact Manually',
    description: 'Add contact manually',
    icon: UserPlus,
    path: '/dashboard/add/manual',
  },
  {
    id: 'scan-ocr',
    label: 'Scan OCR For Contact',
    description: 'Scan business card',
    icon: ScanText,
    path: '/dashboard/add/scan-ocr',
  },
  {
    id: 'add-event',
    label: 'Add New Event',
    description: 'Create a new event',
    icon: Calendar,
    path: '/dashboard/add/event',
  },
];

export function AddEntryFAB({ onEntryAdded }: { onEntryAdded?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const navigate = useNavigate();
  const { events, isLoading } = useEvents();

  const handleOptionClick = (path: string) => {
    setIsOpen(false);
    // For add contact, scan QR, and scan OCR options - show event dialog first
    if (path === '/dashboard/add/manual' || path === '/dashboard/add/scan-qr' || path === '/dashboard/add/scan-ocr') {
      setSelectedOption(path);
      setShowEventDialog(true);
    } else {
      navigate(path);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    console.log('Selected Event:', {
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      eventLocation: event.location,
      eventDescription: event.description,
    });
    
    // Close dialog and navigate with event data
    setShowEventDialog(false);
    if (selectedOption) {
      // Pass event data as state to the next page
      navigate(selectedOption, { 
        state: { 
          selectedEvent: {
            eventId: event.id,
            eventName: event.name,
          }
        } 
      });
    }
  };

  return (
    <>
      {/* Event Selection Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Event</DialogTitle>
            <DialogDescription>
              Choose an event to associate with your new entry
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading events...
                </div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="mb-4 p-4 bg-muted/50 rounded-full">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Events Available
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center">
                    Create your first event to start adding entries
                  </p>
                  <Button
                    onClick={() => {
                      setShowEventDialog(false);
                      navigate('/dashboard/add/event');
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Event
                  </Button>
                </div>
              ) : (
                events.map((event, index) => {
                  const timeline = getEventTimeline(event.date);
                  const isSelected = selectedEvent?.id === event.id;
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <motion.button
                        onClick={() => handleEventSelect(event)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left transition-all rounded-lg overflow-hidden ${
                          isSelected 
                            ? 'ring-2 ring-primary' 
                            : ''
                        }`}
                      >
                        <Card className={`shadow-md hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden bg-white dark:bg-card ${
                          isSelected 
                            ? 'border-primary/50 border-2' 
                            : 'border border-border/50'
                        }`}>
                          <CardContent className="p-3 flex gap-4">
                            {/* Event Image - Left */}
                            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden relative">
                              {event.image ? (
                                <img 
                                  src={event.image} 
                                  alt={event.name}
                                  onError={(e) => {
                                    e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect fill='%23e5e7eb' width='96' height='96'/%3E%3Ctext x='50%' y='50%' font-size='10' fill='%236b7280' text-anchor='middle' dy='.3em' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E`;
                                  }}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
                                  <Calendar className="h-6 w-6 text-primary/40" />
                                </div>
                              )}
                              {/* Badge Overlay */}
                              <div className="absolute bottom-1 left-1 right-1">
                                <Badge className={`${getTimelineGradient(timeline)} shadow-md text-[10px] w-full justify-center py-0.5`}>
                                  {getTimelineIcon(timeline)}
                                  {timeline.charAt(0).toUpperCase() + timeline.slice(1)}
                                </Badge>
                              </div>
                            </div>

                            {/* Event Details */}
                            <div className="flex-1 flex flex-col gap-1.5">
                              {/* Title */}
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-sm text-foreground line-clamp-1 flex-1">
                                  {event.name}
                                </h3>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex-shrink-0"
                                  >
                                    <Check className="h-5 w-5 text-primary" />
                                  </motion.div>
                                )}
                              </div>

                              {/* Location & Date */}
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70" />
                                  <span className="line-clamp-1">{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70" />
                                  <span>{format(event.date, 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </ScrollArea>
          <div className="flex gap-2 justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowEventDialog(false);
                navigate('/dashboard/add/event');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Event
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEventDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedEvent && handleEventSelect(selectedEvent)}
                disabled={!selectedEvent}
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-24 z-40 h-14 w-14 rounded-full gradient-primary shadow-elevated flex items-center justify-center hover:opacity-90 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </motion.button>

      {/* Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30"
              onClick={() => setIsOpen(false)}
            />

            {/* Options */}
            <div className="fixed right-4 bottom-40 z-40 flex flex-col items-end gap-3">
              {addOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0, 
                    scale: 1,
                    transition: { delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 20, 
                    scale: 0.8,
                    transition: { delay: (addOptions.length - index - 1) * 0.03 }
                  }}
                  onClick={() => handleOptionClick(option.path)}
                  className="flex items-center gap-3 group"
                >
                  {/* Label */}
                  <motion.span
                    className="px-3 py-2 bg-card border border-border/50 rounded-lg shadow-card text-sm font-medium text-foreground whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                  >
                    {option.label}
                  </motion.span>

                  {/* Icon Button */}
                  <motion.div
                    className="h-12 w-12 rounded-full bg-yellow-100 border border-border/50 shadow-card flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-elevated transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <option.icon className="h-5 w-5 text-gray-500" />
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
