import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Building2, LogOut, Edit, ChevronRight, Shield, Bell, HelpCircle, Calendar, MapPin, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
                  <AvatarFallback className="gradient-primary text-primary-foreground text-2xl font-bold">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{user?.email}</p>
                  <Badge 
                    className="w-fit text-xs py-1"
                    variant={user?.role === 'exhibitor' ? 'default' : 'secondary'}
                  >
                    {user?.role === 'exhibitor' ? '🎯 Exhibitor' : '👤 Attendee'}
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
                      <p className="text-foreground break-all">{user?.email}</p>
                    </div>
                  </div>
                  {user?.company && (
                    <div className="flex items-start gap-3 text-sm">
                      <Building2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Company</p>
                        <p className="text-foreground">{user.company}</p>
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
              <CardTitle className="text-base">Account Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">-</p>
                  <p className="text-xs text-muted-foreground mt-1">Events</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">-</p>
                  <p className="text-xs text-muted-foreground mt-1">Connections</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">-</p>
                  <p className="text-xs text-muted-foreground mt-1">Visits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
