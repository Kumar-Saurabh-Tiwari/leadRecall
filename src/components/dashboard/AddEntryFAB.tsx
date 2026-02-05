import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, QrCode, UserPlus, ScanText, Calendar, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';

interface AddOption {
  id: string;
  label: string;
  description: string;
  icon: typeof QrCode;
  path: string;
}

const addOptions: AddOption[] = [
  {
    id: 'scan-qr',
    label: 'Scan QR',
    description: 'Scan QR code to add contact',
    icon: QrCode,
    path: '/dashboard/add/scan-qr',
  },
  {
    id: 'add-manual',
    label: 'Add Contact',
    description: 'Add contact manually',
    icon: UserPlus,
    path: '/dashboard/add/manual',
  },
  {
    id: 'scan-ocr',
    label: 'Scan OCR',
    description: 'Scan business card',
    icon: ScanText,
    path: '/dashboard/add/scan-ocr',
  },
  {
    id: 'add-event',
    label: 'Add Event',
    description: 'Create a new event',
    icon: Calendar,
    path: '/dashboard/add/event',
  },
];

export function AddEntryFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleOptionClick = (path: string) => {
    setIsOpen(false);
    // For add contact, scan QR, and scan OCR options - show event dialog first
    if (path === '/dashboard/add/manual' || path === '/dashboard/add/scan-qr' || path === '/dashboard/add/scan-ocr') {
      setSelectedOption(path);
      fetchEvents();
      setShowEventDialog(true);
    } else {
      navigate(path);
    }
  };

  const fetchEvents = () => {
    const allEvents = eventService.getAll();
    setEvents(allEvents);
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Event</DialogTitle>
            <DialogDescription>
              Choose an event to associate with your new entry
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No events available
                </div>
              ) : (
                events.map((event) => (
                  <motion.button
                    key={event.id}
                    onClick={() => handleEventSelect(event)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedEvent?.id === event.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{event.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.date).toLocaleDateString()} • {event.location}
                        </p>
                      </div>
                      {selectedEvent?.id === event.id && (
                        <Check className="h-4 w-4 text-primary ml-2" />
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="flex gap-2 justify-end pt-4 border-t">
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
                    className="h-12 w-12 rounded-full bg-card border border-border/50 shadow-card flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-elevated transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <option.icon className="h-5 w-5 text-primary" />
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
