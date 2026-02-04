import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Calendar, MapPin, Briefcase, Users, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { eventService } from '@/services/eventService';
import type { UserRole } from '@/types';

export default function AddEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    role: 'attendee' as UserRole,
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
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Event title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.location.trim()) {
      toast({
        title: 'Error',
        description: 'Location is required',
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
      // Create date objects
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        toast({
          title: 'Error',
          description: 'End date/time must be after start date/time',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Add event with image data
      const eventData = {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        date: startDateTime,
        endDate: endDateTime,
        role: formData.role,
        image: imagePreview || undefined,
      };

      eventService.add(eventData);

      toast({
        title: 'Success',
        description: 'Event added successfully',
      });

      navigate('/dashboard/events');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add event',
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
                    <Label htmlFor="name" className="text-sm font-medium mb-2">
                      Event Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g., DevCon 2025, Tech Summit"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-secondary/50 border-border/50 focus:ring-primary"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Location <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="bg-secondary/50 border-border/50 focus:ring-primary"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium mb-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Add event details, agenda, schedule, or notes..."
                      value={formData.description}
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

            {/* Role Selection Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/50 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Your Role
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">
                    Select your participation role at this event
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'attendee' }))}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 group ${
                        formData.role === 'attendee'
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Users className={`h-5 w-5 transition-colors ${
                          formData.role === 'attendee' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                        }`} />
                        <p className="text-sm font-semibold text-foreground">Attendee</p>
                        <p className="text-xs text-muted-foreground">Visiting</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'exhibitor' }))}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 group ${
                        formData.role === 'exhibitor'
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Briefcase className={`h-5 w-5 transition-colors ${
                          formData.role === 'exhibitor' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                        }`} />
                        <p className="text-sm font-semibold text-foreground">Exhibitor</p>
                        <p className="text-xs text-muted-foreground">Presenting</p>
                      </div>
                    </button>
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
