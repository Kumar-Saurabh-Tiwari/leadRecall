import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calendarService } from '@/services/calendarService';
import { CalendarItem } from '@/types';
import { format, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns';

export default function CalendarPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);

  useEffect(() => {
    setItems(calendarService.getAll());
  }, []);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, 'EEEE');
    return format(date, 'MMM d, yyyy');
  };

  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const dateKey = format(item.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, CalendarItem[]>);

  const sortedDates = Object.keys(groupedItems).sort();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-xl font-bold text-foreground mb-1">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Events and follow-ups
          </p>
        </motion.div>
      </header>

      {/* Agenda View */}
      <div className="p-4 space-y-6">
        {sortedDates.map((dateKey, groupIndex) => (
          <motion.div
            key={dateKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
          >
            {/* Date Header */}
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">
                {getDateLabel(new Date(dateKey))}
              </h2>
              <span className="text-sm text-muted-foreground">
                {format(new Date(dateKey), 'MMM d')}
              </span>
            </div>

            {/* Items for this date */}
            <div className="space-y-2 pl-6 border-l-2 border-border">
              {groupedItems[dateKey].map((item, itemIndex) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: groupIndex * 0.05 + itemIndex * 0.03 }}
                >
                  <Card className="shadow-card border-border/50">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          item.type === 'event' ? 'bg-accent' : 'bg-secondary/50'
                        }`}>
                          {item.type === 'event' ? (
                            <CalendarDays className="h-4 w-4 text-primary" />
                          ) : (
                            <Bell className="h-4 w-4 text-secondary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
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
                          ? 'bg-accent text-accent-foreground text-xs' 
                          : 'text-xs'
                        }
                      >
                        {item.type === 'event' ? 'Event' : 'Follow-up'}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No upcoming events or follow-ups</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
