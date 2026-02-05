import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Register() {
  const navigate = useNavigate();

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
              <CardTitle className="text-2xl">Create account</CardTitle>
              <CardDescription>Start networking smarter today</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="exhibitor"
                onValueChange={(v) => {
                  if (v === 'exhibitor') {
                    navigate('/register-exhibitor');
                  } else if (v === 'attendee') {
                    navigate('/register-attendee');
                  }
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="exhibitor">Exhibitor</TabsTrigger>
                  <TabsTrigger value="attendee">Attendee</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
