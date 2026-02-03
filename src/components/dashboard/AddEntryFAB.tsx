import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, User, Building2, Calendar, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole, Entry } from '@/types';
import { entryService } from '@/services/entryService';
import { useToast } from '@/hooks/use-toast';

interface AddEntryFABProps {
  onEntryAdded: (entry: Entry) => void;
}

export function AddEntryFAB({ onEntryAdded }: AddEntryFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [type, setType] = useState<UserRole>('attendee');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [event, setEvent] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !event) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in name, company, and event.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newEntry = entryService.add({
      name,
      company,
      event,
      notes,
      type,
    });

    onEntryAdded(newEntry);
    toast({
      title: 'Entry added!',
      description: `${name} has been added to your leads.`,
    });
    
    // Reset form
    setName('');
    setCompany('');
    setEvent('');
    setNotes('');
    setIsOpen(false);
    setIsLoading(false);
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-24 z-40 h-14 w-14 rounded-full gradient-primary shadow-elevated flex items-center justify-center hover:opacity-90 transition-opacity"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 bottom-4 top-auto z-50 max-w-lg mx-auto"
            >
              <Card className="shadow-elevated border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Add New Entry</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={type} onValueChange={(v) => setType(v as UserRole)} className="mb-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="attendee">Attendee</TabsTrigger>
                      <TabsTrigger value="exhibitor">Exhibitor</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="entry-name">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="entry-name"
                          placeholder="Contact name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="entry-company">Company</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="entry-company"
                          placeholder="Company name"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="entry-event">Event</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="entry-event"
                          placeholder="Event name"
                          value={event}
                          onChange={(e) => setEvent(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="entry-notes">Notes</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="entry-notes"
                          placeholder="Add notes about this contact..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="pl-10 min-h-[80px]"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-primary hover:opacity-90"
                      disabled={isLoading}
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Entry'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
