import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./pages/DashboardLayout";
import Home from "./pages/dashboard/Home";
import Events from "./pages/dashboard/Events";
import EventDetail from "./pages/dashboard/EventDetail";
import CalendarPage from "./pages/dashboard/Calendar";
import Profile from "./pages/dashboard/Profile";
import EntryDetail from "./pages/dashboard/EntryDetail";
import EditEntry from "./pages/dashboard/EditEntry";
import ScanQR from "./pages/dashboard/add/ScanQR";
import AddContact from "./pages/dashboard/add/AddContact";
import ScanOCR from "./pages/dashboard/add/ScanOCR";
import AddEvent from "./pages/dashboard/add/AddEvent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <div className="min-h-screen">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Home />} />
                <Route path="entry/:id" element={<EntryDetail />} />
                <Route path="edit/:id" element={<EditEntry />} />
                <Route path="events" element={<Events />} />
                <Route path="event/:id" element={<EventDetail />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="profile" element={<Profile />} />
                {/* Add Entry Routes */}
                <Route path="add/scan-qr" element={<ScanQR />} />
                <Route path="add/manual" element={<AddContact />} />
                <Route path="add/scan-ocr" element={<ScanOCR />} />
                <Route path="add/event" element={<AddEvent />} />
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </div>
);

export default App;
