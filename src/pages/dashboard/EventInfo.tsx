import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  FileText, 
  Image as ImageIcon,
  Car,
  Plane,
  Train,
  Bike,
  Bus,
  Accessibility,
  ArrowLeft,
  Edit2,
  Users,
  ChevronRight,
  ParkingCircle,
  Mail,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Loader
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { eventService } from '@/services/eventService';
import { format } from 'date-fns';
import { Event } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function EventInfo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, entries } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [isTravelLoading, setIsTravelLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [travelEstimates, setTravelEstimates] = useState<any>(null);
  const [safeMapUrl, setSafeMapUrl] = useState<string | null>(null);
  const [isEventTeamDialogOpen, setIsEventTeamDialogOpen] = useState(false);
  const [teamData, setTeamData] = useState<any>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  const googleKey = 'AIzaSyAlMOoWowsyvCTi7YgaPI7EJQpLA2GX9y0';

  useEffect(() => {
    if (!id) return;
    const foundEvent = events.find(e => e.id === id);
    if (!foundEvent) {
      navigate('/dashboard/events');
      return;
    }
    setEvent(foundEvent);
  }, [id, events, navigate]);

  useEffect(() => {
    if (event) {
      getTravelTimeToEvent(event);
    }
  }, [event]);

  const getTravelTimeToEvent = (eventData: Event) => {
    setPermissionDenied(false);
    setIsTravelLoading(true);

    if (!eventData?.location) {
      setIsTravelLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const query = {
            address1: eventData.location,
            originLat: position.coords.latitude,
            originLng: position.coords.longitude
          };

          // Using the media travel time API
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://mirecall.ctoninja.tech/api/v1'}/media/get-travel-time?address1=${encodeURIComponent(query.address1)}&originLat=${query.originLat}&originLng=${query.originLng}`);
          const res = await response.json();

          setIsTravelLoading(false);
          if (res && res.success) {
            setTravelEstimates(res.travelEstimates);
            const originCoords = res.originCoordinates;
            const destCoords = res.destinationCoordinates;
            if (originCoords && destCoords) {
              const url = `https://www.google.com/maps/embed/v1/directions?key=${googleKey}&origin=${originCoords.lat},${originCoords.lng}&destination=${destCoords.lat},${destCoords.lng}&mode=driving&zoom=13&maptype=roadmap`;
              setSafeMapUrl(url);
            }
          }
        } catch (error) {
          setIsTravelLoading(false);
          console.error('Error fetching travel time:', error);
        }
      },
      (error) => {
        setIsTravelLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionDenied(true);
        }
      }
    );
  };

  const eventEntries = useMemo(() => {
    if (!event) return [];
    return entries.filter(e => e.event === event.name);
  }, [entries, event]);

  const fetchEventTeamData = async () => {
    if (!event || !user?.email) return;
    
    try {
      setIsLoadingTeam(true);
      const response = await eventService.getAllEventTeamInvitations(event.id, user.email);
      if (response && typeof response === 'object' && 'data' in response) {
        setTeamData((response as any).data);
      }
    } catch (error) {
      console.error('Error fetching team invitations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event team data',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const mediaItemsCount = useMemo(() => {
    // Assuming some entries have media, or if the event itself has a media collection
    // For now, let's count entries with images or just use a fallback
    return eventEntries.filter(e => e.image).length || 8; // Fallback to 8 as in image
  }, [eventEntries]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
        <p className="text-muted-foreground">Loading event info...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] pb-24 px-4 pt-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="rounded-full bg-white shadow-sm border border-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Event Header Card */}
      <Card className="border-none shadow-lg mb-8 bg-white overflow-hidden">
        {/* Top Action Buttons */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 px-6 py-4 flex gap-3 justify-end border-b border-orange-200/50">
          <Button
            size="sm"
            className="gradient-primary shadow-md hover:shadow-lg transition-all duration-200 rounded-full px-5 py-2.5 font-semibold text-dark border-0 hover:scale-105"
            onClick={() => navigate('/dashboard/add/event', { state: { eventToEdit: event } })}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Event
          </Button>

          <Button
            size="sm"
            className="shadow-md hover:shadow-lg transition-all duration-200 rounded-full px-5 py-2.5 font-semibold border-2 border-orange-300 bg-white text-orange-700 hover:bg-orange-50 hover:scale-105"
            onClick={() => {
              setIsEventTeamDialogOpen(true);
              fetchEventTeamData();
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            Event Team
          </Button>
        </div>

        {/* Event Content */}
        <div className="p-6">
          <div className="flex gap-6 items-start">
            {/* Event Image */}
            <div className="flex-shrink-0">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.name} 
                  className="w-24 h-24 rounded-xl object-cover shadow-md border border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 shadow-md border border-gray-100" />
              )}
            </div>

            {/* Event Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Organized By:</span>
                <span className="text-base font-bold text-orange-600">{event.organizer || (event as any).sOrganizer || 'N/A'}</span>
              </div>

              {/* <Badge className="bg-orange-100 text-orange-700 font-semibold border-0 rounded-full px-3 py-1 text-xs">
                Upcoming Event
              </Badge> */}
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="border-none shadow-sm bg-[#EBF5FF]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-[#D1E9FF] p-2 rounded-lg">
              <FileText className="h-5 w-5 text-[#1570EF]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-[#1570EF]">{eventEntries.length || 12}</span>
              </div>
              <p className="text-xs font-semibold text-[#1570EF]">View entires</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-[#F5F3FF]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-[#EDE9FE] p-2 rounded-lg">
              <ImageIcon className="h-5 w-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-[#7C3AED]">{mediaItemsCount}</span>
              </div>
              <p className="text-xs font-semibold text-[#7C3AED]">Media Items</p>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Event Schedule */}
      <Card className="border-none shadow-sm mb-6 bg-white overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Event schedule</h2>
          </div>
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Start Date:</span>
              <div className="font-medium text-gray-900">
                {format(event.date, 'eee, do MMM yyyy')} | <span className="text-orange-500 font-bold ml-1">{format(event.date, 'h:mm a')}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">End Date:</span>
              <div className="font-medium text-gray-900">
                {format(event.endDate || event.date, 'eee, do MMM yyyy')} | <span className="text-orange-500 font-bold ml-1">{format(event.endDate || event.date, 'h:mm a')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="border-none shadow-sm mb-6 bg-white overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Location</h2>
          </div>
          
          <div className="rounded-xl overflow-hidden mb-4 relative h-60 bg-gray-100 border border-gray-100">
            {safeMapUrl ? (
              <iframe
                title="Event Location"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={safeMapUrl}
                allowFullScreen
              />
            ) : (
              <>
                <img 
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&h=400&fit=crop" 
                  alt="Map"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-red-500 p-1.5 rounded-full shadow-lg border-2 border-white">
                    <MapPin className="h-4 w-4 text-white fill-white" />
                  </div>
                </div>
                {isTravelLoading && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <p className="text-xs font-medium text-gray-600">Calculating travel time...</p>
                  </div>
                )}
                {permissionDenied && (
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 p-2 rounded text-[10px] text-red-600">
                    Location access denied. Enable it to see travel times.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-1">{event.locationName || "O2 Event Centre London"}</h3>
            <p className="text-sm text-gray-500">{event.location}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            <Badge variant="outline" className="flex items-center gap-1.5 py-1.5 px-3 bg-gray-50 border-gray-200 font-medium text-gray-700 rounded-lg">
              <ParkingCircle className="h-3.5 w-3.5 text-orange-400" />
              Free Parking
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 py-1.5 px-3 bg-gray-50 border-gray-200 font-medium text-gray-700 rounded-lg">
              <Accessibility className="h-3.5 w-3.5 text-orange-400" />
              Accessible
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 py-1.5 px-3 bg-gray-50 border-gray-200 font-medium text-gray-700 rounded-lg">
              <Bus className="h-3.5 w-3.5 text-orange-400" />
              Bus-Stop
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Transportation Details */}
      <Card className="border-none shadow-sm mb-6 bg-white overflow-hidden">
        <CardContent className="p-5">
          <div className="space-y-0 divide-y divide-gray-100">
            {[
              { label: 'Driving', icon: Car, key: 'driving' },
              { label: 'Transit', icon: Bus, key: 'transit' },
              { label: 'Flight', icon: Plane, key: 'flight' },
              { label: 'Train', icon: Train, key: 'train' },
              { label: 'Bicycling', icon: Bike, key: 'bicycling' },
            ].map((item, idx) => {
              const estimate = travelEstimates?.[item.key];
              const status = estimate ? `${estimate.time} (${estimate.distance})` : 'N/A - Not Available';
              
              return (
                <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-1">
                      <item.icon className="h-5 w-5 text-orange-400" />
                    </div>
                    <span className="font-bold text-gray-800">{item.label}:</span>
                  </div>
                  {isTravelLoading ? (
                    <span className="text-gray-300 text-xs animate-pulse">Loading...</span>
                  ) : (
                    <span className={`${estimate ? 'text-gray-900 font-semibold' : 'text-gray-400'} text-sm font-medium`}>
                      {status}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Team Dialog */}
      <Dialog open={isEventTeamDialogOpen} onOpenChange={setIsEventTeamDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Event Team
            </DialogTitle>
            <DialogDescription>
              Manage invitations for {event?.name}
            </DialogDescription>
          </DialogHeader>

          {isLoadingTeam ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : teamData ? (
            <div className="space-y-6">
              {/* Event Info Summary */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Event Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event:</span>
                    <span className="font-medium text-foreground">{teamData.event?.eventTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium text-foreground">{teamData.event?.eventType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium text-foreground line-clamp-1">{teamData.event?.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium text-foreground">{format(new Date(teamData.event?.startDate), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>

              {/* Invitation Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600">{teamData.invitationStats?.totalInvitations || 0}</div>
                  <div className="text-xs text-blue-600 font-medium">Total Invitations</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-2xl font-bold text-yellow-600">{teamData.invitationStats?.pendingInvitations || 0}</div>
                  <div className="text-xs text-yellow-600 font-medium">Pending</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600">{teamData.invitationStats?.acceptedInvitations || 0}</div>
                  <div className="text-xs text-green-600 font-medium">Accepted</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl font-bold text-purple-600">{teamData.invitationStats?.adminCount || 0}</div>
                  <div className="text-xs text-purple-600 font-medium">Admins</div>
                </div>
              </div>

              {/* Admin Info */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3">Event Super Admin</h4>
                <div className="flex items-start gap-3">
                  {teamData.admin?.profilePicture ? (
                    <img
                      src={teamData.admin.profilePicture}
                      alt={teamData.admin.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-semibold">
                      {teamData.admin?.userName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{teamData.admin?.userName}</div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{teamData.admin?.email}</span>
                    </div>
                    {teamData.admin?.company && (
                      <div className="text-sm text-muted-foreground mt-1">{teamData.admin.company}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invitations List */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Team Members & Invitations</h4>
                {teamData.invitations && teamData.invitations.length > 0 ? (
                  <div className="space-y-2">
                    {teamData.invitations.map((invitation: any, idx: number) => (
                      <div key={idx} className="border border-border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {invitation.profilePicture ? (
                              <img
                                src={invitation.profilePicture}
                                alt={invitation.userName}
                                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {invitation.userName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground text-sm">{invitation.userName}</div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{invitation.email}</span>
                              </div>
                              {invitation.company && (
                                <div className="text-xs text-muted-foreground mt-1">{invitation.company}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {invitation.invitationStatus === 'accepted' ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-0 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Accepted
                              </Badge>
                            ) : invitation.invitationStatus === 'pending' ? (
                              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border-0 flex items-center gap-1">
                                <Clock3 className="h-3 w-3" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {invitation.invitationStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          {invitation.userType && (
                            <Badge variant="secondary" className="text-xs">{invitation.userType}</Badge>
                          )}
                          {/* {invitation.isAdmin && (
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-0 text-xs">Admin</Badge>
                          )} */}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No team invitations yet</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Failed to load team data</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
