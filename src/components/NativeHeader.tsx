import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Menu, X, Home, Users, MessageCircle, User,
  Megaphone, MapPin, FileText, Calendar, Bell, Shield,
  LogOut, LogIn, ChevronRight, Sun, Moon
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { triggerHaptic } from "@/hooks/useHapticFeedback";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  authRequired?: boolean;
}

export function NativeHeader() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { currentUserProfile } = useProfiles();
  const { unreadCount, friendRequestCount } = useRealtimeNotifications();
  const { isAdmin } = useUserRoles();
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return email?.charAt(0).toUpperCase() || "U";
  };

  const navItems: NavItem[] = [
    { path: "/", icon: Home, label: "Acasă" },
    { path: "/notes", icon: FileText, label: "Notițe" },
    { path: "/groups", icon: Users, label: "Grupuri", authRequired: true },
    { path: "/messages", icon: MessageCircle, label: "Mesaje", badge: unreadCount, authRequired: true },
    { path: "/announcements", icon: Megaphone, label: "Anunțuri", authRequired: true },
    { path: "/calendar", icon: Calendar, label: "Calendar", authRequired: true },
    { path: "/study-spots", icon: MapPin, label: "Locuri de studiu", authRequired: true },
    { path: "/friends", icon: Bell, label: "Prieteni", badge: friendRequestCount, authRequired: true },
    ...(isAdmin ? [{ path: "/admin", icon: Shield, label: "Admin", authRequired: true }] : []),
  ];

  const handleNav = (path: string) => {
    triggerHaptic('light');
    setOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    triggerHaptic('medium');
    setOpen(false);
    await signOut();
  };

  return (
    <>
      {/* Header bar — respects safe area */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => triggerHaptic('light')}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              StudyBuddy
            </span>
          </Link>

          {/* Hamburger button */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 active:bg-muted transition-colors relative"
            onClick={() => { triggerHaptic('light'); setOpen(true); }}
          >
            <Menu className="w-5 h-5" />
            {(unreadCount > 0 || friendRequestCount > 0) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        </div>
      </div>


      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-background z-50 flex flex-col"
              style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between h-14 px-4 border-b border-border/50">
                <span className="font-bold text-base">Meniu</span>
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/50"
                  onClick={() => { triggerHaptic('light'); setOpen(false); }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User section */}
              {user ? (
                <div className="flex items-center gap-3 p-4 border-b border-border/50">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
                    <AvatarFallback className="text-sm font-bold"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
                      {getInitials(currentUserProfile?.full_name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{currentUserProfile?.full_name || "Profil"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted/50"
                    onClick={() => handleNav("/profile")}
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  className="flex items-center gap-3 p-4 border-b border-border/50 w-full text-left"
                  onClick={() => handleNav("/auth")}
                >
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Autentifică-te</p>
                    <p className="text-xs text-muted-foreground">Intră în cont</p>
                  </div>
                  <LogIn className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
              )}

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto py-2">
                {navItems
                  .filter(item => !item.authRequired || !!user)
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/50 active:bg-muted transition-colors"
                        onClick={() => handleNav(item.path)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge className="h-5 min-w-5 px-1 text-[10px] bg-red-500 text-white border-0">
                            {item.badge > 99 ? "99+" : item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
              </nav>

              {/* Theme switcher */}
              <div className="border-t border-border/50 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Temă</p>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${resolvedTheme === 'light' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border text-foreground active:bg-muted'}`}
                    onClick={() => { triggerHaptic('light'); setTheme('light'); }}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-sm font-semibold">Luminos</span>
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${resolvedTheme === 'dark' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border text-foreground active:bg-muted'}`}
                    onClick={() => { triggerHaptic('light'); setTheme('dark'); }}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-sm font-semibold">Întunecat</span>
                  </button>
                </div>
              </div>

              {/* Sign out */}
              {user && (
                <div className="border-t border-border/50 p-4">
                  <button
                    className="flex items-center gap-3 w-full py-2 text-red-500 active:opacity-70 transition-opacity"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Deconectează-te</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
