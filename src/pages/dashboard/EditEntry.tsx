import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Loader, QrCode } from 'lucide-react';
import ScanQrDialog from '@/components/dashboard/ScanQrDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { entryService } from '@/services/entryService';
import { Entry } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function EditEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { setEntries: setEntriesInContext } = useEvents();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);

  const [formData, setFormData] = useState<Partial<Entry>>({
    name: '',
    company: '',
    event: '',
    notes: '',
    email: '',
    phone: '',
    linkedin: '',
  });

  useEffect(() => {
    const fetchEntryDetail = async () => {
      if (!id || !user?.role || !user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        let apiResponse: any;

        // Fetch based on user role
        if (user.role === 'exhibitor') {
          // Exhibitors see attendee details
          apiResponse = await entryService.getExhibitorDataByID (id);
        } else {
          // Attendees see exhibitor details
          apiResponse = await entryService.getAttendeeDataByID(id);
        }

        console.log('Entry Detail API Response:', apiResponse);

        // Check if response has data
        const itemData = apiResponse?.data || apiResponse;
        if (itemData && itemData._id) {
          // Get first non-empty event title
          const validEvent = itemData.oContactData?.sEventTitles?.find((evt: any) => evt.sTitle && evt.sTitle.trim());
          
          // Get first non-N/A LinkedIn profile link
          const linkedinProfile = itemData.oContactData?.profiles?.find((prof: any) => prof.sProfileLink && prof.sProfileLink !== 'N/A');

          const transformedEntry: Entry = {
            id: itemData._id || itemData.id,
            name: itemData.oContactData ? 
              `${itemData.oContactData.sFirstName || ''} ${itemData.oContactData.sLastName || ''}`.trim() : 
              'Unknown',
            company: itemData.oContactData?.sCompany || 'Unknown Company',
            event: validEvent?.sTitle || 'Unknown Event',
            notes: itemData.oContactData?.sEntryNotes?.[0] || '',
            type: user.role === 'exhibitor' ? 'attendee' : 'exhibitor',
            createdAt: itemData.dCreatedDate ? new Date(itemData.dCreatedDate) : new Date(),
            email: itemData.oContactData?.sEmail?.[0]?.Email || undefined,
            phone: itemData.oContactData?.contacts?.[0]?.sContactNumber || undefined,
            linkedin: linkedinProfile?.sProfileLink || undefined,
            profileUrl: undefined,
            image: itemData.sMediaUrl && itemData.sMediaUrl !== 'No Image' ? itemData.sMediaUrl : undefined
          };

          setEntry(transformedEntry);
          setFormData({
            name: transformedEntry.name,
            company: transformedEntry.company,
            email: transformedEntry.email || '',
            phone: transformedEntry.phone || '',
            linkedin: transformedEntry.linkedin || '',
            notes: transformedEntry.notes,
            event: transformedEntry.event,
          });
        } else {
          setError('Entry not found');
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching entry detail:', err);
        setError('Failed to load entry details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntryDetail();
  }, [id, user?.role, user?.email, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entry || !user?.email || !formData.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare update data based on API structure
      const updateData = {
        oContactData: {
          sFirstName: formData.name.split(' ')[0],
          sLastName: formData.name.split(' ').slice(1).join(' ') || '',
          sCompany: formData.company,
          sEmail: [
            {
              Email: formData.email
            }
          ],
          contacts: [
            {
              sContactNumber: formData.phone,
              sContactType: 'Work'
            }
          ],
          profiles: [
            {
              sProfileLink: formData.linkedin || 'N/A',
              sProfileType: 'linkedin'
            }
          ],
          sEntryNotes: [formData.notes],
          sEventTitles: [
            {
              sTitle: formData.event
            }
          ]
        }
      };

      let response;
      if (user.role === 'exhibitor') {
        // Update attendee data
        response = await entryService.updateExhibitorDataByID(entry.id, updateData);
      } else {
        // Update exhibitor data
        response = await entryService.updateAttendeeDataByID(entry.id, updateData);
      }

      console.log('Update response:', response);

      // Refetch all entries to update the list
      let apiResponse;
      if (user.role === 'exhibitor') {
        apiResponse = await entryService.getExhibitorData(user.email);
      } else {
        apiResponse = await entryService.getAttendeeData(user.email);
      }

      // Transform API response to Entry format
      const dataArray = apiResponse?.data || apiResponse;
      if (dataArray && Array.isArray(dataArray)) {
        const transformedEntries: Entry[] = dataArray.map((item: any) => {
          // Get first non-empty event title
          const validEvent = item.oContactData?.sEventTitles?.find((evt: any) => evt.sTitle && evt.sTitle.trim());
          
          // Get first non-N/A LinkedIn profile link
          const linkedinProfile = item.oContactData?.profiles?.find((prof: any) => prof.sProfileLink && prof.sProfileLink !== 'N/A');
          
          return {
            id: item._id || item.id || crypto.randomUUID(),
            name: item.oContactData ? 
              `${item.oContactData.sFirstName || ''} ${item.oContactData.sLastName || ''}`.trim() : 
              'Unknown',
            company: item.oContactData?.sCompany || 'Unknown Company',
            event: validEvent?.sTitle || 'Unknown Event',
            notes: item.oContactData?.sEntryNotes?.[0] || '',
            type: user.role === 'exhibitor' ? 'attendee' : 'exhibitor',
            createdAt: item.dCreatedDate ? new Date(item.dCreatedDate) : new Date(),
            email: item.oContactData?.sEmail?.[0]?.Email || undefined,
            phone: item.oContactData?.contacts?.[0]?.sContactNumber || undefined,
            linkedin: linkedinProfile?.sProfileLink || undefined,
            profileUrl: undefined,
            image: item?.sMediaUrl && item?.sMediaUrl !== 'No Image' ? item?.sMediaUrl : undefined
          };
        });

        // Update context with new entries
        setEntriesInContext(transformedEntries);
      }

      toast({
        title: 'Success',
        description: 'Entry updated successfully',
      });

      navigate(`/dashboard/entry/${entry.id}`);
    } catch (err) {
      console.error('Error updating entry:', err);
      toast({
        title: 'Error',
        description: 'Failed to update entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !user?.email) return;

    try {
      let response;
      console.log('Deleting entry with ID:', user.role);
      if (user.role === 'exhibitor') {
        // Delete attendee data
        response = await entryService.deleteExhibitor(entry.id, user.email);
      } else {
        // Delete exhibitor data
        response = await entryService.deleteAttendee(entry.id, user.email);
      }

      console.log('Delete response:', response);
      toast({
        title: 'Success',
        description: 'Entry deleted successfully',
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground">Loading entry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-3">{error}</p>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-3">Entry not found</p>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 border-b border-border/40"
      >
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/dashboard/entry/${entry.id}`)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-lg font-semibold">Edit Entry</h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company || ''}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event">Event *</Label>
                  <Input
                    id="event"
                    name="event"
                    value={formData.event || ''}
                    onChange={handleChange}
                    placeholder="Enter event name"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <div className="relative">
                    <Input
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin || ''}
                      onChange={handleChange}
                      placeholder="Enter LinkedIn URL"
                    />
                    <button
                      type="button"
                      title="Scan LinkedIn QR"
                      onClick={() => setShowQrDialog(true)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center hover:bg-secondary/20 transition-colors"
                    >
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="Add notes about this contact"
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="flex gap-3 pt-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/dashboard/entry/${entry.id}`)}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={isSaving}
            >
              {isSaving && <Loader className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
              {!isSaving && <Save className="h-4 w-4" />}
            </Button>
          </motion.div>
        </form>
      </div>

      {/* Scan LinkedIn dialog (fills linkedin input) */}
      <ScanQrDialog
        open={showQrDialog}
        onOpenChange={setShowQrDialog}
        onScanned={(url) => setFormData(prev => ({ ...prev, linkedin: url }))}
        title="Scan LinkedIn QR"
        description="Scan a QR that contains a LinkedIn or profile URL"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted/50 p-3 rounded-lg my-3">
            <p className="text-sm font-medium text-foreground">{entry.name}</p>
            <p className="text-xs text-muted-foreground">{entry.company}</p>
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
