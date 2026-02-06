import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, QrCode, Camera, Loader2, X } from 'lucide-react';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ScannedQRData {
  sUserName?: string;
  sAttendeeId?: string;
  sCompanyName?: string;
  sRole?: string;
  sLinkedinUrl?: string;
  sPhoneNumber?: string;
  sEmail?: string;
  sEventName?: string;
  [key: string]: any;
}

export default function ScanQR() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<ScannedQRData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine what type of contact the user can add based on their role
  const targetType = user?.role === 'exhibitor' ? 'Attendee' : 'Exhibitor';

  // Decode QR code from image data
  const decodeQRCode = useCallback((imageData: ImageData): string | null => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });
      
      if (code) {
        console.log('QR Code decoded:', code.data);
        return code.data;
      }
      return null;
    } catch (error) {
      console.error('QR decode error:', error);
      return null;
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log('Stopping camera');
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraError(null);
  }, []);

  // Start QR scanning
  const startQRScanning = useCallback(() => {
    console.log('Starting QR scan');
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) {
        console.log('Video or canvas ref not available');
        return;
      }

      const context = canvasRef.current.getContext('2d');
      if (!context) {
        console.log('Canvas context not available');
        return;
      }

      try {
        // Check if video is loaded and playing
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
          console.log('Video not ready yet, waiting...');
          return;
        }

        // Set canvas size to match video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(videoRef.current, 0, 0);

        // Get image data and try to decode QR code
        const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const qrData = decodeQRCode(imageData);

        if (qrData) {
          console.log('✓ QR Code detected and decoded:', qrData);
          
          // Try to parse JSON data
          let parsedData: ScannedQRData = {};
          try {
            parsedData = JSON.parse(qrData);
          } catch (e) {
            // If not JSON, treat it as plain text
            parsedData = { sUserName: qrData };
          }
          
          // Stop scanning
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }
          
          setIsScanning(false);
          stopCamera();
          
          // Store scanned data and show success
          setScannedData(parsedData);
          toast({
            title: 'QR Code Scanned Successfully',
            description: `Scanned ${parsedData.sUserName || parsedData.sAttendeeId || 'contact'}`,
          });
        }
      } catch (error) {
        console.error('QR scanning error:', error);
      }
    }, 100); // Scan 10 times per second for better detection
  }, [decodeQRCode, toast, stopCamera]);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    console.log('Initializing camera...');
    setCameraError(null);
    
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      console.log('✓ Camera stream obtained:', stream.id);

      if (!videoRef.current) {
        console.error('Video ref is null');
        stream.getTracks().forEach(track => track.stop());
        setCameraError('Failed to initialize video element');
        return;
      }

      // Set the stream to the video element
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      // Add event listener for when video starts playing
      const handleCanPlay = () => {
        console.log('✓ Video is ready to play');
        setCameraActive(true);
        // Start scanning after video is playing
        startQRScanning();
        videoRef.current?.removeEventListener('canplay', handleCanPlay);
      };

      // Add timeout fallback
      const timeoutId = setTimeout(() => {
        console.log('Timeout: video took too long to start');
        if (!cameraActive) {
          setCameraActive(true);
          startQRScanning();
        }
        videoRef.current?.removeEventListener('canplay', handleCanPlay);
      }, 2000);

      videoRef.current.addEventListener('canplay', handleCanPlay);

      // Try to play the video
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✓ Video is now playing');
            clearTimeout(timeoutId);
          })
          .catch((error: any) => {
            console.error('✗ Play error:', error);
            clearTimeout(timeoutId);
            setCameraError('Failed to play video stream: ' + error.message);
            stopCamera();
            setIsScanning(false);
          });
      }
    } catch (error: any) {
      console.error('✗ Camera initialization error:', error);
      
      let errorMessage = 'Failed to access camera';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera device found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setCameraError(errorMessage);
      toast({
        title: 'Camera Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsScanning(false);
    }
  }, [startQRScanning, toast, stopCamera, cameraActive]);

  const handleStartScan = async () => {
    console.log('Start scan clicked');
    setIsScanning(true);
    setScannedData(null);
    await initializeCamera();
  };

  const handleStopScan = () => {
    console.log('Stop scan clicked');
    stopCamera();
    setIsScanning(false);
  };

  const handleRetryScan = () => {
    console.log('Retry scan clicked');
    setScannedData(null);
    handleStartScan();
  };

  const handleSaveContact = () => {
    if (!scannedData) return;

    console.log('Save contact clicked with data:', scannedData);

    // Map QR data to AddContact format
    const ocrData = {
      name: scannedData.sUserName || '',
      email: scannedData.sEmail || '',
      phone: scannedData.sPhoneNumber || '',
      company: scannedData.sCompanyName || '',
      job_title: scannedData.sRole || '',
      website: scannedData.sLinkedinUrl || '',
      address: scannedData.sRegistrationType || '',
    };

    // Get selected event info if available from location state
    const currentState = location.state as any;
    const selectedEvent = currentState?.selectedEvent || (scannedData.sEventName ? {
      eventName: scannedData.sEventName,
      eventId: scannedData.iEventId || ''
    } : null);

    // Navigate to AddContact with scanned data
    navigate('/dashboard/add/manual', {
      state: {
        ocrData,
        selectedEvent,
        scannedViaQR: true,
        qrFullData: scannedData, // Store full QR data for reference
      }
    });
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

          {/* Scanned Data Display */}
          {scannedData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3"
            >
              <p className="text-sm font-semibold text-green-800">✓ QR Code Scanned Successfully</p>
              <div className="space-y-2 text-sm">
                {scannedData.sUserName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{scannedData.sUserName}</span>
                  </div>
                )}
                {scannedData.sEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-blue-600">{scannedData.sEmail}</span>
                  </div>
                )}
                {scannedData.sPhoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{scannedData.sPhoneNumber}</span>
                  </div>
                )}
                {scannedData.sCompanyName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{scannedData.sCompanyName}</span>
                  </div>
                )}
                {scannedData.sRole && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium">{scannedData.sRole}</span>
                  </div>
                )}
                {scannedData.sEventName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event:</span>
                    <span className="font-medium">{scannedData.sEventName}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Scanner Preview Area */}
          <div className={`relative bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border ${scannedData ? 'aspect-video' : 'aspect-square'}`}>
            {/* Video and Canvas - Always in DOM for ref access */}
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }}
              className="absolute inset-0"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {cameraActive ? (
              <>
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
            ) : !scannedData ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3 p-6">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Camera preview will appear here
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {scannedData ? (
              <>
                <Button
                  onClick={handleSaveContact}
                  className="w-full gradient-primary hover:opacity-90"
                  size="lg"
                >
                  Save Contact
                </Button>
                <Button
                  onClick={handleRetryScan}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Camera className="h-4 w-4" />
                  Scan Another
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                  size="lg"
                >
                  Cancel
                </Button>
              </>
            ) : cameraActive ? (
              <Button
                onClick={handleStopScan}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <X className="h-4 w-4" />
                Stop Scanning
              </Button>
            ) : (
              <>
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
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                  size="lg"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
