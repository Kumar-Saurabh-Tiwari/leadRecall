import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Upload, X, Building2, Mail, User, Phone, Briefcase, Hash } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Exhibitor } from '@/types';
import { exhibitorService } from '@/services/exhibitorService';

export default function RegisterExhibitor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Exhibitor>>({
    sCompanyName: '',
    sEmail: '',
    sUserName: '',
    sRole: '',
    sPhoneNumber: '',
    sBoothNumber: '',
    sLinkedinUrl: '',
    sRegistrationType: 'exhibitor',
    sCheckInStatus: 'pending',
    sMediaUrl: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingLogo(true);
      try {
        // Call the API to upload and get direct URL
        const mediaUrl = await exhibitorService.getDirectURL(file, 'image');
        setCompanyLogo(mediaUrl);
        setFormData(prev => ({
          ...prev,
          sMediaUrl: mediaUrl,
        }));
        toast({
          title: 'Logo uploaded',
          description: 'Company logo has been uploaded successfully.',
        });
      } catch (error) {
        console.error('Logo upload error:', error);
        toast({
          title: 'Upload failed',
          description: 'Failed to upload logo. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const removeCompanyLogo = () => {
    setCompanyLogo(null);
    setFormData(prev => ({
      ...prev,
      sCompanyLogo: '',
      sMediaUrl: '',
    }));
  };

  const isStep1Valid = () => {
    return !!(formData.sCompanyName?.trim() && formData.sEmail?.trim() && companyLogo);
  };

  const isStep2Valid = () => {
    return !!(formData.sUserName?.trim() && formData.sRole?.trim());
  };

  const handleNextStep = () => {
    // Allow moving to next step without validation
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate both steps before submission
    if (!isStep1Valid()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in company name, email, and upload a logo.',
        variant: 'destructive',
      });
      setCurrentStep(1);
      return;
    }

    if (!isStep2Valid()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in username and role.',
        variant: 'destructive',
      });
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await exhibitorService.registerExhibitor(formData);
      
      console.log('Exhibitor Registration Response:', response);
      
      toast({
        title: 'Registration successful!',
        description: 'Welcome to LeadRecall Connect as an Exhibitor.',
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <Card className="shadow-card border-border/50">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Register as Exhibitor</CardTitle>
              <CardDescription>
                Step {currentStep} of 2 - {currentStep === 1 ? 'Company Information' : 'Personal Details'}
              </CardDescription>
            </CardHeader>

            {/* Progress Bar */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex gap-2">
                {[1, 2].map((step) => (
                  <div
                    key={step}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      step <= currentStep ? 'bg-primary' : 'bg-secondary'
                    }`}
                  />
                ))}
              </div>
            </div>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {/* Step 1: Company Information */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Company Name */}
                      <div className="space-y-2">
                        <Label htmlFor="sCompanyName">Company Name *</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="sCompanyName"
                            name="sCompanyName"
                            type="text"
                            placeholder="Your Company Name"
                            value={formData.sCompanyName || ''}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="sEmail">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="sEmail"
                            name="sEmail"
                            type="email"
                            placeholder="company@example.com"
                            value={formData.sEmail || ''}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      {/* Company Logo Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="logo-upload">Company Logo *</Label>
                        <div className="relative">
                          {companyLogo ? (
                            <div className="relative w-full h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-secondary/30 overflow-hidden">
                              <img 
                                src={companyLogo} 
                                alt="Company Logo" 
                                className="max-h-full max-w-full object-contain"
                              />
                              <button
                                type="button"
                                onClick={removeCompanyLogo}
                                disabled={isUploadingLogo}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label className={`w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 ${isUploadingLogo ? 'cursor-not-allowed bg-secondary/50' : 'cursor-pointer hover:bg-secondary/30'} transition-colors`}>
                              {isUploadingLogo ? (
                                <>
                                  <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                                  <span className="text-sm text-muted-foreground">Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-6 w-6 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Click to upload logo</span>
                                  <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                                </>
                              )}
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoSelected}
                                disabled={isUploadingLogo}
                                className="hidden"
                                required
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Personal Details */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Username */}
                      <div className="space-y-2">
                        <Label htmlFor="sUserName">Username *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="sUserName"
                            name="sUserName"
                            type="text"
                            placeholder="your.username"
                            value={formData.sUserName || ''}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      {/* Role */}
                      <div className="space-y-2">
                        <Label htmlFor="sRole">Job Title / Role *</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="sRole"
                            name="sRole"
                            type="text"
                            placeholder="e.g., Sales Manager"
                            value={formData.sRole || ''}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      {/* Phone Number (Optional) */}
                      <div className="space-y-2">
                        <Label htmlFor="sPhoneNumber">Phone Number (Optional)</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="sPhoneNumber"
                            name="sPhoneNumber"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.sPhoneNumber || ''}
                            onChange={handleInputChange}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* LinkedIn URL (Optional) */}
                      <div className="space-y-2">
                        <Label htmlFor="sLinkedinUrl">LinkedIn URL (Optional)</Label>
                        <Input
                          id="sLinkedinUrl"
                          name="sLinkedinUrl"
                          type="url"
                          placeholder="https://linkedin.com/in/yourprofile"
                          value={formData.sLinkedinUrl || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                  )}
                  {currentStep < 2 ? (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 gradient-primary hover:opacity-90"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1 gradient-primary hover:opacity-90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Complete Registration'
                      )}
                    </Button>
                  )}
                </div>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Not an exhibitor? </span>
                <Link to="/register-attendee" className="text-primary font-medium hover:underline">
                  Register as Attendee
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
