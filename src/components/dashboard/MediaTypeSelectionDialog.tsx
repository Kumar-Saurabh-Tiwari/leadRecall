import { motion } from 'framer-motion';
import { Camera, ScanText, CreditCard, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MediaTypeSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: 'picture' | 'text' | 'card') => void;
  isLoading?: boolean;
}

export function MediaTypeSelectionDialog({
  open,
  onClose,
  onSelect,
  isLoading = false,
}: MediaTypeSelectionDialogProps) {
  const mediaTypes = [
    {
      type: 'picture',
      label: 'Picture',
      description: 'Upload or capture a photo',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      type: 'text',
      label: 'Text Scan',
      description: 'Scan text from document',
      icon: ScanText,
      color: 'from-purple-500 to-pink-500',
    },
    {
      type: 'card',
      label: 'Business Card',
      description: 'Scan business card',
      icon: CreditCard,
      color: 'from-orange-500 to-red-500',
    },
  ];

  const handleSelect = (type: 'picture' | 'text' | 'card') => {
    onSelect(type);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Media</DialogTitle>
          <DialogDescription>
            Choose how you want to add media to this entry
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 py-6">
          {mediaTypes.map((media, idx) => {
            const Icon = media.icon;
            return (
              <motion.div
                key={media.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.1 }}
              >
                <button
                  onClick={() => handleSelect(media.type as 'picture' | 'text' | 'card')}
                  disabled={isLoading}
                  className="w-full text-left"
                >
                  <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-12 w-12 rounded-lg bg-gradient-to-r ${media.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">
                            {media.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {media.description}
                          </p>
                        </div>
                        <div className="text-muted-foreground">→</div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
