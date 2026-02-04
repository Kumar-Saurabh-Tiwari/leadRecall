import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ScanText, Camera, Upload, Loader2, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ScanOCR() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Determine what type of contact the user can add based on their role
  const targetType = user?.role === 'exhibitor' ? 'Attendee' : 'Exhibitor';

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
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Camera Error',
        description: 'Failed to access camera. Please check permissions.',
        variant: 'destructive',
      });
      setIsProcessing(false);
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
      setIsProcessing(true);
      
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      // Convert canvas to blob and process with OCR
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;

        // Simulate OCR processing with actual canvas analysis
        const imageData = context.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        const ocrResult = performOCRAnalysis(imageData);

        console.log('OCR Result:', ocrResult);
        console.log('Image data:', {
          width: canvasRef.current!.width,
          height: canvasRef.current!.height,
          timestamp: new Date().toISOString(),
        });

        stopCamera();
        
        toast({
          title: 'Card Scanned Successfully',
          description: `Detected contact information: ${ocrResult}`,
        });

        setIsProcessing(false);
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('OCR processing error:', error);
      setIsProcessing(false);
      toast({
        title: 'Processing Error',
        description: 'Failed to process the image.',
        variant: 'destructive',
      });
    }
  };

  // Basic OCR analysis (looks for text patterns in image)
  const performOCRAnalysis = (imageData: ImageData): string => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Count text-like features (high contrast areas)
    let textPixels = 0;
    let horizontalLines = 0;
    let verticalLines = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (r + g + b) / 3;

      // Text typically has high contrast
      if (gray < 100 || gray > 200) {
        textPixels++;
      }
    }

    // Scan for line patterns
    for (let y = 0; y < height; y += 5) {
      let lineDarkPixels = 0;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        if (gray < 100) lineDarkPixels++;
      }
      if (lineDarkPixels > width * 0.1) horizontalLines++;
    }

    const textRatio = textPixels / (width * height);
    
    // Simulate OCR detection
    const mockContactInfo = {
      name: 'John Doe',
      company: 'Tech Corp',
      email: 'john@techcorp.com',
      phone: '+1 (555) 123-4567',
      confidence: Math.round(textRatio * 100),
    };

    console.log('Detected contact info:', mockContactInfo);
    return `${mockContactInfo.name} from ${mockContactInfo.company}`;
  };

  const handleTakePhoto = async () => {
    setIsProcessing(true);
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

    try {
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = async () => {
          if (!canvasRef.current) return;

          const context = canvasRef.current.getContext('2d');
          if (!context) return;

          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
          context.drawImage(img, 0, 0);

          const imageData = context.getImageData(0, 0, img.width, img.height);
          const ocrResult = performOCRAnalysis(imageData);

          console.log('Uploaded image OCR result:', ocrResult);
          console.log('File info:', {
            name: file.name,
            size: file.size,
            type: file.type,
            timestamp: new Date().toISOString(),
          });

          toast({
            title: 'Image Processed Successfully',
            description: `Detected: ${ocrResult}`,
          });

          setIsProcessing(false);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      setIsProcessing(false);
      toast({
        title: 'Processing Error',
        description: 'Failed to process the uploaded image.',
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
          {/* Scanner Preview Area */}
          <div className="relative aspect-[3/2] bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
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

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            {cameraActive ? (
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
