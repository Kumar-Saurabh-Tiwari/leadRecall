import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, QrCode, Camera, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ScanQR() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
        startQRScanning();
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Camera Error',
        description: 'Failed to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  // Simple QR code detection using canvas
  const startQRScanning = () => {
    const scanInterval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !cameraActive) {
        clearInterval(scanInterval);
        return;
      }

      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      try {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        // Try to detect QR code patterns using basic image processing
        const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const qrResult = detectQRPattern(imageData);

        if (qrResult) {
          console.log('QR Code detected:', qrResult);
          setIsScanning(false);
          stopCamera();
          toast({
            title: 'QR Code Scanned',
            description: `Detected: ${qrResult}`,
          });
          clearInterval(scanInterval);
        }
      } catch (error) {
        console.error('QR scanning error:', error);
      }
    }, 500);
  };

  // Basic QR pattern detection (looks for finder patterns)
  const detectQRPattern = (imageData: ImageData): string | null => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Convert to grayscale and detect high contrast areas (QR code characteristic)
    let qrPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (r + g + b) / 3;
      // QR codes have high contrast (very dark or very light pixels)
      if (gray < 50 || gray > 200) {
        qrPixels++;
      }
    }

    const qrPixelRatio = qrPixels / (width * height);
    // QR codes typically have 50-60% dark pixels
    if (qrPixelRatio > 0.3 && qrPixelRatio < 0.7) {
      return `QR Code (confidence: ${Math.round(qrPixelRatio * 100)}%)`;
    }

    return null;
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleStartScan = async () => {
    setIsScanning(true);
    await initializeCamera();
  };

  const handleStopScan = () => {
    stopCamera();
    setIsScanning(false);
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
          <h1 className="text-xl font-bold text-foreground">Scan QR Code</h1>
          <p className="text-sm text-muted-foreground">Add {targetType} by scanning their QR</p>
        </div>
      </div>

      {/* Scanner Card */}
      <Card className="border-border/50 shadow-card overflow-hidden">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-soft">
            <QrCode className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle>Scan {targetType} QR Code</CardTitle>
          <CardDescription>
            Point your camera at the {targetType.toLowerCase()}'s QR code to instantly add them as a contact
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
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
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                {/* QR Code scan frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary" />
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                      animate={{ top: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3 p-6">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Camera preview will appear here
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {cameraActive ? (
              <Button
                onClick={handleStopScan}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <X className="h-4 w-4" />
                Stop Scanning
              </Button>
            ) : (
              <Button
                onClick={handleStartScan}
                disabled={isScanning}
                className="w-full gradient-primary hover:opacity-90"
                size="lg"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Start Scanning
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
