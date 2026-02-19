import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { nextStepsService } from '@/services/nextStepsService';

const NextStep3 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const entryId = searchParams.get('entryId');
  const entryName = searchParams.get('entryName') || 'Contact';
  const tag = searchParams.get('tag') || 'refer';
  const option = searchParams.get('option') || '';
  const note = searchParams.get('note') || '';

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedDate || !selectedTime) {
      console.log('[NextStep3] Date and time are required');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[NextStep3] Continuing with date:', selectedDate, 'time:', selectedTime);

      // Save the step data
      await nextStepsService.saveNextStep({
        recordId: entryId || '',
        entryName,
        action: tag,
        tag: tag,
        notes: `${option} - Scheduled for ${selectedDate} at ${selectedTime}. ${customNote}`,
        selectedOptions: [option, `${selectedDate} ${selectedTime}`],
      });

      // Navigate to NextStep4 (final confirmation)
      const scheduleDateTime = `${selectedDate}T${selectedTime}`;
      navigate(
        `/dashboard/add/next-step-4?entryId=${entryId}&entryName=${entryName}&tag=${tag}&option=${option}&schedule=${encodeURIComponent(scheduleDateTime)}&note=${encodeURIComponent(customNote)}`
      );
    } catch (error) {
      console.error('[NextStep3] Error:', error);
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
          <h1 className="text-lg font-bold text-foreground flex-1 text-center">Schedule</h1>
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
            <CardContent className="p-4">
              <div className="space-y-2 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Next Step Action
                </p>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {tag}
                  {option && ` - ${option}`}
                </p>
                <p className="text-xs text-muted-foreground">with {entryName}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-4"
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Input */}
              <div className="space-y-2">
                <Label htmlFor="scheduleDate">Date</Label>
                <Input
                  id="scheduleDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-muted-foreground">
                  Select the date for your next step
                </p>
              </div>

              {/* Time Input */}
              <div className="space-y-2">
                <Label htmlFor="scheduleTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </Label>
                <Input
                  id="scheduleTime"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">Select the time</p>
              </div>

              {/* Optional Note */}
              <div className="space-y-2">
                <Label htmlFor="customNote">Additional Notes (Optional)</Label>
                <Input
                  id="customNote"
                  placeholder="Add any notes about this next step..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  maxLength={200}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {customNote.length}/200
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
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
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime || isLoading}
            className="flex-1"
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
        </motion.div>
      </div>
    </div>
  );
};

export default NextStep3;
