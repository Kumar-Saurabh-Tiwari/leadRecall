import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Briefcase,
  Users,
  Sparkles,
  Zap,
  ArrowRight,
  QrCode,
  Scan,
  FileText,
  Calendar,
  BarChart3,
  Shield,
  Clock,
  Globe,
  Award,
  Check,
  Building2,
  TrendingUp,
  Star,
  Menu,
  X
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const stats = [
    { value: '10,000+', label: 'Active Users', icon: Users },
    { value: '500+', label: 'Events Hosted', icon: Building2 },
    { value: '50,000+', label: 'Connections Made', icon: Calendar },
    { value: '95%', label: 'ROI Increase', icon: TrendingUp },
  ];

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Scanning',
      description: 'Instant contact exchange with secure QR technology.'
    },
    {
      icon: Scan,
      title: 'Business Card Scanner',
      description: 'AI-powered digitization of business cards.'
    },
    {
      icon: FileText,
      title: 'Manual Contact Creation',
      description: 'Intuitive interface for adding contacts manually.'
    },
    {
      icon: Users,
      title: 'Attendee Management',
      description: 'Track interactions and manage attendee data.'
    },
    {
      icon: Calendar,
      title: 'Event Calendar',
      description: 'Organize and schedule your events seamlessly.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Comprehensive reports on your networking success.'
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Instant Connections',
      description: 'Connect with professionals in seconds.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with encryption.'
    },
    {
      icon: Award,
      title: 'Better Lead Quality',
      description: 'Focus on high-value business opportunities.'
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Automate networking and follow-ups.'
    },
    {
      icon: Globe,
      title: 'Global Networking',
      description: 'Connect across borders and industries.'
    },
    {
      icon: Star,
      title: 'Professional Image',
      description: 'Present yourself as a modern professional.'
    },
  ];

  const pricingTiers = [
    {
      name: 'Independent Exhibitor',
      description: 'Perfect for individual exhibitors',
      subtitle: 'For Solo exhibitors who need simple QR code scanning and contact management without advanced features.',
      price: '$49',
      period: '/event',
      features: [
        'Unique QR Code for contacts',
        'Business card scanner access',
        'Contact management dashboard',
        'Basic analytics',
        'Email support',
        '+2 more features'
      ],
      cta: 'Get Started',
      variant: 'outline'
    },
    {
      name: 'Independent Attendee',
      description: 'For individual event attendees',
      subtitle: 'For Event attendees who want to collect exhibitor contacts and organize leads at trade shows.',
      price: '$19',
      period: '/event',
      features: [
        'Personal QR code',
        'Exhibitor contact saving',
        'Contact organization',
        'Event directory access',
        'Basic networking tools',
        '+2 more features'
      ],
      cta: 'Get Started',
      variant: 'outline'
    },
    {
      name: 'Trade Show Support Exhibitor',
      description: 'Full support for exhibitors',
      subtitle: 'For Enterprise exhibitor teams needing advanced analytics, team collaboration, and dedicated support for complex trade show campaigns.',
      price: '$199',
      period: '/event',
      features: [
        'Everything in Independent Exhibitor',
        'Priority support (phone + email)',
        'Advanced analytics & reports',
        'Team member accounts (up to 5)',
        'Custom branding options',
        '+5 more features'
      ],
      cta: 'Get Started',
      popular: true,
      savingsText: 'Save 30% vs. monthly',
      variant: 'default'
    },
    {
      name: 'Trade Show Support Attendee',
      description: 'Enhanced experience for attendees',
      subtitle: 'For Professional attendees and corporate buyers who need advanced meeting scheduling, insights, and follow-up tools for maximum trade show ROI.',
      price: '$79',
      period: '/event',
      features: [
        'Everything in Independent Attendee',
        'Priority support (phone + email)',
        'Advanced contact filtering',
        'Meeting scheduler with exhibitors',
        'Personalized event schedule',
        '+4 more features'
      ],
      cta: 'Get Started',
      variant: 'outline'
    }
  ];

  // Animated counter hook - optimized for performance
  const useAnimatedCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
      if (!hasStarted) return;
      
      let startTime: number;
      let animationFrame: number;
      const frameInterval = 1000 / 60; // 60fps
      let lastUpdate = 0;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        
        // Throttle updates to 60fps
        if (currentTime - lastUpdate < frameInterval) {
          animationFrame = requestAnimationFrame(animate);
          return;
        }
        lastUpdate = currentTime;
        
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [end, duration, hasStarted]);

    // Start animation when element comes into view
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      return () => observer.disconnect();
    }, [hasStarted]);

    return count;
  };

  const AnimatedCounter = ({ value, suffix = '' }: { value: string, suffix?: string }) => {
    const numericValue = parseInt(value.replace(/[^\d]/g, ''));
    const animatedValue = useAnimatedCounter(numericValue);

    return <span>{animatedValue.toLocaleString()}{suffix}</span>;
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 will-change-auto">
        <div className="absolute inset-0 gradient-hero" />
        {!isMobile && (
          <>
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
              style={{ willChange: 'transform' }}
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
              style={{ willChange: 'transform' }}
            />
          </>
        )}
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-lg"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" showTagline />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-foreground/80 hover:text-primary transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-foreground/80 hover:text-primary transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('benefits')} className="text-foreground/80 hover:text-primary transition-colors">
              Benefits
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-foreground/80 hover:text-primary transition-colors">
              Pricing
            </button>
            <Button onClick={() => navigate('/login')} className="ml-4 text-gray-700" style={{ background: 'linear-gradient(108.18deg, #EBCB42 0%, #FFEC99 50.7%, #EBCB42 97.5%)' }}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left text-foreground/80 hover:text-primary transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left text-foreground/80 hover:text-primary transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('benefits')} className="block w-full text-left text-foreground/80 hover:text-primary transition-colors">
                Benefits
              </button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-foreground/80 hover:text-primary transition-colors">
                Pricing
              </button>
              <Button onClick={() => navigate('/login')} className="w-full text-gray-700" style={{ background: 'linear-gradient(108.18deg, #EBCB42 0%, #FFEC99 50.7%, #EBCB42 97.5%)' }}>
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 flex items-center justify-center will-change-auto">
          <motion.div
            className="absolute w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{ willChange: 'opacity' }}
          >
            {!isMobile && (
              <>
                <QrCode className="absolute top-20 right-10 h-32 w-32 text-primary/10 -rotate-12 opacity-40" />
                <QrCode className="absolute bottom-32 left-5 h-40 w-40 text-secondary/10 rotate-45 opacity-30" />
              </>
            )}
          </motion.div>
        </div>
        
        <div className="container mx-auto max-w-5xl text-center relative z-10 mt-2">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/25 to-secondary/25 border border-primary/50 mb-6 md:mb-10 backdrop-blur-sm hover:border-primary/70 transition-all hover:from-primary/35 hover:to-secondary/35 shadow-sm will-change-transform"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* <Sparkles className="h-5 w-5 text-primary animate-pulse flex-shrink-0" /> */}
            <span className="text-sm font-bold text-foreground">
              ✨ The Smart Way to Network at Events
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 md:mb-6 tracking-tight will-change-transform"
            style={{ willChange: 'transform, opacity' }}
          >
            Transform Trade Shows Into{' '}
            <span className="relative inline-block">
              Powerful Networks
              <motion.div
                className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary rounded-full will-change-transform"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                style={{ willChange: 'transform' }}
              />
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6 md:mb-3 will-change-transform"
            style={{ willChange: 'transform, opacity' }}
          >
            Connect exhibitors and attendees seamlessly with QR technology. Build meaningful business relationships and maximize your trade show ROI.
          </motion.p>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-10 text-sm will-change-transform"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-muted/40 backdrop-blur-sm border border-border/50">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-xs md:text-sm">50,000+ Connections Made</span>
            </div>
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-muted/40 backdrop-blur-sm border border-border/50">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-xs md:text-sm">95% Satisfaction Rate</span>
            </div>
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-muted/40 backdrop-blur-sm border border-border/50">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-xs md:text-sm">500+ Events Powered</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center will-change-transform w-full"
            style={{ willChange: 'transform, opacity' }}
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/login')} 
              className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 h-auto font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-gray-700 w-full sm:w-auto" 
              style={{ background: 'linear-gradient(135deg, #EBCB42 0%, #FFEC99 50%, #EBCB42 100%)' }}
            >
              <Zap className="mr-2 h-5 w-5" />
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => scrollToSection('features')} 
              className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 h-auto font-semibold rounded-xl border-2 hover:bg-primary/5 transition-all duration-300 w-full sm:w-auto"
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Additional Trust Element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 text-xs text-muted-foreground"
          >
            No credit card required • 14-day free trial • Cancel anytime
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-12 w-12 text-primary" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Everything You Need to Succeed at Trade Shows
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Showcase Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              See QR Networking in Action
            </h2>
            <p className="text-xl text-muted-foreground">
              Interactive demo showing QR code generation and scanning process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <QrCode className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Sharing</h3>
              <p className="text-muted-foreground">Share contact info instantly with QR codes</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No App Downloads</h3>
              <p className="text-muted-foreground">Works with any QR code scanner</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Encryption</h3>
              <p className="text-muted-foreground">Your data is protected and encrypted</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to transform your networking experience</p>
          </motion.div>

          {/* Exhibitor Steps */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h3 className="text-2xl font-bold mb-4">For Exhibitors</h3>
              <p className="text-muted-foreground">Showcase your business and connect with attendees</p>
            </motion.div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: 1, title: 'Create Profile', desc: 'Set up your exhibitor profile', icon: Users },
                { step: 2, title: 'Generate QR', desc: 'Get your unique QR code', icon: QrCode },
                { step: 3, title: 'Scan Attendees', desc: 'Scan attendee QR codes', icon: Scan },
                { step: 4, title: 'Manage Contacts', desc: 'Organize and follow up', icon: Users }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-300 hover:scale-105 text-center"
                >
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Attendee Steps */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h3 className="text-2xl font-bold mb-4">For Attendees</h3>
              <p className="text-muted-foreground">Discover exhibitors and build your network</p>
            </motion.div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: 1, title: 'Create Profile', desc: 'Set up your attendee profile', icon: Users },
                { step: 2, title: 'Get QR', desc: 'Receive your personal QR code', icon: QrCode },
                { step: 3, title: 'Scan Booths', desc: 'Scan exhibitor QR codes', icon: Scan },
                { step: 4, title: 'Follow Up', desc: 'Connect and network', icon: Calendar }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-300 hover:scale-105 text-center"
                >
                  <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Choose LeadRecall?</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <benefit.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground">Flexible pricing for every networking need</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative rounded-2xl overflow-hidden border transition-all duration-300 ${
                  tier.popular
                    ? 'border-0 shadow-2xl lg:scale-105 lg:z-10'
                    : 'border-border bg-card shadow-md hover:shadow-lg'
                }`}
              >
                {/* Gradient Background for Popular */}
                {tier.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-200 via-yellow-400 opacity-95 text-black" />
                )}
                
                {/* Card Content */}
                <div className={`relative p-5 h-full flex flex-col ${tier.popular ? 'bg-opacity-0' : ''}`}>
                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1 bg-black/20 backdrop-blur-sm text-black px-3 py-1 rounded-full text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-current" /> Popular
                      </span>
                    </div>
                  )}

                  {/* Title and Description */}
                  <div className="mb-3">
                    <h3 className={`text-xl font-bold mb-1 ${tier.popular ? 'text-black' : 'text-foreground'}`}>
                      {tier.name}
                    </h3>
                    <p className={`text-sm mb-2 ${tier.popular ? 'text-gray-800' : 'text-muted-foreground'}`}>
                      {tier.description}
                    </p>
                    <p className={`text-xs leading-relaxed ${tier.popular ? 'text-gray-700' : 'text-muted-foreground'}`}>
                      {tier.subtitle}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${tier.popular ? 'text-black' : 'text-foreground'}`}>
                        {tier.price}
                      </span>
                      <span className={`text-sm font-medium ${tier.popular ? 'text-gray-800' : 'text-muted-foreground'}`}>
                        {tier.period}
                      </span>
                    </div>
                    {tier.savingsText && (
                      <p className="text-xs text-grey-400 mt-2">
                        📊 {tier.savingsText}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-5 flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className={`h-4 w-4 ${tier.popular ? 'text-white/80' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-bold uppercase tracking-wide ${tier.popular ? 'text-gray-800' : 'text-muted-foreground'}`}>
                        Includes
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className={`h-4 w-4 flex-shrink-0 mt-1 ${tier.popular ? 'text-white/90' : 'text-green-500'}`} />
                          <span className={`text-sm ${tier.popular ? 'text-gray-900' : 'text-foreground'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <Button
                      className={`w-full font-bold py-3 rounded-xl ${
                        tier.popular
                          ? 'bg-white text-blue-700 hover:bg-white/90 shadow-lg'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                      onClick={() => navigate('/login')}
                    >
                      <Zap className="h-4 w-4" />
                      {tier.cta}
                    </Button>
                    <button
                      className={`w-full text-sm font-medium py-2 rounded-lg transition-colors ${
                        tier.popular
                          ? 'text-gray-800 hover:text-gray-900 border border-gray-300 hover:border-gray-400'
                          : 'text-foreground/60 hover:text-foreground border border-border hover:border-foreground/30'
                      }`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="md" showTagline />
              <p className="text-muted-foreground mt-4">
                Transform trade shows into powerful networks with QR technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><button onClick={() => scrollToSection('features')}>Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')}>Pricing</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')}>How It Works</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 LeadRecall. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
