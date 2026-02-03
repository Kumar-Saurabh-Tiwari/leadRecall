import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, CalendarDays, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home', exact: true },
  { to: '/dashboard/events', icon: Calendar, label: 'Events' },
  { to: '/dashboard/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-[4.5rem] max-w-lg mx-auto px-4">
        {navItems.map(({ to, icon: Icon, label, exact }) => {
          const active = isActive(to, exact);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all relative",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-accent rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={cn("h-5 w-5 relative z-10", active && "text-primary")} />
              <span className="text-xs font-medium relative z-10">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
