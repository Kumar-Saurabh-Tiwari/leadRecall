import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { EventProvider } from "@/contexts/EventContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RegisterExhibitor from "./pages/RegisterExhibitor";
import RegisterAttendee from "./pages/RegisterAttendee";
import DashboardLayout from "./pages/DashboardLayout";
import Home from "./pages/dashboard/Home";
import Events from "./pages/dashboard/Events";
import EventDetail from "./pages/dashboard/EventDetail";
import EventInfo from "./pages/dashboard/EventInfo";
import CalendarPage from "./pages/dashboard/Calendar";
import Profile from "./pages/dashboard/Profile";
import EntryDetail from "./pages/dashboard/EntryDetail";
import EditEntry from "./pages/dashboard/EditEntry";
import ScanQR from "./pages/dashboard/add/ScanQR";
import AddContact from "./pages/dashboard/add/AddContact";
import ScanOCR from "./pages/dashboard/add/ScanOCR";
import AddContent from "./pages/dashboard/add/AddContent";
import AddContentEditor from "./pages/dashboard/add/AddContentEditor";
import AddEvent from "./pages/dashboard/add/AddEvent";
import AddAdditionalMedia from "./pages/dashboard/add/AddAdditionalMedia";
import AdditionalMediaView from "./pages/dashboard/AdditionalMediaView";
import NextStep1 from "./pages/dashboard/NextSteps/NextStep1";
import NextStep2 from "./pages/dashboard/NextSteps/NextStep2";
import NextStep3 from "./pages/dashboard/NextSteps/NextStep3";
import NextStep4 from "./pages/dashboard/NextSteps/NextStep4";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component for authenticated users
const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

// Route for authenticated users to redirect to dashboard
const AuthenticatedRedirect = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : element;
};

const AppRoutes = () => (
  <Routes>
    {/* Landing and Auth Routes - redirect to dashboard if authenticated */}
    <Route path="/" element={<AuthenticatedRedirect element={<Landing />} />} />
    <Route path="/login" element={<AuthenticatedRedirect element={<Login />} />} />
    <Route path="/register-exhibitor" element={<AuthenticatedRedirect element={<RegisterExhibitor />} />} />
    <Route path="/register-attendee" element={<AuthenticatedRedirect element={<RegisterAttendee />} />} />
    <Route path="/register" element={<AuthenticatedRedirect element={<Navigate to="/register-exhibitor" replace />} />} />
    
    {/* Protected Dashboard Routes */}
    <Route path="/dashboard" element={<ProtectedRoute element={<DashboardLayout />} />}>
      <Route index element={<Home />} />
      <Route path="entry/:id" element={<EntryDetail />} />
      <Route path="media-view/:id" element={<AdditionalMediaView />} />
      <Route path="edit/:id" element={<EditEntry />} />
      <Route path="events" element={<Events />} />
      <Route path="event/:id" element={<EventDetail />} />
      <Route path="event-info/:id" element={<EventInfo />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="profile" element={<Profile />} />
      {/* Add Entry Routes */}
      <Route path="add/scan-qr" element={<ScanQR />} />
      <Route path="add/manual" element={<AddContact />} />
      <Route path="add/scan-ocr" element={<ScanOCR />} />
      <Route path="add/content" element={<AddContent />} />
      <Route path="add/content/editor" element={<AddContentEditor />} />
      <Route path="add/event" element={<AddEvent />} />
      <Route path="add/media/:id" element={<AddAdditionalMedia />} />
      {/* Next Steps Routes */}
      <Route path="add/next-step-1" element={<NextStep1 />} />
      <Route path="add/next-step-2" element={<NextStep2 />} />
      <Route path="add/next-step-3" element={<NextStep3 />} />
      <Route path="add/next-step-4" element={<NextStep4 />} />
    </Route>
    
    {/* Fallback */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <div className="min-h-screen">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EventProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </EventProvider>
      </AuthProvider>
    </QueryClientProvider>
  </div>
);

export default App;
