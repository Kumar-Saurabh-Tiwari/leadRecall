import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { nextStepsService } from '@/services/nextStepsService';

interface OptionItem {
  label: string;
  icon: string;
  value: string;
}

const NextStep2 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const entryId = searchParams.get('entryId');
  const entryName = searchParams.get('entryName') || 'Contact';
  const tag = searchParams.get('tag') || 'refer';

  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const [otherNote, setOtherNote] = useState('');
  const [contemplateChecked, setContemplateChecked] = useState<{
    [key: number]: boolean;
  }>({
    0: false,
    1: false,
    2: false,
    3: false,
  });
  const [contemplateOtherNote, setContemplateOtherNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const referOptions: OptionItem[] = [
    { label: 'Person', icon: '/src/components/shared/next-step/ref-person.svg', value: 'person' },
    { label: 'Website/App', icon: '/src/components/shared/next-step/ref-web.svg', value: 'webapp' },
    { label: 'Book', icon: '/src/components/shared/next-step/ref-book.svg', value: 'book' },
    { label: 'Product', icon: '/src/components/shared/next-step/ref-product.svg', value: 'product' },
    { label: 'Service', icon: '/src/components/shared/next-step/ref-service.svg', value: 'service' },
    { label: 'Location', icon: '/src/components/shared/next-step/ref-location.svg', value: 'place' },
    { label: 'Other', icon: '/src/components/shared/next-step/ref-other.svg', value: 'others' },
  ];

  const connectOptions: OptionItem[] = [
    { label: 'In Person', icon: '/src/components/shared/next-step/connect/person.svg', value: 'inperson' },
    { label: 'Video Platform', icon: '/src/components/shared/next-step/connect/web.svg', value: 'videoPlatform' },
    { label: 'Email', icon: '/src/components/shared/next-step/connect/email.svg', value: 'email' },
    { label: 'Phone Call', icon: '/src/components/shared/next-step/connect/call.svg', value: 'call' },
    { label: 'LinkedIn', icon: '/src/components/shared/next-step/connect/linkedin.svg', value: 'linkedin' },
    { label: 'WhatsApp', icon: '/src/components/shared/next-step/connect/whatsapp.svg', value: 'whatsapp' },
    { label: 'Other', icon: '/src/components/shared/next-step/connect/other.svg', value: 'others' },
  ];

  const callOptions: OptionItem[] = [
    { label: 'Mobile', icon: '/src/components/shared/next-step/call/mobile.svg', value: 'personal' },
    { label: 'Work', icon: '/src/components/shared/next-step/call/work.svg', value: 'professional' },
    { label: 'LinkedIn', icon: '/src/components/shared/next-step/call/linkedin.svg', value: 'linkedin' },
    { label: 'Slack', icon: '/src/components/shared/next-step/call/slack.svg', value: 'slack' },
    { label: 'WhatsApp', icon: '/src/components/shared/next-step/call/whatsapp.svg', value: 'whatsapp' },
    { label: 'Landline', icon: '/src/components/shared/next-step/call/landline.svg', value: 'landline' },
  ];

  const mentionOptions: OptionItem[] = [
    { label: 'Someone', icon: '/src/components/shared/next-step/mention/someone.svg', value: 'team' },
    { label: 'Business', icon: '/src/components/shared/next-step/mention/business.svg', value: 'manager' },
    { label: 'Event', icon: '/src/components/shared/next-step/mention/event.svg', value: 'colleague' },
    { label: 'Organization', icon: '/src/components/shared/next-step/mention/organization.svg', value: 'organization' },
    { label: 'Program', icon: '/src/components/shared/next-step/mention/program.svg', value: 'program' },
    { label: 'Other', icon: '/src/components/shared/next-step/mention/other.svg', value: 'others' },
  ];

  const buyOptions: OptionItem[] = [
    { label: 'Product', icon: '/src/components/shared/next-step/buy/product.svg', value: 'interested' },
    { label: 'Service', icon: '/src/components/shared/next-step/buy/service.svg', value: 'service' },
    { label: 'Programme', icon: '/src/components/shared/next-step/buy/programme.svg', value: 'programme' },
    { label: 'Book', icon: '/src/components/shared/next-step/buy/book.svg', value: 'book' },
    { label: 'Gift', icon: '/src/components/shared/next-step/buy/gift.svg', value: 'gift' },
    { label: 'Other', icon: '/src/components/shared/next-step/buy/other.svg', value: 'others' },
  ];

  const contemplateOptions = [
    { label: 'An idea', icon: '/src/components/shared/next-step/contemplate/idea.svg' },
    { label: 'Working Together', icon: '/src/components/shared/next-step/contemplate/working.svg' },
    { label: 'A Proposal', icon: '/src/components/shared/next-step/contemplate/proposal.svg' },
  ];

  const getOptions = (): OptionItem[] => {
    switch (tag) {
      case 'refer':
        return referOptions;
      case 'connect':
        return connectOptions;
      case 'call':
        return callOptions;
      case 'mention':
        return mentionOptions;
      case 'buy':
        return buyOptions;
      default:
        return referOptions;
    }
  };

  const getTitle = (): string => {
    switch (tag) {
      case 'refer':
        return 'What do you want to refer?';
      case 'connect':
        return 'How will you like to connect?';
      case 'call':
        return 'What type of call?';
      case 'mention':
        return 'Mention to whom?';
      case 'buy':
        return 'What is your buying status?';
      default:
        return 'Select an option';
    }
  };

  const handleOptionSelect = (option: string) => {
    console.log('[NextStep2] Selected option:', option);

    if (option === 'others') {
      setIsOtherOpen(true);
    } else {
      navigateToNextStep(option);
    }
  };

  const navigateToNextStep = (option: string) => {
    console.log('[NextStep2] Navigating to NextStep3 with option:', option);

    navigate(
      `/dashboard/add/next-step-3?entryId=${entryId}&entryName=${entryName}&tag=${tag}&option=${option}`
    );
  };

  const handleSubmitOther = async () => {
    if (!otherNote.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('[NextStep2] Submitting other option with note:', otherNote);

      await nextStepsService.saveNextStep({
        recordId: entryId || '',
        entryName,
        action: tag,
        tag: tag,
        notes: otherNote,
        selectedOptions: ['others'],
      });

      setIsOtherOpen(false);
      setOtherNote('');

      navigate(
        `/dashboard/add/next-step-3?entryId=${entryId}&entryName=${entryName}&tag=${tag}&option=others&note=${encodeURIComponent(otherNote)}`
      );
    } catch (error) {
      console.error('[NextStep2] Error submitting other:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContemplateSubmit = async () => {
    const selectedItems: string[] = [];
    contemplateOptions.forEach((_, idx) => {
      if (contemplateChecked[idx]) {
        selectedItems.push(contemplateOptions[idx].label);
      }
    });

    if (contemplateChecked[3] && contemplateOtherNote.trim()) {
      selectedItems.push(`Other: ${contemplateOtherNote}`);
    }

    if (selectedItems.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('[NextStep2] Submitting contemplate options:', selectedItems);

      const noteText = selectedItems.join(', ');
      await nextStepsService.saveNextStep({
        recordId: entryId || '',
        entryName,
        action: tag,
        tag: tag,
        notes: noteText,
        selectedOptions: selectedItems,
      });

      navigate(
        `/dashboard/add/next-step-4?entryId=${entryId}&entryName=${entryName}&tag=${tag}&option=contemplate&note=${encodeURIComponent(noteText)}`
      );
    } catch (error) {
      console.error('[NextStep2] Error submitting contemplate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (tag === 'contemplate') {
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
            <h1 className="text-lg font-bold text-foreground flex-1 text-center">Contemplate</h1>
            <div className="w-10" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="px-4 py-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground text-center">
                  What will you think about?
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-3"
          >
            {contemplateOptions.map((option, idx) => {
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 + idx * 0.05 }}
                >
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-colors group">
                    <Checkbox
                      id={`contemplate-${idx}`}
                      checked={contemplateChecked[idx]}
                      onCheckedChange={(checked) => {
                        const isChecked = typeof checked === 'boolean' ? checked : false;
                        setContemplateChecked({
                          ...contemplateChecked,
                          [idx]: isChecked,
                        });
                      }}
                      className="h-5 w-5"
                    />
                    <img src={option.icon} alt={option.label} className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    <Label
                      htmlFor={`contemplate-${idx}`}
                      className="flex-1 cursor-pointer text-sm font-semibold text-foreground"
                    >
                      {option.label}
                    </Label>
                  </div>
                </motion.div>
              );
            })}

            {/* Other Option */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.35 }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-colors group">
                  <Checkbox
                    id="contemplate-other"
                    checked={contemplateChecked[3]}
                    onCheckedChange={(checked) => {
                      const isChecked = typeof checked === 'boolean' ? checked : false;
                      setContemplateChecked({
                        ...contemplateChecked,
                        [3]: isChecked,
                      });
                    }}
                    className="h-5 w-5"
                  />
                  <Label
                    htmlFor="contemplate-other"
                    className="flex-1 cursor-pointer text-sm font-semibold text-foreground"
                  >
                    Other
                  </Label>
                </div>
                {contemplateChecked[3] && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      placeholder="Describe what you'd like to contemplate..."
                      value={contemplateOtherNote}
                      onChange={(e) => setContemplateOtherNote(e.target.value)}
                      className="text-sm"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="pt-4"
          >
            <Button
              onClick={handleContemplateSubmit}
              disabled={
                Object.values(contemplateChecked).every((val) => !val) || isLoading
              }
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Continuing...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const options = getOptions();

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
          <h1 className="text-lg font-bold text-foreground flex-1 text-center capitalize">
            {tag}
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
              <p className="text-sm text-muted-foreground text-center">{getTitle()}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Options List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-2"
        >
          {options.map((option, idx) => {
            return (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.2 + idx * 0.05 }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => handleOptionSelect(option.value)}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <img src={option.icon} alt={option.label} className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                      {option.label}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Other Option Dialog */}
      <Dialog open={isOtherOpen} onOpenChange={setIsOtherOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Other {tag} Option</DialogTitle>
            <DialogDescription>
              Please describe your {tag} option for {entryName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otherOption">Details</Label>
              <Input
                id="otherOption"
                placeholder={`Enter your ${tag} details...`}
                value={otherNote}
                onChange={(e) => setOtherNote(e.target.value)}
                className="text-sm"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {otherNote.length}/200
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsOtherOpen(false);
                setOtherNote('');
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOther}
              disabled={!otherNote.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
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

export default NextStep2;
