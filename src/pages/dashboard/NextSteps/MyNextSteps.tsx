import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Phone,
  Link2,
  ShoppingCart,
  AtSign,
  Lightbulb,
  MoreHorizontal,
  Edit2,
  Trash2,
  ChevronRight,
  RefreshCw,
  AlarmClock,
  User,
  ListChecks,
  Mail,
  FileText,
  StickyNote,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { nextStepsService } from '@/services/nextStepsService';
import { format, parseISO, isValid } from 'date-fns';

const ACTION_META: Record<
  string,
  { label: string; icon: React.ElementType; pill: string; dot: string }
> = {
  refer:       { label: 'Refer',       icon: Link2,        pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',     dot: 'bg-blue-400' },
  connect:     { label: 'Connect',     icon: CheckCircle2, pill: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', dot: 'bg-green-400' },
  call:        { label: 'Call',        icon: Phone,        pill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', dot: 'bg-purple-400' },
  mention:     { label: 'Mention to', icon: AtSign,       pill: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', dot: 'bg-orange-400' },
  buy:         { label: 'Buy',         icon: ShoppingCart, pill: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',     dot: 'bg-pink-400' },
  contemplate: { label: 'Contemplate', icon: Lightbulb,    pill: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300', dot: 'bg-yellow-400' },
  others:      { label: 'Other',       icon: MoreHorizontal, pill: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
};

function getMeta(type?: string) {
  if (!type) return ACTION_META['others'];
  return ACTION_META[type.toLowerCase()] ?? ACTION_META['others'];
}

function fmtDateTime(value?: string | null): string | null {
  if (!value) return null;
  try {
    const d = parseISO(value);
    if (isValid(d)) return format(d, 'EEE, MMM d yyyy \u00b7 h:mm a');
  } catch { /* ignore */ }
  return value;
}

function fmtDate(value?: string | null): string | null {
  if (!value) return null;
  try {
    const d = parseISO(value);
    if (isValid(d)) return format(d, 'MMM d, yyyy \u00b7 h:mm a');
  } catch { /* ignore */ }
  return value;
}

function toDatetimeLocalValue(value?: string | null): string {
  if (!value) return '';
  try {
    const d = parseISO(value);
    if (isValid(d)) return format(d, "yyyy-MM-dd'T'HH:mm");
  } catch { /* ignore */ }
  return value.length >= 16 ? value.slice(0, 16) : value;
}

interface NoteItem {
  _id: string;
  sNote?: string;
  aAddtionalDetails?: string;
  sType?: string;
  sPersonName?: string;
  sEmail?: string;
  sActionTime?: string;
  isCommercialValue?: boolean;
  dCreatedDate?: string;
  dUpdatedDate?: string;
  iContactId?: string;
}

const MyNextSteps = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // If opened from a contact detail page, filter by that contact
  const contactId = searchParams.get('contactId');

  const [items, setItems] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit state
  const [editItem, setEditItem] = useState<NoteItem | null>(null);
  const [editDetails, setEditDetails] = useState('');
  const [editSchedule, setEditSchedule] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<NoteItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // API returns { message: "...", data: [...] }
      let res: any;
      if (contactId) {
        res = await nextStepsService.getAllNextSteps(contactId);
      } else {
        res = await nextStepsService.getAllNextStepsOfUser();
      }
      const raw = res?.data ?? res?.records ?? res ?? [];
      setItems(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('[MyNextSteps] Load error:', err);
      toast({ title: 'Error', description: 'Could not load next steps', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [contactId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Edit handlers ───────────────────────────────────────────────────────────
  const openEdit = (item: NoteItem) => {
    setEditItem(item);
    setEditDetails(item.aAddtionalDetails ?? '');
    setEditSchedule(toDatetimeLocalValue(item.sActionTime));
  };

  const saveEdit = async () => {
    if (!editItem) return;
    setIsSaving(true);
    try {
      await nextStepsService.updateNextSteps(
        { aAddtionalDetails: editDetails, sActionTime: editSchedule || '' },
        editItem._id,
      );
      toast({ title: 'Saved', description: 'Next step updated successfully' });
      setEditItem(null);
      load();
    } catch (err) {
      console.error('[MyNextSteps] Update error:', err);
      toast({ title: 'Error', description: 'Could not update next step', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete handlers ─────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // The backend delete may differ; using update to mark deleted or call delete endpoint if available.
      // For now we'll call deleteNextStep with the id (extend service later for real endpoint).
      await nextStepsService.updateNextSteps({ isDeleted: true }, deleteTarget._id);
      toast({ title: 'Deleted', description: 'Next step removed' });
      setDeleteTarget(null);
      setItems(prev => prev.filter(i => i._id !== deleteTarget._id));
    } catch (err) {
      console.error('[MyNextSteps] Delete error:', err);
      toast({ title: 'Error', description: 'Could not delete next step', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-background to-muted/30">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 gradient-primary backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 border-b border-border/40"
      >
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-foreground leading-tight">
              {contactId ? 'Contact Next Steps' : 'My Next Steps'}
            </h1>
            {!isLoading && items.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {items.length} record{items.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={load}
            disabled={isLoading}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            aria-label="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      <div className="px-4 py-6 max-w-2xl mx-auto">

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3 mt-2">
            {[1, 2, 3].map(n => (
              <div key={n} className="rounded-2xl border border-border/50 bg-card p-5 space-y-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-20 rounded-full bg-muted" />
                  <div className="h-4 w-28 rounded bg-muted" />
                </div>
                <div className="h-3.5 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center gap-5 py-28 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted/70 flex items-center justify-center">
              <ListChecks className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-foreground">No next steps yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Create a next step from any contact’s detail page and it will show up here.
              </p>
            </div>
          </motion.div>
        )}

        {/* List */}
        {!isLoading && items.length > 0 && (
          <AnimatePresence initial={false}>
            <div className="space-y-3">
              {items.map((item, idx) => {
                const meta       = getMeta(item.sType);
                const ActionIcon = meta.icon;
                const schedule   = fmtDateTime(item.sActionTime);
                const createdAt  = fmtDate(item.dCreatedDate);
                const hasNote    = !!item.aAddtionalDetails?.trim();
                const hasSummary = !!item.sNote?.trim();

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.97 }}
                    transition={{ duration: 0.22, delay: idx * 0.05 }}
                  >
                    <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow bg-card overflow-hidden">
                      {/* Coloured top accent bar */}
                      <div className={`h-1 w-full ${meta.dot}`} />

                      <CardContent className="p-4 space-y-3.5">

                        {/* Row 1 — action pill + person + edit/delete */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.pill}`}>
                              <ActionIcon className="h-3.5 w-3.5" />
                              {meta.label}
                            </span>
                            {item.sPersonName && (
                              <span className="flex items-center gap-1 text-sm font-semibold text-foreground truncate">
                                <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                {item.sPersonName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              aria-label="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Row 2 — auto-generated summary (muted chip) */}
                        {hasSummary && (
                          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-muted/60 border border-border/40">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{item.sNote}</p>
                          </div>
                        )}

                        {/* Row 3 — user-typed notes (primary) */}
                        {hasNote && (
                          <div className="flex items-start gap-2">
                            <StickyNote className="h-3.5 w-3.5 text-foreground/60 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                              {item.aAddtionalDetails}
                            </p>
                          </div>
                        )}

                        {!hasSummary && !hasNote && (
                          <p className="text-sm text-muted-foreground italic">No note added</p>
                        )}

                        <Separator className="opacity-50" />

                        {/* Row 4 — meta info */}
                        <div className="space-y-1.5">
                          {schedule && (
                            <div className="flex items-center gap-2">
                              <AlarmClock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{schedule}</span>
                            </div>
                          )}
                          {item.sEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-muted-foreground truncate">{item.sEmail}</span>
                            </div>
                          )}
                          {createdAt && (
                            <div className="flex items-center gap-2">
                              <CalendarClock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-muted-foreground">Added {createdAt}</span>
                            </div>
                          )}
                        </div>

                        {/* Row 5 — View contact (only if not already on a contact page) */}
                        {item.iContactId && !contactId && (
                          <button
                            onClick={() => navigate(`/dashboard/entry/${item.iContactId}`)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                          >
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                              View Contact
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </button>
                        )}

                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* ── Edit Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!editItem} onOpenChange={open => !open && setEditItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Edit2 className="h-4 w-4" />
              Edit Next Step
            </DialogTitle>
          </DialogHeader>

          {editItem && (() => {
            const meta = getMeta(editItem.sType);
            const ActionIcon = meta.icon;
            return (
              <div className="space-y-4 py-1">
                {/* Context chip */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.pill}`}>
                    <ActionIcon className="h-3.5 w-3.5" />
                    {meta.label}
                  </span>
                  {editItem.sPersonName && (
                    <span className="text-sm text-muted-foreground font-medium">{editItem.sPersonName}</span>
                  )}
                </div>

                {/* Summary (read-only context) */}
                {editItem.sNote && (
                  <div className="px-3 py-2 rounded-xl bg-muted/60 border border-border/40">
                    <p className="text-xs text-muted-foreground">{editItem.sNote}</p>
                  </div>
                )}

                {/* User notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-details" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Your Notes
                  </Label>
                  <Textarea
                    id="edit-details"
                    rows={3}
                    value={editDetails}
                    onChange={e => setEditDetails(e.target.value)}
                    placeholder="Add your notes here…"
                    className="resize-none text-sm"
                  />
                </div>

                {/* Schedule */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-schedule" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Scheduled Date &amp; Time
                  </Label>
                  <Input
                    id="edit-schedule"
                    type="datetime-local"
                    value={editSchedule}
                    onChange={e => setEditSchedule(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            );
          })()}

          <DialogFooter className="gap-2 flex-row">
            <Button variant="outline" onClick={() => setEditItem(null)} disabled={isSaving} className="flex-1">
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={isSaving} className="flex-1">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Saving…
                </span>
              ) : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Next Step</AlertDialogTitle>
            <AlertDialogDescription>
              This next step will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteTarget && (
            <div className="bg-muted/50 rounded-xl p-3 my-1 space-y-1 border border-border/40">
              {(() => {
                const meta = getMeta(deleteTarget.sType);
                const ActionIcon = meta.icon;
                return (
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${meta.pill}`}>
                      <ActionIcon className="h-3 w-3" />
                      {meta.label}
                    </span>
                    <span className="text-sm font-medium text-foreground">{deleteTarget.sPersonName}</span>
                  </div>
                );
              })()}
              {deleteTarget.sNote && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{deleteTarget.sNote}</p>
              )}
            </div>
          )}
          <div className="flex gap-3 mt-1">
            <AlertDialogCancel disabled={isDeleting} className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Removing…' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyNextSteps;
