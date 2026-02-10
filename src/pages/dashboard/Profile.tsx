import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Building2, LogOut, Edit, ChevronRight, Shield, Bell, HelpCircle, Loader, Linkedin, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

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
        setIsFromCache(false);
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

  const handleRefresh = async () => {
    if (!user?.email || refreshing) return;

    setRefreshing(true);
    try {
      // Clear cache and fetch fresh data
      await profileService.clearProfileCache(user.email);
      const response = await profileService.getLeadUserProfileByEmail(user.email);
      setProfileData(response.data);
      setError(null);
      setIsFromCache(false);
      toast({
        title: 'Refreshed',
        description: 'Profile data updated successfully',
      });
    } catch (err) {
      console.error('Error refreshing profile:', err);
      toast({
        title: 'Error',
        description: 'Failed to refresh profile data',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

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
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
          </div>
          {!loading && !error && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-9 w-9"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
            <div className="h-28 gradient-primary relative" />
            <CardContent className="pt-0 -mt-16 relative z-10">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-32 w-32 border-4 border-card shadow-xl mb-4 flex-shrink-0">
                  {displayMediaUrl && (
                    <AvatarImage src={displayMediaUrl} alt={displayName} className="object-cover" />
                  )}
                  <AvatarFallback className="gradient-primary text-primary-foreground text-3xl font-bold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">{displayEmail}</p>
                  {displayCompany && (
                    <div className="flex items-center justify-center gap-2 text-base text-foreground font-medium">
                      <Building2 className="h-4 w-4 text-primary" />
                      {displayCompany}
                    </div>
                  )}
                  <Badge 
                    className="w-fit text-sm py-1.5 px-4 mt-3"
                    variant={displayRole === 'exhibitor' ? 'default' : 'secondary'}
                  >
                    {displayRole === 'exhibitor' ? '🎯 Exhibitor' : '👤 Attendee'}
                  </Badge>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Contact Information Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 p-2 rounded-md bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                      <p className="text-sm text-foreground break-all mt-0.5">{displayEmail}</p>
                    </div>
                  </div>
                  
                  {displayPhone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0 p-2 rounded-md bg-primary/10">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">Phone Number</p>
                        <p className="text-sm text-foreground mt-0.5">{displayPhone}</p>
                      </div>
                    </div>
                  )}

                  {displayLinkedinUrl && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0 p-2 rounded-md bg-primary/10">
                        <Linkedin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">LinkedIn Profile</p>
                        <a 
                          href={displayLinkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-0.5 inline-block"
                        >
                          View Profile →
                        </a>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Manage your profile settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-primary/5 hover:border-primary/50 transition-all"
                  onClick={() => toast({ title: 'Coming soon!', description: 'Profile editing will be available soon.' })}
                >
                  <Edit className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Edit Profile</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-primary/5 hover:border-primary/50 transition-all"
                  onClick={() => toast({ title: 'Coming soon!', description: 'Security settings will be available soon.' })}
                >
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Privacy</span>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Settings & Preferences</CardTitle>
              <CardDescription className="text-xs">Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between px-6 py-3.5 hover:bg-muted/50 transition-colors ${
                    index !== menuItems.length - 1 ? 'border-b border-border/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="h-4 w-4 text-primary" />
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
        {(displayEventName || displayCheckInStatus || displayBoothNumber) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Event Information</CardTitle>
              <CardDescription className="text-xs">Your event details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayEventName && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground font-medium">Event Name</span>
                    <span className="text-sm font-semibold text-foreground">{displayEventName}</span>
                  </div>
                )}
                {displayCheckInStatus && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground font-medium">Check-in Status</span>
                    <Badge variant={displayCheckInStatus === 'verified' ? 'default' : 'secondary'}>
                      {displayCheckInStatus}
                    </Badge>
                  </div>
                )}
                {displayBoothNumber && displayRole === 'exhibitor' && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground font-medium">Booth Number</span>
                    <span className="text-sm font-semibold text-foreground">#{displayBoothNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        )}
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
            size="lg"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground font-semibold h-12"
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
