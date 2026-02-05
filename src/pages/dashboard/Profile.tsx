import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Building2, LogOut, Edit, ChevronRight, Shield, Bell, HelpCircle, Calendar, MapPin, Award, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { profileService } from '@/services/profileService';
import { ProfileData } from '@/types';
import { useEffect, useState } from 'react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        const response = await profileService.getLeadUserProfileByEmail(user.email);
        setProfileData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        toast({
          title: 'Error',
          description: 'Failed to load profile information',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.email, toast]);

  const displayName = profileData?.sUserName || user?.name || 'User';
  const displayEmail = profileData?.sEmail || user?.email || '';
  const displayCompany = profileData?.sCompanyName || user?.company || '';
  const displayRole = profileData?.sRegistrationType || user?.role || '';
  const displayPhone = profileData?.sPhoneNumber || '';
  const displayMediaUrl = profileData?.sMediaUrl || '';
  const displayCheckInStatus = profileData?.sCheckInStatus || '';
  const displayEventName = profileData?.sEventName || '';
  const displayBoothNumber = profileData?.sBoothNumber || '';
  const displayLinkedinUrl = profileData?.sLinkedinUrl || '';

  const handleLogout = () => {
    logout();
    toast({
      title: 'Signed out',
      description: 'See you next time!',
    });
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    { icon: Edit, label: 'Edit Profile', action: () => toast({ title: 'Coming soon!', description: 'Profile editing will be available soon.' }) },
    { icon: Bell, label: 'Notifications', action: () => toast({ title: 'Coming soon!', description: 'Notification settings will be available soon.' }) },
    { icon: Shield, label: 'Privacy & Security', action: () => toast({ title: 'Coming soon!', description: 'Privacy settings will be available soon.' }) },
    { icon: HelpCircle, label: 'Help & Support', action: () => toast({ title: 'Coming soon!', description: 'Help center will be available soon.' }) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
        </motion.div>
      </header>

      <div className="p-4 pb-20 space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading profile...</span>
          </div>
        )}

        {!loading && error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <>
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-card border-border/50 overflow-hidden">
            <div className="h-24 gradient-primary relative" />
            <CardContent className="pt-0 -mt-12 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
                <Avatar className="h-24 w-24 border-4 border-card shadow-lg flex-shrink-0">
                  {displayMediaUrl && (
                    <AvatarImage src={displayMediaUrl} alt={displayName} />
                  )}
                  <AvatarFallback className="gradient-primary text-primary-foreground text-2xl font-bold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{displayEmail}</p>
                  <Badge 
                    className="w-fit text-xs py-1"
                    variant={displayRole === 'exhibitor' ? 'default' : 'secondary'}
                  >
                    {displayRole === 'exhibitor' ? '🎯 Exhibitor' : '👤 Attendee'}
                  </Badge>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-foreground break-all">{displayEmail}</p>
                    </div>
                  </div>
                  {displayCompany && (
                    <div className="flex items-start gap-3 text-sm">
                      <Building2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Company</p>
                        <p className="text-foreground">{displayCompany}</p>
                      </div>
                    </div>
                  )}
                  {displayPhone && (
                    <div className="flex items-start gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-foreground">{displayPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-10"
                  onClick={() => toast({ title: 'Coming soon!', description: 'Profile editing will be available soon.' })}
                >
                  <Edit className="h-4 w-4" />
                  <span className="text-xs">Edit Profile</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-10"
                  onClick={() => toast({ title: 'Coming soon!', description: 'Profile editing will be available soon.' })}
                >
                  <Shield className="h-4 w-4" />
                  <span className="text-xs">Privacy</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Menu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Settings & Preferences</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors ${
                    index !== menuItems.length - 1 ? 'border-b border-border/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <item.icon className="h-4 w-4 text-foreground" />
                    </div>
                    <span className="text-foreground font-medium text-sm">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Stats - Optional */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayEventName && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Event</span>
                    <span className="text-sm font-medium text-foreground">{displayEventName}</span>
                  </div>
                )}
                {displayCheckInStatus && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Check-in Status</span>
                    <Badge variant={displayCheckInStatus === 'verified' ? 'default' : 'secondary'}>
                      {displayCheckInStatus}
                    </Badge>
                  </div>
                )}
                {displayBoothNumber && displayRole === 'exhibitor' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Booth Number</span>
                    <span className="text-sm font-medium text-foreground">{displayBoothNumber}</span>
                  </div>
                )}
                {displayLinkedinUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">LinkedIn</span>
                    <a 
                      href={displayLinkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
          </>
        )}

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive font-medium"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
