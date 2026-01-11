import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Users, LogIn, LogOut, User, Settings, Menu, X, MapPin, MessageCircle, Megaphone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

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
  const { unreadCount } = useRealtimeNotifications();
  
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "U";
  };
  return <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-primary text-center font-light font-mono text-lg">StudyBuddy</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                București
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Acasă
            </Link>
            <Link to="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Explorează
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
                <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Profilul Meu
                </Link>
              </>}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
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
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link to="/" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Acasă
              </Link>
              <Link to="/browse" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Explorează
              </Link>
              {isAuthenticated ? <>
                  <Link to="/groups" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Grupuri
                  </Link>
                  <Link to="/announcements" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Anunțuri
                  </Link>
                  <Link to="/study-spots" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Locuri de studiu
                  </Link>
                  <Link to="/messages" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg flex items-center justify-between" onClick={() => setMobileMenuOpen(false)}>
                    Mesaje
                    {unreadCount > 0 && (
                      <Badge className="h-5 min-w-5 px-1 text-xs gradient-primary text-primary-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Link>
                  <Link to="/profile" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    Profilul Meu
                  </Link>
                  <Button variant="ghost" className="justify-start text-destructive" onClick={() => {
              onSignOut();
              setMobileMenuOpen(false);
            }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Deconectare
                  </Button>
                </> : <div className="flex gap-2 px-4 pt-2">
                  <Button variant="outline" asChild className="flex-1">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Autentificare
                    </Link>
                  </Button>
                  <Button asChild className="flex-1 gradient-primary text-primary-foreground">
                    <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                      Înregistrare
                    </Link>
                  </Button>
                </div>}
            </div>
          </div>}
      </div>
    </nav>;
};