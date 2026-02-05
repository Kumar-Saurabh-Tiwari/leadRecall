import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Building2, Calendar, FileText, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { entryService } from '@/services/entryService';
import { UserRole } from '@/types';

interface LocationState {
  selectedEvent?: {
    eventId: string;
    eventName: string;
  };
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
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
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

  // Get selected event from navigation state
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.selectedEvent) {
      setSelectedEventData(state.selectedEvent);
      setEvent(state.selectedEvent.eventName);
      console.log('Event data received in AddContact:', state.selectedEvent);
    }
  }, [location.state]);

  // Attendees add Exhibitors, Exhibitors add Attendees
  const targetType: UserRole = user?.role === 'exhibitor' ? 'attendee' : 'exhibitor';
  const targetLabel = targetType === 'exhibitor' ? 'Exhibitor' : 'Attendee';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !company.trim() || !event.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in first name, last name, company, and event.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    
    console.log('Entry data to be submitted:', entryData);
    console.log('Contact details structure:', contactDetails);
    
    entryService.add(entryData);

    toast({
      title: `${targetLabel} added!`,
      description: `${firstName} ${lastName} has been added to your leads.`,
    });
    
    navigate('/dashboard');
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
    </motion.div>
  );
}
