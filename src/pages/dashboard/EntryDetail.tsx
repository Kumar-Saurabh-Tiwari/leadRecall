import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Trash2,
  MessageSquare,
  Linkedin,
  Globe,
  Copy,
  ExternalLink,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { entryService } from '@/services/entryService';
import { Entry } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setEntries: setEntriesInContext, entries: cachedEntries } = useEvents();
  const { toast } = useToast();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchEntryDetail = async () => {
      if (!id || !user?.role || !user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        let apiResponse: any;
        
        // Fetch based on user role
        if (user.role === 'exhibitor') {
          // Exhibitors see attendee details
          apiResponse = await entryService.getExhibitorDataByID (id);
        } else {
          // Attendees see exhibitor details
          apiResponse = await entryService.getAttendeeDataByID(id);
        }

        console.log('Entry Detail API Response:', apiResponse);

        // Check if response has data
        const itemData = apiResponse?.data || apiResponse;
        if (itemData && itemData._id) {
          // Get first non-empty event title
          const validEvent = itemData.oContactData?.sEventTitles?.find((evt: any) => evt.sTitle && evt.sTitle.trim());
          
          // Get first non-N/A LinkedIn profile link
          const linkedinProfile = itemData.oContactData?.profiles?.find((prof: any) => prof.sProfileLink && prof.sProfileLink !== 'N/A');

          const transformedEntry: Entry = {
            id: itemData._id || itemData.id,
            name: itemData.oContactData ? 
              `${itemData.oContactData.sFirstName || ''} ${itemData.oContactData.sLastName || ''}`.trim() : 
              'Unknown',
            company: itemData.oContactData?.sCompany || 'Unknown Company',
            event: validEvent?.sTitle || 'Unknown Event',
            notes: itemData.oContactData?.sEntryNotes?.[0] || '',
            type: user.role === 'exhibitor' ? 'attendee' : 'exhibitor',
            createdAt: itemData.dCreatedDate ? new Date(itemData.dCreatedDate) : new Date(),
            email: itemData.oContactData?.sEmail?.[0]?.Email || undefined,
            phone: itemData.oContactData?.contacts?.[0]?.sContactNumber || undefined,
            linkedin: linkedinProfile?.sProfileLink || undefined,
            profileUrl: undefined,
            image: itemData.sMediaUrl && itemData.sMediaUrl !== 'No Image' ? itemData.sMediaUrl : undefined
          };

          setEntry(transformedEntry);
        } else {
          setError('Entry not found');
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching entry detail:', err);
        setError('Failed to load entry details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntryDetail();
  }, [id, user?.role, user?.email, navigate]);

  const handleDelete = async () => {
    if (!entry || !user?.email) return;

    try {
      let response;
      if (user.role === 'exhibitor') {
        // Delete attendee data
        response = await entryService.deleteExhibitor(entry.id, user.email);
      } else {
        // Delete exhibitor data
        response = await entryService.deleteAttendee(entry.id, user.email);
      }

      
      // Update cached entries by removing the deleted entry
      const updatedEntries = cachedEntries.filter(e => e.id !== entry.id);
      setEntriesInContext(updatedEntries);
      
      console.log('Delete response:', response);
      toast({
        title: 'Success',
        description: 'Entry deleted successfully',
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };

  const openUrl = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground">Loading entry details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-3">{error}</p>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-3">Entry not found</p>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
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
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/dashboard/edit/${entry.id}`)}
              className="h-9 w-9"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {entry.name}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{entry.company}</span>
                  </div>
                </div>
                <Badge 
                  variant={entry.type === 'exhibitor' ? 'default' : 'secondary'}
                  className={entry.type === 'exhibitor' 
                    ? 'gradient-primary text-primary-foreground border-0' 
                    : 'bg-secondary text-secondary-foreground'
                  }
                >
                  {entry.type === 'exhibitor' ? 'Exhibitor' : 'Attendee'}
                </Badge>
              </div>

              {/* Image Section */}
              <div className="mb-6">
                {entry.image && !imageError ? (
                  <img
                    src={entry.image}
                    alt={entry.name}
                    onError={() => setImageError(true)}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/30">
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground/70">No image available</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Event
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {entry.event}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Date Added
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {format(entry.createdAt, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notes Section */}
        {entry.notes && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {entry.notes}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entry.email ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email</p>
                      <p className="text-sm font-medium text-foreground truncate">{entry.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(entry.email!, 'Email')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground/70">Email not added</p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/edit/${entry.id}`)}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
              {entry.phone ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Phone</p>
                      <p className="text-sm font-medium text-foreground">{entry.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(entry.phone!, 'Phone')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground/70">Phone not added</p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/edit/${entry.id}`)}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile URLs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entry.linkedin ? (
                <button
                  onClick={() => openUrl(entry.linkedin!)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">LinkedIn</p>
                      <p className="text-sm font-medium text-foreground truncate">{entry.linkedin}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 ml-2" />
                </button>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-4 w-4 text-[#0A66C2]/50" />
                    <p className="text-sm text-muted-foreground/70">LinkedIn not added</p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/edit/${entry.id}`)}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
              {entry.profileUrl ? (
                <button
                  onClick={() => openUrl(entry.profileUrl!)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Website</p>
                      <p className="text-sm font-medium text-foreground truncate">{entry.profileUrl}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 ml-2" />
                </button>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground/70">Website not added</p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/edit/${entry.id}`)}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-2 gap-3 pt-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/add/event?entryId=${entry.id}`)}
            className="w-full"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Add Follow-up
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* Handle contact action */}}
            className="w-full"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted/50 p-3 rounded-lg my-3">
            <p className="text-sm font-medium text-foreground">{entry.name}</p>
            <p className="text-xs text-muted-foreground">{entry.company}</p>
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
