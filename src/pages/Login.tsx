import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { attendeeService } from '@/services/attendeeService';
import { exhibitorService } from '@/services/exhibitorService';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginEmailOnly } = useAuth();
  const { toast } = useToast();
  
  const initialRole = (searchParams.get('role') as UserRole) || 'exhibitor';
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'email-only' | 'password'>('email-only');

  const handleEmailOnlyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Missing email',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const service = role === 'exhibitor' ? exhibitorService : attendeeService;
      const response = await service.verifyAndLoginLeadRegisterUser(email);
      
      // Check if verification was successful
      if (response?.data?.verified === true) {
        const userData = response.data.user;
        
        // Call loginEmailOnly to update AuthContext state
        await loginEmailOnly(userData, role);
        
        // Show success message
        toast({
          title: 'Welcome!',
          description: `You have successfully logged in as ${role}.`,
        });
        
        // Immediate redirect to dashboard
        navigate('/dashboard');
      } else {
        toast({
          title: 'Login failed',
          description: 'Email verification failed. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'Email not found. Please check your email or register.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, role);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (loginMode === 'email-only') {
      await handleEmailOnlyLogin(e);
    } else {
      await handlePasswordLogin(e);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <Card className="shadow-card border-border/50">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="exhibitor">Exhibitor</TabsTrigger>
                  <TabsTrigger value="attendee">Attendee</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Login Mode Selector */}
              <div className="mb-6 flex gap-2">
                <Button
                  type="button"
                  variant={loginMode === 'email-only' ? 'default' : 'outline'}
                  className={`flex-1 ${loginMode === 'email-only' ? 'gradient-primary' : ''}`}
                  onClick={() => setLoginMode('email-only')}
                >
                  Email Only
                </Button>
                <Button
                  type="button"
                  variant={loginMode === 'password' ? 'default' : 'outline'}
                  className={`flex-1 ${loginMode === 'password' ? 'gradient-primary' : ''}`}
                  onClick={() => setLoginMode('password')}
                >
                  Email & Password
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {loginMode === 'password' && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required={loginMode === 'password'}
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gradient-primary hover:opacity-90"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {loginMode === 'email-only' ? 'Verifying...' : 'Signing in...'}
                    </>
                  ) : (
                    loginMode === 'email-only' ? 'Verify & Login' : 'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to={`/register-${role}`} className="text-primary font-medium hover:underline">
                  Register
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
