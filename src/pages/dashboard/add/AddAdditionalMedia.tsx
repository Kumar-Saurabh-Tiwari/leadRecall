import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { entryService } from '@/services/entryService';
import { ocrService } from '@/services/ocrService';
import { SafeImage } from '@/components/SafeImage';

interface LocationState {
  mediaType: 'picture' | 'text' | 'card';
  capturedImage?: string;
  extractedData?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    job_title?: string;
    company?: string;
    text?: string;
  };
  entryType?: string;
}

export default function AddAdditionalMedia() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const state = (location.state || {}) as LocationState;

  // Form State
  const [mediaTitle, setMediaTitle] = useState(
    state.extractedData?.name || state.extractedData?.job_title || ''
  );
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState(state.extractedData?.text || '');
  const [mediaTags, setMediaTags] = useState('');
  const [mediaDescription, setMediaDescription] = useState(
    state.extractedData?.company ? `${state.extractedData.company}` : ''
  );
  const [otherNotes, setOtherNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // If no media data provided, redirect back
    if (!state.capturedImage && !state.extractedData) {
      navigate('/dashboard');
      return;
    }
  }, [state, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!mediaTitle.trim()) {
      newErrors.mediaTitle = 'Media title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!id) {
      toast({
        title: 'Error',
        description: 'Entry ID not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      // Upload image and get URL if captured image exists
      let mediaUrl = '';
      if (state.capturedImage) {
        try {
          // Convert data URL to Blob
          const response = await fetch(state.capturedImage);
          const blob = await response.blob();
          const file = new File([blob], `media-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });

          // Upload using ocrService to get direct URL
          mediaUrl = await ocrService.getDirectURL(file, 'image');
          console.log('Media uploaded successfully:', mediaUrl);
        } catch (uploadError) {
          console.error('Error uploading media:', uploadError);
          throw new Error('Failed to upload media image');
        }
      }

      // Format media object according to the required structure
      const media = {
        _id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        iRecordId: id,
        sAdditionalMediaUrl: mediaUrl,
        eMediaType: state.mediaType,
        sMediaTitle: mediaTitle,
        sNotes: notes,
        iUserId: user?.id || '',
        sOtherNotes: otherNotes,
        sMediaTags: mediaTags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        sMediaDescription: mediaDescription,
        sExternalLink: state.extractedData?.website || '',
        userType: user?.role === 'exhibitor' ? 'exhibitor' : 'attendee',
        entryType: state.entryType || (state.mediaType === 'card' ? 'card' : 'text'),
        dCreatedDate: new Date().toISOString(),
      };

      console.log('Saving media:', media);

      // Call the API to save the media
      const response = await entryService.addAdditionalMedia(media, state.mediaType);

      if (response && (response.success || response.data)) {
        toast({
          title: 'Success',
          description: 'Media added successfully',
        });
        navigate(`/dashboard/entry/${id}`);
      } else {
        throw new Error(response?.message || 'Failed to save media');
      }
    } catch (error: any) {
      console.error('Error saving media:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save media. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/entry/${id}`);
  };

  if (!state.capturedImage && !state.extractedData) {
    return null;
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
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {state.mediaType}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Media Preview */}
        {state.capturedImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Media Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full max-w-md rounded-lg overflow-hidden border border-border/50">
                  <SafeImage
                    src={state.capturedImage}
                    alt="Media preview"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Extracted Data (if from OCR scan) */}
        {state.extractedData && state.mediaType !== 'picture' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card className="border-border/50 bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Extracted Information</CardTitle>
                <CardDescription>
                  Data automatically extracted from your scan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {state.extractedData.name && (
                  <div>
                    <span className="text-muted-foreground">Name: </span>
                    <span className="font-medium">{state.extractedData.name}</span>
                  </div>
                )}
                {state.extractedData.company && (
                  <div>
                    <span className="text-muted-foreground">Company: </span>
                    <span className="font-medium">{state.extractedData.company}</span>
                  </div>
                )}
                {state.extractedData.job_title && (
                  <div>
                    <span className="text-muted-foreground">Title: </span>
                    <span className="font-medium">{state.extractedData.job_title}</span>
                  </div>
                )}
                {state.extractedData.email && (
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-medium">{state.extractedData.email}</span>
                  </div>
                )}
                {state.extractedData.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="font-medium">{state.extractedData.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-6"
        >
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before saving
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Media Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Media Title */}
              <div className="space-y-2">
                <Label htmlFor="mediaTitle" className="text-sm font-medium">
                  Media Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mediaTitle"
                  placeholder="Enter media title"
                  value={mediaTitle}
                  onChange={(e) => {
                    setMediaTitle(e.target.value);
                    if (errors.mediaTitle) {
                      setErrors({ ...errors, mediaTitle: '' });
                    }
                  }}
                  className={errors.mediaTitle ? 'border-destructive' : ''}
                />
                {errors.mediaTitle && (
                  <p className="text-xs text-destructive">{errors.mediaTitle}</p>
                )}
              </div>

              {/* Label */}
              <div className="space-y-2">
                <Label htmlFor="label" className="text-sm font-medium">
                  Label
                </Label>
                <Input
                  id="label"
                  placeholder="e.g., Photo, Document, Screenshot"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              {/* Media Description */}
              <div className="space-y-2">
                <Label htmlFor="mediaDescription" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="mediaDescription"
                  placeholder="Brief description of the media"
                  value={mediaDescription}
                  onChange={(e) => setMediaDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Notes with extracted text */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="text-sm"
                />
                {state.extractedData?.text && (
                  <p className="text-xs text-muted-foreground">
                    Text automatically extracted from scan
                  </p>
                )}
              </div>

              {/* Media Tags */}
              <div className="space-y-2">
                <Label htmlFor="mediaTags" className="text-sm font-medium">
                  Tags
                </Label>
                <Input
                  id="mediaTags"
                  placeholder="Comma-separated tags (e.g., important, follow-up, partnership)"
                  value={mediaTags}
                  onChange={(e) => setMediaTags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple tags with commas
                </p>
              </div>

              {/* Other Notes */}
              <div className="space-y-2">
                <Label htmlFor="otherNotes" className="text-sm font-medium">
                  Additional Notes
                </Label>
                <Textarea
                  id="otherNotes"
                  placeholder="Any other relevant information"
                  value={otherNotes}
                  onChange={(e) => setOtherNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Media'
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
