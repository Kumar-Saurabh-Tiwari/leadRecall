import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { entryService } from '@/services/entryService';
import { Entry } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function EditEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Entry>>({
    name: '',
    company: '',
    event: '',
    type: 'attendee',
    notes: '',
    email: '',
    phone: '',
    linkedin: '',
    profileUrl: '',
  });

  useEffect(() => {
    if (id) {
      const entry = entryService.getById(id);
      if (entry) {
        setFormData(entry);
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as 'exhibitor' | 'attendee' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      if (id) {
        entryService.update(id, formData);
        toast({
          title: 'Success',
          description: 'Entry updated successfully',
        });
        navigate(`/dashboard/entry/${id}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update entry',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h2 className="text-lg font-semibold">Edit Entry</h2>
          <div className="w-8" />
        </div>
      </motion.div>

      {/* Form Content */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <Separator className="mx-6" />
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Company & Event */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Company & Event</CardTitle>
              </CardHeader>
              <Separator className="mx-6" />
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="company" className="text-sm font-medium">
                    Company *
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company || ''}
                    onChange={handleChange}
                    placeholder="Company name"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="event" className="text-sm font-medium">
                    Event *
                  </Label>
                  <Input
                    id="event"
                    name="event"
                    value={formData.event || ''}
                    onChange={handleChange}
                    placeholder="Event name"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-medium">
                    Role *
                  </Label>
                  <Select value={formData.type || 'attendee'} onValueChange={handleTypeChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendee">Attendee</SelectItem>
                      <SelectItem value="exhibitor">Exhibitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile URLs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Profile URLs</CardTitle>
              </CardHeader>
              <Separator className="mx-6" />
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="linkedin" className="text-sm font-medium">
                    LinkedIn Profile
                  </Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin || ''}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="profileUrl" className="text-sm font-medium">
                    Personal/Company Website
                  </Label>
                  <Input
                    id="profileUrl"
                    name="profileUrl"
                    value={formData.profileUrl || ''}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <Separator className="mx-6" />
              <CardContent className="pt-6">
                <Textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="Add any notes about this lead..."
                  className="min-h-[120px] resize-none"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex gap-3 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 -mx-4 border-t border-border/40"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
