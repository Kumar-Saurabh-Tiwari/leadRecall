import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { RoleCard } from '@/components/shared/RoleCard';

export default function Landing() {
  const navigate = useNavigate();

  const exhibitorFeatures = [
    'Instant lead capture',
    'QR-based attendee connections',
    'Real-time attendee insights',
    'Follow-up reminders',
  ];

  const attendeeFeatures = [
    'Easy networking',
    'Connect with exhibitors',
    'Save interactions',
    'Build your professional network',
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" showTagline />
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Hero Text */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Smart networking for{' '}
              <span className="bg-clip-text text-transparent gradient-primary">
                modern events
              </span>
            </motion.h1>
            <motion.p 
              className="text-lg text-muted-foreground max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Capture leads, build connections, and follow up effortlessly.
            </motion.p>
          </motion.div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <RoleCard
              role="exhibitor"
              title="For Exhibitors"
              subtitle="Showcase & capture leads effortlessly"
              features={exhibitorFeatures}
              icon={Briefcase}
              onSelect={() => navigate('/login?role=exhibitor')}
              delay={0.3}
            />
            <RoleCard
              role="attendee"
              title="For Attendees"
              subtitle="Discover exhibitors & grow your network"
              features={attendeeFeatures}
              icon={Users}
              onSelect={() => navigate('/login?role=attendee')}
              delay={0.4}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2025 lead-Recall. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
