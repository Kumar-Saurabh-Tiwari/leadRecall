import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Building2, Calendar, FileText, Loader2, UserPlus, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';
import { useToast } from '@/hooks/use-toast';
import { entryService } from '@/services/entryService';
import { offlineEntryService } from '@/services/offlineEntryService';
import { exhibitorService } from '@/services/exhibitorService';
import { attendeeService } from '@/services/attendeeService';
import { aiAnalyzeService } from '@/services/aiAnalyzeService';
import { MediaUploadDialog } from '@/components/dashboard/MediaUploadDialog';
import { UserRole } from '@/types';

interface LocationState {
  selectedEvent?: {
    eventId: string;
    eventName: string;
  };
  ocrData?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    job_title?: string;
    company?: string;
  };
  scannedViaOCR?: boolean;
  scannedViaQR?: boolean;
  qrFullData?: any;
  mediaUrl?: string;
}

interface ContactFormData {
  sFirstName: string;
  sLastName: string;
  sEmail: Array<{ Email: string }>;
  sCompany: string;
  sDesignation: string;
  sEventTitles: Array<{
    sTitle: string;
    EventId: string;
    startDate: string;
    endDate: string;
    attended: boolean;
  }>;
  contacts: Array<{
    sCountryCode: string;
    sContactNumber: string;
    sContactType: string;
  }>;
  profiles: Array<{
    sProfileLink: string;
    sProfileType: string;
  }>;
  notes: string;
}

export default function AddContact() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { refreshEntries } = useEvents();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [mediaDialogInitialized, setMediaDialogInitialized] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [event, setEvent] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedEventData, setSelectedEventData] = useState<LocationState['selectedEvent'] | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [scannedViaOCR, setScannedViaOCR] = useState<boolean>(false);

  // Get selected event and OCR data from navigation state
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.selectedEvent) {
      setSelectedEventData(state.selectedEvent);
      setEvent(state.selectedEvent.eventName);
    }
    
    // Populate form with OCR data if present
    if (state?.ocrData) {
      console.log('OCR data received in AddContact:', state.ocrData);
      const ocrData = state.ocrData;
      
      // Parse full name into first and last name
      if (ocrData.name) {
        const nameParts = ocrData.name.trim().split(' ');
        if (nameParts.length > 1) {
          setFirstName(nameParts.slice(0, -1).join(' '));
          setLastName(nameParts[nameParts.length - 1]);
        } else {
          setFirstName(ocrData.name);
        }
      }
      
      if (ocrData.email) setEmail(ocrData.email);
      if (ocrData.phone) setPhoneNumber(ocrData.phone);
      if (ocrData.company) setCompany(ocrData.company);
      if (ocrData.job_title) setDesignation(ocrData.job_title);
      if (ocrData.website) setLinkedinUrl(ocrData.website);
      
      // Add note that it was scanned via OCR
      if (state.scannedViaOCR) {
        setNotes(`Scanned via OCR${ocrData.address ? `\nAddress: ${ocrData.address}` : ''}`);
      }
      
      // Add note that it was scanned via QR
      if (state.scannedViaQR) {
        setNotes(`Scanned via QR Code${state.qrFullData?.sEventName ? `\nEvent: ${state.qrFullData.sEventName}` : ''}${state.qrFullData?.sAttendeeId ? `\nAttendee ID: ${state.qrFullData.sAttendeeId}` : ''}`);
      }
    }
    if (state?.mediaUrl) {
      setMediaUrl(state.mediaUrl);
    }
    if (state?.scannedViaOCR) {
      setScannedViaOCR(state.scannedViaOCR);
    }
    if(state?.selectedEvent){
      setSelectedEventData(state.selectedEvent);
      setEvent(state.selectedEvent.eventName);
    }

    // Show media upload dialog if mediaUrl is not already set (not from OCR)
    if (!state?.mediaUrl && !mediaDialogInitialized) {
      setShowMediaDialog(true);
      setMediaDialogInitialized(true);
    }
  }, [location.state, mediaDialogInitialized]);

  // Attendees add Exhibitors, Exhibitors add Attendees
  const targetType: UserRole = user?.role === 'exhibitor' ? 'attendee' : 'exhibitor';
  const targetLabel = targetType === 'exhibitor' ? 'Exhibitor' : 'Attendee';

  // Generate MongoDB-style ObjectId (24-character hex string)
  const generateObjectId = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
    const machineId = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    const processId = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
    const counter = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    return timestamp + machineId + processId + counter;
  };

  // Get the appropriate service based on user role
  const getMediaUploadService = () => {
    return user?.role === 'exhibitor' ? exhibitorService : attendeeService;
  };

  // Handle media upload from dialog
  const handleMediaUpload = (uploadedMediaUrl: string) => {
    console.log('Media uploaded, URL:', uploadedMediaUrl);
    setMediaUrl(uploadedMediaUrl);
    setShowMediaDialog(false);
    toast({
      title: 'Photo added',
      description: 'You can now fill in the contact details.',
    });
  };

  // Remove media
  const removeMedia = () => {
    setMediaUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      toast({
        title: 'Missing Name',
        description: 'Please fill in the first name.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Build contact form data structure
      const contactDetails: ContactFormData = {
        sFirstName: firstName.trim(),
        sLastName: lastName.trim(),
        sEmail: [{ Email: email.trim() || 'N/A' }],
        sCompany: company.trim(),
        sDesignation: designation.trim() || 'N/A',
        sEventTitles: [
          {
            sTitle: selectedEventData?.eventName || event.trim() || 'N/A',
            EventId: selectedEventData?.eventId || '',
            startDate: '',
            endDate: '',
            attended: false
          }
        ],
        contacts: [
          {
            sCountryCode: '',
            sContactNumber: phoneNumber.trim() || 'N/A',
            sContactType: 'Work'
          }
        ],
        profiles: [
          {
            sProfileLink: linkedinUrl.trim() || 'N/A',
            sProfileType: 'linkedin'
          }
        ],
        notes: notes.trim()
      };
      
      console.log('Creating contact with structured data:', contactDetails);
      
      // Call AI analysis service to enrich profile data
      let profileAnalyzeData = {};
      try {
        const aiData = {
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim() || '',
          company: company.trim(),
          designation: designation.trim() || '',
          linkedinUrl: linkedinUrl.trim() || ''
        };
        
        console.log('Sending data to AI analysis service:', aiData);
        const aiResponse = await aiAnalyzeService.aiAnalizeProfile(aiData);
        profileAnalyzeData = aiResponse?.data || {};
        console.log('AI Profile Analysis Response:', profileAnalyzeData);
      } catch (aiError) {
        // Log error but continue with contact creation
        console.warn('AI analysis failed, continuing without enriched profile data:', aiError);
        profileAnalyzeData = {};
      }
      
      // Generate a unique ID for the entry (MongoDB ObjectId format)
      const entryId = generateObjectId();
      
      // Format data for API call
      const data = {
        _id: entryId,
        id: entryId,
        iExhibitorId: user?.role === 'exhibitor' ? user.id || '' : '',
        sExhibitorEmail: user?.role === 'exhibitor' ? user.email || '' : '',
        bOcrScan: scannedViaOCR || false,
        bMediaScan: false,
        sMediaUrl: mediaUrl || '',
        entryType: user?.role || 'manual',
        sAttendeeId: user?.role === 'attendee' ? user.id || '' : '',
        sAttendeeEmail: user?.role === 'attendee' ? user.email || '' : '',
        oContactData: contactDetails,
        oProfileAnalyzeData: profileAnalyzeData,
        eMediaType: 'dataset',
        eRecordType: "contact",
        dCreatedDate: (new Date()).toISOString(),
        isOfflineRecord: false
      };
      
      console.log('API payload:', data);
      
      // Use offline-first service - it handles online/offline automatically
      const entryData = {
        name: `${firstName.trim()} ${lastName.trim()}`,
        company: company.trim(),
        event: selectedEventData?.eventName || event.trim() || 'N/A',
        notes: notes.trim(),
        type: targetType,
        email: email.trim() || undefined,
        phone: phoneNumber.trim() || undefined,
        linkedin: linkedinUrl.trim() || undefined,
      };
      
      // offlineEntryService handles: 
      // - Saving to IndexedDB immediately (works offline)
      // - Syncing to server if online
      // - Queuing for sync if offline
      await offlineEntryService.addEntry(entryData, data);

      toast({
        title: `${targetLabel} added!`,
        description: `${firstName} ${lastName} has been added to your leads.`,
      });
      
      // Refresh entries to show updated list with proper image handling
      refreshEntries();
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to add contact. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-full p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Add {targetLabel}</h1>
          <p className="text-sm text-muted-foreground">Add contact manually</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-border/50 shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">New {targetLabel}</CardTitle>
              <CardDescription>Fill in the contact details</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Media Upload Section */}
            <div className="mb-6 pb-6 border-b border-border/50">
              <Label className="block mb-3 font-semibold">Contact Photo</Label>
              {mediaUrl ? (
                <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-border bg-secondary/30">
                  <img
                    src={mediaUrl}
                    alt="Contact"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMediaDialog(true)}
                  className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-3 hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Add contact photo</p>
                    <p className="text-xs text-muted-foreground">Click to take or upload a photo</p>
                  </div>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-first-name">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact-first-name"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-last-name">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact-last-name"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10"
                    maxLength={50}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-email"
                  placeholder="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone Number</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-phone"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-company">Company</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-company"
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-designation">Designation</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-designation"
                  placeholder="Job title or designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-linkedin">LinkedIn URL</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-linkedin"
                  placeholder="LinkedIn profile URL"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="pl-10"
                  maxLength={200}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-event">Event</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-event"
                  placeholder="Event name"
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                  disabled={selectedEventData !== null}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-notes">Notes</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="contact-notes"
                  placeholder={`Add notes about this ${targetLabel.toLowerCase()}...`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="pl-10 min-h-[100px]"
                  maxLength={1000}
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
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
                  <>
                    <UserPlus className="h-4 w-4" />
                    Add {targetLabel}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Media Upload Dialog */}
      <MediaUploadDialog
        open={showMediaDialog}
        onClose={() => setShowMediaDialog(false)}
        onMediaUpload={handleMediaUpload}
        title="Add Contact Photo"
        description="Take a photo with your camera or upload one from your device"
        getDirectURL={getMediaUploadService().getDirectURL.bind(getMediaUploadService())}
      />
    </motion.div>
  );
}
