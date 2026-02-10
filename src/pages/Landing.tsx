import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

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

  const sectionVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.23, 1, 0.320, 1] as const,
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.12,
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1] as const,
      },
    }),
    hover: {
      x: 8,
      transition: { duration: 0.3 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.85, rotateY: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.9,
        ease: [0.23, 1, 0.320, 1] as const,
      },
    },
    hover: {
      y: -10,
      transition: { duration: 0.4, ease: 'easeInOut' as const },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.23, 1, 0.320, 1] as const },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
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
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-amber-200/30 shadow-lg"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" showTagline />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-sm font-medium text-amber-600"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
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
          <div className="text-center mb-20 space-y-6">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 border border-amber-300/60 dark:border-amber-600/40 mb-6 shadow-sm"
            >
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Event Networking Reimagined</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl md:text-3xl font-extrabold text-foreground mb-6 leading-tight tracking-tight drop-shadow-md"
            >
              Smart networking for{' '}
              <span className="relative inline-block">
                <span 
                  className="bg-clip-text text-transparent text-3xl md:text-3xl font-semibold"
                  style={{ 
                    backgroundImage: 'linear-gradient(90deg, #374151 0%, #6B7280 50%, #9CA3AF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  modern events
                </span>
                <motion.span
                  className="absolute -bottom-2 left-1/6 right-1/6 h-0.5 rounded-full"
                  style={{ 
                    backgroundImage: 'linear-gradient(90deg, #E5E7EB 0%, #D1D5DB 50%, #9CA3AF 100%)'
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
                />
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-foreground max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Capture leads, build meaningful connections, and follow up effortlessly.
              <span className="block mt-2 text-foreground/85">All in one powerful platform.</span>
            </motion.p>

            {/* Stats or Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-6 md:gap-12 mt-12 px-4"
            >
              {[
                { value: '10K+', label: 'Leads Captured' },
                { value: '500+', label: 'Events' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center px-6 py-4 rounded-lg bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/40 dark:border-amber-700/40 backdrop-blur-sm"
                  whileHover={{ scale: 1.08, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-sm font-medium text-foreground/75 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Professional Sections Layout */}
          <motion.div
            variants={itemVariants}
            className="space-y-16 max-w-5xl mx-auto"
          >
            {/* Exhibitors Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
              className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center py-6"
            >
              <div className="space-y-6 order-2 md:order-1">
                <motion.div 
                  variants={badgeVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/30 border border-amber-300/60 dark:border-amber-700/50 w-fit cursor-default shadow-sm font-bold"
                >
                  <Briefcase className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">FOR EXHIBITORS</span>
                </motion.div>
                
                <motion.h2 
                  variants={headingVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight"
                >
                  Maximize Your Lead Capture at Every Event
                </motion.h2>

                <motion.p 
                  variants={textVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="text-lg md:text-xl text-foreground/80 leading-relaxed font-medium"
                >
                  Transform your booth experience with our intelligent lead capture technology. Effortlessly connect with attendees through QR codes, QR scanning, and real-time data insights. Every interaction is recorded, organized, and ready for follow-up.
                </motion.p>

                <div className="space-y-4 pt-6">
                  {exhibitorFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      custom={index}
                      initial="hidden"
                      whileInView="visible"
                      whileHover="hover"
                      viewport={{ once: true }}
                      variants={featureVariants}
                      className="flex items-start gap-4 cursor-default p-3 rounded-lg hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors"
                    >
                      <motion.div 
                        className="flex-shrink-0 mt-1"
                        whileHover={{ scale: 1.25, rotate: 12 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 shadow-md">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      </motion.div>
                      <div>
                        <p className="font-semibold text-foreground text-base">{feature}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  onClick={() => navigate('/login?role=exhibitor')}
                  whileHover={{ scale: 1.06, y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-gray-800 dark:text-gray-100 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 dark:from-amber-700 dark:via-amber-600 dark:to-amber-500 hover:from-amber-300 hover:via-amber-200 hover:to-yellow-100 transition-all duration-300 shadow-lg hover:shadow-2xl border border-amber-200/50 dark:border-amber-600/50"
                >
                  Get Started as Exhibitor
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="h-5 w-5 text-current" />
                  </motion.div>
                </motion.button>
              </div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                variants={imageVariants}
                style={{ perspective: 1000 }}
                className="order-1 md:order-2"
              >
                <motion.div 
                  className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-950/50 dark:to-amber-900/30 border border-amber-200/30 dark:border-amber-800/30"
                  whileHover={{ boxShadow: "0 25px 50px rgba(251, 191, 36, 0.2)" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="text-center space-y-4">
                      <Briefcase className="h-24 w-24 text-amber-300 dark:text-amber-700 mx-auto opacity-50" />
                      <p className="text-muted-foreground font-medium">Professional Lead Management</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.section>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4"
            />

            {/* Attendees Section */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
              className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center py-6"
            >
              <motion.div
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                variants={imageVariants}
                style={{ perspective: 1000 }}
              >
                <motion.div 
                  className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-yellow-100 to-amber-50 dark:from-yellow-950/50 dark:to-yellow-900/30 border border-yellow-200/30 dark:border-yellow-800/30"
                  whileHover={{ boxShadow: "0 25px 50px rgba(251, 191, 36, 0.2)" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="text-center space-y-4">
                      <Users className="h-24 w-24 text-yellow-300 dark:text-yellow-700 mx-auto opacity-50" />
                      <p className="text-muted-foreground font-medium">Smart Networking</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              <div className="space-y-6">
                <motion.div 
                  variants={badgeVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-800/30 border border-yellow-300/60 dark:border-yellow-700/50 w-fit cursor-default shadow-sm"
                >
                  <Users className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
                  <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">FOR ATTENDEES</span>
                </motion.div>
                
                <motion.h2 
                  variants={headingVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight"
                >
                  Build Meaningful Professional Connections
                </motion.h2>

                <motion.p 
                  variants={textVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="text-lg md:text-xl text-foreground/80 leading-relaxed font-medium"
                >
                  Navigate events with confidence and purpose. Discover exhibitors aligned with your interests, connect seamlessly, and build a professional network that lasts. Every connection is saved and organized for easy follow-up and future collaboration.
                </motion.p>

                <div className="space-y-4 pt-6">
                  {attendeeFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      custom={index}
                      initial="hidden"
                      whileInView="visible"
                      whileHover="hover"
                      viewport={{ once: true }}
                      variants={featureVariants}
                      className="flex items-start gap-4 cursor-default p-3 rounded-lg hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20 transition-colors"
                    >
                      <motion.div 
                        className="flex-shrink-0 mt-1"
                        whileHover={{ scale: 1.25, rotate: 12 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500 shadow-md">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      </motion.div>
                      <div>
                        <p className="font-semibold text-foreground text-base">{feature}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  onClick={() => navigate('/login?role=attendee')}
                  whileHover={{ scale: 1.06, y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-gray-800 dark:text-gray-100 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 dark:from-amber-700 dark:via-amber-600 dark:to-amber-500 hover:from-amber-300 hover:via-amber-200 hover:to-yellow-100 transition-all duration-300 shadow-lg hover:shadow-2xl border border-amber-200/50 dark:border-amber-600/50"
                >
                  Join as Attendee
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="h-5 w-5 text-current" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.section>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-12"
          >
            <motion.button
              onClick={() => navigate('/login')}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-800 dark:text-gray-100 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 dark:from-amber-700 dark:via-amber-600 dark:to-amber-500 hover:from-amber-300 hover:via-amber-200 hover:to-yellow-100 transition-all duration-300 shadow-md hover:shadow-lg border border-amber-200/60 dark:border-amber-600/40"
              whileHover={{ x: 5, y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              Already have an account? Sign in
              <ArrowRight className="h-5 w-5 text-current group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="py-10 px-4 border-t border-amber-200/30 dark:border-amber-800/30 bg-gradient-to-b from-transparent to-amber-50/30 dark:to-amber-950/20"
      >
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm">
          <span className="text-foreground/70 font-medium">© 2025 lead-Recall. All rights reserved.</span>
          <div className="flex items-center gap-8">
            <a href="#" className="text-foreground/60 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors">Privacy</a>
            <a href="#" className="text-foreground/60 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors">Terms</a>
            <a href="#" className="text-foreground/60 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors">Contact</a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
