import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Loader2, ChevronLeft, ScanText, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Check if device is mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

interface MediaUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onMediaUpload: (mediaUrl: string) => void;
  title?: string;
  description?: string;
  getDirectURL: (file: File, mediaType: string) => Promise<string>;
  // optional handler when user wants to perform an OCR scan instead of uploading
  onScanChoice?: (mode: 'text' | 'card') => void;
}

export function MediaUploadDialog({
  open,
  onClose,
  onMediaUpload,
  title = 'Upload Contact Photo',
  description = 'Add a photo to this contact',
  getDirectURL,
  onScanChoice,
}: MediaUploadDialogProps) {
  const [step, setStep] = useState<'choose' | 'camera' | 'result'>('choose');
  const [cameraActive, setCameraActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  // Cleanup stream on unmount or when dialog closes
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Initialize camera
  const initializeCamera = async () => {
    // On mobile, use native camera via file input
    if (isMobileDevice()) {
      cameraInputRef.current?.click();
      return;
    }

    // On desktop, use getUserMedia
    try {
      setIsLoading(true);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported on your device');
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!videoRef.current) {
        throw new Error('Video element not ready');
      }

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      // Ensure video plays
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch((e) => {
          console.error('Play error:', e);
          toast({
            title: 'Camera Error',
            description: 'Failed to start camera stream.',
            variant: 'destructive',
          });
        });
      };

      setCameraActive(true);
      setStep('camera');
    } catch (error: any) {
      console.error('Camera error details:', error);
      
      let errorMessage = 'Failed to access camera. Please check permissions.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please enable it in settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another app.';
      } else if (error.message?.includes('not supported')) {
        errorMessage = 'Camera not supported on your device.';
      }
      
      toast({
        title: 'Camera Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture photo from camera
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setIsLoading(true);
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      const previewDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
      setPreviewImage(previewDataUrl);
      setCameraActive(false);
      setStep('result');

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error('Capture error:', error);
      toast({
        title: 'Capture Error',
        description: 'Failed to capture photo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          const compressedDataUrl = await compressImage(dataUrl);
          setPreviewImage(compressedDataUrl);
          setStep('result');
        } catch (error) {
          console.error('Compression error:', error);
          toast({
            title: 'Compression Error',
            description: 'Failed to process image.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File selection error:', error);
      setIsLoading(false);
    }
  };

  // Compress image
  const compressImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1024;
        const maxHeight = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  };

  // Handle camera file selection
  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          const compressedDataUrl = await compressImage(dataUrl);
          setPreviewImage(compressedDataUrl);
          setStep('result');
        } catch (error) {
          console.error('Compression error:', error);
          toast({
            title: 'Compression Error',
            description: 'Failed to process image.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Camera capture error:', error);
      setIsLoading(false);
    }
  };

  // Upload media to server
  const handleUpload = async () => {
    if (!previewImage) return;

    try {
      setIsUploading(true);

      // Convert data URL to blob
      const response = await fetch(previewImage);
      const blob = await response.blob();
      
      // Check blob size
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error('Image size exceeds 5MB limit after compression');
      }

      const file = new File([blob], 'contact-photo.jpg', { type: 'image/jpeg' });

      // Upload to server
      const mediaUrl = await getDirectURL(file, 'image');

      toast({
        title: 'Photo uploaded',
        description: 'Contact photo has been uploaded successfully.',
      });

      // Notify parent with the uploaded media URL. Parent navigation/state should close this dialog —
      // do NOT call handleClose() here to avoid overriding parent's navigation (was causing a redirect to /dashboard).
      onMediaUpload(mediaUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || 'Failed to upload photo. Please try again.';
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Close and reset
  const handleClose = () => {
    if (cameraActive) {
      stopCamera();
    }
    setStep('choose');
    setPreviewImage(null);
    setIsLoading(false);
    setIsUploading(false);
    onClose();
  };

  const handleBack = () => {
    if (step === 'camera') {
      stopCamera();
    }
    setPreviewImage(null);
    setStep('choose');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Choose Step */}
          {step === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <Button
                onClick={initializeCamera}
                disabled={isLoading}
                className="h-24 flex flex-col gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="h-6 w-6" />
                    <span className="text-xs">Take Photo</span>
                  </>
                )}
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="h-24 flex flex-col gap-2"
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs">Upload Photo</span>
              </Button>

              {/* New scan options: Text scan & Business card scan */}
              <Button
                onClick={() => {
                  // let parent handle navigation/closing so it can pass state (returnTo / selectedEvent / etc.)
                  onScanChoice?.('text');
                }}
                variant="outline"
                className="h-24 flex flex-col gap-2"
              >
                <FileText className="h-6 w-6" />
                <span className="text-xs">Text Scan</span>
              </Button>

              <Button
                onClick={() => {
                  // let parent handle navigation/closing so it can pass state (returnTo / selectedEvent / etc.)
                  onScanChoice?.('card');
                }}
                variant="outline"
                className="h-24 flex flex-col gap-2"
              >
                <ScanText className="h-6 w-6" />
                <span className="text-xs">Scan Business Card</span>
              </Button>
            </motion.div>
          )}

          {/* Camera Step */}
          {step === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  controls={false}
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={capturePhoto}
                  disabled={isLoading}
                  className="flex-1 gradient-primary"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Capture
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {/* Result Step */}
          {step === 'result' && previewImage && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-secondary/30">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 gradient-primary"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                >
                  Retake
                </Button>
              </div>
            </motion.div>
          )}

          {/* Hidden camera input */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            onChange={handleCameraCapture}
            className="hidden"
            capture="environment"
          />

          {/* Hidden file input for gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
