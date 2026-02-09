import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Calendar, MapPin, Briefcase, Users, FileText, Clock, Lock, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { eventService } from '@/services/eventService';
import { useEvents } from '../../../contexts/EventContext';
import { compressImage } from '@/lib/utils';
import type { UserRole } from '@/types';

export default function AddEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { fetchEvents } = useEvents();
  const [formData, setFormData] = useState({
    eventTitle: '',
    venueName: '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    locationCoordinates: '',
    additionalNotes: '',
    notes: '',
    eventPageUrl: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    bEventPrivate: true,
    ticketRequired: false,
    costPerTicket: '',
  });

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

    if (!formData.city.trim()) {
      toast({
        title: 'Error',
        description: 'City is required',
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

    if (formData.ticketRequired && !formData.costPerTicket.trim()) {
      toast({
        title: 'Error',
        description: 'Cost per ticket is required when tickets are enabled',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      let sMediaUrl = '';

      // Upload image if provided
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
      }

      // Create date/time strings
      const startDateTime = `${formData.startDate}T${formData.startTime}`;
      const endDateTime = `${formData.endDate}T${formData.endTime}`;

      // Validate end date is after start date
      if (new Date(endDateTime) <= new Date(startDateTime)) {
        toast({
          title: 'Error',
          description: 'End date/time must be after start date/time',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Prepare event data matching API schema
      const eventDataPayload = {
        sName: formData.eventTitle,
        dStartDate: startDateTime,
        dEndDate: endDateTime,
        sLogo: sMediaUrl,
        adminEmail: user?.email || '',
        sLocationPhysical: formData.address1,
        sShortDescription: formData.additionalNotes
      }

      // Call API to create event - wrap in eventData object for backend
      await eventService.addNewLeadEvent({ eventData: eventDataPayload });

      toast({
        title: 'Success',
        description: 'Event created successfully',
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
        description: error instanceof Error ? error.message : 'Failed to create event',
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
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Create Event</h1>
          </div>
          <p className="text-sm text-muted-foreground">Add a new event to your calendar</p>
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
                        className="relative w-full h-56 rounded-xl overflow-hidden border border-border/50 bg-secondary shadow-card"
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
                      <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
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

                  {/* Address 1 */}
                  <div>
                    <Label htmlFor="address1" className="text-sm font-medium mb-2">
                      Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address1"
                      name="address1"
                      type="text"
                      placeholder="e.g., 747 Market Street"
                      value={formData.address1}
                      onChange={handleInputChange}
                      className="bg-secondary/50 border-border/50 focus:ring-primary"
                    />
                  </div>

                  {/* City & Postcode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  </div>

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
                  {/* Privacy Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Private Event</p>
                        <p className="text-xs text-muted-foreground">Only invited guests can attend</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={formData.bEventPrivate}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, bEventPrivate: checked as boolean }))
                      }
                      className="h-5 w-5"
                    />
                  </div>

                  {/* Ticket Required Toggle */}
                  <div className="border-t border-border/30 pt-5">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <Ticket className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Ticket Required</p>
                          <p className="text-xs text-muted-foreground">Charge attendees to register</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={formData.ticketRequired}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({ ...prev, ticketRequired: checked as boolean }))
                        }
                        className="h-5 w-5"
                      />
                    </div>

                    {/* Cost Per Ticket - Only show if ticketRequired is true */}
                    {formData.ticketRequired && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4"
                      >
                        <Label htmlFor="costPerTicket" className="text-sm font-medium mb-2">
                          Cost Per Ticket <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="costPerTicket"
                          name="costPerTicket"
                          type="number"
                          placeholder="e.g., 50.00"
                          step="0.01"
                          min="0"
                          value={formData.costPerTicket}
                          onChange={handleInputChange}
                          className="bg-secondary/50 border-border/50 focus:ring-primary"
                        />
                      </motion.div>
                    )}
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
                    Adding...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
