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
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  Globe2,
  TrendingUp,
  Target,
  Image as ImageIcon
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
import { SafeImage } from '@/components/SafeImage';
import { MediaTypeSelectionDialog } from '@/components/dashboard/MediaTypeSelectionDialog';
import { MediaUploadDialog } from '@/components/dashboard/MediaUploadDialog';
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
  const [profileAnalyzeData, setProfileAnalyzeData] = useState<any>(null);
  const [contentData, setContentData] = useState<any>(null);
  const [recordType, setRecordType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Media addition state
  const [showMediaTypeDialog, setShowMediaTypeDialog] = useState(false);
  const [showMediaUploadDialog, setShowMediaUploadDialog] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<'picture' | 'text' | 'card' | null>(null);
  const [capturedMediaImage, setCapturedMediaImage] = useState<string | null>(null);
  const [extractedMediaData, setExtractedMediaData] = useState<any>(null);
  
  // View additional media state
  const [additionalMedia, setAdditionalMedia] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [showMediaSection, setShowMediaSection] = useState(false);

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
          // Extract record type and content data if present
          if (itemData.eRecordType) {
            setRecordType(itemData.eRecordType);
          }
          if (itemData.oContentData) {
            setContentData(itemData.oContentData);
          }
          // Get first non-empty event title
          const validEvent = itemData.oContactData?.sEventTitles?.find((evt: any) => evt.sTitle && evt.sTitle.trim());
          
          // Get first non-N/A LinkedIn profile link
          const linkedinProfile = itemData.oContactData?.profiles?.find((prof: any) => prof.sProfileLink && prof.sProfileLink !== 'N/A');

          const transformedEntry: Entry = {
            id: itemData._id || itemData.id,
            name: itemData.oContactData ? 
              `${itemData.oContactData.sFirstName || ''} ${itemData.oContactData.sLastName || ''}`.trim() : 
              'Unknown',
            company: itemData.oContactData?.sCompany || '',
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
          // Extract and store profile analysis data
          if (itemData.oProfileAnalyzeData) {
            setProfileAnalyzeData(itemData.oProfileAnalyzeData);
          }
          // Fetch additional media for this entry
          fetchAdditionalMedia(itemData._id || itemData.id);
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

  const fetchAdditionalMedia = async (entryId: string) => {
    try {
      setIsLoadingMedia(true);
      const filterData = {
        iRecordId: entryId,
        userType: user?.role === 'exhibitor' ? 'exhibitor' : 'attendee',
      };
      const response = await entryService.getAdditionalMedia(filterData);
      
      // Handle the API response structure: { data: { records: [...] } }
      const mediaArray = response?.data?.records || response?.records || [];
      setAdditionalMedia(Array.isArray(mediaArray) ? mediaArray : []);
    } catch (err) {
      console.error('Error fetching additional media:', err);
      setAdditionalMedia([]);
    } finally {
      setIsLoadingMedia(false);
    }
  };

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

  const handleAddMediaClick = () => {
    setShowMediaTypeDialog(true);
  };

  const handleMediaTypeSelect = (mediaType: 'picture' | 'text' | 'card') => {
    setSelectedMediaType(mediaType);
    setShowMediaTypeDialog(false);

    if (mediaType === 'picture') {
      // For picture upload, show media upload dialog
      setShowMediaUploadDialog(true);
    } else {
      // For text/card scan, navigate to ScanOCR page
      navigate(`/dashboard/add/scan-ocr`, {
        state: {
          scanMode: mediaType,
          returnTo: `/dashboard/entry/${id}`,
        },
      });
    }
  };

  const handleMediaUpload = (mediaUrl: string) => {
    setCapturedMediaImage(mediaUrl);
    setShowMediaUploadDialog(false);
    
    // Navigate to AddAdditionalMedia form with the captured image
    if (id) {
      navigate(`/dashboard/add/media/${id}`, {
        state: {
          mediaType: selectedMediaType || 'picture',
          capturedImage: mediaUrl,
          extractedData: extractedMediaData,
          entryType: 'picture',
        },
      });
    }
  };

  // Mock function for getting direct upload URL - you may need to adjust this
  const getDirectURL = async (file: File, mediaType: string): Promise<string> => {
    // In a real app, this would upload to cloud storage
    // For now, we'll create a data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
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
        className="sticky top-0 gradient-primary backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 border-b border-border/40"
      >
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/dashboard/edit/${entry.id}`)}
              className="h-10 w-10"
            >
              <Edit2 className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5" />
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
                    {recordType === 'content' && contentData?.sPresentation 
                      ? (contentData.sPresentation.sLabel || contentData.sPresentation.sValue || entry.name)
                      : entry.name
                    }
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{entry.company}</span>
                  </div>
                </div>
                <Badge 
                  variant={recordType === 'content' ? 'default' : (entry.type === 'exhibitor' ? 'default' : 'secondary')}
                  className={recordType === 'content' 
                    ? 'gradient-primary text-primary-foreground border-0'
                    : (entry.type === 'exhibitor' 
                      ? 'gradient-primary text-primary-foreground border-0' 
                      : 'bg-secondary text-secondary-foreground')
                  }
                >
                  {recordType === 'content' ? 'Content' : (entry.type === 'exhibitor' ? 'Exhibitor' : 'Attendee')}
                </Badge>
              </div>

              {/* Image Section */}
              <div className="mb-6 flex justify-center">
                {entry.image && !imageError ? (
                  <div className="w-48 h-48 rounded-lg overflow-hidden">
                    <SafeImage
                      src={entry.image}
                      alt={entry.name}
                      className="w-full h-full object-cover"
                      fallbackClassName="rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-muted/50 rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/30">
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-16 w-16 text-muted-foreground/70 stroke-[1.5]" />
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
        {recordType !== 'content' && (
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
        )}

        {/* Media/Content View - Display when recordType is 'content' */}
        {recordType === 'content' && contentData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe2 className="h-4 w-4" />
                  Media View
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contentData.sPresentation && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {contentData.sPresentation.sLabel || 'Presentation'}
                    </p>
                    {contentData.sPresentation.sValue ? (
                      <div className="p-3 rounded-lg bg-background border border-border/50">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{contentData.sPresentation.sValue}</p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30 text-center">
                        <p className="text-sm text-muted-foreground/70">No media content available</p>
                      </div>
                    )}
                  </div>
                )}

                {contentData.sNotes && (
                  <>
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{contentData.sNotes}</p>
                    </div>
                  </>
                )}

                {contentData.sContentTags && contentData.sContentTags.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {contentData.sContentTags.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {contentData.sEventTitles && contentData.sEventTitles.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Associated Events</p>
                      <div className="flex flex-wrap gap-2">
                        {contentData.sEventTitles.map((eventTitle: string, idx: number) => (
                          <Badge key={idx} variant="outline">{eventTitle}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Profile URLs */}
        {recordType !== 'content' && (
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
        )}

        {/* AI Profile Analysis */}
        {profileAnalyzeData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="space-y-4"
          >
            {/* Header with AI Badge */}
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">AI Profile Insights</h2>
              <Badge variant="secondary" className="ml-auto text-xs">AI Enriched</Badge>
            </div>

            {/* Professional Summary */}
            {profileAnalyzeData.professionalSummary && (
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Professional Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profileAnalyzeData.professionalSummary}
                  </p>
                </CardContent>
              </Card>
            )}
            {!profileAnalyzeData.professionalSummary && (
              <Card className="border-border/50 border-dashed bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground/50" />
                    Professional Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground/60">Summary not available</p>
                </CardContent>
              </Card>
            )}

            {/* Current Role */}
            {profileAnalyzeData.currentRole && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Current Role
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Title</p>
                      <p className="text-sm font-semibold text-foreground">{profileAnalyzeData.currentRole.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Company</p>
                      <p className="text-sm font-semibold text-foreground">{profileAnalyzeData.currentRole.company}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Duration</p>
                      <p className="text-sm text-foreground">{profileAnalyzeData.currentRole.duration}</p>
                    </div>
                  </div>
                  {profileAnalyzeData.currentRole.responsibilities && profileAnalyzeData.currentRole.responsibilities.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Key Responsibilities</p>
                      <ul className="space-y-2">
                        {profileAnalyzeData.currentRole.responsibilities.map((resp: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <span className="text-sm text-foreground">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Career History */}
            {profileAnalyzeData.careerHistory && profileAnalyzeData.careerHistory.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Career History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileAnalyzeData.careerHistory.map((role: any, idx: number) => (
                      <div key={idx} className="pb-4 last:pb-0 last:border-0 border-b border-border/50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{role.position}</p>
                            <p className="text-xs text-muted-foreground">{role.company}</p>
                          </div>
                          <span className="text-xs font-medium bg-muted px-2 py-1 rounded text-foreground">{role.duration}</span>
                        </div>
                        {role.achievements && role.achievements.length > 0 && (
                          <ul className="space-y-1 mt-2">
                            {role.achievements.map((achievement: string, aidx: number) => (
                              <li key={aidx} className="flex items-start gap-2">
                                <div className="h-1 w-1 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {(!profileAnalyzeData.careerHistory || profileAnalyzeData.careerHistory.length === 0) && (
              <Card className="border-border/50 border-dashed bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground/50" />
                    Career History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground/60">Career history not available</p>
                </CardContent>
              </Card>
            )}

            {/* Skills & Expertise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profileAnalyzeData.skills && profileAnalyzeData.skills.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {profileAnalyzeData.skills.slice(0, 5).map((skill: string, idx: number) => (
                          <div key={idx} className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300 rounded-full">
                            {skill}
                          </div>
                        ))}
                      </div>
                      {profileAnalyzeData.skills.length > 5 && (
                        <p className="text-xs text-muted-foreground pt-1">+{profileAnalyzeData.skills.length - 5} more</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {profileAnalyzeData.expertise && profileAnalyzeData.expertise.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {profileAnalyzeData.expertise.slice(0, 5).map((exp: string, idx: number) => (
                          <div key={idx} className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300 rounded-full">
                            {exp}
                          </div>
                        ))}
                      </div>
                      {profileAnalyzeData.expertise.length > 5 && (
                        <p className="text-xs text-muted-foreground pt-1">+{profileAnalyzeData.expertise.length - 5} more</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {!profileAnalyzeData.skills && (
                <Card className="border-border/50 border-dashed bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground/50" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground/60">Skills not available</p>
                  </CardContent>
                </Card>
              )}
              {!profileAnalyzeData.expertise && (
                <Card className="border-border/50 border-dashed bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground/50" />
                      Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground/60">Expertise not available</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Education */}
            {profileAnalyzeData.education && profileAnalyzeData.education.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profileAnalyzeData.education.map((edu: any, idx: number) => (
                    <div key={idx} className="pb-3 last:pb-0 last:border-0 border-b border-border/50">
                      <p className="text-sm font-semibold text-foreground">{edu.degree}</p>
                      <p className="text-xs text-muted-foreground">{edu.field}</p>
                      <p className="text-xs text-muted-foreground">{edu.institution}</p>
                      {edu.year && edu.year !== 'N/A' && (
                        <p className="text-xs text-muted-foreground mt-1">{edu.year}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {(!profileAnalyzeData.education || profileAnalyzeData.education.length === 0) && (
              <Card className="border-border/50 border-dashed bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground/50" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground/60">Education information not available</p>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 gap-3">
              {(profileAnalyzeData.industry || profileAnalyzeData.specializations || profileAnalyzeData.languages) && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe2 className="h-4 w-4" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profileAnalyzeData.industry && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Industry</p>
                        <p className="text-sm font-medium text-foreground">{profileAnalyzeData.industry}</p>
                      </div>
                    )}
                    {profileAnalyzeData.specializations && profileAnalyzeData.specializations.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {profileAnalyzeData.specializations.map((spec: string, idx: number) => (
                            <div key={idx} className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300 rounded-full">
                              {spec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {profileAnalyzeData.languages && profileAnalyzeData.languages.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {profileAnalyzeData.languages.map((lang: string, idx: number) => (
                            <div key={idx} className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300 rounded-full">
                              {lang}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {(!profileAnalyzeData.industry && !profileAnalyzeData.specializations && !profileAnalyzeData.languages) && (
                <Card className="border-border/50 border-dashed bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-muted-foreground/50" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground/60">Additional information not available</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Data Quality */}
            {profileAnalyzeData.dataQuality && (
              <Card className="border-border/50 bg-muted/30">
                <CardContent className="p-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Confidence Score</span>
                      <span className="font-semibold text-foreground">{Math.round(profileAnalyzeData.dataQuality.confidenceScore * 100)}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full" 
                        style={{ width: `${profileAnalyzeData.dataQuality.confidenceScore * 100}%` }}
                      />
                    </div>
                    <div className="pt-2 space-y-1">
                      <div><span className="text-muted-foreground">Data Completeness: </span><span className="font-medium text-foreground">{profileAnalyzeData.dataQuality.dataCompleteness}</span></div>
                      <div><span className="text-muted-foreground">Verification: </span><span className="font-medium text-foreground">{profileAnalyzeData.dataQuality.verificationStatus}</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {!profileAnalyzeData.dataQuality && (
              <Card className="border-border/50 border-dashed bg-muted/20">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground/60 text-center">Data quality information not available</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* AI Profile Analysis - Empty State */}
        {!profileAnalyzeData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-border/50 border-dashed bg-muted/30">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-primary/50" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-2">AI Profile Insights</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Profile analysis not available yet
                    </p>
                    <div className="inline-block px-3 py-1 bg-amber-100/50 border border-amber-300/50 rounded-full">
                      <p className="text-xs font-medium text-amber-900/70">AI data will appear here after enrichment</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Additional Media View Section */}
        {additionalMedia && additionalMedia.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Media ({additionalMedia.length})
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMediaSection(!showMediaSection)}
                  >
                    {showMediaSection ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </CardHeader>
              {showMediaSection && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {additionalMedia.map((media, idx) => (
                      <motion.div
                        key={media._id || idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                      >
                        <div className="border border-border/50 rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                          {/* Media Image */}
                          {media.sAdditionalMediaUrl && (
                            <div className="h-32 bg-muted overflow-hidden">
                              <SafeImage
                                src={media.sAdditionalMediaUrl}
                                alt={media.sMediaTitle || 'Media'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Media Content */}
                          <div className="p-3 space-y-2">
                            {/* Title with Media Type Badge */}
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                                {media.sMediaTitle || 'Untitled Media'}
                              </h4>
                              {media.eMediaType && (
                                <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
                                  {media.eMediaType}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Description */}
                            {media.sMediaDescription && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {media.sMediaDescription}
                              </p>
                            )}
                            
                            {/* Tags */}
                            {media.sMediaTags && media.sMediaTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {media.sMediaTags.slice(0, 3).map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {media.sMediaTags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{media.sMediaTags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {/* Notes */}
                            {media.sNotes && (
                              <p className="text-xs text-muted-foreground line-clamp-2 pt-1 border-t border-border/30 mt-2 pt-2">
                                {media.sNotes}
                              </p>
                            )}
                            
                            {/* View Full Media Link */}
                            {media.sAdditionalMediaUrl && (
                              <div className="pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-8 text-xs"
                                  onClick={() => window.open(media.sAdditionalMediaUrl, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View Full
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3 pt-4"
        >
          <div className="grid grid-cols-2 gap-3">
            {/* Primary Action - Next Steps */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={() => navigate(`/dashboard/add/next-step-1?entryId=${entry.id}`)}
                className="w-full h-12 gradient-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <Calendar className="h-5 w-5 mr-2" />
                <span>Next Steps</span>
              </Button>
            </motion.div>

            {/* Secondary Action - Add Media */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="outline"
                onClick={handleAddMediaClick}
                className="w-full h-12 font-semibold border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                <span>Add Media</span>
              </Button>
            </motion.div>
          </div>

          {/* Media Gallery Link */}
          {additionalMedia.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                onClick={() => navigate(`/dashboard/media-view/${entry.id}`)}
                className="w-full h-11 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-300 hover:from-amber-100 hover:to-orange-100 text-foreground font-semibold transition-all duration-200 group"
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <ImageIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>View Media Gallery</span>
                  <Badge 
                    className="ml-auto gradient-primary text-primary-foreground font-bold px-2.5"
                    variant="default"
                  >
                    {additionalMedia.length}
                  </Badge>
                </div>
              </Button>
            </motion.div>
          )}
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

      {/* Media Type Selection Dialog */}
      <MediaTypeSelectionDialog
        open={showMediaTypeDialog}
        onClose={() => setShowMediaTypeDialog(false)}
        onSelect={handleMediaTypeSelect}
      />

      {/* Media Upload Dialog */}
      <MediaUploadDialog
        open={showMediaUploadDialog}
        onClose={() => {
          setShowMediaUploadDialog(false);
          setSelectedMediaType(null);
        }}
        onMediaUpload={handleMediaUpload}
        title="Upload Media"
        description="Take a photo or upload an image"
        getDirectURL={getDirectURL}
      />
    </div>
  );
}
