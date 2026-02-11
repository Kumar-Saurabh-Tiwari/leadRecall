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
  UserPlus,
  Grid3x3,
  List,
  LayoutGrid,
  Search,
  Filter,
  CloudRain,
  Info
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
import { WeatherDialog } from '@/components/dashboard/WeatherDialog';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'exhibitor' | 'attendee'>('all');
  const [isWeatherDialogOpen, setIsWeatherDialogOpen] = useState(false);

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

  // Filter and search entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || entry.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 border-b border-border/40"
      >
        <div className="px-4 py-2.5 flex items-center justify-between">
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
                onClick={() => navigate('/dashboard/add/manual', {
                  state: {
                    selectedEvent: {
                      eventId: event.id,
                      eventName: event.name
                    }
                  }
                })}
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
      <div className="px-2 py-3 space-y-3">
        {/* Event Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-border/50 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Event Image - Left Side */}
              {event.image && (
                <div className="relative w-full md:w-40 lg:w-48 h-40 md:h-auto flex-shrink-0 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              )}

              {/* Content - Right Side */}
              <CardContent className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-bold text-foreground mb-1">
                        {event.name}
                      </h1>
                      {event.description && (
                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    {/* Badge */}
                    {(() => {
                      const now = new Date();
                      const eventStart = new Date(event.date);
                      const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.date);

                      let status = 'Upcoming';
                      let statusColor = 'bg-blue-50/90 text-blue-900 border-0';
                      let Icon = Calendar;

                      if (now > eventEnd) {
                        status = 'Past';
                        statusColor = 'bg-gray-100/90 text-gray-700 border-0';
                      } else if (now >= eventStart && now <= eventEnd) {
                        status = 'Live';
                        statusColor = 'gradient-primary text-primary-foreground border-0';
                      }

                      return (
                        <Badge
                          variant="secondary"
                          className={`flex-shrink-0 text-xs ${statusColor}`}
                        >
                          <Icon className="h-3 w-3 mr-1" /> {status}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>

                {/* Date and Location Info - Minimal */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                    <p className="text-muted-foreground">
                      {format(event.date, 'MMM d, yyyy')}
                      {event.endDate && ` to ${format(event.endDate, 'MMM d, yyyy')}`}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="h-4 w-4 text-secondary-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground line-clamp-1">{event.location}</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Associated Leads Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-border/50 overflow-hidden">
            {/* Header with Title and Count */}
            <CardHeader className="pb-2.5 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between mb-2.5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  Entries
                </CardTitle>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                >
                  <Badge variant="secondary" className="ml-2 px-3 py-1 text-sm font-bold">
                    {filteredEntries.length}
                  </Badge>
                </motion.div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/dashboard/event-info/${event.id}`)}
                  className="flex items-center gap-1.5 px-1 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors whitespace-nowrap font-medium text-xs flex-shrink-0"
                >
                  <Info className="h-3.5 w-3.5" />
                  Event Info
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsWeatherDialogOpen(true)}
                  className="flex items-center gap-1.5 px-1 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors whitespace-nowrap font-medium text-xs flex-shrink-0"
                >
                  <CloudRain className="h-3.5 w-3.5" />
                  Weather
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard/add/manual', {
                    state: {
                      selectedEvent: {
                        eventId: event.id,
                        eventName: event.name
                      }
                    }
                  })}
                  className="flex items-center gap-1.5 px-1 py-1.5 rounded-md bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors whitespace-nowrap font-medium text-xs flex-shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Entry
                </motion.button>
              </div>
            </CardHeader>

            <Separator />

            {/* View Controls and Search/Filter */}
            <div className="px-4 py-2.5 border-b border-border/40 bg-muted/30">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase">View:</span>
                  <div className="flex gap-1 bg-muted p-1 rounded-lg">

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'list'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                      title="List View"
                    >
                      <List className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                      title="Grid View"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('compact')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'compact'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                      title="Compact View"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-2 md:items-center">
                  <div className="relative flex-1 md:flex-none md:w-48">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>

                  {/* Filter Dropdown */}
                  {/* <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterType('all')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        filterType === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterType('exhibitor')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        filterType === 'exhibitor'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Exhibitor
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterType('attendee')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        filterType === 'attendee'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Attendee
                    </motion.button>
                  </div> */}
                </div>
              </div>
            </div>

            <CardContent className="pt-3">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {searchQuery || filterType !== 'all'
                      ? 'No entries match your filters'
                      : 'No entries collected yet'}
                  </p>
                  {!(searchQuery || filterType !== 'all') && (
                    <Button
                      onClick={() => navigate('/dashboard/add/manual', {
                        state: {
                          selectedEvent: {
                            eventId: event.id,
                            eventName: event.name
                          }
                        }
                      })}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Entry
                    </Button>
                  )}
                </div>
              ) : (
                <div className={`${viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4'
                    : viewMode === 'list'
                      ? 'space-y-3'
                      : 'grid grid-cols-1 gap-3'
                  }`}>
                  {filteredEntries.map((entry, index) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onClick={() => navigate(`/dashboard/entry/${entry.id}`)}
                      delay={index * 0.05}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        {filteredEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="pb-2.5 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  Entry Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-default"
                  >
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                      className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-0.5"
                    >
                      {filteredEntries.length}
                    </motion.p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Entries
                    </p>
                  </motion.div>
                  {/* <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-default"
                  >
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.4 }}
                      className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-0.5"
                    >
                      {filteredEntries.filter(e => e.type === 'exhibitor').length}
                    </motion.p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Exhibitors
                    </p>
                  </motion.div> */}
                  {/* <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-colors cursor-default"
                  >
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.5 }}
                      className="text-2xl font-bold text-green-600 dark:text-green-400 mb-0.5"
                    >
                      {filteredEntries.filter(e => e.type === 'attendee').length}
                    </motion.p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Attendees
                    </p>
                  </motion.div> */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-colors cursor-default"
                  >
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.6 }}
                      className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-0.5"
                    >
                      {filteredEntries.filter(e => e.email).length}
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

      {/* Weather Dialog */}
      {event && (
        <WeatherDialog
          open={isWeatherDialogOpen}
          onOpenChange={setIsWeatherDialogOpen}
          event={event}
        />
      )}

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
