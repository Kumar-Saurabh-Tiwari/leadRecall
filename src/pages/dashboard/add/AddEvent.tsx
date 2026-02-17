import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Calendar, MapPin, Users, FileText, Clock, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { eventService } from '@/services/eventService';
import { useEvents } from '../../../contexts/EventContext';
import { compressImage } from '@/lib/utils';
import LocationSelector from '@/components/LocationSelector';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { UserRole } from '@/types';

export default function AddEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { fetchEvents } = useEvents();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Check if we're editing an event
  const eventToEdit = (location.state as any)?.eventToEdit;
  const isEditMode = !!eventToEdit;

  const [formData, setFormData] = useState({
    eventTitle: eventToEdit?.name || '',
    venueName: eventToEdit?.locationName || '',
    host: eventToEdit?.organizer || '',
    address1: eventToEdit?.location || '',
    address2: '',
    city: '',
    postcode: '',
    locationCoordinates: '',
    additionalNotes: eventToEdit?.description || '',
    notes: '',
    eventPageUrl: '',
    startDate: eventToEdit?.date ? new Date(eventToEdit.date).toISOString().split('T')[0] : '',
    startTime: eventToEdit?.date ? new Date(eventToEdit.date).toTimeString().split(' ')[0].slice(0, 5) : '',
    endDate: eventToEdit?.endDate ? new Date(eventToEdit.endDate).toISOString().split('T')[0] : '',
    endTime: eventToEdit?.endDate ? new Date(eventToEdit.endDate).toTimeString().split(' ')[0].slice(0, 5) : '',
    bIsPublic: eventToEdit?.bIsPublic ?? eventToEdit?.isPublic ?? false,
  });

  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Set image preview if editing
  useEffect(() => {
    if (isEditMode && eventToEdit?.image) {
      setImagePreview(eventToEdit.image);
    }
  }, [isEditMode, eventToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle address selection from LocationSelector
  const handleAddressSelect = (
    address: string,
    coordinates?: { lat: number; lng: number },
    addressComponents?: {
      street?: string;
      city?: string;
      district?: string;
      postcode?: string;
      country?: string;
      venueName?: string;
    }
  ) => {
    setFormData(prev => ({
      ...prev,
      address1: address,
      // Auto-populate city and postcode from address components
      city: addressComponents?.city || prev.city,
      postcode: addressComponents?.postcode || prev.postcode,
      // Auto-populate venue name if available and not already set
      venueName: addressComponents?.venueName && !prev.venueName ? addressComponents.venueName : prev.venueName,
    }));

    if (coordinates) {
      setLocationCoords(coordinates);
    }
  };

  // Handle clear address
  const handleAddressClear = () => {
    setFormData(prev => ({
      ...prev,
      address1: '',
      city: '',
      postcode: '',
      // Keep venueName as user may want to keep it
    }));
    setLocationCoords(null);
  };

  const handleDelete = async () => {
    if (!eventToEdit) return;
    
    try {
      setIsDeleting(true);

      // Call backend delete API
      if (eventToEdit?.id) {
        await eventService.deleteLeadEvent(eventToEdit.id);
      }

      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });

      // Refresh events in context
      try {
        await fetchEvents(true);
      } catch (fetchError) {
        console.error('Error fetching updated events:', fetchError);
      }

      navigate('/dashboard/events');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Event deletion error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete event',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.eventTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Event title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.venueName.trim()) {
      toast({
        title: 'Error',
        description: 'Venue name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.address1.trim()) {
      toast({
        title: 'Error',
        description: 'Address is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.startDate || !formData.startTime) {
      toast({
        title: 'Error',
        description: 'Start date and time are required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.endDate || !formData.endTime) {
      toast({
        title: 'Error',
        description: 'End date and time are required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Determine media (keep existing when editing unless user changed/removed it)
      let sMediaUrl = '';

      if (imageFile) {
        try {
          toast({
            title: 'Compressing image...',
            description: 'Please wait while we compress your image',
          });
          const compressedFile = await compressImage(imageFile, 0.75, 1920, 1920);
          sMediaUrl = await eventService.getDirectURL(compressedFile, 'image');
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to process image',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
      } else if (isEditMode) {
        // If user explicitly removed preview (imagePreview === null) we should clear the logo
        if (imagePreview === null) {
          sMediaUrl = '';
        } else {
          // keep existing image URL from the event when editing
          sMediaUrl = eventToEdit?.image || '';
        }
      }

      // Create date/time strings (fallback to existing event values when editing)
      const startDateTime = formData.startDate
        ? `${formData.startDate}T${formData.startTime}`
        : (isEditMode && eventToEdit?.date ? new Date(eventToEdit.date).toISOString() : '');
      const endDateTime = formData.endDate
        ? `${formData.endDate}T${formData.endTime}`
        : (isEditMode && eventToEdit?.endDate ? new Date(eventToEdit.endDate).toISOString() : startDateTime);

      // Validate end date is after start date (use final values)
      if (startDateTime && endDateTime && new Date(endDateTime) <= new Date(startDateTime)) {
        toast({
          title: 'Error',
          description: 'End date/time must be after start date/time',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Prepare event data matching API schema (use older values when fields not provided)
      const eventDataPayload = {
        sName: formData.eventTitle || eventToEdit?.name || '',
        dStartDate: startDateTime || (isEditMode && eventToEdit?.date ? new Date(eventToEdit.date).toISOString() : ''),
        dEndDate: endDateTime || (isEditMode && eventToEdit?.endDate ? new Date(eventToEdit.endDate).toISOString() : ''),
        sLogo: sMediaUrl || '',
        sOrganizer: formData.host || eventToEdit?.organizer || '',
        bIsPublic: formData.bIsPublic,
        adminEmail: user?.email || '',
        sLocationPhysical: formData.address1 || eventToEdit?.location || '',
        sVenueName: formData.venueName || eventToEdit?.locationName || '',
        sShortDescription: formData.additionalNotes || eventToEdit?.description || '',
        ...(locationCoords && {
          dLocationCoordinates: `${locationCoords.lat},${locationCoords.lng}`
        })
      }

      // Call API to create or update event - wrap in eventData object for backend
      if (isEditMode && eventToEdit?.id) {
        await eventService.updateLeadEvent(eventToEdit.id, { eventData: eventDataPayload });
      } else {
        await eventService.addNewLeadEvent({ eventData: eventDataPayload });
      }

      toast({
        title: 'Success',
        description: isEditMode ? 'Event updated successfully' : 'Event created successfully',
      });

      // Refresh events in context to show the new event in the list - force refresh to bypass cache
      try {
        await fetchEvents(true);
      } catch (fetchError) {
        console.error('Error fetching updated events:', fetchError);
        // Continue to navigate even if fetch fails
      }

      // Small delay to ensure state updates before navigation
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/dashboard/events');
    } catch (error) {
      console.error('Event creation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : isEditMode ? 'Failed to update event' : 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </button>
              <h1 className="text-2xl font-bold text-foreground">{isEditMode ? 'Edit Event' : 'Create Event'}</h1>
            </div>
            {isEditMode && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                title="Delete event"
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </motion.button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{isEditMode ? 'Update your event details' : 'Add a new event to your calendar'}</p>
        </motion.div>
      </header>

      {/* Form */}
      <div className="p-4 pb-24 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="border-border/50 shadow-card overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Event Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {imagePreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative h-56 aspect-square mx-auto rounded-xl overflow-hidden border border-border/50 bg-secondary shadow-card"
                      >
                        <img
                          src={imagePreview}
                          alt="Event preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-md border border-border/50 font-semibold"
                        >
                          ×
                        </button>
                      </motion.div>
                    )}

                    {!imagePreview && (
                      <label className="relative h-56 aspect-square mx-auto flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="text-center"
                        >
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                            <Upload className="h-6 w-6 text-primary" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            Upload event image
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 5MB (optional)
                          </p>
                        </motion.div>
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Basic Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border/50 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Event Title */}
                  <div>
                    <Label htmlFor="eventTitle" className="text-sm font-medium mb-2">
                      Event Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="eventTitle"
                      name="eventTitle"
                      type="text"
                      placeholder="e.g., DevCon 2025, Tech Summit"
                      value={formData.eventTitle}
                      onChange={handleInputChange}
                      className="bg-secondary/50 border-border/50 focus:ring-primary"
                    />
                  </div>

                  {/* Venue Name */}
                  <div>
                    <Label htmlFor="venueName" className="text-sm font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Venue Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="venueName"
                      name="venueName"
                      type="text"
                      placeholder="e.g., San Francisco Convention Center"
                      value={formData.venueName}
                      onChange={handleInputChange}
                      className="bg-secondary/50 border-border/50 focus:ring-primary"
                    />
                  </div>

                  {/* Host */}
                  <div>
                    <Label htmlFor="host" className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Host
                    </Label>
                    <Input
                      id="host"
                      name="host"
                      type="text"
                      placeholder="e.g., John Doe or Company"
                      value={formData.host}
                      onChange={handleInputChange}
                      className="bg-secondary/50 border-border/50 focus:ring-primary"
                    />
                  </div>

                  {/* Location Selector with Google Maps Integration */}
                  <LocationSelector
                    value={formData.address1}
                    onChange={handleAddressSelect}
                    onClear={handleAddressClear}
                    placeholder="e.g., 747 Market Street"
                    label="Address"
                    required={true}
                    isSelected={!!formData.address1}
                  />

                  {/* City & Postcode */}
                  {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium mb-2">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="e.g., San Francisco"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="bg-secondary/50 border-border/50 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postcode" className="text-sm font-medium mb-2">
                        Postcode
                      </Label>
                      <Input
                        id="postcode"
                        name="postcode"
                        type="text"
                        placeholder="e.g., 94103"
                        value={formData.postcode}
                        onChange={handleInputChange}
                        className="bg-secondary/50 border-border/50 focus:ring-primary"
                      />
                    </div>
                  </div> */}

                  {/* Event Page URL */}
                  <div>
                    <Label htmlFor="eventPageUrl" className="text-sm font-medium mb-2">
                      Event Page URL (Optional)
                    </Label>
                    <Input
                      id="eventPageUrl"
                      name="eventPageUrl"
                      type="url"
                      placeholder="e.g., https://example.com/event"
                      value={formData.eventPageUrl}
                      onChange={handleInputChange}
                      className="bg-secondary/50 border-border/50 focus:ring-primary"
                    />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <Label htmlFor="additionalNotes" className="text-sm font-medium mb-2">
                      Description
                    </Label>
                    <Textarea
                      id="additionalNotes"
                      name="additionalNotes"
                      placeholder="Add event details, agenda, schedule, or notes..."
                      value={formData.additionalNotes}
                      onChange={handleInputChange}
                      rows={3}
                      className="bg-secondary/50 border-border/50 resize-none focus:ring-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Date & Time Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-border/50 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Event Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Start DateTime */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block text-foreground">
                      Start <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Date</p>
                        <Input
                          name="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="bg-secondary/50 border-border/50 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Time
                        </p>
                        <Input
                          name="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="bg-secondary/50 border-border/50 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End DateTime */}
                  <div className="border-t border-border/30 pt-5">
                    <Label className="text-sm font-medium mb-3 block text-foreground">
                      End <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Date</p>
                        <Input
                          name="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className="bg-secondary/50 border-border/50 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Time
                        </p>
                        <Input
                          name="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className="bg-secondary/50 border-border/50 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Settings Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/50 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Event Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Event Privacy (public / private) - improved UI */}
                  <div className="pt-1">
                    <Label className="text-sm font-medium mb-3 block text-foreground">Event Privacy</Label>

                    <RadioGroup
                      value={formData.bIsPublic ? 'public' : 'private'}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, bIsPublic: value === 'public' }))}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {/* Public option */}
                      <div
                        role="button"
                        onClick={() => setFormData(prev => ({ ...prev, bIsPublic: true }))}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${formData.bIsPublic ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/30 bg-transparent hover:border-primary/50'}`}
                      >
                        <div className="mt-1 flex-shrink-0">
                          <RadioGroupItem value="public" id="privacy-public" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">Public</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Anyone can find and attend</p>
                        </div>
                      </div>

                      {/* Private option */}
                      <div
                        role="button"
                        onClick={() => setFormData(prev => ({ ...prev, bIsPublic: false }))}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${!formData.bIsPublic ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/30 bg-transparent hover:border-primary/50'}`}
                      >
                        <div className="mt-1 flex-shrink-0">
                          <RadioGroupItem value="private" id="privacy-private" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">Private</span>
                            <span className="text-xs text-muted-foreground ml-2">Only invited guests</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Only invited guests can attend</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>


                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex gap-3 sticky bottom-20"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 gradient-primary text-primary-foreground hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    {isEditMode ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Save Changes' : 'Create Event'
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToEdit?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Event'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
