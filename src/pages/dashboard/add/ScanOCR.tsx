import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ScanText, Camera, Upload, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ScanOCR() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  // Determine what type of contact the user can add based on their role
  const targetType = user?.role === 'exhibitor' ? 'Attendee' : 'Exhibitor';

  const handleTakePhoto = async () => {
    setIsScanning(true);
    
    // Simulate OCR scan (in real app, this would use camera + OCR service)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'OCR Scan Feature',
      description: 'Camera and OCR integration will be added with backend support.',
    });
    
    setIsScanning(false);
  };

  const handleUploadImage = () => {
    toast({
      title: 'Upload Feature',
      description: 'Image upload with OCR will be added with backend support.',
    });
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
            <div className="absolute inset-0 flex items-center justify-center">
              {isScanning ? (
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

            {/* Card frame guide */}
            {isScanning && (
              <motion.div
                className="absolute inset-6 border-2 border-primary rounded-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleTakePhoto}
              disabled={isScanning}
              className="gradient-primary hover:opacity-90"
              size="lg"
            >
              {isScanning ? (
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
              disabled={isScanning}
              size="lg"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>

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
