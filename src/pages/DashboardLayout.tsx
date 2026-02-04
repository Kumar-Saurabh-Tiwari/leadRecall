import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if we're on the dashboard home page
  const isHomePage = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!isHomePage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="mr-1 hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Logo size="sm" />
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-safe">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
