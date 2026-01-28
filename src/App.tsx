import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationProvider } from "@/hooks/useRealtimeNotifications";
import { EmailVerificationGuard } from "@/components/EmailVerificationGuard";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { BottomTabBar } from "@/components/BottomTabBar";
import { PageTransition } from "@/components/PageTransition";
import { useIsMobile } from "@/hooks/use-mobile";
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
import NoteDetailPage from "./pages/NoteDetailPage";
import CalendarPage from "./pages/CalendarPage";
import Badges from "./pages/Badges";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import UniversitiesIndex from "./pages/UniversitiesIndex";
import UniversityPage from "./pages/UniversityPage";
import FacultyPage from "./pages/FacultyPage";
import CoursePage from "./pages/CoursePage";

// StudyBuddy App - v2.1 PWA
const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Pages that should show bottom tab bar (authenticated main pages)
  const showBottomTabBar = !['/auth', '/auth/forgot-password', '/auth/reset-password', '/verify-email'].some(
    path => location.pathname.startsWith(path)
  );

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/profile" element={<EmailVerificationGuard><PageTransition><Profile /></PageTransition></EmailVerificationGuard>} />
          <Route path="/profile/edit" element={<EmailVerificationGuard><PageTransition><ProfileEdit /></PageTransition></EmailVerificationGuard>} />
          <Route path="/messages" element={<EmailVerificationGuard><PageTransition><Messages /></PageTransition></EmailVerificationGuard>} />
          <Route path="/groups" element={<EmailVerificationGuard><PageTransition><Groups /></PageTransition></EmailVerificationGuard>} />
          <Route path="/groups/:id" element={<EmailVerificationGuard><PageTransition><GroupDetail /></PageTransition></EmailVerificationGuard>} />
          <Route path="/announcements" element={<EmailVerificationGuard><PageTransition><Announcements /></PageTransition></EmailVerificationGuard>} />
          <Route path="/study-spots" element={<EmailVerificationGuard><PageTransition><StudySpots /></PageTransition></EmailVerificationGuard>} />
          <Route path="/friends" element={<EmailVerificationGuard><PageTransition><Friends /></PageTransition></EmailVerificationGuard>} />
          <Route path="/user/:userId" element={<EmailVerificationGuard><PageTransition><ProfileView /></PageTransition></EmailVerificationGuard>} />
          <Route path="/admin" element={<EmailVerificationGuard><PageTransition><Admin /></PageTransition></EmailVerificationGuard>} />
          <Route path="/notes" element={<EmailVerificationGuard><PageTransition><Notes /></PageTransition></EmailVerificationGuard>} />
          <Route path="/notes/:noteId" element={<EmailVerificationGuard><PageTransition><NoteDetailPage /></PageTransition></EmailVerificationGuard>} />
          <Route path="/calendar" element={<EmailVerificationGuard><PageTransition><CalendarPage /></PageTransition></EmailVerificationGuard>} />
          <Route path="/badges" element={<EmailVerificationGuard><PageTransition><Badges /></PageTransition></EmailVerificationGuard>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/browse" element={<PageTransition><Index /></PageTransition>} />
          {/* SEO Catalog Routes */}
          <Route path="/uni" element={<PageTransition><UniversitiesIndex /></PageTransition>} />
          <Route path="/uni/:uniSlug" element={<PageTransition><UniversityPage /></PageTransition>} />
          <Route path="/uni/:uniSlug/:facultySlug" element={<PageTransition><FacultyPage /></PageTransition>} />
          <Route path="/uni/:uniSlug/:facultySlug/:courseId" element={<PageTransition><CoursePage /></PageTransition>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      
      {/* Bottom Tab Bar for mobile - only show on main authenticated pages */}
      {isMobile && showBottomTabBar && <BottomTabBar />}
    </>
  );
}

function AppContent() {
  // Enable PWA update notifications
  useServiceWorker();

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}


const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
