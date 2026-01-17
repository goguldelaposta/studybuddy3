import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationProvider } from "@/hooks/useRealtimeNotifications";
import { EmailVerificationGuard } from "@/components/EmailVerificationGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Messages from "./pages/Messages";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import Announcements from "./pages/Announcements";
import StudySpots from "./pages/StudySpots";
import Friends from "./pages/Friends";
import ProfileView from "./pages/ProfileView";
import Admin from "./pages/Admin";
import Notes from "./pages/Notes";
import CalendarPage from "./pages/CalendarPage";
import Badges from "./pages/Badges";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/profile" element={<EmailVerificationGuard><Profile /></EmailVerificationGuard>} />
                <Route path="/profile/edit" element={<EmailVerificationGuard><ProfileEdit /></EmailVerificationGuard>} />
                <Route path="/messages" element={<EmailVerificationGuard><Messages /></EmailVerificationGuard>} />
                <Route path="/groups" element={<EmailVerificationGuard><Groups /></EmailVerificationGuard>} />
                <Route path="/groups/:id" element={<EmailVerificationGuard><GroupDetail /></EmailVerificationGuard>} />
                <Route path="/announcements" element={<EmailVerificationGuard><Announcements /></EmailVerificationGuard>} />
                <Route path="/study-spots" element={<EmailVerificationGuard><StudySpots /></EmailVerificationGuard>} />
                <Route path="/friends" element={<EmailVerificationGuard><Friends /></EmailVerificationGuard>} />
                <Route path="/user/:userId" element={<EmailVerificationGuard><ProfileView /></EmailVerificationGuard>} />
                <Route path="/admin" element={<EmailVerificationGuard><Admin /></EmailVerificationGuard>} />
                <Route path="/notes" element={<EmailVerificationGuard><Notes /></EmailVerificationGuard>} />
                <Route path="/calendar" element={<EmailVerificationGuard><CalendarPage /></EmailVerificationGuard>} />
                <Route path="/badges" element={<EmailVerificationGuard><Badges /></EmailVerificationGuard>} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/browse" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
