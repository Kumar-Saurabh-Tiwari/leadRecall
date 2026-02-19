import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { nextStepsService } from '@/services/nextStepsService';

const NextStep1 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const entryId = searchParams.get('entryId');
  const entryName = searchParams.get('entryName') || 'Contact';

  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [otherNote, setOtherNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const menuItems = [
    {
      label: 'Refer',
      icon: '/src/components/shared/next-step/refer.svg',
      value: 'refer',
      description: 'Refer this contact to someone',
    },
    {
      label: 'Connect',
      icon: '/src/components/shared/next-step/connect.svg',
      value: 'connect',
      description: 'Connect with this contact',
    },
    {
      label: 'Call',
      icon: '/src/components/shared/next-step/call.svg',
      value: 'call',
      description: 'Schedule a call',
    },
    {
      label: 'Mention to',
      icon: '/src/components/shared/next-step/mention.svg',
      value: 'mention',
      description: 'Mention to someone',
    },
    {
      label: 'Buy',
      icon: '/src/components/shared/next-step/buy.svg',
      value: 'buy',
      description: 'Intention to purchase',
    },
    {
      label: 'Contemplate',
      icon: '/src/components/shared/next-step/contemplate.svg',
      value: 'contemplate',
      description: 'Think about this later',
    },
    {
      label: 'Other',
      icon: '/src/components/shared/next-step/other.svg',
      value: 'others',
      description: 'Something else',
    },
  ];

  useEffect(() => {
    if (!entryId) {
      navigate('/dashboard');
    }
  }, [entryId, navigate]);

  const handleSelectedOption = (option: string) => {
    console.log('[NextStep1] Selected option:', option);

    if (option === 'refer' || option === 'call' || option === 'others') {
      // Navigate to NextStep2
      navigate(
        `/dashboard/add/next-step-2?entryId=${entryId}&entryName=${entryName}&tag=${option}`
      );
    } else if (
      option === 'connect' ||
      option === 'mention' ||
      option === 'buy' ||
      option === 'contemplate'
    ) {
      // Navigate to NextStep2 with name parameter
      navigate(
        `/dashboard/add/next-step-2?entryId=${entryId}&entryName=${entryName}&tag=${option}`
      );
    }
  };

  const handleSubmitOther = async () => {
    if (!otherNote.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('[NextStep1] Submitting other option with note:', otherNote);

      // Save to next steps service (will console log)
      await nextStepsService.saveNextStep({
        recordId: entryId || '',
        entryName,
        action: 'other',
        tag: 'other',
        notes: otherNote,
      });

      setIsOtherModalOpen(false);
      setOtherNote('');

      // Navigate to NextStep4 directly for 'other' flow
      navigate(
        `/dashboard/add/next-step-4?entryId=${entryId}&entryName=${entryName}&tag=other&option=other&note=${encodeURIComponent(otherNote)}`
      );
    } catch (error) {
      console.error('[NextStep1] Error submitting other:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 border-b border-border/40"
      >
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-lg font-bold text-foreground text-center flex-1">
            Next Steps with {entryName}
          </h1>
          <div className="w-10" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {/* Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                Choose from the following actions for your next step:
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu Items Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
        >
          {menuItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.2 + idx * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => {
                    if (item.value === 'others') {
                      setIsOtherModalOpen(true);
                    } else {
                      handleSelectedOption(item.value);
                    }
                  }}
                  className="w-full h-full p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 group flex flex-col items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <img src={item.icon} alt={item.label} className="h-8 w-8 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                    {item.label}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 hidden group-hover:block">
                    {item.description}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Other Option Dialog */}
      <Dialog open={isOtherModalOpen} onOpenChange={setIsOtherModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Other Next Step</DialogTitle>
            <DialogDescription>
              Please describe what you want to do as a next step with {entryName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otherNote">Next Step Note</Label>
              <Input
                id="otherNote"
                placeholder="Enter your next step..."
                value={otherNote}
                onChange={(e) => setOtherNote(e.target.value)}
                className="min-h-24 p-3 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {otherNote.length}/500
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsOtherModalOpen(false);
                setOtherNote('');
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOther}
              disabled={!otherNote.trim() || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NextStep1;
