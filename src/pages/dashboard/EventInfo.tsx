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
  ChevronRight,
  ParkingCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEvents } from '@/contexts/EventContext';
import { format } from 'date-fns';
import { Event } from '@/types';

export default function EventInfo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, entries } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [isTravelLoading, setIsTravelLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [travelEstimates, setTravelEstimates] = useState<any>(null);
  const [safeMapUrl, setSafeMapUrl] = useState<string | null>(null);

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
      <Card className="border-none shadow-md mb-8 bg-white overflow-hidden">
        <div className="relative">
          {/* Background Gradient */}
          <div className="relative h-16 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 overflow-hidden" />

          {/* Content Overlay */}
          <div className="relative px-6 pb-6 pt-0 -mt-2 flex gap-4 items-end">
            {/* Event Image */}
            <div className="flex-shrink-0 relative z-10">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.name} 
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gray-300 shadow-lg border-4 border-white" />
              )}
            </div>

            {/* Event Details */}
            <div className="flex-1 pb-2">
              {event.organizer && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {event.organizer}
                </p>
              )}
              <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{event.name}</h1>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-700 font-semibold border-0 rounded-full text-xs">
                  Upcoming Event
                </Badge>
              </div>
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
    </div>
  );
}
