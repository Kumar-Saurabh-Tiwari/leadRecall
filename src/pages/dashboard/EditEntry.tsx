import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Loader, QrCode, User, FileText, MapPin } from 'lucide-react';
import ScanQrDialog from '@/components/dashboard/ScanQrDialog';
import LocationSelector from '@/components/LocationSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// ─── Form state types ────────────────────────────────────────────────────────

interface ContactForm {
  name: string;
  company: string;
  event: string;
  notes: string;
  email: string;
  phone: string;
  linkedin: string;
}

interface ContentForm {
  presentationLabel: string;
  presentationValue: string;
  notes: string;
  event: string;
}

interface LocationForm {
  placeLabel: string;
  placeValue: string;
  placeAddress: string;
  lat: string;
  lng: string;
  notes: string;
  event: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EditEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { setEntries: setEntriesInContext } = useEvents();

  // Raw entry & meta
  const [entry, setEntry] = useState<Entry | null>(null);
  const [recordType, setRecordType] = useState<string>('contact');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);

  // Availability flags – which tabs to show
  const [hasContact, setHasContact] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  // Per-section form data
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '', company: '', event: '', notes: '', email: '', phone: '', linkedin: '',
  });
  const [contentForm, setContentForm] = useState<ContentForm>({
    presentationLabel: '', presentationValue: '', notes: '', event: '',
  });
  const [locationForm, setLocationForm] = useState<LocationForm>({
    placeLabel: '', placeValue: '', placeAddress: '', lat: '', lng: '', notes: '', event: '',
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchEntryDetail = async () => {
      if (!id || !user?.role || !user?.email) { setIsLoading(false); return; }

      try {
        setIsLoading(true);
        setError(null);

        const apiResponse: any = user.role === 'exhibitor'
          ? await entryService.getExhibitorDataByID(id)
          : await entryService.getAttendeeDataByID(id);

        console.log('Entry Detail API Response:', apiResponse);

        const itemData = apiResponse?.data || apiResponse;
        if (!itemData?._id) {
          setError('Entry not found');
          navigate('/dashboard');
          return;
        }

        // Determine record type
        const rType: string = itemData.eRecordType || 'contact';
        setRecordType(rType);

        // ── Contact data ──────────────────────────────────────────────────
        if (itemData.oContactData) {
          setHasContact(true);
          const cd = itemData.oContactData;
          const validEvent = cd.sEventTitles?.find((e: any) => e.sTitle?.trim());
          const linkedinProfile = cd.profiles?.find((p: any) => p.sProfileLink && p.sProfileLink !== 'N/A');

          setContactForm({
            name: `${cd.sFirstName || ''} ${cd.sLastName || ''}`.trim(),
            company: cd.sCompany || '',
            event: validEvent?.sTitle || '',
            notes: cd.sEntryNotes?.[0] || '',
            email: cd.sEmail?.[0]?.Email || '',
            phone: cd.contacts?.[0]?.sContactNumber || '',
            linkedin: linkedinProfile?.sProfileLink || '',
          });

          setEntry({
            id: itemData._id,
            name: `${cd.sFirstName || ''} ${cd.sLastName || ''}`.trim() || 'Unknown',
            company: cd.sCompany || '',
            event: validEvent?.sTitle || '',
            notes: cd.sEntryNotes?.[0] || '',
            type: user.role === 'exhibitor' ? 'attendee' : 'exhibitor',
            createdAt: itemData.dCreatedDate ? new Date(itemData.dCreatedDate) : new Date(),
            email: cd.sEmail?.[0]?.Email || undefined,
            phone: cd.contacts?.[0]?.sContactNumber || undefined,
            linkedin: linkedinProfile?.sProfileLink || undefined,
            image: itemData.sMediaUrl && itemData.sMediaUrl !== 'No Image' ? itemData.sMediaUrl : undefined,
          });
        }

        // ── Content data ──────────────────────────────────────────────────
        if (itemData.oContentData) {
          setHasContent(true);
          const ocData = itemData.oContentData;
          const validEvent = ocData.sEventTitles?.find((e: any) => e.sTitle?.trim());

          setContentForm({
            presentationLabel: ocData.sPresentation?.sLabel || '',
            presentationValue: ocData.sPresentation?.sValue || '',
            notes: ocData.sNotes || '',
            event: validEvent?.sTitle || '',
          });

          if (!itemData.oContactData) {
            setEntry({
              id: itemData._id,
              name: ocData.sPresentation?.sValue || ocData.sPresentation?.sLabel || 'Content',
              company: '',
              event: validEvent?.sTitle || '',
              notes: ocData.sNotes || '',
              type: 'content',
              createdAt: itemData.dCreatedDate ? new Date(itemData.dCreatedDate) : new Date(),
              image: itemData.sMediaUrl && itemData.sMediaUrl !== 'No Image' ? itemData.sMediaUrl : undefined,
            });
          }
        }

        // ── Location data ─────────────────────────────────────────────────
        if (itemData.oLocationData) {
          setHasLocation(true);
          const olData = itemData.oLocationData;
          const place = olData.sPlace || {};
          const validEvent = olData.sEventTitles?.find((e: any) => e.sTitle?.trim());

          setLocationForm({
            placeLabel: place.sLabel || '',
            placeValue: place.sValue || '',
            placeAddress: place.sAddress || '',
            lat: place.sCoordinates?.lat || '',
            lng: place.sCoordinates?.lng || '',
            notes: olData.sNotes || '',
            event: validEvent?.sTitle || '',
          });

          if (!itemData.oContactData && !itemData.oContentData) {
            setEntry({
              id: itemData._id,
              name: place.sValue || place.sLabel || place.sAddress || 'Location',
              company: '',
              event: validEvent?.sTitle || '',
              notes: olData.sNotes || '',
              type: 'location',
              createdAt: itemData.dCreatedDate ? new Date(itemData.dCreatedDate) : new Date(),
              image: itemData.sMediaUrl && itemData.sMediaUrl !== 'No Image' ? itemData.sMediaUrl : undefined,
            });
          }
        }

        // Fallback: treat as contact if no typed sections present
        if (!itemData.oContactData && !itemData.oContentData && !itemData.oLocationData) {
          setHasContact(true);
          setEntry({
            id: itemData._id,
            name: 'Unknown',
            company: '',
            event: '',
            notes: '',
            type: user.role === 'exhibitor' ? 'attendee' : 'exhibitor',
            createdAt: itemData.dCreatedDate ? new Date(itemData.dCreatedDate) : new Date(),
          });
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

  // Determine which tab to open by default based on record type
  const defaultTab = recordType === 'location' ? 'location'
    : recordType === 'content' ? 'content'
    : 'contact';

  // ── Refresh context list ───────────────────────────────────────────────────

  const refreshEntriesContext = async () => {
    if (!user?.email) return;
    try {
      const apiResponse = user.role === 'exhibitor'
        ? await entryService.getExhibitorData(user.email)
        : await entryService.getAttendeeData(user.email);
      const dataArray = apiResponse?.data || apiResponse;
      if (Array.isArray(dataArray)) {
        const transformed: Entry[] = dataArray.map((item: any) => {
          const validEvent = item.oContactData?.sEventTitles?.find((e: any) => e.sTitle?.trim());
          const linkedinProfile = item.oContactData?.profiles?.find((p: any) => p.sProfileLink && p.sProfileLink !== 'N/A');
          return {
            id: item._id || item.id || crypto.randomUUID(),
            name: item.oContactData
              ? `${item.oContactData.sFirstName || ''} ${item.oContactData.sLastName || ''}`.trim()
              : 'Unknown',
            company: item.oContactData?.sCompany || '',
            event: validEvent?.sTitle || '',
            notes: item.oContactData?.sEntryNotes?.[0] || '',
            type: user.role === 'exhibitor' ? 'attendee' : 'exhibitor',
            createdAt: item.dCreatedDate ? new Date(item.dCreatedDate) : new Date(),
            email: item.oContactData?.sEmail?.[0]?.Email || undefined,
            phone: item.oContactData?.contacts?.[0]?.sContactNumber || undefined,
            linkedin: linkedinProfile?.sProfileLink || undefined,
            image: item?.sMediaUrl && item?.sMediaUrl !== 'No Image' ? item?.sMediaUrl : undefined,
          };
        });
        setEntriesInContext(transformed);
      }
    } catch { /* non-blocking */ }
  };

  // ── Save: Contact ──────────────────────────────────────────────────────────

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry || !contactForm.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }
    try {
      setIsSaving(true);
      const updateData = {
        oContactData: {
          sFirstName: contactForm.name.split(' ')[0],
          sLastName: contactForm.name.split(' ').slice(1).join(' ') || '',
          sCompany: contactForm.company,
          sEmail: [{ Email: contactForm.email }],
          contacts: [{ sContactNumber: contactForm.phone, sContactType: 'Work' }],
          profiles: [{ sProfileLink: contactForm.linkedin || 'N/A', sProfileType: 'linkedin' }],
          sEntryNotes: [contactForm.notes],
          sEventTitles: [{ sTitle: contactForm.event }],
        },
      };
      if (user!.role === 'exhibitor') {
        await entryService.updateExhibitorDataByID(entry.id, updateData);
      } else {
        await entryService.updateAttendeeDataByID(entry.id, updateData);
      }
      await refreshEntriesContext();
      toast({ title: 'Success', description: 'Contact updated successfully' });
      navigate(`/dashboard/entry/${entry.id}`);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to update contact', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Save: Content ──────────────────────────────────────────────────────────

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;
    try {
      setIsSaving(true);
      const updateData = {
        oContentData: {
          sPresentation: {
            sLabel: contentForm.presentationLabel,
            sValue: contentForm.presentationValue,
          },
          sNotes: contentForm.notes,
          sEventTitles: [{ sTitle: contentForm.event }],
        },
      };
      if (user!.role === 'exhibitor') {
        await entryService.updateExhibitorDataByID(entry.id, updateData);
      } else {
        await entryService.updateAttendeeDataByID(entry.id, updateData);
      }
      await refreshEntriesContext();
      toast({ title: 'Success', description: 'Content updated successfully' });
      navigate(`/dashboard/entry/${entry.id}`);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to update content', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Save: Location ─────────────────────────────────────────────────────────

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;
    try {
      setIsSaving(true);
      const updateData = {
        oLocationData: {
          sPlace: {
            sLabel: locationForm.placeLabel,
            sValue: locationForm.placeValue,
            sAddress: locationForm.placeAddress,
            sCoordinates: {
              lat: locationForm.lat,
              lng: locationForm.lng,
            },
          },
          sNotes: locationForm.notes,
          sEventTitles: [{ sTitle: locationForm.event }],
        },
      };
      if (user!.role === 'exhibitor') {
        await entryService.updateExhibitorDataByID(entry.id, updateData);
      } else {
        await entryService.updateAttendeeDataByID(entry.id, updateData);
      }
      await refreshEntriesContext();
      toast({ title: 'Success', description: 'Location updated successfully' });
      navigate(`/dashboard/entry/${entry.id}`);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to update location', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!entry || !user?.email) return;
    try {
      if (user.role === 'exhibitor') {
        await entryService.deleteExhibitor(entry.id, user.email);
      } else {
        await entryService.deleteAttendee(entry.id, user.email);
      }
      toast({ title: 'Success', description: 'Entry deleted successfully' });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to delete entry', variant: 'destructive' });
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-3">Entry not found</p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-24">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
          <div className="flex flex-col items-center gap-0.5">
            <h1 className="text-lg font-semibold">Edit Entry</h1>
            <Badge variant="secondary" className="text-xs capitalize px-2 py-0">
              {recordType}
            </Badge>
          </div>
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

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs defaultValue={defaultTab} className="w-full">
            {/* Tab triggers – only render tabs that have data */}
            <TabsList className="w-full mb-6">
              {hasContact && (
                <TabsTrigger value="contact" className="flex-1 gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Contact
                </TabsTrigger>
              )}
              {hasContent && (
                <TabsTrigger value="content" className="flex-1 gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Content
                </TabsTrigger>
              )}
              {hasLocation && (
                <TabsTrigger value="location" className="flex-1 gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </TabsTrigger>
              )}
            </TabsList>

            {/* ── Contact Tab ─────────────────────────────────────────────── */}
            {hasContact && (
              <TabsContent value="contact">
                <form onSubmit={handleSaveContact} className="space-y-5">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="c-name">Full Name *</Label>
                        <Input
                          id="c-name"
                          value={contactForm.name}
                          onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="c-company">Company</Label>
                        <Input
                          id="c-company"
                          value={contactForm.company}
                          onChange={e => setContactForm(p => ({ ...p, company: e.target.value }))}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="c-event">Event</Label>
                        <Input
                          id="c-event"
                          value={contactForm.event}
                          onChange={e => setContactForm(p => ({ ...p, event: e.target.value }))}
                          placeholder="Enter event name"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base">Contact Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="c-email">Email</Label>
                        <Input
                          id="c-email"
                          type="email"
                          value={contactForm.email}
                          onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="c-phone">Phone</Label>
                        <Input
                          id="c-phone"
                          value={contactForm.phone}
                          onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="c-linkedin">LinkedIn</Label>
                        <div className="relative">
                          <Input
                            id="c-linkedin"
                            value={contactForm.linkedin}
                            onChange={e => setContactForm(p => ({ ...p, linkedin: e.target.value }))}
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

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={contactForm.notes}
                        onChange={e => setContactForm(p => ({ ...p, notes: e.target.value }))}
                        placeholder="Add notes about this contact"
                        rows={4}
                        className="resize-none"
                      />
                    </CardContent>
                  </Card>

                  <SaveCancelBar isSaving={isSaving} onCancel={() => navigate(`/dashboard/entry/${entry.id}`)} />
                </form>
              </TabsContent>
            )}

            {/* ── Content Tab ─────────────────────────────────────────────── */}
            {hasContent && (
              <TabsContent value="content">
                <form onSubmit={handleSaveContent} className="space-y-5">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base">Presentation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ct-label">Label</Label>
                        <Input
                          id="ct-label"
                          value={contentForm.presentationLabel}
                          onChange={e => setContentForm(p => ({ ...p, presentationLabel: e.target.value }))}
                          placeholder="e.g. media view"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ct-value">Value / URL</Label>
                        <Input
                          id="ct-value"
                          value={contentForm.presentationValue}
                          onChange={e => setContentForm(p => ({ ...p, presentationValue: e.target.value }))}
                          placeholder="Enter content value or link"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ct-event">Event</Label>
                        <Input
                          id="ct-event"
                          value={contentForm.event}
                          onChange={e => setContentForm(p => ({ ...p, event: e.target.value }))}
                          placeholder="Enter event name"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={contentForm.notes}
                        onChange={e => setContentForm(p => ({ ...p, notes: e.target.value }))}
                        placeholder="Add notes about this content"
                        rows={4}
                        className="resize-none"
                      />
                    </CardContent>
                  </Card>

                  <SaveCancelBar isSaving={isSaving} onCancel={() => navigate(`/dashboard/entry/${entry.id}`)} />
                </form>
              </TabsContent>
            )}

            {/* ── Location Tab ─────────────────────────────────────────────── */}
            {hasLocation && (
              <TabsContent value="location">
                <form onSubmit={handleSaveLocation} className="space-y-5">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base">Place Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="loc-label">Label</Label>
                        <Input
                          id="loc-label"
                          value={locationForm.placeLabel}
                          onChange={e => setLocationForm(p => ({ ...p, placeLabel: e.target.value }))}
                          placeholder="Short label for this place"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loc-value">Name / Value</Label>
                        <Input
                          id="loc-value"
                          value={locationForm.placeValue}
                          onChange={e => setLocationForm(p => ({ ...p, placeValue: e.target.value }))}
                          placeholder="Place name"
                        />
                      </div>
                      <LocationSelector
                        label="Address"
                        value={locationForm.placeAddress}
                        onChange={(address, coords) =>
                          setLocationForm(p => ({
                            ...p,
                            placeAddress: address,
                            lat: coords ? String(coords.lat) : p.lat,
                            lng: coords ? String(coords.lng) : p.lng,
                          }))
                        }
                        onClear={() => setLocationForm(p => ({ ...p, placeAddress: '', lat: '', lng: '' }))}
                        placeholder="Search for an address"
                        required={false}
                        isSelected={!!locationForm.placeAddress}
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base">Coordinates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="loc-lat">Latitude</Label>
                          <Input
                            id="loc-lat"
                            value={locationForm.lat}
                            onChange={e => setLocationForm(p => ({ ...p, lat: e.target.value }))}
                            placeholder="e.g. 45.5508"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loc-lng">Longitude</Label>
                          <Input
                            id="loc-lng"
                            value={locationForm.lng}
                            onChange={e => setLocationForm(p => ({ ...p, lng: e.target.value }))}
                            placeholder="e.g. -73.6530"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loc-event">Event</Label>
                        <Input
                          id="loc-event"
                          value={locationForm.event}
                          onChange={e => setLocationForm(p => ({ ...p, event: e.target.value }))}
                          placeholder="Enter event name"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Live map preview when coordinates are present */}
                  {locationForm.lat && locationForm.lng && (
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle className="text-base">Map Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full aspect-video rounded-lg overflow-hidden border border-border/50">
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            src={`https://www.google.com/maps?q=${locationForm.lat},${locationForm.lng}&z=15&output=embed`}
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {locationForm.lat}, {locationForm.lng}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={locationForm.notes}
                        onChange={e => setLocationForm(p => ({ ...p, notes: e.target.value }))}
                        placeholder="Add notes about this location"
                        rows={4}
                        className="resize-none"
                      />
                    </CardContent>
                  </Card>

                  <SaveCancelBar isSaving={isSaving} onCancel={() => navigate(`/dashboard/entry/${entry.id}`)} />
                </form>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>

      {/* ── QR Scanner ─────────────────────────────────────────────────────── */}
      <ScanQrDialog
        open={showQrDialog}
        onOpenChange={setShowQrDialog}
        onScanned={(url) => setContactForm(p => ({ ...p, linkedin: url }))}
        title="Scan LinkedIn QR"
        description="Scan a QR that contains a LinkedIn or profile URL"
      />

      {/* ── Delete Dialog ───────────────────────────────────────────────────── */}
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

// ─── Shared save / cancel bar ─────────────────────────────────────────────────

function SaveCancelBar({ isSaving, onCancel }: { isSaving: boolean; onCancel: () => void }) {
  return (
    <div className="flex gap-3 pt-2">
      <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSaving}>
        Cancel
      </Button>
      <Button type="submit" className="flex-1 gap-2" disabled={isSaving}>
        {isSaving && <Loader className="h-4 w-4 animate-spin" />}
        {isSaving ? 'Saving…' : 'Save Changes'}
        {!isSaving && <Save className="h-4 w-4" />}
      </Button>
    </div>
  );
}
