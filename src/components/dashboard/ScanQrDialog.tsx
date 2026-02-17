import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Loader2 } from 'lucide-react';

interface ScanQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanned: (scannedUrl: string) => void;
  title?: string;
  description?: string;
}

export default function ScanQrDialog({ open, onOpenChange, onScanned, title = 'Scan QR', description = 'Point camera at QR code' }: ScanQrDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedValue, setScannedValue] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setIsInitializing(false);
  }, []);

  const decodeQRCode = useCallback((imageData: ImageData): string | null => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      return code ? code.data : null;
    } catch (err) {
      console.error('QR decode error', err);
      return null;
    }
  }, []);

  const startCameraAndScan = useCallback(async () => {
    setError(null);
    setIsInitializing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (!videoRef.current) throw new Error('Video element not available');
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      setIsInitializing(false);

      // scanning loop
      if (scanIntervalRef.current) window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = window.setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const v = videoRef.current;
        const c = canvasRef.current;
        if (v.videoWidth === 0 || v.videoHeight === 0) return;
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(v, 0, 0);
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        const raw = decodeQRCode(imageData);
        if (raw) {
          // parse JSON or treat as plain text
          let url = '';
          try {
            const parsed = JSON.parse(raw);
            // pick common linkedin fields
            url = parsed.sLinkedinUrl || parsed.linkedin || parsed.url || parsed.profile || '';
          } catch (_) {
            url = raw;
          }

          // attempt to sanitize / pick plausible URL
          if (!url && typeof raw === 'string') url = raw;

          // stop and notify
          setScannedValue(url);
          onScanned(url);
          stopCamera();
          onOpenChange(false);
        }
      }, 120);
    } catch (err: any) {
      console.error('Camera init error', err);
      setError(err?.message || 'Failed to access camera');
      setIsInitializing(false);
      stopCamera();
    }
  }, [decodeQRCode, onOpenChange, onScanned, stopCamera]);

  useEffect(() => {
    if (open) {
      setScannedValue(null);
      startCameraAndScan();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [open, startCameraAndScan, stopCamera]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Card className="border-border/50 mt-4">
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
            )}

            <div className="relative bg-muted rounded-lg overflow-hidden aspect-square">
              <video
                ref={videoRef}
                muted
                playsInline
                autoPlay
                className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {!cameraActive && !isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2 p-6">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Camera preview will appear here</p>
                  </div>
                </div>
              )}

              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm text-muted-foreground">Initializing camera...</span>
                  </div>
                </div>
              )}
            </div>

            {scannedValue && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                <p className="font-medium text-green-800">Scanned</p>
                <p className="break-all">{scannedValue}</p>
              </div>
            )}

            <DialogFooter>
              <div className="w-full flex gap-2">
                <Button variant="outline" onClick={() => { stopCamera(); setScannedValue(null); onOpenChange(false); }}>Cancel</Button>
                <Button onClick={() => { setScannedValue(null); startCameraAndScan(); }} className="ml-auto">Restart</Button>
              </div>
            </DialogFooter>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
