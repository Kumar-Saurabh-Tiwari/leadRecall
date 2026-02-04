import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users, Sparkles, Zap, ArrowRight } from 'lucide-react';
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

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 gradient-hero" />
        <motion.div
          className="absolute top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" showTagline />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Smart Networking</span>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="pt-28 pb-20 px-4">
        <motion.div
          className="container mx-auto max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Text */}
          <div className="text-center mb-16">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-primary/20 mb-6"
            >
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Event Networking Reimagined</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight"
            >
              Smart networking for{' '}
              <span className="relative inline-block">
                <span 
                  className="bg-clip-text text-transparent"
                  style={{ 
                    backgroundImage: 'linear-gradient(135deg, hsl(243, 75%, 59%) 0%, hsl(280, 70%, 55%) 50%, hsl(292, 70%, 50%) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  modern events
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                  style={{ 
                    backgroundImage: 'linear-gradient(135deg, hsl(243, 75%, 59%) 0%, hsl(280, 70%, 55%) 50%, hsl(292, 70%, 50%) 100%)' 
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
                />
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Capture leads, build meaningful connections, and follow up effortlessly.
              <span className="block mt-2 text-foreground/70">All in one powerful platform.</span>
            </motion.p>

            {/* Stats or Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-8 mt-10"
            >
              {[
                { value: '10K+', label: 'Leads Captured' },
                { value: '500+', label: 'Events' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Role Cards */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto"
          >
            <RoleCard
              role="exhibitor"
              title="For Exhibitors"
              subtitle="Showcase & capture leads effortlessly"
              features={exhibitorFeatures}
              icon={Briefcase}
              onSelect={() => navigate('/login?role=exhibitor')}
              delay={0.4}
            />
            <RoleCard
              role="attendee"
              title="For Attendees"
              subtitle="Discover exhibitors & grow your network"
              features={attendeeFeatures}
              icon={Users}
              onSelect={() => navigate('/login?role=attendee')}
              delay={0.5}
            />
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-16"
          >
            <motion.button
              onClick={() => navigate('/login')}
              className="group inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              whileHover={{ x: 5 }}
            >
              Already have an account? Sign in
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="py-8 px-4 border-t border-border/50"
      >
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2025 lead-Recall. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
