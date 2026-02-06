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
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';

interface ApiEntryResponse {
  _id?: string;
  id?: string;
  oContactData?: {
    sFirstName?: string;
    sLastName?: string;
    sCompany?: string;
    sEventTitles?: Array<{ sTitle?: string }>;
    sEntryNotes?: string[];
    sEmail?: Array<{ Email?: string }>;
    contacts?: Array<{ sContactNumber?: string }>;
    profiles?: Array<{ sProfileLink?: string }>;
  };
  entryType?: string;
  dCreatedDate: string;
  sMediaUrl?: string;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Map API response to Entry type
  const mapApiResponseToEntry = (item: ApiEntryResponse): Entry => {
    const firstEmail = item.oContactData?.sEmail?.[0]?.Email || '';
    const firstPhone = item.oContactData?.contacts?.[0]?.sContactNumber || '';
    const firstProfile = item.oContactData?.profiles?.[0]?.sProfileLink || '';
    
    return {
      id: item._id || item.id,
      name: `${item.oContactData?.sFirstName || ''} ${item.oContactData?.sLastName || ''}`.trim(),
      company: item.oContactData?.sCompany || '',
      event: item.oContactData?.sEventTitles?.[0]?.sTitle || '',
      notes: item.oContactData?.sEntryNotes?.join(', ') || '',
      type: (item.entryType || 'exhibitor') as 'exhibitor' | 'attendee',
      createdAt: new Date(item.dCreatedDate),
      linkedin: firstProfile,
      profileUrl: firstProfile,
      email: firstEmail,
      phone: firstPhone,
      image: item.sMediaUrl || undefined,
    };
  };

  useEffect(() => {
    const fetchEventAndEntries = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const foundEvent = events.find(e => e.id === id);
        
        if (!foundEvent) {
          navigate('/dashboard/events');
          return;
        }
        
        setEvent(foundEvent);

        // Fetch entries from API if user is authenticated
        if (user?.email) {
          try {
            const response = await eventService.getLeadEventData(
              user.email,
              user.role,
              id
            );
            
            if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as { data: ApiEntryResponse[] }).data)) {
              const mappedEntries = (response as { data: ApiEntryResponse[] }).data.map(mapApiResponseToEntry);
              setEntries(mappedEntries);
            } else {
              // Fallback to local entries if API doesn't return data
              const eventEntries = entryService.getAll().filter(
                entry => entry.event === foundEvent.name
              );
              setEntries(eventEntries);
            }
          } catch (error) {
            console.error('Error fetching entries from API:', error);
            // Fallback to local entries
            const eventEntries = entryService.getAll().filter(
              entry => entry.event === foundEvent.name
            );
            setEntries(eventEntries);
          }
        } else {
          // No user authenticated, use local entries
          const eventEntries = entryService.getAll().filter(
            entry => entry.event === foundEvent.name
          );
          setEntries(eventEntries);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventAndEntries();
  }, [id, navigate, user, events]);

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

  if (!event || isLoading) {
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
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/events')}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsInviteDialogOpen(true)}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="sm"
                onClick={() => navigate('/dashboard/add/manual')}
                className="gradient-primary shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </motion.div>
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
            {/* Event Image */}
            {event.image && (
              <div className="relative h-48 md:h-64 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge 
                    variant={event.role === 'exhibitor' ? 'default' : 'secondary'}
                    className={`mb-2 ${event.role === 'exhibitor' 
                      ? 'gradient-primary text-primary-foreground border-0' 
                      : 'bg-white/90 text-gray-900 border-0'
                    }`}
                  >
                    {event.role === 'exhibitor' ? (
                      <><Briefcase className="h-3 w-3 mr-1" /> Exhibiting</>
                    ) : (
                      <><Users className="h-3 w-3 mr-1" /> Attending</>
                    )}
                  </Badge>
                </div>
              </div>
            )}
            
            {/* Accent bar if no image */}
            {!event.image && (
              <div className={`h-2 ${event.role === 'exhibitor' ? 'gradient-primary' : 'bg-secondary'}`} />
            )}
            
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
                {/* Badge moved to image overlay if image exists */}
                {!event.image && (
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
                )}
              </div>

              <Separator className="my-4" />

              {/* Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-colors cursor-default"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Date
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {format(event.date, 'MMMM d, yyyy')}
                    </p>
                    {event.endDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        to {format(event.endDate, 'MMMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border/50 hover:border-border transition-colors cursor-default"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Location
                    </p>
                    <p className="text-sm font-bold text-foreground line-clamp-2">
                      {event.location}
                    </p>
                  </div>
                </motion.div>
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
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  Leads from this Event
                </CardTitle>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                >
                  <Badge variant="secondary" className="ml-2 px-3 py-1 text-sm font-bold">
                    {entries.length}
                  </Badge>
                </motion.div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  Event Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-default"
                  >
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                      className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1"
                    >
                      {entries.length}
                    </motion.p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Total Leads
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-default"
                  >
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.4 }}
                      className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1"
                    >
                      {entries.filter(e => e.type === 'exhibitor').length}
                    </motion.p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Exhibitors
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-colors cursor-default"
                  >
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.5 }}
                      className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1"
                    >
                      {entries.filter(e => e.type === 'attendee').length}
                    </motion.p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Attendees
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-colors cursor-default"
                  >
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.6 }}
                      className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1"
                    >
                      {entries.filter(e => e.email).length}
                    </motion.p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      With Email
                    </p>
                  </motion.div>
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
