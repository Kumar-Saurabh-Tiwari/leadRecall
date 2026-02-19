import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { nextStepsService } from '@/services/nextStepsService';

const NextStep4 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const entryId = searchParams.get('entryId');
  const entryName = searchParams.get('entryName') || 'Contact';
  const tag = searchParams.get('tag') || 'refer';
  const option = searchParams.get('option') || '';
  const note = searchParams.get('note') || '';
  const schedule = searchParams.get('schedule') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      console.log('[NextStep4] Confirming next step:', {
        entryId,
        entryName,
        tag,
        option,
        note,
        schedule,
      });

      // Final save with all details
      await nextStepsService.saveNextStep({
        recordId: entryId || '',
        entryName,
        action: tag,
        tag: tag,
        notes: `${tag} - ${option}. ${note}. Scheduled: ${schedule}`,
        selectedOptions: [option, schedule],
      });

      console.log('[NextStep4] Next step confirmed and saved');
      setSubmitted(true);

      // Show success for 2 seconds then redirect
      setTimeout(() => {
        navigate(`/dashboard/entry/${entryId}`);
      }, 2000);
    } catch (error) {
      console.error('[NextStep4] Error confirming next step:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-4 max-w-md mx-auto px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="relative w-20 h-20">
              <CheckCircle className="h-20 w-20 text-green-500" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute inset-0 rounded-full border-2 border-green-500"
                style={{ animation: 'pulse 2s infinite' }}
              />
            </div>
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Success!</h2>
            <p className="text-sm text-muted-foreground">
              Your next step has been saved successfully
            </p>
          </div>

          <Button
            onClick={() => navigate(`/dashboard/entry/${entryId}`)}
            className="w-full mt-6"
          >
            Back to Entry
          </Button>
        </motion.div>
      </div>
    );
  }

  const scheduleDate = schedule ? new Date(schedule).toLocaleString() : 'Not scheduled';

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
            disabled={isLoading}
            className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-lg font-bold text-foreground flex-1 text-center">
            Confirm Next Step
          </h1>
          <div className="w-10" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="space-y-4 text-center">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Contact
                  </p>
                  <p className="text-xl font-bold text-foreground">{entryName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3"
        >
          {/* Action */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Action
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="capitalize">
                    {tag}
                  </Badge>
                  {option && (
                    <Badge variant="secondary" className="capitalize">
                      {option}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          {schedule && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Scheduled Date & Time
                  </p>
                  <p className="text-sm font-semibold text-foreground">{scheduleDate}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {note && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Notes
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                    {decodeURIComponent(note)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Info Alert */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-300">
              <p className="font-semibold mb-1">Next Step Information</p>
              <p className="text-xs opacity-90">
                This next step will help you stay organized and follow up with your contacts at the right time.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex gap-3 pt-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirm & Save
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default NextStep4;
