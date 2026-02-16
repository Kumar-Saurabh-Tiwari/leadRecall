import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ScanText, Camera, Upload, Loader2, ImageIcon, X, RotateCcw, ArrowRight, Mail, Phone, Building2, MapPin, Globe, Briefcase, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ocrService } from '@/services/ocrService';

interface ExtractedContact {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  job_title?: string;
  company?: string;
}

export default function ScanOCR() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedContact | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ eventId: string; eventName: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Determine what type of contact the user can add based on their role
  const targetType = user?.role === 'exhibitor' ? 'Attendee' : 'Exhibitor';

  // Capture selected event from navigation state
  useEffect(() => {
    const state = location.state as { selectedEvent?: { eventId: string; eventName: string } } | null;
    if (state?.selectedEvent) {
      setSelectedEvent(state.selectedEvent);
    }
  }, [location.state]);

  // Initialize camera stream
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        // Ensure video plays
        videoRef.current.play().catch(e => console.error('Play error:', e));
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraActive(false);
      toast({
        title: 'Camera Error',
        description: 'Failed to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureAndProcessPhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      // Get preview image first
      const previewDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
      setPreviewImage(previewDataUrl);
      
      // Stop camera and show preview with Scan/Retry buttons
      stopCamera();
      setImageReady(true);

      console.log('Photo captured, preview ready');
    } catch (error) {
      console.error('Capture error:', error);
      toast({
        title: 'Capture Error',
        description: 'Failed to capture the photo.',
        variant: 'destructive',
      });
    }
  };

  // OCR processing using the service
  const performOCRProcessing = async (blob: Blob): Promise<ExtractedContact | null> => {
    try {
      const formData = new FormData();
      formData.append('image', blob);

      const result = await ocrService.detectLabels(formData);
      
      console.log('OCR Service Result:', result);
      
      // Initialize with empty contact data
      let contactData: ExtractedContact = {
        name: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        job_title: '',
        company: ''
      };

      // Check if result already has structured contact fields
      if (result && typeof result === 'object') {
        // Use directly returned fields if they exist
        contactData.name = result.name?.trim() || '';
        contactData.email = result.email?.trim() || '';
        contactData.phone = result.phone?.trim() || '';
        contactData.address = result.address?.trim() || '';
        contactData.website = result.website?.trim() || '';
        contactData.job_title = result.job_title?.trim() || '';
        contactData.company = result.company?.trim() || '';
      }

      // If no data extracted, try parsing from text field
      if (!contactData.name && result?.text) {
        contactData.name = extractField(result.text, 'name') || '';
        contactData.email = extractField(result.text, 'email') || '';
        contactData.phone = extractField(result.text, 'phone') || '';
        contactData.company = extractField(result.text, 'company') || '';
        contactData.job_title = extractField(result.text, 'title|job') || '';
      }

      // Use labels if available
      if (result?.labels && result.labels.length > 0) {
        console.log('Detected labels:', result.labels);
      }
      
      console.log('Extracted Contact Data:', contactData);
      
      return contactData;
    } catch (error) {
      console.error('OCR Service Error:', error);
      return null;
    }
  };

  // Helper function to extract fields from text
  const extractField = (text: string, fieldType: string): string | null => {
    const patterns: { [key: string]: RegExp } = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      phone: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/,
      name: /^[A-Z][a-z]+ [A-Z][a-z]+/m,
      website: /https?:\/\/[^\s]+|www\.[^\s]+/i,
      title: /(?:manager|director|engineer|developer|designer|analyst|consultant|specialist|coordinator|officer|executive)/i,
      company: /(?:Inc|Ltd|LLC|Corp|Company|Co|Corporation)/i,
    };

    const fieldPatterns = fieldType.split('|');
    for (const field of fieldPatterns) {
      const pattern = patterns[field.trim()];
      if (pattern) {
        const match = text.match(pattern);
        if (match) {
          return match[0];
        }
      }
    }
    return null;
  };

  const handleTakePhoto = async () => {
    setCameraActive(true);
    await initializeCamera();
  };

  const handleCapture = () => {
    captureAndProcessPhoto();
  };

  const handleUploadImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Stop camera if it's active
    stopCamera();

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        
        console.log('Image uploaded - Base64 Data:', base64Data);
        console.log('Image file details:', {
          name: file.name,
          size: file.size,
          type: file.type,
          timestamp: new Date().toISOString(),
        });

        const img = new Image();
        img.onload = () => {
          console.log('Image element loaded successfully', {
            width: img.width,
            height: img.height,
          });

          // Set preview directly from base64 (no canvas needed for upload)
          setPreviewImage(base64Data);
          setUploadedFile(file);
          setImageReady(true);

          console.log('Image preview ready:', {
            name: file.name,
            size: file.size,
            type: file.type,
            imageWidth: img.width,
            imageHeight: img.height,
            imageReady: true,
            timestamp: new Date().toISOString(),
          });
        };
        img.onerror = (error) => {
          console.error('Image failed to load:', error);
          toast({
            title: 'Image Error',
            description: 'Failed to load the selected image.',
            variant: 'destructive',
          });
        };
        img.onabort = () => {
          console.error('Image load aborted');
        };
        
        console.log('Setting image source...');
        img.src = base64Data;
      };
      reader.onerror = () => {
        console.error('FileReader error');
        toast({
          title: 'File Error',
          description: 'Failed to read the file.',
          variant: 'destructive',
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process the uploaded image.',
        variant: 'destructive',
      });
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleScanImage = async () => {
    try {
      setIsProcessing(true);

      let imageBlob: Blob | null = null;

      // If uploaded file exists, use it directly (File extends Blob)
      if (uploadedFile) {
        imageBlob = uploadedFile;
      } 
      // Otherwise use canvas for captured photo
      else if (canvasRef.current) {
        imageBlob = await new Promise<Blob | null>((resolve) => {
          canvasRef.current!.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
        });
      }

      if (!imageBlob) {
        console.error('No image source available');
        setIsProcessing(false);
        toast({
          title: 'Error',
          description: 'No image to process',
          variant: 'destructive',
        });
        return;
      }

      const ocrResult = await performOCRProcessing(imageBlob);

      console.log('Image OCR result:', ocrResult);
      console.log('Image info:', {
        source: uploadedFile ? 'uploaded' : 'captured',
        fileName: uploadedFile?.name || 'captured.jpg',
        fileSize: imageBlob.size,
        fileType: imageBlob.type,
        timestamp: new Date().toISOString(),
      });

      if (ocrResult) {
        setExtractedData(ocrResult);
        toast({
          title: 'Image Processed Successfully',
          description: 'Contact information extracted',
        });
      } else {
        toast({
          title: 'Processing Failed',
          description: 'Could not extract contact information',
          variant: 'destructive',
        });
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('Scan error:', error);
      setIsProcessing(false);
      toast({
        title: 'Processing Error',
        description: 'Failed to process the image.',
        variant: 'destructive',
      });
    }
  };

  const handleRetry = () => {
    setPreviewImage(null);
    setUploadedFile(null);
    setImageReady(false);
    setExtractedData(null);
    setIsProcessing(false);
  };

  const handleSaveContact = async () => {
    if (!extractedData) return;

    try {
      setIsSaving(true);

      let mediaUrl = '';

      // Upload the image if available
      if (uploadedFile) {
        mediaUrl = await ocrService.getDirectURL(uploadedFile, 'image');
      } else if (previewImage && canvasRef.current) {
        // For captured image, convert canvas to blob
        const blob = await new Promise<Blob | null>((resolve) => {
          canvasRef.current!.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
        });
        if (blob) {
          const file = new File([blob], 'ocr-captured.jpg', { type: 'image/jpeg' });
          mediaUrl = await ocrService.getDirectURL(file, 'image');
        }
      }

      console.log('Navigating to AddContact with OCR data:', extractedData, 'Media URL:', mediaUrl);

      toast({
        title: 'Redirecting to Form',
        description: 'Fill in additional details and save the contact',
      });

      // Navigate to AddContact page with extracted data
      setTimeout(() => {
        navigate('/dashboard/add/manual', {
          state: {
            ocrData: extractedData,
            selectedEvent: selectedEvent,
            scannedViaOCR: true,
            mediaUrl: mediaUrl
          }
        });
      }, 500);

      setIsSaving(false);
    } catch (error) {
      console.error('Navigation error:', error);
      setIsSaving(false);
      toast({
        title: 'Navigation Failed',
        description: 'Could not navigate to contact form',
        variant: 'destructive',
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
          <h1 className="text-xl font-bold text-foreground">Scan Business Card</h1>
          <p className="text-sm text-muted-foreground">Add {targetType} via OCR</p>
        </div>
      </div>

      {/* Scanner Card */}
      <Card className="border-border/50 shadow-card overflow-hidden">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-soft">
            <ScanText className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle>Scan {targetType} Card</CardTitle>
          <CardDescription>
            Take a photo or upload an image of the {targetType.toLowerCase()}'s business card to extract contact info automatically
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Hidden canvas for capturing photos */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />

          {/* Scanner Preview Area */}
          <div className="relative aspect-square bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Business card frame guide */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="relative border-2 border-primary rounded-lg"
                    style={{ width: '280px', height: '180px' }}
                    animate={{ boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.3)', '0 0 0 10px rgba(59, 130, 246, 0)'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </>
            ) : previewImage ? (
              <div className="absolute inset-0 flex items-center justify-center">
                {isProcessing ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="text-center space-y-3">
                      <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                      <p className="text-sm text-white font-medium">Processing card...</p>
                    </div>
                  </div>
                ) : null}
                <img
                  src={previewImage}
                  alt="Card preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {isProcessing ? (
                  <div className="text-center space-y-3">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Processing card...</p>
                  </div>
                ) : (
                  <div className="text-center space-y-3 p-6">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Business card preview will appear here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Extracted Contact Data */}
          {extractedData && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Extracted Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {extractedData.name && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{extractedData.name}</p>
                    </div>
                  </div>
                )}
                {extractedData.job_title && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Title</p>
                      <p className="text-sm font-medium">{extractedData.job_title}</p>
                    </div>
                  </div>
                )}
                {extractedData.company && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="text-sm font-medium">{extractedData.company}</p>
                    </div>
                  </div>
                )}
                {extractedData.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium break-all">{extractedData.email}</p>
                    </div>
                  </div>
                )}
                {extractedData.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{extractedData.phone}</p>
                    </div>
                  </div>
                )}
                {extractedData.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium">{extractedData.address}</p>
                    </div>
                  </div>
                )}
                {extractedData.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Website</p>
                      <p className="text-sm font-medium break-all">{extractedData.website}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            {extractedData ? (
              <>
                <Button
                  onClick={handleSaveContact}
                  disabled={isSaving}
                  className="gradient-primary hover:opacity-90"
                  size="lg"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Continue
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isSaving}
                  size="lg"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
              </>
            ) : imageReady ? (
              <>
                <Button
                  onClick={handleScanImage}
                  disabled={isProcessing}
                  className="gradient-primary hover:opacity-90"
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ScanText className="h-4 w-4" />
                      Scan
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isProcessing}
                  size="lg"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
              </>
            ) : cameraActive ? (
              <>
                <Button
                  onClick={handleCapture}
                  disabled={isProcessing}
                  className="gradient-primary hover:opacity-90"
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Capture
                    </>
                  )}
                </Button>

                <Button
                  onClick={stopCamera}
                  className="bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleTakePhoto}
                  disabled={isProcessing}
                  className="gradient-primary hover:opacity-90"
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleUploadImage}
                  disabled={isProcessing}
                  size="lg"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            capture="environment"
          />

          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="w-full"
            size="lg"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-4 border-border/50 bg-accent/30">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> For best results, ensure the business card is well-lit and the text is clearly visible. The OCR will automatically extract name, company, email, and phone number.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
