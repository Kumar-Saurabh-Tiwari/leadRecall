import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Bell, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { calendarService } from '@/services/calendarService';
import { eventService } from '@/services/eventService';
import { CalendarItem, Event } from '@/types';
import { format, isToday, isTomorrow, isThisWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '09:00',
    notes: '',
  });

  useEffect(() => {
    setItems(calendarService.getAll());
    setEvents(eventService.getAll());
  }, []);

  // Get all days in the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get previous month days to fill the first week
  const firstDayOfWeek = getDay(monthStart);
  const prevMonthEnd = new Date(monthStart);
  prevMonthEnd.setDate(prevMonthEnd.getDate() - 1);
  const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const day = new Date(prevMonthEnd);
    day.setDate(day.getDate() - (firstDayOfWeek - 1 - i));
    return day;
  });

  // Get next month days to fill the last week
  const totalCells = prevMonthDays.length + daysInMonth.length;
  const nextMonthDays = Array.from({ length: 42 - totalCells }, (_, i) => {
    const day = new Date(monthEnd);
    day.setDate(day.getDate() + (i + 1));
    return day;
  });

  const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];

  // Group items by date
  const itemsByDate = items.reduce((acc, item) => {
    const dateKey = format(item.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, CalendarItem[]>);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date, { weekStartsOn: 0 })) return format(date, 'EEEE');
    return format(date, 'MMM d, yyyy');
  };

  const getItemsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return itemsByDate[dateKey] || [];
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get selected date events
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedDayItems = selectedDateStr ? getItemsForDate(selectedDate!) : [];

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  const handleAddTask = () => {
    if (!selectedDate) return;
    setIsAddTaskOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Task title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedDate) return;

    try {
      setIsSubmitting(true);

      // Parse the time
      const [hours, minutes] = formData.startTime.split(':');
      const taskDateTime = new Date(selectedDate);
      taskDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Create new task
      const newTask: CalendarItem = {
        id: Date.now().toString(),
        title: formData.title,
        date: taskDateTime,
        type: 'follow-up',
        relatedId: undefined,
      };

      // Add to calendar service
      const updatedItems = [...items, newTask];
      setItems(updatedItems);

      // Log to console
      console.log('New Task Created:', {
        id: newTask.id,
        title: formData.title,
        date: format(taskDateTime, 'MMMM d, yyyy'),
        time: formData.startTime,
        notes: formData.notes || 'No notes',
        type: 'follow-up',
      });

      toast({
        title: 'Success',
        description: 'Task added successfully',
      });

      // Reset form and close dialog
      setFormData({ title: '', startTime: '09:00', notes: '' });
      setIsAddTaskOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: 'Error',
        description: 'Failed to add task',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setIsAddTaskOpen(false);
    setFormData({ title: '', startTime: '09:00', notes: '' });
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-foreground mb-1">Calendar</h1>
              <p className="text-sm text-muted-foreground">
                Events and follow-ups
              </p>
            </div>
            {/* <Button
              onClick={() => navigate('/dashboard/add/event')}
              size="sm"
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Event
            </Button> */}
          </div>
        </motion.div>
      </header>

      {/* Calendar View */}
      <div className="p-3 pb-24 space-y-4">
        {/* Month Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-1">
            <h2 className="font-semibold text-foreground text-sm">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-8 px-2 text-xs"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-card rounded-lg border border-border/50 overflow-hidden"
        >
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-muted/40 border-b border-border/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="px-1 py-2 text-center text-xs font-semibold text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {allDays.map((day, idx) => {
              const isCurrentMonthDay = isCurrentMonth(day);
              const isTodayDay = isToday(day);
              const isSelectedDay = selectedDate && isSameDay(day, selectedDate);
              const dayItems = getItemsForDate(day);
              const eventDots = dayItems.filter(item => item.type === 'event').length;
              const followUpDots = dayItems.filter(item => item.type === 'follow-up').length;
              const lastInRow = (idx + 1) % 7 === 0;
              const isLastRow = idx >= allDays.length - 7;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-1.5 border-b border-r border-border/30 cursor-pointer transition-all hover:bg-muted/40 relative ${
                    lastInRow ? 'border-r-0' : ''
                  } ${
                    isLastRow ? 'border-b-0' : ''
                  } ${
                    !isCurrentMonthDay ? 'bg-muted/20' : 'bg-background'
                  } ${isTodayDay ? 'bg-accent/15' : ''} ${
                    isSelectedDay ? 'ring-inset ring-2 ring-primary' : ''
                  }`}
                >
                  <div className={`text-xs font-semibold mb-0.5 ${
                    isTodayDay ? 'text-primary' : isCurrentMonthDay ? 'text-foreground' : 'text-muted-foreground/60'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {/* Event Indicators */}
                  {dayItems.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {Array.from({ length: Math.min(eventDots, 2) }).map((_, i) => (
                        <div key={`event-${i}`} className="h-1 w-1 rounded-full bg-accent" />
                      ))}
                      {Array.from({ length: Math.min(followUpDots, 2) }).map((_, i) => (
                        <div key={`followup-${i}`} className="h-1 w-1 rounded-full bg-secondary" />
                      ))}
                      {eventDots + followUpDots > 4 && (
                        <div className="text-xs text-muted-foreground">+{eventDots + followUpDots - 4}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex gap-3 text-xs px-1"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-muted-foreground">Event</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Follow-up</span>
          </div>
        </motion.div>

        {/* Selected Date Details */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="mt-2"
          >
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <CalendarDays className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-semibold text-foreground text-sm">
                    {getDateLabel(selectedDate)}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {format(selectedDate, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAddTask}
                className="gap-1 flex-shrink-0 text-xs h-8"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>

            {selectedDayItems.length > 0 ? (
              <div className="space-y-1.5 pl-4 border-l border-border/60">
                {selectedDayItems.map((item, itemIndex) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: itemIndex * 0.03 }}
                  >
                    <Card className="border-border/40 hover:border-border/60 hover:shadow-sm transition-all">
                      <CardContent className="p-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`h-6 w-6 rounded flex items-center justify-center flex-shrink-0 ${
                            item.type === 'event' ? 'bg-accent' : 'bg-secondary/40'
                          }`}>
                            {item.type === 'event' ? (
                              <CalendarDays className="h-3 w-3 text-primary" />
                            ) : (
                              <Bell className="h-3 w-3 text-secondary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground text-xs truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(item.date, 'h:mm a')}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={item.type === 'event' ? 'default' : 'outline'}
                          className={item.type === 'event' 
                            ? 'bg-accent text-accent-foreground text-xs px-1.5 py-0' 
                            : 'text-xs px-1.5 py-0'
                          }
                        >
                          {item.type === 'event' ? 'Event' : 'Follow-up'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-3 text-muted-foreground text-xs"
              >
                No events or follow-ups on this date
              </motion.div>
            )}
          </motion.div>
        )}

        {!selectedDate && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <p className="text-muted-foreground mb-3 text-sm">No upcoming events or follow-ups</p>
            <Button onClick={() => navigate('/dashboard/add/event')} size="sm">
              Create Your First Event
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTask} className="space-y-4">
            {selectedDate && (
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Date:</span> {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleFormChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleFormChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={handleFormChange}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
