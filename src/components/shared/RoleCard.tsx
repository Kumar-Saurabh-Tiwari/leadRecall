import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="relative overflow-hidden border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group h-full">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {subtitle}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + 0.1 * (index + 1) }}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                {feature}
              </motion.li>
            ))}
          </ul>
          
          <Button 
            onClick={onSelect}
            className="w-full gradient-primary hover:opacity-90 transition-opacity"
            size="lg"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
