import { useState, useRef, useEffect, useCallback } from 'react';
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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine what type of contact the user can add based on their role
  const targetType = user?.role === 'exhibitor' ? 'Attendee' : 'Exhibitor';

  // Basic QR pattern detection
  const detectQRPattern = useCallback((imageData: ImageData): string | null => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    let qrPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (r + g + b) / 3;
      if (gray < 50 || gray > 200) {
        qrPixels++;
      }
    }

    const qrPixelRatio = qrPixels / (width * height);
    if (qrPixelRatio > 0.3 && qrPixelRatio < 0.7) {
      return `QR Code (confidence: ${Math.round(qrPixelRatio * 100)}%)`;
    }

    return null;
  }, []);

  // Start QR scanning
  const startQRScanning = useCallback(() => {
    console.log('Starting QR scan');
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      try {
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
          return;
        }

        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const qrResult = detectQRPattern(imageData);

        if (qrResult) {
          console.log('QR Code detected:', qrResult);
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
          }
          setIsScanning(false);
          stopCamera();
          toast({
            title: 'QR Code Scanned',
            description: `Detected: ${qrResult}`,
          });
        }
      } catch (error) {
        console.error('QR scanning error:', error);
      }
    }, 500);
  }, [detectQRPattern, toast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log('Stopping camera');
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    console.log('Initializing camera');
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      console.log('Got stream:', stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for the video to actually be playing before marking camera as active
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video playing, setting camera active');
              setCameraActive(true);
              // Start scanning after video is confirmed playing
              startQRScanning();
            })
            .catch((error: any) => {
              console.error('Play error:', error);
              setCameraError('Failed to play video stream');
            });
        } else {
          // Fallback for older browsers
          setCameraActive(true);
          startQRScanning();
        }
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraError(error.message || 'Failed to access camera');
      toast({
        title: 'Camera Error',
        description: error.message || 'Failed to access camera. Please check permissions.',
        variant: 'destructive',
      });
      setIsScanning(false);
    }
  }, [startQRScanning, toast]);

  const handleStartScan = async () => {
    console.log('Start scan clicked');
    setIsScanning(true);
    await initializeCamera();
  };

  const handleStopScan = () => {
    console.log('Stop scan clicked');
    stopCamera();
    setIsScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      stopCamera();
    };
  }, [stopCamera]);

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
          {cameraError && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              <p className="font-semibold">Camera Error</p>
              <p>{cameraError}</p>
            </div>
          )}

          {/* Scanner Preview Area */}
          <div className="relative aspect-square bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  className="absolute inset-0"
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
