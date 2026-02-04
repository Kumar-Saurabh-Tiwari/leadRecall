import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Briefcase,
  Plus,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { EntryCard } from '@/components/dashboard/EntryCard';
import { eventService } from '@/services/eventService';
import { entryService } from '@/services/entryService';
import { Event, Entry } from '@/types';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (id) {
      const foundEvent = eventService.getById(id);
      if (foundEvent) {
        setEvent(foundEvent);
        // Get all entries associated with this event
        const eventEntries = entryService.getAll().filter(
          entry => entry.event === foundEvent.name
        );
        setEntries(eventEntries);
      } else {
        navigate('/dashboard/events');
      }
    }
  }, [id, navigate]);

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    console.log('Inviting user with email:', inviteEmail);
    toast({
      title: 'Invitation Sent',
      description: `Invitation sent to ${inviteEmail}`,
    });

    // Reset and close dialog
    setInviteEmail('');
    setIsInviteDialogOpen(false);
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 border-b border-border/40"
      >
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard/events')}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsInviteDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/dashboard/add/manual')}
              className="gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Event Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-border/50 overflow-hidden">
            {/* Accent bar */}
            <div className={`h-2 ${event.role === 'exhibitor' ? 'gradient-primary' : 'bg-secondary'}`} />
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-3">
                    {event.name}
                  </h1>
                  {event.description && (
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>
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

              <Separator className="my-4" />

              {/* Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Date
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {format(event.date, 'MMMM d, yyyy')}
                    </p>
                    {event.endDate && (
                      <p className="text-xs text-muted-foreground">
                        to {format(event.endDate, 'MMMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Associated Leads Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Leads from this Event
                </CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {entries.length}
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No leads collected yet
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard/add/manual')}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Lead
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry, index) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onClick={() => navigate(`/dashboard/entry/${entry.id}`)}
                      delay={index * 0.05}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">
                      {entries.filter(e => e.type === 'exhibitor').length}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Exhibitors
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">
                      {entries.filter(e => e.type === 'attendee').length}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Attendees
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User to Event</DialogTitle>
            <DialogDescription>
              Send an invitation to collaborate on this event. Enter the email address of the person you'd like to invite.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="invite-email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInvite();
                }
              }}
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInviteEmail('');
                setIsInviteDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleInvite} className="gradient-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
