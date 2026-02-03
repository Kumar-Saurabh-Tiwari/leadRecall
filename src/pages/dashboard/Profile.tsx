import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Building2, LogOut, Edit, ChevronRight, Shield, Bell, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </motion.div>
      </header>

      <div className="p-4 space-y-6">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-card border-border/50 overflow-hidden">
            <div className="h-20 gradient-primary" />
            <CardContent className="pt-0 -mt-10">
              <div className="flex items-end gap-4 mb-4">
                <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
                  <AvatarFallback className="gradient-primary text-primary-foreground text-xl font-bold">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pb-2">
                  <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                  <Badge 
                    variant="secondary"
                    className={user?.role === 'exhibitor' 
                      ? 'gradient-primary text-primary-foreground border-0' 
                      : 'bg-secondary text-secondary-foreground'
                    }
                  >
                    {user?.role === 'exhibitor' ? 'Exhibitor' : 'Attendee'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user?.email}</span>
                </div>
                {user?.company && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user.company}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-card border-border/50">
            <CardContent className="p-0">
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                    index !== menuItems.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
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
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
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
