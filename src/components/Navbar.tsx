import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Users, LogIn, LogOut, User, Settings, Menu, X, MapPin, MessageCircle, Megaphone, UserPlus, Shield, Mail, BookOpen, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useUserRoles } from "@/hooks/useUserRoles";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Capacitor } from "@capacitor/core";

interface NavbarProps {
  isAuthenticated: boolean;
  user?: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
  onSignOut: () => void;
}
export const Navbar = ({
  isAuthenticated,
  user,
  onSignOut
}: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { unreadCount, friendRequestCount } = useRealtimeNotifications();
  const { isAdmin } = useUserRoles();

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "U";
  };
  // Pe native (iOS/Android) Navbar-ul web nu se afișează — există BottomTabBar
  if (Capacitor.isNativePlatform()) return null;

  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
    <div className="container px-4">
      <div className="flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group min-h-[44px]">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-soft group-hover:shadow-elevated group-hover:scale-105 transition-all duration-300 ease-out">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
            StudyBuddy
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Acasă
          </Link>
          <Link to="/notes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Notițe
          </Link>
          <Link to="/uni" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Universități
          </Link>
          <Link to="/calendar" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Calendar
          </Link>
          {isAuthenticated && <>
            <Link to="/groups" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Grupuri
            </Link>
            <Link to="/announcements" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Anunțuri
            </Link>
            <Link to="/study-spots" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Locuri de studiu
            </Link>
            <Link to="/messages" className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Mesaje
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-4 h-5 min-w-5 px-1 text-xs gradient-primary text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Link>
          </>}
        </div>

        {/* Auth Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                    {getInitials(user?.fullName, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {user?.fullName || user?.email?.split("@")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  Profilul Meu
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/groups" className="flex items-center gap-2 cursor-pointer">
                  <Users className="w-4 h-4" />
                  Grupuri
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/friends" className="flex items-center gap-2 cursor-pointer">
                  <UserPlus className="w-4 h-4" />
                  Prieteni
                  {friendRequestCount > 0 && (
                    <Badge className="ml-auto h-5 min-w-5 px-1 text-xs bg-destructive text-destructive-foreground">
                      {friendRequestCount > 99 ? "99+" : friendRequestCount}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/announcements" className="flex items-center gap-2 cursor-pointer">
                  <Megaphone className="w-4 h-4" />
                  Anunțuri
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/study-spots" className="flex items-center gap-2 cursor-pointer">
                  <MapPin className="w-4 h-4" />
                  Locuri de studiu
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/notes" className="flex items-center gap-2 cursor-pointer">
                  Notițe
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/calendar" className="flex items-center gap-2 cursor-pointer">
                  Calendar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/messages" className="flex items-center gap-2 cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  Mesaje
                  {unreadCount > 0 && (
                    <Badge className="ml-auto h-5 min-w-5 px-1 text-xs gradient-primary text-primary-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile/edit" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  Setări
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/contact" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" />
                  Contact
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-amber-600">
                      <Shield className="w-4 h-4" />
                      Administrare
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut} className="flex items-center gap-2 text-destructive cursor-pointer">
                <LogOut className="w-4 h-4" />
                Deconectare
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> : <>
            <Button variant="ghost" asChild>
              <Link to="/auth">
                <LogIn className="w-4 h-4 mr-2" />
                Autentificare
              </Link>
            </Button>
            <Button asChild className="gradient-primary text-primary-foreground">
              <Link to="/auth?mode=signup">Înregistrare</Link>
            </Button>
          </>}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu - Dropdown below navbar */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-background border-b border-border shadow-lg max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="flex flex-col gap-1 p-4">
            <Link to="/" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
              Acasă
            </Link>
            {isAuthenticated ? <>
              <Link to="/groups" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
                Grupuri
              </Link>
              <Link to="/announcements" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
                Anunțuri
              </Link>
              <Link to="/study-spots" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
                Locuri de studiu
              </Link>
              <Link to="/notes" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
                Notițe
              </Link>
              <Link to="/uni" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
                Universități
              </Link>
              <Link to="/calendar" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
                Calendar
              </Link>
              <Link to="/messages" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center justify-between" onClick={() => setMobileMenuOpen(false)}>
                Mesaje
                {unreadCount > 0 && (
                  <Badge className="h-6 min-w-6 px-2 text-sm gradient-primary text-primary-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Link>
              <Link to="/friends" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center justify-between" onClick={() => setMobileMenuOpen(false)}>
                Prieteni
                {friendRequestCount > 0 && (
                  <Badge className="h-6 min-w-6 px-2 text-sm bg-destructive text-destructive-foreground">
                    {friendRequestCount > 99 ? "99+" : friendRequestCount}
                  </Badge>
                )}
              </Link>
              <Link to="/profile" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
                Profilul Meu
              </Link>
              <Link to="/contact" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
              {isAdmin && (
                <Link to="/admin" className="px-4 py-3 text-base font-medium hover:bg-muted rounded-xl active:bg-muted/80 transition-colors min-h-[48px] flex items-center gap-2 text-amber-600" onClick={() => setMobileMenuOpen(false)}>
                  <Shield className="w-5 h-5" />
                  Administrare
                </Link>
              )}
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start text-destructive h-12 text-base" onClick={() => {
                  onSignOut();
                  setMobileMenuOpen(false);
                }}>
                  <LogOut className="w-5 h-5 mr-3" />
                  Deconectare
                </Button>
              </div>
            </> : (
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                <Button variant="outline" asChild className="h-12 text-base">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    Autentificare
                  </Link>
                </Button>
                <Button asChild className="h-12 text-base gradient-primary text-primary-foreground">
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    Înregistrare
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </nav>;
};