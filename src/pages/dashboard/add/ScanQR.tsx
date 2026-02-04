import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, QrCode, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ScanQR() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  // Determine what type of contact the user can add based on their role
  const targetType = user?.role === 'exhibitor' ? 'Attendee' : 'Exhibitor';

  const handleStartScan = async () => {
    setIsScanning(true);
    
    // Simulate QR scan (in real app, this would use camera/QR library)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'QR Scan Feature',
      description: 'Camera integration will be added with backend support.',
    });
    
    setIsScanning(false);
  };

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
            <div className="absolute inset-0 flex items-center justify-center">
              {isScanning ? (
                <div className="text-center space-y-3">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">Scanning...</p>
                </div>
              ) : (
                <div className="text-center space-y-3 p-6">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Camera preview will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Scanner frame corners */}
            {isScanning && (
              <>
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary rounded-br-lg" />
              </>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleStartScan}
              disabled={isScanning}
              className="w-full gradient-primary hover:opacity-90"
              size="lg"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning...
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
