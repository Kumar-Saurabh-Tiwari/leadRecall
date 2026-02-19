import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader2,
  Download,
  ExternalLink,
  Calendar,
  FileText,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { entryService } from '@/services/entryService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { SafeImage } from '@/components/SafeImage';
import { format } from 'date-fns';

interface AdditionalMediaRecord {
  _id: string;
  eFormStatus: string;
  eStatus: string;
  sMediaTags: string[];
  bOcrScan: boolean;
  sAdditionalMediaUrl: string;
  iRecordId: string;
  eMediaType: string;
  sMediaTitle: string;
  sMediaDescription: string;
  sNotes: string;
  sOtherNotes: string;
  sExternalLink: string;
  iUserId: string;
  dCreatedDate: string;
  dUpdatedDate: string;
}

export default function AdditionalMediaView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [mediaRecords, setMediaRecords] = useState<AdditionalMediaRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<AdditionalMediaRecord | null>(null);

  useEffect(() => {
    const fetchMediaRecords = async () => {
      if (!id || !user?.role) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const filterData = {
          iRecordId: id,
          userType: user?.role === 'exhibitor' ? 'exhibitor' : 'attendee',
        };

        const response = await entryService.getAdditionalMedia(filterData);
        const records = response?.data?.records || response?.records || response || [];
        
        setMediaRecords(Array.isArray(records) ? records : []);
        
        if (Array.isArray(records) && records.length > 0) {
          setSelectedMedia(records[0]);
        }
      } catch (err) {
        console.error('Error fetching media records:', err);
        setError('Failed to load media records');
        toast({
          title: 'Error',
          description: 'Failed to load media records',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaRecords();
  }, [id, user?.role, toast]);

  const handleDownload = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'media'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground">Loading media...</p>
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
            onClick={() => navigate(`/dashboard/entry/${id}`)}
          >
            Back to Entry
          </Button>
        </div>
      </div>
    );
  }

  if (mediaRecords.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground mb-4">No media found for this entry</p>
          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/entry/${id}`)}
          >
            Back to Entry
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
            onClick={() => navigate(`/dashboard/entry/${id}`)}
            className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {mediaRecords.length} Media
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Media List Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="border-border/50 sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Media ({mediaRecords.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 p-4 pt-0 max-h-96 overflow-y-auto">
                  {mediaRecords.map((media, idx) => (
                    <motion.button
                      key={media._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      onClick={() => setSelectedMedia(media)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedMedia?._id === media._id
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {media.sAdditionalMediaUrl && (
                          <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                            <SafeImage
                              src={media.sAdditionalMediaUrl}
                              alt={media.sMediaTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold line-clamp-2 text-foreground">
                            {media.sMediaTitle || 'Untitled'}
                          </h4>
                          <Badge variant="outline" className="text-xs capitalize mt-1">
                            {media.eMediaType}
                          </Badge>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Media Detail View */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2"
          >
            {selectedMedia && (
              <div className="space-y-6">
                {/* Media Preview */}
                {selectedMedia.sAdditionalMediaUrl && (
                  <Card className="border-border/50 overflow-hidden">
                    <div className="relative bg-muted">
                      <SafeImage
                        src={selectedMedia.sAdditionalMediaUrl}
                        alt={selectedMedia.sMediaTitle}
                        className="w-full h-auto object-cover max-h-96"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() =>
                            handleDownload(
                              selectedMedia.sAdditionalMediaUrl,
                              selectedMedia.sMediaTitle
                            )
                          }
                          className="h-10 w-10"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => window.open(selectedMedia.sAdditionalMediaUrl, '_blank')}
                          className="h-10 w-10"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Media Details */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-2xl font-bold text-foreground">
                          {selectedMedia.sMediaTitle || 'Untitled Media'}
                        </h2>
                        <Badge
                          variant="outline"
                          className="text-xs capitalize flex-shrink-0"
                        >
                          {selectedMedia.eMediaType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(selectedMedia.dCreatedDate), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Status */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Status
                      </p>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            selectedMedia.eStatus === 'active' ? 'default' : 'secondary'
                          }
                        >
                          {selectedMedia.eStatus}
                        </Badge>
                        <Badge
                          variant={
                            selectedMedia.eFormStatus === 'done' ? 'default' : 'secondary'
                          }
                        >
                          {selectedMedia.eFormStatus}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    {selectedMedia.sMediaDescription && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Description
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {selectedMedia.sMediaDescription}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedMedia.sNotes && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          Notes
                        </p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {selectedMedia.sNotes}
                        </p>
                      </div>
                    )}

                    {/* Other Notes */}
                    {selectedMedia.sOtherNotes && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          Additional Notes
                        </p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {selectedMedia.sOtherNotes}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedMedia.sMediaTags && selectedMedia.sMediaTags.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                          <Tag className="h-3 w-3" />
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedMedia.sMediaTags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* External Link */}
                    {selectedMedia.sExternalLink && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          External Link
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            window.open(selectedMedia.sExternalLink, '_blank')
                          }
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Link
                        </Button>
                      </div>
                    )}

                    <Separator />

                    {/* Meta Information */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-muted-foreground font-medium mb-1">
                          Created
                        </p>
                        <p className="text-foreground">
                          {format(new Date(selectedMedia.dCreatedDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-muted-foreground font-medium mb-1">
                          Updated
                        </p>
                        <p className="text-foreground">
                          {format(new Date(selectedMedia.dUpdatedDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-muted-foreground font-medium mb-1">
                          Media Type
                        </p>
                        <p className="text-foreground capitalize">
                          {selectedMedia.eMediaType}
                        </p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-muted-foreground font-medium mb-1">
                          OCR Scan
                        </p>
                        <p className="text-foreground">
                          {selectedMedia.bOcrScan ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/dashboard/entry/${id}`)}
                    className="flex-1"
                  >
                    Back to Entry
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
