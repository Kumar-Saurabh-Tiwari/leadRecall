import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types';

interface RoleCardProps {
  role: UserRole;
  title: string;
  subtitle: string;
  features: string[];
  icon: LucideIcon;
  onSelect: () => void;
  delay?: number;
}

export function RoleCard({ role, title, subtitle, features, icon: Icon, onSelect, delay = 0 }: RoleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm shadow-card hover:shadow-elevated transition-all duration-500 group h-full">
        {/* Animated gradient border */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-1 gradient-primary"
          initial={{ scaleX: 0, originX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Background glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="pb-4 relative">
          <div className="flex items-center gap-4 mb-3">
            <motion.div 
              className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-soft"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Icon className="h-7 w-7 text-primary-foreground" />
            </motion.div>
          </div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            {subtitle}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0 relative">
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: delay + 0.1 * (index + 1),
                  type: 'spring',
                  stiffness: 100,
                }}
                className="flex items-start gap-3 text-sm text-foreground/90"
              >
                <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                {feature}
              </motion.li>
            ))}
          </ul>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={onSelect}
              className="w-full gradient-primary hover:opacity-90 transition-all duration-300 group/btn shadow-soft hover:shadow-elevated"
              size="lg"
            >
              Get Started
              <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
