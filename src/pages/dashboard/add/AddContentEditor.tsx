import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';
import { entryService } from '@/services/entryService';

export default function AddContentEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshEntries } = useEvents();

  const state = (location.state || {}) as { mediaUrl?: string; ocrText?: string; selectedEvent?: { eventId: string; eventName: string } };
  const [label, setLabel] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState(state.ocrText || '');

  useEffect(() => {
    if (state.ocrText) setNotes(state.ocrText);
  }, [state.ocrText]);

  const generateObjectId = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
    const machineId = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    const processId = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
    const counter = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    return timestamp + machineId + processId + counter;
  };

  const handleSave = async () => {
    const mediaUrl = state.mediaUrl || '';

    if (!mediaUrl) {
      toast({ title: 'No image', description: 'Please upload or take a photo first.', variant: 'destructive' });
      return;
    }

    setTimeout(async () => {
      try {
        const entryId = generateObjectId();

        const contentDetails = {
          sPresentation:{sLabel: label.trim() || '', sValue: title.trim() || ''},
          sNotes: notes.trim() || '',
          sEventTitles: state.selectedEvent ? [state.selectedEvent.eventName] : [],
        };

        const data: any = {
          _id: entryId,
          id: entryId,
          iExhibitorId: user?.role === 'exhibitor' ? user.id || '' : '',
          sExhibitorEmail: user?.role === 'exhibitor' ? user.email || '' : '',
          bOcrScan: !!state.ocrText,
          bMediaScan: false,
          sMediaUrl: mediaUrl,
          entryType: user?.role || 'manual',
          sAttendeeId: user?.role === 'attendee' ? user.id || '' : '',
          sAttendeeEmail: user?.role === 'attendee' ? user.email || '' : '',
          oContentData: contentDetails,
          oProfileAnalyzeData: {},
          eMediaType: 'dataset',
          eRecordType: 'content',
          dCreatedDate: (new Date()).toISOString(),
          isOfflineRecord: false,
        };

        // Call backend API (same endpoints as contact flow)
        let apiResponse;
        if (data.entryType === 'attendee') {
          apiResponse = await entryService.addNewAttendeeData(data);
        } else {
          apiResponse = await entryService.addNewExhibitorData(data);
        }

        // Add to local service for immediate UI update
        const targetType = user?.role === 'exhibitor' ? 'attendee' : 'exhibitor';
        const newEntry = entryService.add({
          name: title.trim() || label.trim() || 'Untitled content',
          company: '',
          event: state.selectedEvent?.eventName || 'N/A',
          notes: notes.trim() || '',
          type: targetType,
          image: mediaUrl || undefined,
        });

        toast({ title: 'Content saved', description: 'Your content was saved.' });
        refreshEntries();
        navigate('/dashboard');
      } catch (error) {
        console.error('Error saving content:', error);
        toast({ title: 'Error', description: 'Failed to save content. Please try again.', variant: 'destructive' });
      }
    }, 200);
  };

  return (
    <div className="p-4 min-h-full">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-bold">Create Content</h1>
        <p className="text-sm text-muted-foreground">Add details and save</p>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader className="p-4">
          <CardTitle>Content Details</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {state.mediaUrl && (
            <div className="w-full h-64 max-w-md mx-auto">
              <img src={state.mediaUrl} alt="uploaded" className="w-full h-full rounded-lg object-cover" />
            </div>
          )}

          <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Input placeholder="Media Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
